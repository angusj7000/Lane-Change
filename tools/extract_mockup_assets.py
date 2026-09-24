"""
Extract placeholder campaign imagery from the approved homepage mockup.

The mockup (design/reference/homepage-mockup.png) is the primary visual
reference. Until real campaign photography exists, we crop its photographic
regions, remove the baked-in UI text with inpainting, upscale, and write the
results into src/assets/images/ (Astro optimises them at build). Replace any output file with real photography
of the same name/aspect ratio and the site picks it up with no code change.

Usage:  python3 tools/extract_mockup_assets.py
Needs:  pip install pillow numpy opencv-python-headless
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design/reference/homepage-mockup.png"
OUT = ROOT / "src/assets/images"
RAW = ROOT / "design/source"

img = cv2.imread(str(SRC))


def clean(region, text_boxes, thresh=70, dilate=4, radius=7):
    """Inpaint light text inside boxes (coords relative to region)."""
    r = region.copy()
    gray = cv2.cvtColor(r, cv2.COLOR_BGR2GRAY)
    mask = np.zeros(gray.shape, np.uint8)
    for (x0, y0, x1, y1, *opt) in text_boxes:
        t = opt[0] if opt else thresh
        sub = gray[y0:y1, x0:x1]
        bg = cv2.medianBlur(sub, 21)
        m = ((sub.astype(int) - bg.astype(int)) > t // 3) | (sub > t + 40)
        if opt and len(opt) > 1 and opt[1] == "all":
            m[:] = True
        mask[y0:y1, x0:x1] |= (m * 255).astype(np.uint8)
    k = np.ones((dilate, dilate), np.uint8)
    mask = cv2.dilate(mask, k, iterations=2)
    return cv2.inpaint(r, mask, radius, cv2.INPAINT_TELEA)


def patch(region, boxes, feather=9):
    """Cover boxes with texture copied from an offset area (keeps fabric grain)."""
    r = region.astype(np.float32)
    for (x0, y0, x1, y1, dx, dy) in boxes:
        m = np.zeros(r.shape[:2], np.float32)
        m[y0:y1, x0:x1] = 1
        m = cv2.GaussianBlur(m, (0, 0), feather)[..., None]
        shifted = np.roll(r, (-dy, -dx), axis=(0, 1))
        r = r * (1 - m) + shifted * m
    return r.astype(np.uint8)


def upscale(im, factor):
    h, w = im.shape[:2]
    big = cv2.resize(im, (int(w * factor), int(h * factor)), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(big, (0, 0), 1.2)
    return cv2.addWeighted(big, 1.35, blur, -0.35, 0)


def save(name, im, q=90, out=None):
    out = out or OUT
    (out / name).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out / f"{name}.jpg"), im, [cv2.IMWRITE_JPEG_QUALITY, q, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])


# ---------- HERO ----------
hero = img[0:610, 0:1214]
hero = clean(hero, [
    (30, 18, 410, 52),        # left nav
    (525, 14, 690, 72),       # centre logo
    (905, 18, 1200, 52),      # right utilities
    (40, 150, 450, 340),      # eyebrow + headline + copy
    (40, 350, 390, 400, 60, "all"),  # buttons
    (30, 540, 170, 582),      # est / aus
    (1115, 512, 1200, 594),   # vertical list
])
# the flagship-graphic hero is kept as source: tools/swap_hero_graphic.py prints the
# Gothic Stack graphic on it to make the site hero (run it after this script)
save("hero-campaign-flagship", upscale(hero, 1.6), 95, RAW)
# portrait crop of the flagship tee — used as the FIT view of the core washed tees
save("products/core-washed-fit", upscale(hero[0:610, 540:1010], 1.9))

# ---------- CATEGORY PANELS ----------
panels = {
    "category-hoodies": (img[613:822, 415:800], [(18, 130, 300, 205)]),
    "category-story": (img[613:822, 803:1214], [(20, 130, 330, 205)]),
}
# tees: fabric close-up, so copy real texture over the copy + star (star is drawn as vector)
tees = patch(img[613:822, 0:412].copy(), [(14, 128, 222, 209, 0, -74), (214, 108, 306, 209, 100, 0)])
save("category-tees", upscale(tees, 2.2))
for name, (reg, boxes) in panels.items():
    save(name, upscale(clean(reg, boxes), 2.2))

# ---------- BRAND STATEMENT ----------
st = img[1106:1295, 0:1214]
st = clean(st, [
    (440, 60, 780, 160),       # wordmark + lines
    (585, 10, 635, 66, 40, "all"),  # star (drawn as vector on the page)
    (20, 80, 130, 160),        # left words
    (1100, 90, 1200, 170),     # right words
])
save("brand-statement", upscale(st, 1.7))

# ---------- PRODUCTS ----------
# tee bounding boxes (x0, x1) on the product row, y 876-1052
tees = {
    "washed-black": (30, 245),
    "concrete-grey": (268, 480),
    "forest-green": (500, 713),
    "faded-blue": (735, 948),
    "dusty-pink": (970, 1184),
}
for slug, (x0, x1) in tees.items():
    crop = img[874:1054, x0:x1]
    big = upscale(crop, 3.2)
    save(f"products/{slug}-front-raw", big, 95, RAW)
print("done")
