# 3D model conversion tools

Standard-library Python (3.10+), no Blender needed. Used to build the real anatomy
models in `frontend/public/models/` for the Virtual Lab's 3D models library.

- `un7z.py ARCHIVE OUTDIR [--list]` — reads a .7z archive (LZMA/LZMA2/BCJ) when 7-Zip is not installed.
- `blend.py` — reads objects and meshes from an uncompressed Blender 2.8x–3.x `.blend` file using its own SDNA description.
- `blend2glb.py IN.blend OUT.glb [options]` — writes the visible meshes as a `.glb`: one named node per object
  (names kept, so labels can match them; the Z-Anatomy material and collections go in the node's extras), Y-up,
  smooth normals, 16-bit quantized positions, colours by material or organ. Label lines, text and helper objects
  are left out, and so are the non-commercial structures (below), always. Reads Blender 2.8x–3.5 files.
  Options: `--list` (print the collections and objects), `--root NAME` / `--collection RE` (what to export),
  `--name RE` / `--exclude RE` / `--material RE` (filter objects), `--simplify MM` (vertex clustering),
  `--skip-render-hidden`, `--include-insertions`.
- `glb_patch_images.py IN.glb OUT.glb 'IMAGE:x0,y0,x1,y1:sx,sy' ...` — paints rectangles over a .glb's textures (every
  copy of the named image, e.g. a WebP and its JPEG fallback) with the colour sampled at (sx, sy), and repacks the file (needs Pillow).
  Used to remove the NASA and JPL logos: see `frontend/public/models/LICENSE-nasa.txt`.

The skeleton: `python3 -I blend2glb.py Z-Biomechanics/Startup.blend skeleton.glb --skip-render-hidden`.

The full atlas (`Startup.blend` in `Z-Anatomy.zip` from https://github.com/Z-Anatomy/Models-of-human-anatomy):

    B=Z-Anatomy/Startup.blend
    python3 -I blend2glb.py $B heart.glb --root "5: Cardiovascular system" --exclude "sinus|plexus|communicating"
    python3 -I blend2glb.py $B organs.glb --root "8: Visceral systems" --exclude "Genital|Pleura|Testis|penis|Prostate|Seminal|Epididymis|parathyroid|parotid|Gingiva|Uvula|palate|Mucosa of nasal|pharynx|taenia|Meso|omentum|segment of liver|Tongue|Epiglottis|lingual|mandibular|hypophysis|Pineal"
    python3 -I blend2glb.py $B brain.glb --root "7: Nervous system & Sense organs" --material "lobe|Cerebellum|Insula|Interlobar|^Brain$" --exclude "fasciculus|spinal|Filum|Conus" --simplify 1.0

All are Z-Anatomy, CC BY-SA 4.0, from BodyParts3D, CC BY-SA 2.1 JP; see `frontend/public/models/LICENSE-*.txt`
for the required attribution.

**Licences when converting more of Z-Anatomy.** Most of the atlas is CC BY-SA (fine: credit it, keep the licence).
But Z-Anatomy lists two adapted models that are **non-commercial**: "Kidney - by Lissie Cowley - CC-BY-NC 4.0" and
"Anatomy of the Inner Ear - by University of Dundee School of Medicine - CC-BY-NC-SA 4.0". Smartious charges fees, so
leave those objects out of any export (the kidney and the inner-ear structures: cochlea, vestibule, semicircular canals).
"Cranial Nerves and Foramina" (University of Dundee) is CC BY 4.0 and may be used with its credit. Name a new build `skeleton-v2.glb` (or `brain-v2.glb`…)
and update the model's `.js` file: the files are cached for a year under their name.
