"""Export visible meshes of a Blender 3.0–3.5 file to a .glb (one named node per object).

   python3 -I blend2glb.py IN.blend OUT.glb [options]
     --root NAME          only objects under this top-level collection (repeatable), e.g. "4: Muscular system"
     --collection NAME    only objects in a collection with this name, at any depth (repeatable)
     --name REGEX         only objects whose name matches
     --exclude REGEX      leave out objects whose name or collection matches
     --material REGEX     only objects whose Z-Anatomy material matches (e.g. "lobe|Cerebellum")
     --include-insertions keep muscle insertion patches (left out by default)
     --simplify MM        merge vertices closer than MM millimetres (vertex clustering) to make the file smaller
     --skip-render-hidden leave out objects hidden from Blender's renderer (the Z-Biomechanics skeleton needs this:
                          it hides overlapping sub-regions that way; the full atlas hides real structures too)
     --list               print what would be exported (name, collection, vertices) and stop

   Names, collections and materials are kept, so labels in the lab can match them.
   Structures Z-Anatomy adapted from non-commercial sources (the kidney, CC BY-NC 4.0;
   the inner ear, CC BY-NC-SA 4.0) are always left out: Smartious is a paid platform."""
import sys, struct, json, math, array, re
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from blend import Blend

args = sys.argv[1:]
src, out = args[0], args[1]
def opt_all(flag): return [args[i + 1] for i, a in enumerate(args) if a == flag]
def opt(flag): v = opt_all(flag); return v[-1] if v else None
roots, colls_wanted = opt_all('--root'), opt_all('--collection')
name_re = re.compile(opt('--name')) if opt('--name') else None
excl_re = re.compile(opt('--exclude'), re.I) if opt('--exclude') else None
mat_re = re.compile(opt('--material'), re.I) if opt('--material') else None
with_insertions = '--include-insertions' in args
simplify = float(opt('--simplify')) / 1000 if opt('--simplify') else 0
listing = '--list' in args
skip_render_hidden = '--skip-render-hidden' in args

b = Blend(src)
F = b.field
PTR = '<Q' if b.psize == 8 else '<I'

# Blender writes each ID block followed by its own data blocks. Old addresses can repeat
# across the file (3.5 reuses one buffer for every mesh's legacy vertices), so a pointer
# is resolved in the run of data blocks that follows its owner, then globally.
index_of = {id(x): i for i, x in enumerate(b.blocks)}
def local(owner_block):
    i = index_of[id(owner_block)] + 1; m = {}
    while i < len(b.blocks) and b.blocks[i]['code'] == 'DATA':
        m.setdefault(b.blocks[i]['addr'], b.blocks[i]); i += 1
    return m
def resolve(addr, run):
    return run.get(addr) or b.by_addr.get(addr)

# Collections: membership and top-level parent.
coll_of, parent = {}, {}
for g in b.blocks_of('GR'):
    gname = F('ID', F('Collection', g['start'], 'id'), 'name')[2:]
    first = F('ListBase', F('Collection', g['start'], 'gobject'), 'first')
    while first in b.by_addr:
        blk = b.by_addr[first]
        coll_of.setdefault(F('CollectionObject', blk['start'], 'ob'), []).append(gname)
        first = F('CollectionObject', blk['start'], 'next')
    first = F('ListBase', F('Collection', g['start'], 'children'), 'first')
    while first in b.by_addr:
        blk = b.by_addr[first]; c = F('CollectionChild', blk['start'], 'collection')
        if c in b.by_addr: parent[F('ID', F('Collection', b.by_addr[c]['start'], 'id'), 'name')[2:]] = gname
        first = F('CollectionChild', blk['start'], 'next')
def root_of(c):
    n = 0
    while c in parent and n < 64: c = parent[c]; n += 1
    return c

def material(ob_block, me_block):
    for st, blk in (('Object', ob_block), ('Mesh', me_block)):
        run = local(blk); arr = resolve(F(st, blk['start'], 'mat'), run)
        if arr:
            ptr, = struct.unpack_from(PTR, b.data, arr['start'])
            if ptr in b.by_addr: return F('ID', F('Material', b.by_addr[ptr]['start'], 'id'), 'name')[2:]
    return 'Bone'

# The kidney (CC BY-NC) and the inner ear (CC BY-NC-SA). "(?<![a-z])renal" keeps the suprarenal (adrenal) gland.
NON_COMMERCIAL = re.compile(r'kidney|(?<![a-z])renal|nephron|cochlea(?!r nucle)|^vestibule|semicircular|labyrinth|utricle|saccule|spiral organ|organ of corti|endolymph|perilymph', re.I)
LABEL_PARTS = re.compile(r'(\.(j|t|g|st)|-line|-txt)$')
HELPER_MATERIALS = re.compile(r'^(Text|Lines|Planes|Directions|Movement|Dots Stroke|Black)', re.I)
legacy = 'mvert' in b.struct_by_name['Mesh']['fields']          # Blender ≤ 3.4 keeps arrays on the mesh

objs = []
for o in b.blocks_of('OB'):
    s = o['start']
    if F('Object', s, 'type') != 1: continue
    name = F('ID', F('Object', s, 'id'), 'name')[2:]
    me = b.by_addr.get(F('Object', s, 'data'))
    if not me: continue
    ms = me['start']
    nv, np_ = F('Mesh', ms, 'totvert'), F('Mesh', ms, 'totpoly')
    colls = coll_of.get(o['addr'], [])
    if np_ < 4 or LABEL_PARTS.search(name): continue
    if NON_COMMERCIAL.search(name) or any(NON_COMMERCIAL.search(c) for c in colls):
        print('left out (non-commercial licence):', name, file=sys.stderr); continue
    if skip_render_hidden and F('Object', s, 'restrictflag') & 4: continue
    if any(c in ('Cross section planes',) for c in colls): continue
    if not with_insertions and any('nsertion' in c for c in colls): continue
    if roots and not any(root_of(c) in roots for c in colls): continue
    if colls_wanted and not any(c in colls_wanted for c in colls): continue
    if name_re and not name_re.search(name): continue
    if excl_re and (excl_re.search(name) or any(excl_re.search(c) for c in colls)): continue
    mat = material(o, me)
    if HELPER_MATERIALS.search(mat): continue
    if mat_re and not mat_re.search(mat): continue
    objs.append((name, o, me, nv, np_, colls, mat))

print('objects', len(objs), file=sys.stderr)
if listing:
    for name, o, me, nv, np_, colls, mat in objs: print(nv, name, '|', ' / '.join(colls[:2]), '|', mat)
    sys.exit(0)

def layer(me, cdname, ltype):
    """The data block of the first CustomData layer of this type (Blender 3.5 meshes)."""
    run = local(me); cd = F('Mesh', me['start'], cdname)
    lp = resolve(F('CustomData', cd, 'layers'), run)
    if not lp: return None
    L = b.struct_by_name['CustomDataLayer']['size']
    for i in range(F('CustomData', cd, 'totlayer')):
        base = lp['start'] + i * L
        if F('CustomDataLayer', base, 'type') == ltype: return resolve(F('CustomDataLayer', base, 'data'), run)
    return None

MV = b.struct_by_name['MVert']; MP = b.struct_by_name['MPoly']
co_off = MV['fields']['co']['off']

def mesh_arrays(o, me, nv, np_):
    d = b.data; ms = me['start']
    if legacy:
        run = local(me)
        vb = resolve(F('Mesh', ms, 'mvert'), run); pb = resolve(F('Mesh', ms, 'mpoly'), run); lb = resolve(F('Mesh', ms, 'mloop'), run)
    else:
        vb, pb, lb = layer(me, 'vdata', 0), layer(me, 'pdata', 25), layer(me, 'ldata', 26)
    if not (vb and pb and lb) or vb['count'] < nv: return None
    m = F('Object', o['start'], 'obmat')          # 16 floats, column-major (m[12..14] = translation)
    pos = array.array('f')
    vs = vb['size'] // vb['count']; p0 = vb['start']
    for i in range(nv):
        x, y, z = struct.unpack_from('<fff', d, p0 + i * vs + co_off)
        wx = m[0] * x + m[4] * y + m[8] * z + m[12]
        wy = m[1] * x + m[5] * y + m[9] * z + m[13]
        wz = m[2] * x + m[6] * y + m[10] * z + m[14]
        pos.extend((wx, wz, -wy))                # Blender Z-up → glTF Y-up
    nl = F('Mesh', ms, 'totloop')
    loops = struct.unpack_from('<' + 'II' * nl, d, lb['start'])[0::2]
    idx = array.array('I')
    ps = MP['size']; q0 = pb['start']
    for i in range(np_):
        ls, tl = struct.unpack_from('<ii', d, q0 + i * ps)
        for k in range(1, tl - 1): idx.extend((loops[ls], loops[ls + k], loops[ls + k + 1]))
    det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5])
    if det < 0:                                  # mirrored objects: flip the winding
        for t in range(0, len(idx), 3): idx[t + 1], idx[t + 2] = idx[t + 2], idx[t + 1]
    if simplify:
        pos, idx, nv = cluster(pos, idx, nv, simplify)
    return pos, normals(pos, idx, nv), idx, nv

def cluster(pos, idx, nv, g):
    """Vertex clustering: merge the vertices in each g-sized cell (their mean), drop collapsed triangles."""
    cells, remap, acc = {}, [0] * nv, []
    for v in range(nv):
        x, y, z = pos[3 * v], pos[3 * v + 1], pos[3 * v + 2]
        k = (math.floor(x / g), math.floor(y / g), math.floor(z / g))
        c = cells.get(k)
        if c is None: c = cells[k] = len(acc); acc.append([0.0, 0.0, 0.0, 0])
        a = acc[c]; a[0] += x; a[1] += y; a[2] += z; a[3] += 1; remap[v] = c
    np2 = array.array('f')
    for a in acc: np2.extend((a[0] / a[3], a[1] / a[3], a[2] / a[3]))
    ni, seen = array.array('I'), set()
    for t in range(0, len(idx), 3):
        a, c, e = remap[idx[t]], remap[idx[t + 1]], remap[idx[t + 2]]
        if a == c or c == e or a == e: continue
        key = tuple(sorted((a, c, e)))
        if key in seen: continue
        seen.add(key); ni.extend((a, c, e))
    return np2, ni, len(acc)

def normals(pos, idx, nv):
    nrm = [0.0] * (3 * nv)
    for t in range(0, len(idx), 3):
        a, c, e = idx[t], idx[t + 1], idx[t + 2]
        ax, ay, az = pos[3 * a:3 * a + 3]; bx, by, bz = pos[3 * c:3 * c + 3]; cx, cy, cz = pos[3 * e:3 * e + 3]
        ux, uy, uz = bx - ax, by - ay, bz - az; vx, vy, vz = cx - ax, cy - ay, cz - az
        nx, ny, nz = uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx
        for v in (a, c, e): nrm[3 * v] += nx; nrm[3 * v + 1] += ny; nrm[3 * v + 2] += nz
    nb = array.array('b')
    for v in range(nv):
        x, y, z = nrm[3 * v:3 * v + 3]; l = math.sqrt(x * x + y * y + z * z) or 1
        nb.extend((round(127 * x / l), round(127 * y / l), round(127 * z / l), 0))
    return nb

# Plain textbook colours by material family (Z-Anatomy's material names).
FAMILIES = [
    ('Bone', r'^(Bone|Suture)', [0.89, 0.85, 0.76]), ('Cartilage', r'^(Cartilage|Articular capsule)', [0.62, 0.78, 0.86]),
    ('Teeth', r'^(Teeth|Dentine)', [0.97, 0.96, 0.92]), ('Tendon', r'^(Tendon|Fascia|Ligament|Origin-Ligament)', [0.91, 0.88, 0.80]),
    ('Muscular origin', r'^(Muscular origin|Origin)', [0.82, 0.25, 0.25]), ('Muscular ending', r'^(Muscular ending|End-)', [0.25, 0.4, 0.82]),
    ('Artery', r'^(Artery|Pulmonary vein)', [0.77, 0.17, 0.2]), ('Vein', r'^(Vein|Pulmonary artery)', [0.25, 0.36, 0.66]),
    ('Heart', r'^Heart', [0.66, 0.2, 0.23]), ('Nerve', r'^(Nerve|Nucleus)', [0.91, 0.77, 0.28]),
    ('Frontal lobe', r'^Frontal lobe', [0.91, 0.64, 0.49]), ('Parietal lobe', r'^Parietal lobe', [0.61, 0.77, 0.91]),
    ('Temporal lobe', r'^Temporal lobe', [0.72, 0.85, 0.6]), ('Occipital lobe', r'^Occipital lobe', [0.91, 0.76, 0.88]),
    ('Cerebellum', r'^Cerebellum', [0.91, 0.83, 0.54]), ('Limbic lobe', r'^(Limbic lobe|Insula)', [0.94, 0.71, 0.71]),
    ('Brain', r'^(Brain|White matter|Interlobar)', [0.93, 0.84, 0.8]), ('CSF', r'^LCR', [0.75, 0.89, 0.97]),
    ('Lung', r'^Lung', [0.91, 0.64, 0.63]), ('Bronchi', r'^Bronchi', [0.91, 0.86, 0.78]),
    ('Liver and bile', r'^(Gallbladder|Biliary|Ductus)', [0.42, 0.64, 0.29]), ('Gland', r'^Gland', [0.85, 0.64, 0.42]),
    ('Lymph', r'^Lymph', [0.62, 0.75, 0.48]), ('Organ', r'^(Organ|Mucosa|Intestine|Peritoneum|Diaphragm)', [0.85, 0.54, 0.47]),
    ('Eye', r'^(Eye|Cornea|Iris)', [0.95, 0.95, 0.97]), ('Skin', r'^Skin', [0.91, 0.77, 0.66]), ('Fat', r'^Fat', [0.95, 0.85, 0.55]),
    ('Bursa', r'^Bursa', [0.81, 0.89, 0.94]), ('Nail', r'^Nail', [0.95, 0.9, 0.88]),
    ('Muscle', r'.', [0.71, 0.26, 0.24]),          # every other Z-Anatomy material is a muscle grouped by its action
]
# Organs share Z-Anatomy materials, so they are coloured by name (textbook colours).
BY_NAME = [
    ('Liver', r'^Liver', [0.55, 0.2, 0.17]), ('Stomach', r'^(Stomach|Duodenum)', [0.9, 0.58, 0.55]),
    ('Large intestine', r'(colon|appendix|Caecum|Rectum)', [0.88, 0.7, 0.55]), ('Pancreas', r'^Pancreas', [0.93, 0.78, 0.45]),
    ('Gallbladder', r'^Gallbladder', [0.36, 0.6, 0.27]), ('Urinary bladder', r'^Urinary bladder', [0.95, 0.85, 0.5]),
    ('Trachea', r'^Trachea', [0.85, 0.9, 0.95]), ('Lung', r'lobe of (right|left) lung', [0.93, 0.6, 0.6]),
    ('Thyroid', r'^Thyroid gland', [0.8, 0.4, 0.45]), ('Suprarenal gland', r'^Suprarenal', [0.95, 0.75, 0.35]),
]
FAMILIES = FAMILIES[:-1] + BY_NAME + FAMILIES[-1:]
FAM = [(n, re.compile(r), c) for n, r, c in FAMILIES]
BYN = [(n, re.compile(r, re.I)) for n, r, c in BY_NAME]
def family(mat, name=''):
    return next((n for n, r in BYN if r.search(name)), None) or next(n for n, r, c in FAM if r.search(mat))

gl = {'asset': {'version': '2.0', 'generator': 'Smartious blend2glb', 'copyright': 'BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan; Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0'},
      'extensionsUsed': ['KHR_mesh_quantization'], 'extensionsRequired': ['KHR_mesh_quantization'],
      'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'accessors': [], 'bufferViews': [], 'materials': []}
mat_index = {}
def mat_for(fam):
    if fam not in mat_index:
        c = next(c for n, r, c in FAM if n == fam)
        mat_index[fam] = len(gl['materials'])
        gl['materials'].append({'name': fam, 'pbrMetallicRoughness': {'baseColorFactor': c + [1], 'metallicFactor': 0.0, 'roughnessFactor': 0.62}})
    return mat_index[fam]

bin_ = bytearray()
def view(data, target=None, stride=None):
    while len(bin_) % 4: bin_.append(0)
    v = {'buffer': 0, 'byteOffset': len(bin_), 'byteLength': len(data)}
    if target: v['target'] = target
    if stride: v['byteStride'] = stride
    bin_.extend(data); gl['bufferViews'].append(v); return len(gl['bufferViews']) - 1

total_v = total_t = 0
for name, o, me, nv, np_, colls, mat in objs:
    arrs = mesh_arrays(o, me, nv, np_)
    if not arrs: print('skipped (no mesh data):', name, file=sys.stderr); continue
    pos, nb, idx, nv = arrs
    if not len(idx): continue
    mn = [min(pos[i::3]) for i in range(3)]; mx = [max(pos[i::3]) for i in range(3)]
    # Positions as 16-bit integers (KHR_mesh_quantization); the node's scale and translation restore them.
    sc = [max(mx[i] - mn[i], 1e-9) / 65535 for i in range(3)]
    qp = array.array('h')
    for v in range(nv):
        qp.extend([round((pos[3 * v + i] - mn[i]) / sc[i]) - 32768 for i in range(3)] + [0])
    tr = [mn[i] + 32768 * sc[i] for i in range(3)]
    qmin = [-32768] * 3; qmax = [round((mx[i] - mn[i]) / sc[i]) - 32768 for i in range(3)]
    pa = len(gl['accessors']); gl['accessors'].append({'bufferView': view(qp.tobytes(), 34962, 8), 'componentType': 5122, 'count': nv, 'type': 'VEC3', 'min': qmin, 'max': qmax})
    na = len(gl['accessors']); gl['accessors'].append({'bufferView': view(nb.tobytes(), 34962, 4), 'componentType': 5120, 'normalized': True, 'count': nv, 'type': 'VEC3'})
    small = nv < 65536
    ib = array.array('H', idx) if small else idx
    ia = len(gl['accessors']); gl['accessors'].append({'bufferView': view(ib.tobytes(), 34963), 'componentType': 5123 if small else 5125, 'count': len(idx), 'type': 'SCALAR'})
    gl['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na}, 'indices': ia, 'material': mat_for(family(mat, name))}]})
    gl['nodes'].append({'name': name, 'mesh': len(gl['meshes']) - 1, 'translation': tr, 'scale': sc, 'extras': {'collections': colls, 'material': mat}})
    gl['scenes'][0]['nodes'].append(len(gl['nodes']) - 1)
    total_v += nv; total_t += len(idx) // 3
gl['buffers'] = [{'byteLength': len(bin_)}]
js = json.dumps(gl, separators=(',', ':')).encode()
js += b' ' * ((4 - len(js) % 4) % 4)
while len(bin_) % 4: bin_.append(0)
with open(out, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(bin_), 0x004E4942)); f.write(bin_)
print('vertices', total_v, 'triangles', total_t, 'bytes', 28 + len(js) + len(bin_), file=sys.stderr)
