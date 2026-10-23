"""Minimal 7z reader (LZMA / LZMA2 / BCJ / copy), standard library only.
   python3 -I un7z.py ARCHIVE OUTDIR [--list]"""
import lzma, struct, sys, os, zlib

class R:
    def __init__(s, b, p=0): s.b, s.p = b, p
    def byte(s): v = s.b[s.p]; s.p += 1; return v
    def bytes(s, n): v = s.b[s.p:s.p + n]; s.p += n; return v
    def num(s):
        first = s.byte(); mask = 0x80; val = 0
        for i in range(8):
            if first & mask == 0:
                hi = first & (mask - 1)
                return val | (hi << (8 * i))
            val |= s.byte() << (8 * i); mask >>= 1
        return val
    def u32(s): return struct.unpack('<I', s.bytes(4))[0]
    def u64(s): return struct.unpack('<Q', s.bytes(8))[0]

def bits(r, n):
    out, mask, cur = [], 0, 0
    for _ in range(n):
        if mask == 0: cur = r.byte(); mask = 0x80
        out.append(bool(cur & mask)); mask >>= 1
    return out

def defined_bits(r, n):
    alld = r.byte()
    return [True] * n if alld else bits(r, n)

def read_pack_info(r):
    pack_pos = r.num(); n = r.num(); sizes = []
    while True:
        t = r.byte()
        if t == 0: break
        if t == 9: sizes = [r.num() for _ in range(n)]
        elif t == 10:
            d = defined_bits(r, n); [r.u32() for x in d if x]
    return pack_pos, sizes

def read_folder(r):
    nc = r.num(); coders = []; total_out = 0
    for _ in range(nc):
        flag = r.byte(); idsize = flag & 0xF
        mid = r.bytes(idsize)
        ins = outs = 1
        if flag & 0x10: ins = r.num(); outs = r.num()
        props = r.bytes(r.num()) if flag & 0x20 else b''
        coders.append({'id': mid.hex(), 'props': props, 'ins': ins, 'outs': outs})
        total_out += outs
    bonds = [(r.num(), r.num()) for _ in range(total_out - 1)]
    total_in = sum(c['ins'] for c in coders)
    npacked = total_in - len(bonds)
    packed = [r.num() for _ in range(npacked)] if npacked > 1 else [0]
    return {'coders': coders, 'bonds': bonds, 'packed': packed, 'total_out': total_out}

def read_unpack_info(r):
    assert r.byte() == 11
    nf = r.num(); assert r.byte() == 0
    folders = [read_folder(r) for _ in range(nf)]
    assert r.byte() == 12
    for f in folders: f['sizes'] = [r.num() for _ in range(f['total_out'])]
    t = r.byte()
    if t == 10:
        d = defined_bits(r, nf); [r.u32() for x in d if x]; t = r.byte()
    assert t == 0
    return folders

def read_substreams(r, folders):
    nums = [1] * len(folders); sizes = []; t = r.byte()
    if t == 13: nums = [r.num() for _ in folders]; t = r.byte()
    for f, n in zip(folders, nums):
        if n == 0: continue
        unp = final_size(f); s = 0
        if t == 9:
            for _ in range(n - 1): x = r.num(); sizes.append(x); s += x
        sizes.append(unp - s)
    if t == 9: t = r.byte()
    while t != 0:
        if t == 10:
            k = sum(1 for f, n in zip(folders, nums) if n != 1 or True) ; cnt = sum(nums)
            d = defined_bits(r, cnt); [r.u32() for x in d if x]
        t = r.byte()
    return nums, sizes

def final_size(f):
    # the output not bound to another coder's input
    bound_out = {b[1] for b in f['bonds']}
    for i in range(f['total_out']):
        if i not in bound_out: return f['sizes'][i]

def read_streams(r):
    pack = None; folders = []; sub = None
    while True:
        t = r.byte()
        if t == 0: break
        if t == 6: pack = read_pack_info(r)
        elif t == 7: folders = read_unpack_info(r)
        elif t == 8: sub = read_substreams(r, folders)
    return pack, folders, sub

def filt(c):
    i, p = c['id'], c['props']
    if i == '030101':
        d = p[0]; lc = d % 9; d //= 9; lp = d % 5; pb = d // 5
        return {'id': lzma.FILTER_LZMA1, 'dict_size': struct.unpack('<I', p[1:5])[0], 'lc': lc, 'lp': lp, 'pb': pb}
    if i == '21':
        b = p[0]; ds = (2 | (b & 1)) << (b // 2 + 11) if b < 40 else 0xFFFFFFFF
        return {'id': lzma.FILTER_LZMA2, 'dict_size': ds}
    if i == '03030103': return {'id': lzma.FILTER_X86}
    if i == '00': return None
    raise SystemExit('unsupported coder ' + i)

def decode_folder(data, start, f):
    coders = f['coders']
    if len(coders) == 1:
        packed = data[start:]
        fl = filt(coders[0])
        if fl is None: return packed[:final_size(f)]
        dec = lzma.LZMADecompressor(format=lzma.FORMAT_RAW, filters=[fl])
        return dec.decompress(packed, max_length=final_size(f))
    # Simple chains (e.g. BCJ + LZMA): filters applied as one raw chain, outer coder last.
    chain = [filt(c) for c in reversed(coders)]
    chain = [c for c in chain if c]
    chain.sort(key=lambda c: c['id'] in (lzma.FILTER_LZMA1, lzma.FILTER_LZMA2))
    dec = lzma.LZMADecompressor(format=lzma.FORMAT_RAW, filters=chain)
    return dec.decompress(data[start:], max_length=final_size(f))

def main():
    path, out = sys.argv[1], sys.argv[2]
    data = open(path, 'rb').read()
    assert data[:6] == b"7z\xbc\xaf\x27\x1c", 'not a 7z file'
    off, size = struct.unpack('<QQ', data[12:28])
    r = R(data, 32 + off)
    t = r.byte()
    if t == 0x17:
        pack, folders, _ = read_streams(r)
        hdr = decode_folder(data, 32 + pack[0], folders[0])
        r = R(hdr); t = r.byte()
    assert t == 1, 'no header'
    t = r.byte()
    if t == 2:
        while r.byte() != 0: pass
        t = r.byte()
    main_pack = main_folders = main_sub = None
    if t == 4:
        main_pack, main_folders, main_sub = read_streams(r); t = r.byte()
    names = []; empty = []
    if t == 5:
        nfiles = r.num(); empty = [False] * nfiles
        while True:
            pt = r.byte()
            if pt == 0: break
            sz = r.num(); body = R(r.bytes(sz))
            if pt == 14: empty = bits(body, nfiles)
            elif pt == 17:
                body.byte(); raw = body.b[body.p:]
                names = raw.decode('utf-16-le').split('\x00')[:nfiles]
    files = [n for n, e in zip(names, empty) if not e]
    nums, sizes = main_sub if main_sub else ([1] * len(main_folders), [final_size(f) for f in main_folders])
    listing = '--list' in sys.argv
    pos = 32 + main_pack[0]; fi = 0; si = 0
    for f, n in zip(main_folders, nums):
        psize = sum(main_pack[1][:len(f['packed'])])
        if listing:
            for _ in range(n): print(sizes[si], files[fi]); si += 1; fi += 1
        else:
            blob = decode_folder(data[:pos + psize], pos, f); o = 0
            for _ in range(n):
                name = files[fi]; s = sizes[si]
                dest = os.path.join(out, name.replace('\\', '/'))
                if not os.path.abspath(dest).startswith(os.path.abspath(out)): raise SystemExit('unsafe path ' + name)
                os.makedirs(os.path.dirname(dest) or out, exist_ok=True)
                open(dest, 'wb').write(blob[o:o + s]); print(s, name)
                o += s; si += 1; fi += 1
        main_pack = (main_pack[0], main_pack[1][len(f['packed']):])
        pos += psize
    for n, e in zip(names, empty):
        if e and not listing: os.makedirs(os.path.join(out, n.replace('\\', '/')), exist_ok=True)

main()
