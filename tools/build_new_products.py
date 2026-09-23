"""
Build product photography for the extended range from the supplied concept art.

Sources (design/reference/):
  brand-board.png            flats: Distressed tee, Flagship hoodie, Raglan jersey,
                             Globe, Same Roads and Overpass tees
  gothic-stack-tee-model.png on-model front/back (Gothic Stack tee, LC cap)
  worldwide-tee-model.png    on-model front/back (Worldwide tee, LC cap)

Flats are cut out with GrabCut and placed on the same studio-black 4:5 canvas
as the core tees, so the whole range reads as one shoot. On-model shots keep
their studio backdrop. Outputs go to src/assets/images/products/.

Usage:  python3 tools/build_new_products.py
Needs:  pip install pillow numpy opencv-python-headless
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "design/reference"
OUT = ROOT / "src/assets/images/products"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1000, 1250
BG = np.array([13, 13, 13], np.float32)
rng = np.random.default_rng(7)


def save(name, im):
    im = np.clip(im, 0, 255).astype(np.uint8)
    cv2.imwrite(str(OUT / f"{name}.jpg"), im, [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])


def sharpen(im, amt=0.4, sigma=1.4):
    blur = cv2.GaussianBlur(im, (0, 0), sigma)
    return cv2.addWeighted(im, 1 + amt, blur, -amt, 0)


# ---------------------------------------------------------------- flats
BOARD = cv2.imread(str(REF / "brand-board.png"))
SCALE = 4

# name: (crop box on board, garment rect inside crop, mirror-repair side or None)
FLATS = {
    "distressed-tee-concrete-grey-front": ((444, 118, 660, 392), (4, 6, 210, 268), None),
    "distressed-tee-concrete-grey-back": ((648, 118, 878, 392), (6, 6, 224, 268), None),
    "flagship-hoodie-washed-black-front": ((878, 120, 1094, 394), (4, 4, 212, 268), "right"),
    "flagship-hoodie-washed-black-back": ((1088, 120, 1310, 394), (4, 4, 218, 268), None),
    "raglan-jersey-grey-black-front": ((6, 466, 190, 664), (4, 6, 180, 192), "left"),
    "raglan-jersey-grey-black-back": ((172, 466, 350, 664), (6, 6, 172, 192), None),
    "globe-tee-washed-black-front": ((352, 466, 530, 664), (4, 6, 174, 192), None),
    "globe-tee-washed-black-back": ((506, 466, 675, 664), (6, 6, 164, 192), None),
    "same-roads-tee-washed-black-front": ((666, 466, 842, 664), (4, 6, 172, 192), None),
    "same-roads-tee-washed-black-back": ((814, 466, 977, 664), (6, 6, 158, 192), "left"),
    "overpass-tee-concrete-grey-front": ((973, 466, 1154, 664), (4, 6, 163, 192), "right"),
    "overpass-tee-concrete-grey-back": ((1129, 466, 1310, 664), (6, 6, 177, 192), None),
}


def cutout(box, rect):
    c = BOARD[box[1]:box[3], box[0]:box[2]]
    c = cv2.resize(c, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_CUBIC)
    r = tuple(int(v * SCALE) for v in (rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]))
    m = np.zeros(c.shape[:2], np.uint8)
    cv2.grabCut(c, m, r, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_RECT)
    mm = np.where((m == 1) | (m == 3), 255, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(mm)
    mm = ((lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])) * 255).astype(np.uint8)
    mm = cv2.morphologyEx(mm, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    ff = mm.copy()
    cv2.floodFill(ff, np.zeros((mm.shape[0] + 2, mm.shape[1] + 2), np.uint8), (0, 0), 255)
    mm = mm | cv2.bitwise_not(ff)
    return c, mm


def mirror_repair(img, mask, side):
    """Rebuild a sleeve clipped by a neighbouring garment from the opposite side."""
    ys, xs = np.nonzero(mask)
    top, bot = ys.min(), ys.max()
    axis = None
    # tees: the neck opening splits the top rows into two shoulder runs; its centre is the axis
    for y in range(top, top + int((bot - top) * 0.05)):
        runs = np.flatnonzero(np.diff(np.concatenate(([0], (mask[y] > 127).astype(np.int8), [0]))))
        if len(runs) >= 4:
            axis = (runs[1] + runs[2]) / 2
            break
    if axis is None:  # hoods: centre of the top band
        band = mask[top:top + int((bot - top) * 0.04)]
        bx = np.nonzero(band.any(0))[0]
        axis = (bx.min() + bx.max()) / 2
    h, w = mask.shape
    M = np.float32([[-1, 0, 2 * axis], [0, 1, 0]])
    fimg = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    fmask = cv2.warpAffine(mask, M, (w, h))
    half = np.zeros_like(mask)
    if side == "right":
        half[:, int(axis):] = 255
    else:
        half[:, :int(axis)] = 255
    add = (fmask > 127) & (mask < 128) & (half > 0)
    img = img.copy()
    img[add] = fimg[add]
    mask = mask.copy()
    mask[add] = 255
    return img, mask


def place_flat(img, mask, max_w=900, max_h=1060):
    ys, xs = np.nonzero(mask)
    img = img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    mask = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    s = min(max_w / img.shape[1], max_h / img.shape[0])
    img = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA)
    mask = cv2.resize(mask, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)
    a = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.2)[..., None]
    canvas = np.tile(BG, (H, W, 1))
    h, w = img.shape[:2]
    x, y = (W - w) // 2, (H - h) // 2 - 10
    canvas[y:y + h, x:x + w] = sharpen(img.astype(np.float32), 0.35) * a + canvas[y:y + h, x:x + w] * (1 - a)
    canvas += rng.normal(0, 2.5, (H, W))[..., None]
    return canvas


flat_cache = {}
for name, (box, rect, repair) in FLATS.items():
    img, mask = cutout(box, rect)
    if repair:
        img, mask = mirror_repair(img, mask, repair)
    canvas = place_flat(img, mask)
    flat_cache[name] = canvas
    save(name, canvas)
    print("flat", name)

# detail = print close-up from each back flat (upper back, 4:5)
for name, canvas in flat_cache.items():
    if not name.endswith("-back"):
        continue
    crop = canvas[130:130 + 875, 150:150 + 700]
    save(name.replace("-back", "-detail"), cv2.resize(crop, (W, H), interpolation=cv2.INTER_CUBIC))


# ---------------------------------------------------------------- on-model
def model_panels(file, split):
    im = cv2.imread(str(REF / file))
    return im[:, :split[0]], im[:, split[1]:]


def four_five_top(panel, drop=0):
    """Head-to-thigh editorial crop at 4:5."""
    h, w = panel.shape[:2]
    ch = int(w / 0.8)
    crop = panel[drop:drop + ch]
    return sharpen(cv2.resize(crop, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32), 0.3)


def full_length(panel):
    """Full-length fit shot, backdrop extended to 4:5."""
    h, w = panel.shape[:2]
    tw = int(h * 0.8)
    pad = max(0, (tw - w) // 2)
    ext = cv2.copyMakeBorder(panel, 0, 0, pad, tw - w - pad, cv2.BORDER_REPLICATE)
    soft = cv2.GaussianBlur(ext, (0, 0), 25)
    m = np.zeros(ext.shape[:2], np.float32)
    m[:, pad:pad + w] = 1
    m = cv2.GaussianBlur(m, (0, 0), 12)[..., None]
    ext = ext * m + soft * (1 - m)
    return cv2.resize(ext.astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)


gs_front, gs_back = model_panels("gothic-stack-tee-model.png", (650, 658))
ww_front, ww_back = model_panels("worldwide-tee-model.png", (569, 576))

for slug, front, back, print_box in [
    ("gothic-stack-tee-washed-black", gs_front, gs_back, (70, 215, 470, 715)),
    ("worldwide-tee-washed-black", ww_front, ww_back, (60, 250, 480, 775)),
]:
    save(f"{slug}-front", four_five_top(front))
    save(f"{slug}-back", four_five_top(back))
    save(f"{slug}-fit", full_length(front))
    x0, y0, x1, y1 = print_box
    save(f"{slug}-detail", sharpen(cv2.resize(back[y0:y1, x0:x1], (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32), 0.35))
    print("model", slug)

# LC cap — cropped from the on-model shots
cap_front = ww_front[0:260, 120:328]
cap_back = gs_back[0:230, 205:389]
for name, c in [("lc-cap-washed-black-front", cap_front), ("lc-cap-washed-black-back", cap_back)]:
    save(name, sharpen(cv2.resize(c, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32), 0.4))
print("cap")
