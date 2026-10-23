"""Export the visible meshes of a Blender 3.x file to a .glb (one named node per object).
   python3 -I blend2glb.py IN.blend OUT.glb [--include-insertions]"""
import sys, struct, json, math, array
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from blend import Blend

src, out = sys.argv[1], sys.argv[2]
with_insertions = '--include-insertions' in sys.argv
b = Blend(src)
F = b.field

def name_of(addr, st='Object'):
    return F('ID', F(st, b.by_addr[addr]['start'], 'id'), 'name')[2:]

# Collections each object belongs to.
coll_of = {}
for g in b.blocks_of('GR'):
    gname = F('ID', F('Collection', g['start'], 'id'), 'name')[2:]
    first = F('ListBase', F('Collection', g['start'], 'gobject'), 'first')
    while first in b.by_addr:
        blk = b.by_addr[first]
        coll_of.setdefault(F('CollectionObject', blk['start'], 'ob'), []).append(gname)
        first = F('CollectionObject', blk['start'], 'next')

def first_material(ob_start, me_start):
    for st, base in (('Object', ob_start), ('Mesh', me_start)):
        arr = F(st, base, 'mat')
        if arr in b.by_addr:
            ptr, = struct.unpack('<Q', b.data[b.by_addr[arr]['start']:b.by_addr[arr]['start'] + 8])
            if ptr in b.by_addr: return F('ID', F('Material', b.by_addr[ptr]['start'], 'id'), 'name')[2:]
    return 'Bone'

MV = b.struct_by_name['MVert']; MP = b.struct_by_name['MPoly']; ML = b.struct_by_name['MLoop']
co_off = MV['fields']['co']['off']
objs = []
for o in b.blocks_of('OB'):
    s = o['start']
    if F('Object', s, 'type') != 1: continue
    name = F('ID', F('Object', s, 'id'), 'name')[2:]
    me = F('Object', s, 'data')
    if me not in b.by_addr: continue
    ms = b.by_addr[me]['start']
    nv, np_ = F('Mesh', ms, 'totvert'), F('Mesh', ms, 'totpoly')
    colls = coll_of.get(o['addr'], [])
    if np_ < 4 or name.endswith('-line'): continue
    if F('Object', s, 'restrictflag') & 4: continue                         # not rendered in Z-Anatomy either
    if any(c in ('Cross section planes',) for c in colls): continue
    if not with_insertions and any('nsertion' in c for c in colls): continue
    objs.append((name, s, ms, nv, np_, colls))

print('objects', len(objs), file=sys.stderr)

def mesh_arrays(ob_start, ms, nv, np_):
    d = b.data
    vb = b.by_addr[F('Mesh', ms, 'mvert')]; pb = b.by_addr[F('Mesh', ms, 'mpoly')]; lb = b.by_addr[F('Mesh', ms, 'mloop')]
    m = F('Object', ob_start, 'obmat')          # 16 floats, column-major (m[12..14] = translation)
    pos = array.array('f')
    vs = MV['size']; p0 = vb['start']
    for i in range(nv):
        x, y, z = struct.unpack_from('<fff', d, p0 + i * vs + co_off)
        wx = m[0] * x + m[4] * y + m[8] * z + m[12]
        wy = m[1] * x + m[5] * y + m[9] * z + m[13]
        wz = m[2] * x + m[6] * y + m[10] * z + m[14]
        pos.extend((wx, wz, -wy))                # Blender Z-up → glTF Y-up
    loops = struct.unpack_from('<' + 'II' * F('Mesh', ms, 'totloop'), d, lb['start'])[0::2]
    idx = array.array('I')
    ps = MP['size']; q0 = pb['start']
    for i in range(np_):
        ls, tl = struct.unpack_from('<ii', d, q0 + i * ps)
        for k in range(1, tl - 1): idx.extend((loops[ls], loops[ls + k], loops[ls + k + 1]))
    # Mirrored objects (negative scale) need their winding flipped.
    det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5])
    if det < 0:
        for t in range(0, len(idx), 3): idx[t + 1], idx[t + 2] = idx[t + 2], idx[t + 1]
    # Smooth normals (area weighted).
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
    return pos, nb, idx

COLOURS = {'Bone': [0.89, 0.85, 0.76], 'Cartilage': [0.62, 0.78, 0.86], 'Teeth': [0.97, 0.96, 0.92], 'Suture': [0.75, 0.68, 0.55],
           'Muscular origin': [0.82, 0.25, 0.25], 'Muscular ending': [0.25, 0.4, 0.82], 'White matter': [0.95, 0.93, 0.88]}
mats = list(COLOURS)
gl = {'asset': {'version': '2.0', 'generator': 'Smartious blend2glb', 'copyright': 'Z-Anatomy (CC BY-SA 4.0), based on BodyParts3D (DBCLS, CC BY-SA 2.1 JP)'},
      'extensionsUsed': ['KHR_mesh_quantization'], 'extensionsRequired': ['KHR_mesh_quantization'],
      'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'accessors': [], 'bufferViews': [],
      'materials': [{'name': k, 'pbrMetallicRoughness': {'baseColorFactor': v + [1], 'metallicFactor': 0.0, 'roughnessFactor': 0.62}} for k, v in COLOURS.items()]}
bin_ = bytearray()
def view(data, target=None, stride=None):
    while len(bin_) % 4: bin_.append(0)
    v = {'buffer': 0, 'byteOffset': len(bin_), 'byteLength': len(data)}
    if target: v['target'] = target
    if stride: v['byteStride'] = stride
    bin_.extend(data); gl['bufferViews'].append(v); return len(gl['bufferViews']) - 1

total_v = total_t = 0
for name, s, ms, nv, np_, colls in objs:
    pos, nb, idx = mesh_arrays(s, ms, nv, np_)
    mn = [min(pos[i::3]) for i in range(3)]; mx = [max(pos[i::3]) for i in range(3)]
    # Positions as 16-bit integers (KHR_mesh_quantization); the node's scale and translation restore them.
    sc = [max(mx[i] - mn[i], 1e-9) / 65535 for i in range(3)]
    qp = array.array('h')
    for v in range(nv):
        qp.extend([round((pos[3 * v + i] - mn[i]) / sc[i]) - 32768 for i in range(3)] + [0])
    tr = [mn[i] + 32768 * sc[i] for i in range(3)]
    qmin = [round((mn[i] - mn[i]) / sc[i]) - 32768 for i in range(3)]; qmax = [round((mx[i] - mn[i]) / sc[i]) - 32768 for i in range(3)]
    pa = len(gl['accessors']); gl['accessors'].append({'bufferView': view(qp.tobytes(), 34962, 8), 'componentType': 5122, 'count': nv, 'type': 'VEC3', 'min': qmin, 'max': qmax})
    na = len(gl['accessors']); gl['accessors'].append({'bufferView': view(nb.tobytes(), 34962, 4), 'componentType': 5120, 'normalized': True, 'count': nv, 'type': 'VEC3'})
    small = nv < 65536
    ib = array.array('H', idx) if small else idx
    ia = len(gl['accessors']); gl['accessors'].append({'bufferView': view(ib.tobytes(), 34963), 'componentType': 5123 if small else 5125, 'count': len(idx), 'type': 'SCALAR'})
    mat = first_material(s, ms)
    gl['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na}, 'indices': ia, 'material': mats.index(mat) if mat in mats else 0}]})
    gl['nodes'].append({'name': name, 'mesh': len(gl['meshes']) - 1, 'translation': tr, 'scale': sc, 'extras': {'collections': colls}})
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
