"""Read meshes and objects from a Blender 2.8x–3.x .blend file (uncompressed), standard library only."""
import struct, re

class Blend:
    def __init__(self, path):
        self.data = data = open(path, 'rb').read()
        assert data[:7] == b'BLENDER', 'not a .blend'
        self.psize = 8 if data[7:8] == b'-' else 4
        self.end = '<' if data[8:9] == b'v' else '>'
        self.version = int(data[9:12])
        p = 12; self.blocks = []; self.by_addr = {}
        ph = 16 + self.psize + 8 - 8
        while p < len(data):
            code = data[p:p + 4]
            size, = struct.unpack(self.end + 'i', data[p + 4:p + 8])
            addr, = struct.unpack(self.end + ('Q' if self.psize == 8 else 'I'), data[p + 8:p + 8 + self.psize])
            sdna, count = struct.unpack(self.end + 'ii', data[p + 8 + self.psize:p + 16 + self.psize])
            start = p + 16 + self.psize
            b = {'code': code.rstrip(b'\0').decode('latin1'), 'size': size, 'addr': addr, 'sdna': sdna, 'count': count, 'start': start}
            self.blocks.append(b)
            if addr: self.by_addr[addr] = b
            if code == b'ENDB': break
            p = start + size
        self._dna(next(b for b in self.blocks if b['code'] == 'DNA1'))

    def _dna(self, b):
        d = self.data; p = b['start']; base = p
        al = lambda q: base + ((q - base + 3) & ~3)          # sections are 4-byte aligned within the DNA block
        assert d[p:p + 4] == b'SDNA'; p += 4
        def section(tag):
            nonlocal p
            assert d[p:p + 4] == tag, tag; p += 4
        section(b'NAME'); n, = struct.unpack(self.end + 'i', d[p:p + 4]); p += 4
        names = []
        for _ in range(n): e = d.index(b'\0', p); names.append(d[p:e].decode('latin1')); p = e + 1
        p = al(p)
        section(b'TYPE'); n, = struct.unpack(self.end + 'i', d[p:p + 4]); p += 4
        types = []
        for _ in range(n): e = d.index(b'\0', p); types.append(d[p:e].decode('latin1')); p = e + 1
        p = al(p)
        section(b'TLEN'); tlen = list(struct.unpack(self.end + 'h' * n, d[p:p + 2 * n])); p += 2 * n
        p = al(p)
        section(b'STRC'); ns, = struct.unpack(self.end + 'i', d[p:p + 4]); p += 4
        self.structs = []; self.struct_by_name = {}
        for _ in range(ns):
            t, nf = struct.unpack(self.end + 'hh', d[p:p + 4]); p += 4
            fields = {}; off = 0
            for _ in range(nf):
                ft, fn = struct.unpack(self.end + 'hh', d[p:p + 4]); p += 4
                name = names[fn]
                dims = [int(x) for x in re.findall(r'\[(\d+)\]', name)]
                ptr = name.startswith('*') or name.startswith('(*')
                base = re.sub(r'\[.*', '', name).lstrip('*').replace('(', '').replace(')', '')
                count = 1
                for x in dims: count *= x
                size = (self.psize if ptr else tlen[ft]) * count
                fields[base] = {'off': off, 'type': types[ft], 'ptr': ptr, 'dims': dims, 'size': size}
                off += size
            s = {'name': types[t], 'size': tlen[t], 'fields': fields}
            self.structs.append(s); self.struct_by_name[types[t]] = s

    # ── reading values ──
    def field(self, struct_name, base, name):
        f = self.struct_by_name[struct_name]['fields'][name]
        o = base + f['off']; d = self.data
        if f['ptr'] and not f['dims']:
            return struct.unpack(self.end + ('Q' if self.psize == 8 else 'I'), d[o:o + self.psize])[0]
        t = f['type']
        if t == 'char': raw = d[o:o + f['size']]; return raw.split(b'\0', 1)[0].decode('utf-8', 'replace')
        fmt = {'float': 'f', 'int': 'i', 'short': 'h', 'double': 'd', 'uchar': 'B', 'ushort': 'H', 'int64_t': 'q', 'uint64_t': 'Q'}.get(t)
        if fmt is None: return o          # a nested struct: return its offset
        n = f['size'] // struct.calcsize(fmt)
        vals = struct.unpack(self.end + fmt * n, d[o:o + f['size']])
        return vals[0] if n == 1 else vals

    def blocks_of(self, code): return [b for b in self.blocks if b['code'] == code]
    def struct_of(self, b): return self.structs[b['sdna']]
