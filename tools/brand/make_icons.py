"""Make the favicon and search-result icons from the official crest in the logo.

    python3 tools/brand/make_icons.py

Cuts the crest out of frontend/public/brand/logo.png (transparent background) and writes
frontend/public/favicon-*.png and favicon.ico with margins around the shield, so it is never
cropped or enlarged. The large icons (192, 512) have a white square behind the crest, so a
circular crop (as in Google results) does not cut into the shield. Needs Pillow.
"""
from pathlib import Path
from PIL import Image

PUBLIC = Path(__file__).resolve().parents[2] / 'frontend' / 'public'
logo = Image.open(PUBLIC / 'brand' / 'logo.png').convert('RGBA')
# The crest is the left part of the lockup, before the wordmark.
alpha = logo.split()[3].point(lambda a: 255 if a > 24 else 0)
left = alpha.crop((0, 0, int(logo.width * 0.31), logo.height))
crest = logo.crop(left.getbbox())


def icon(size, fill, background=None):
    """The crest centred in a square, its height `fill` of the side."""
    canvas = Image.new('RGBA', (size, size), background or (0, 0, 0, 0))
    h = round(size * fill); w = round(crest.width * h / crest.height)
    c = crest.resize((w, h), Image.LANCZOS)
    canvas.alpha_composite(c, ((size - w) // 2, (size - h) // 2))
    return canvas


small = {16: 0.94, 32: 0.92, 48: 0.9, 64: 0.88, 96: 0.86}       # tabs: as large as possible, still uncut
for size, fill in small.items():
    icon(size, fill).save(PUBLIC / f'favicon-{size}x{size}.png', optimize=True)
for size in (192, 512):                                          # search results, tiles: room for a circle
    icon(size, 0.72, (255, 255, 255, 255)).save(PUBLIC / f'favicon-{size}x{size}.png', optimize=True)
icon(48, 0.9).save(PUBLIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('crest', crest.size, '→ favicons written to', PUBLIC)
