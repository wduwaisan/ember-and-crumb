> **Superseded.** Every menu item and bag of beans now uses Ember & Crumb's
> own brand photography, supplied as transparent PNGs and committed to
> `img/menu` as WebP. This script is kept because it still documents how the
> earlier images were made, and it is the fallback if artwork is ever missing
> for a new item.

# tools/cutout.py — how the menu PNGs were made

The transparent product shots in `img/menu/` are not stock cut-outs; almost
none exist under a free licence. Pixabay's "transparent" filter returns
cartoon clipart, and the photoreal cut-out look is a paid-stock genre.

So they were made here, from the Unsplash originals mapped in `js/photos.js`:

1. fetch each source photo at 900px
2. run **U2Net** (salient-object segmentation) over it via `onnxruntime`
3. harden the resulting soft matte — a feathered edge over a cream card
   reads as a grey halo rather than a cut-out
4. trim to the subject's bounding box, pad slightly, cap at 460px, save PNG

## Running it again

```bash
pip install onnxruntime pillow numpy
curl -L -o u2net.onnx \
  https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
# download sources into <scratch>/src/<item-id>.jpg, then:
python3 tools/cutout.py <scratch-dir> <repo-dir>
```

`rembg` would normally wrap all of this, but it imports `pymatting` at module
level, which needs `numba` → `llvmlite` → CMake. Calling the model directly
avoids that whole toolchain.

## Judging the output

The script prints a `cover=` figure per image — the fraction of pixels kept.
Below ~0.06 means it found nothing; above ~0.72 means it kept the background
too. Both are worth looking at. Four photos failed on the first pass
(`d-qahwa`, `p-date`, `p-kouign`, `d-wafer`) and were swapped for different
sources rather than patched.
