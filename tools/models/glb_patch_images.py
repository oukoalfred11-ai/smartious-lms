"""Paint rectangles over images inside a .glb and repack it.
usage: glb_patch_images.py IN.glb OUT.glb 'IMAGE_NAME:x0,y0,x1,y1:sx,sy' ...
Every image with that name (e.g. the WebP and its JPEG fallback) gets the rectangle
filled with the colour sampled at (sx, sy)."""
import sys, json, struct, io
from PIL import Image, ImageDraw
src, dst, *edits = sys.argv[1:]
d = open(src, 'rb').read()
n, = struct.unpack('<I', d[12:16]); j = json.loads(d[20:20 + n])
bl, = struct.unpack('<I', d[20 + n:24 + n]); bin_ = d[28 + n:28 + n + bl]
views = [bytes(bin_[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]) for v in j['bufferViews']]
fmt = {'image/webp': 'WEBP', 'image/png': 'PNG', 'image/jpeg': 'JPEG'}
done = 0
for e in edits:
    name, box, at = e.split(':'); box = [int(x) for x in box.split(',')]; at = [int(x) for x in at.split(',')]
    for im in j['images']:
        if im.get('name') != name: continue
        img = Image.open(io.BytesIO(views[im['bufferView']])); mode = img.mode; img = img.convert('RGBA')
        ImageDraw.Draw(img).rectangle(box, fill=img.getpixel(tuple(at)))
        out = io.BytesIO(); f = fmt[im['mimeType']]
        (img.convert('RGB') if f == 'JPEG' else img.convert(mode if mode in ('RGB', 'RGBA') else 'RGBA')).save(out, f, **({'quality': 90} if f != 'PNG' else {}))
        views[im['bufferView']] = out.getvalue(); done += 1
body = bytearray()
for v, data in zip(j['bufferViews'], views):
    body += b'\0' * (-len(body) % 4); v['byteOffset'] = len(body); v['byteLength'] = len(data); body += data
body += b'\0' * (-len(body) % 4); j['buffers'][0]['byteLength'] = len(body)
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(body)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(body)) + b'BIN\0' + body
open(dst, 'wb').write(out); print(dst, done, 'images patched', len(out), 'bytes')
