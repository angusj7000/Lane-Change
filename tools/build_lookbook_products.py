"""
Build product photography from the confirmed lookbook sheets.

Each sheet in design/reference/products/<slug>.webp is a 2-row layout:
  top row    front · side · back · front (3/4)    full-length on-model shots
  bottom row chest print · back print · fabric · neck label   close-ups

Outputs 4:5 images (1000x1250) to src/assets/images/products/:
  <slug>-front, -side, -back, -fit, -detail, -print, -fabric, -label

Full-length shots keep their studio backdrop, extended sideways to 4:5.
When original high-res photography is available, drop the files in with the
same names instead — no code changes needed.

Usage:  python3 tools/build_lookbook_products.py
Needs:  pip install numpy opencv-python-headless
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design/reference/products"
OUT = ROOT / "src/assets/images/products"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1000, 1250
rng = np.random.default_rng(3)

# sheet geometry (all sheets share the same 1312x1199 layout)
TOP = [(0, 375), (381, 653), (658, 1022), (1028, 1312)]      # x ranges, y 0..841
TOP_Y = (0, 841)
BOTTOM = [(0, 326), (329, 655), (658, 983), (986, 1312)]     # x ranges, y 846..1199
BOTTOM_Y = (847, 1199)
TOP_VIEWS = ["front", "side", "back", "fit"]
BOTTOM_VIEWS = ["detail", "print", "fabric", "label"]


def save(name, im):
    cv2.imwrite(str(OUT / f"{name}.jpg"), np.clip(im, 0, 255).astype(np.uint8),
                [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])


def sharpen(im, amt=0.35, sigma=1.3):
    blur = cv2.GaussianBlur(im, (0, 0), sigma)
    return cv2.addWeighted(im, 1 + amt, blur, -amt, 0)


PAPER = np.array([231, 232, 232], np.float32)   # BGR of --paper (#e8e8e7) in src/styles/global.css


def flatten_backdrop(img):
    """Even out studio lighting so the backdrop is exactly PAPER everywhere.

    Estimates the backdrop's brightness field with the model masked out, then
    applies the difference to the whole frame (a smooth lighting correction, so
    the garment keeps its colour relative to its surroundings).
    """
    h, w = img.shape[:2]
    lum = img.mean(axis=2)
    sat = img.max(axis=2) - img.min(axis=2)
    model = ((lum < 205) | (sat > 18)).astype(np.uint8) * 255
    model = cv2.dilate(model, np.ones((31, 31), np.uint8))
    small = cv2.resize(np.clip(img, 0, 255).astype(np.uint8), (w // 8, h // 8), interpolation=cv2.INTER_AREA)
    smask = cv2.resize(model, (w // 8, h // 8), interpolation=cv2.INTER_NEAREST)
    field = cv2.inpaint(small, smask, 5, cv2.INPAINT_TELEA).astype(np.float32)
    field = cv2.GaussianBlur(field, (0, 0), 4)
    field = cv2.resize(field, (w, h), interpolation=cv2.INTER_CUBIC)
    return img + (PAPER[None, None, :] - field)


def backdrop_profile(strip):
    """Per-row backdrop colour from an edge strip, ignoring the (darker) model."""
    lum = strip.mean(axis=2)
    out = np.empty((strip.shape[0], 3), np.float32)
    for y in range(strip.shape[0]):
        row = strip[y]
        light = row[lum[y] >= np.percentile(lum[y], 70)]
        out[y] = light.mean(axis=0)
    return cv2.GaussianBlur(out[:, None, :], (0, 0), 12)[:, 0, :]


def extend(img, tw, th):
    """Extend a photo to tw x th: studio backdrop sideways, soft edge stretch top/bottom."""
    h, w = img.shape[:2]
    if tw > w:  # sideways: paint the backdrop colour, never stretch the model
        left = (tw - w) // 2
        right = tw - w - left
        lp = backdrop_profile(img[:, :24])
        rp = backdrop_profile(img[:, -24:])
        out = np.empty((h, tw, 3), np.float32)
        out[:, :left] = lp[:, None, :]
        out[:, left + w:] = rp[:, None, :]
        out[:, left:left + w] = img
        # blend a narrow seam so the panel edge disappears
        m = np.zeros((h, tw), np.float32)
        m[:, left + 3:left + w - 3] = 1
        m = cv2.GaussianBlur(m, (0, 0), 2.5)[..., None]
        fill = out.copy()
        fill[:, left:left + w // 2] = lp[:, None, :]
        fill[:, left + w // 2:left + w] = rp[:, None, :]
        out = out * m + fill * (1 - m)
        out += rng.normal(0, 1.4, (h, tw))[..., None] * (1 - m)
        return out
    # vertically (close-ups): stretch edges, blurred
    top = (th - h) // 2
    ext = cv2.copyMakeBorder(img, top, th - h - top, 0, 0, cv2.BORDER_REPLICATE).astype(np.float32)
    soft = cv2.GaussianBlur(ext, (0, 0), 22)
    m = np.zeros(ext.shape[:2], np.float32)
    m[top:top + h] = 1
    m = cv2.GaussianBlur(m, (0, 0), 6)[..., None]
    out = ext * m + soft * (1 - m)
    out += rng.normal(0, 1.6, out.shape[:2])[..., None] * (1 - m)
    return out


for sheet in sorted(SRC.glob("*.webp")):
    slug = sheet.stem
    im = cv2.imread(str(sheet)).astype(np.float32)

    for (x0, x1), view in zip(TOP, TOP_VIEWS):
        panel = im[TOP_Y[0]:TOP_Y[1], x0 + 2:x1 - 2]
        h = panel.shape[0]
        framed = flatten_backdrop(extend(panel, int(h * 0.8), h))
        save(f"{slug}-{view}", sharpen(cv2.resize(framed, (W, H), interpolation=cv2.INTER_CUBIC), 0.3))

    for (x0, x1), view in zip(BOTTOM, BOTTOM_VIEWS):
        tile = im[BOTTOM_Y[0]:BOTTOM_Y[1], x0 + 2:x1 - 2]
        th, tw = tile.shape[:2]
        if view == "print":
            # keep the whole print: extend top/bottom rather than cropping the sides
            framed = extend(tile, tw, int(tw / 0.8))
        else:
            cw = int(th * 0.8)
            cx = tw // 2 + (20 if view == "label" else 0)
            cx = min(max(cx, cw // 2), tw - cw // 2)
            framed = tile[:, cx - cw // 2:cx - cw // 2 + cw]
        save(f"{slug}-{view}", sharpen(cv2.resize(framed, (W, H), interpolation=cv2.INTER_LANCZOS4), 0.45))
    print(slug)
