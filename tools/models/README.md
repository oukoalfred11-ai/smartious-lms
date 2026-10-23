# 3D model conversion tools

Standard-library Python (3.10+), no Blender needed. Used to build the real anatomy
models in `frontend/public/models/` for the Virtual Lab's 3D models library.

- `un7z.py ARCHIVE OUTDIR [--list]` — reads a .7z archive (LZMA/LZMA2/BCJ) when 7-Zip is not installed.
- `blend.py` — reads objects and meshes from an uncompressed Blender 2.8x–3.x `.blend` file using its own SDNA description.
- `blend2glb.py IN.blend OUT.glb [--include-insertions]` — writes the visible meshes as a `.glb`: one named node per object
  (names kept, so labels can match them), Y-up, smooth normals, 16-bit quantized positions, colours by material
  (bone, cartilage, teeth…). Objects hidden from render, label lines and cross-section planes are left out.

The skeleton: `python3 blend2glb.py Z-Biomechanics/Startup.blend skeleton.glb` (Z-Anatomy, CC BY-SA; see
`frontend/public/models/LICENSE-skeleton.txt` for the required attribution). Name a new build `skeleton-v2.glb`
and update `src/lab/models/skeleton.js`: the files are cached for a year under their name.
