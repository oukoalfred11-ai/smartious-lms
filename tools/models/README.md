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
    python3 -I blend2glb.py $B muscles.glb --root "4: Muscular system" --root "1: Skeletal system" --names-file muscles-v1.names.txt --simplify 3.5

    python3 -I blend2glb.py $B knee.glb --root "1: Skeletal system" --root "3: Joints" --crop-y 0.33,0.53 --name "^(Femur|Tibia|Fibula|Patella|Anterior cruciate ligament|Posterior cruciate ligament|Lateral meniscus|Medial meniscus|Superficial part of tibial collateral ligament|Deep part of tibial collateral ligament|Transverse ligament of knee|Articular capsule of knee joint|Oblique popliteal ligament|Arcuate popliteal ligament|Popliteofibular ligament|Meniscopatellar ligament|.*meniscotibial ligament.*|Anterior ligament of fibular head|Posterior ligament of fibular head)\.r$"
    python3 -I blend2glb.py $B hip.glb --root "1: Skeletal system" --root "3: Joints" --crop-y 0.66,1.3 --name "^(Femur|Hip bone|Acetabular labrum|Articular capsule of hip joint|Descending part of iliofemoral ligament|Transverse part of iliofemoral ligament|Ischiofemoral ligament|Ligament of head of femur|Pubofemoral ligament|Transverse acetabular ligament)\.r$"
    python3 -I blend2glb.py $B skull.glb --root "1: Skeletal system" --crop-y 1.45,2.0 --exclude "^(Atlas|Axis|Vertebra|Arytenoid|Corniculate|Cricoid|Thyroid cartilage|Hyoid|Malleus|Incus|Stapes|Anterior cells|Middle cells|Posterior cells|Sinus of)"

(The ear ossicles are left out of the skull to be safe: Z-Anatomy's inner-ear model is non-commercial and it is not
clear which ear structures come from it.)

`--crop-y` cuts the meshes at two heights (triangles are clipped exactly at the planes), so a joint can be shown
without the whole length of its bones.

`muscles-v1.names.txt` lists the muscles and bones that can be seen from outside. It was made by rendering the
figure from 26 directions with each object in its own flat colour, and keeping the objects whose visible area was
at least 20% (muscles) or 5% (bones, with the muscles on) of their area when drawn alone; deep muscles that only
peek through gaps were left out. That keeps the full figure to 5.5 MB.
