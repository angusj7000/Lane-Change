"""
Build the placeholder product photography set for every colourway.

For each tee in design/source/products/<slug>-front-raw.jpg (produced by
extract_mockup_assets.py) this writes, on one consistent studio-black canvas:

  <slug>-front   isolated front, small LC chest emblem
  <slug>-back    same garment with the flagship LANE CHANGE back graphic
  <slug>-detail  close-up of the chest print on washed jersey
  <slug>-fabric  macro of the washed heavyweight jersey

Every output is 1000x1250 (4:5). Real photography can replace any file 1:1.
Needs: pip install pillow numpy opencv-python-headless
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "src/assets/images/products"
RAW = ROOT / "design/source/products"
MOCK = cv2.imread(str(ROOT / "design/reference/homepage-mockup.png"))
W, H = 1000, 1250
BG = np.array([13, 13, 13], np.float32)  # studio black (BGR)
rng = np.random.default_rng(2025)

SLUGS = ["washed-black", "concrete-grey", "forest-green", "faded-blue", "dusty-pink"]
LIGHT_INK = {"washed-black": True, "forest-green": True, "faded-blue": True,
             "concrete-grey": False, "dusty-pink": False}


def save(name, im):
    im = np.clip(im, 0, 255).astype(np.uint8)
    cv2.imwrite(str(P / f"{name}.jpg"), im, [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])


def tee_mask(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    m = (cv2.GaussianBlur(g, (0, 0), 2) > 24).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    biggest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    m = (lab == biggest).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    return cv2.GaussianBlur(m, (0, 0), 1.5).astype(np.float32) / 255


def place(img, mask, scale=1.36):
    """Composite the garment centred on the studio canvas."""
    ih, iw = img.shape[:2]
    nw, nh = int(iw * scale), int(ih * scale)
    img = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_CUBIC)
    mask = cv2.resize(mask, (nw, nh), interpolation=cv2.INTER_LINEAR)
    canvas = np.tile(BG, (H, W, 1))
    x, y = (W - nw) // 2, (H - nh) // 2 - 20
    a = mask[..., None]
    region = canvas[y:y + nh, x:x + nw]
    canvas[y:y + nh, x:x + nw] = img * a + region * (1 - a)
    return canvas, (x, y, nw, nh)


def grain(im, amt=5):
    return im + rng.normal(0, amt, im.shape[:2])[..., None]


# ---- flagship back graphic, lifted from the hero shirt as an ink alpha ----
g = cv2.cvtColor(MOCK[195:560, 632:930], cv2.COLOR_BGR2GRAY).astype(np.float32)
g = cv2.resize(g, None, fx=2.2, fy=2.2, interpolation=cv2.INTER_CUBIC)
local = cv2.medianBlur(g.astype(np.uint8), 31).astype(np.float32)
ink = np.clip((g - np.minimum(local, 70) - 14) / 120, 0, 1)
gh, gw = ink.shape
fx = np.minimum(np.linspace(0, 1, gw) * 14, 1) * np.minimum(np.linspace(1, 0, gw) * 14, 1)
fy = np.minimum(np.linspace(0, 1, gh) * 30, 1) * np.minimum(np.linspace(1, 0, gh) * 20, 1)
BACK_INK = ink * np.outer(fy, fx)


def fabric(base_bgr, w, h, seed):
    """Procedural washed heavyweight jersey: mineral-wash clouds + veins + knit."""
    r = np.random.default_rng(seed)
    def field(sigma):
        f = cv2.GaussianBlur(r.random((h, w)).astype(np.float32), (0, 0), sigma)
        return (f - f.min()) / (f.max() - f.min() + 1e-6)
    cloud = 0.55 * field(60) + 0.45 * field(18)
    veins = np.exp(-np.abs(field(9) - 0.5) * 38) * 0.7 + np.exp(-np.abs(field(22) - 0.5) * 30) * 0.5
    knit = r.normal(0, 1, (h, w)).astype(np.float32)
    knit = cv2.GaussianBlur(knit, (0, 0), 0.8)
    yy, xx = np.mgrid[0:h, 0:w]
    rib = np.sin(xx * 0.9) * 0.5 + np.sin(yy * 0.45 + xx * 0.2) * 0.3
    lum = 1 + (cloud - 0.5) * 0.30 + veins * 0.22 + knit * 0.05 + rib * 0.025
    return np.array(base_bgr, np.float32)[None, None, :] * lum[..., None]


def print_logo(canvas, cx, cy, height, colour, svg_mask):
    mh, mw = svg_mask.shape
    s = height / mh
    m = cv2.resize(svg_mask, (int(mw * s), int(mh * s)), interpolation=cv2.INTER_AREA)
    # crack the print a little so it reads as screen print on washed cotton
    crack = cv2.GaussianBlur(rng.random(m.shape).astype(np.float32), (0, 0), 1.2)
    m = m * np.clip(0.55 + crack * 0.9, 0, 1)
    h, w = m.shape
    x, y = int(cx - w / 2), int(cy - h / 2)
    a = m[..., None]
    canvas[y:y + h, x:x + w] = canvas[y:y + h, x:x + w] * (1 - a) + np.array(colour, np.float32) * a


def render_emblem_mask(px=900):
    """Rasterise the traced LC monogram + star at high resolution (white on black)."""
    import re
    svg = (ROOT / "src/assets/brand/monogram.svg").read_text()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    d = re.search(r' d="([^"]+)"', svg).group(1)
    scale = px / vb[3]
    mask = np.zeros((px + int(px * 0.55), int(vb[2] * scale) + 4), np.uint8)
    # parse potrace path (M / L / C / Z) into polylines
    toks = re.findall(r'[MLCZ]|-?\d+\.?\d*', d)
    polys, cur, i, pt = [], [], 0, (0, 0)
    while i < len(toks):
        t = toks[i]
        if t == 'M':
            if cur: polys.append(cur)
            pt = (float(toks[i + 1]), float(toks[i + 2])); cur = [pt]; i += 3
        elif t == 'L':
            pt = (float(toks[i + 1]), float(toks[i + 2])); cur.append(pt); i += 3
        elif t == 'C':
            c = [float(v) for v in toks[i + 1:i + 7]]
            p0 = pt
            for k in np.linspace(0, 1, 12)[1:]:
                u = 1 - k
                cur.append((u**3 * p0[0] + 3 * u * u * k * c[0] + 3 * u * k * k * c[2] + k**3 * c[4],
                            u**3 * p0[1] + 3 * u * u * k * c[1] + 3 * u * k * k * c[3] + k**3 * c[5]))
            pt = (c[4], c[5]); i += 7
        else:
            i += 1
    if cur: polys.append(cur)
    pts = [(np.array(p) * scale * 8).astype(np.int32) for p in polys]
    big = np.zeros((mask.shape[0] * 8, mask.shape[1] * 8), np.uint8)
    cv2.fillPoly(big, pts, 255, lineType=cv2.LINE_AA, shift=0)
    mask = cv2.resize(big, (mask.shape[1], mask.shape[0]), interpolation=cv2.INTER_AREA)
    # brand compass star (same curves as src/assets/brand/star.svg) under the monogram
    ys, xs = np.nonzero(mask)
    cx, cy, k = (xs.min() + xs.max()) / 2 + px * 0.06, px + px * 0.27, px * 0.0036
    segs = [((0, -70), (3, -22), (6, -6), (50, 0)), ((50, 0), (6, 6), (3, 22), (0, 70)),
            ((0, 70), (-3, 22), (-6, 6), (-50, 0)), ((-50, 0), (-6, -6), (-3, -22), (0, -70))]
    star = []
    for p0, c1, c2, p1 in segs:
        for t in np.linspace(0, 1, 24):
            u = 1 - t
            star.append((cx + k * (u**3 * p0[0] + 3*u*u*t * c1[0] + 3*u*t*t * c2[0] + t**3 * p1[0]),
                         cy + k * (u**3 * p0[1] + 3*u*u*t * c1[1] + 3*u*t*t * c2[1] + t**3 * p1[1])))
    big = np.zeros((mask.shape[0] * 4, mask.shape[1] * 4), np.uint8)
    cv2.fillPoly(big, [(np.array(star) * 4).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    mask = np.maximum(mask, cv2.resize(big, (mask.shape[1], mask.shape[0]), interpolation=cv2.INTER_AREA))
    ys, xs = np.nonzero(mask)
    mask = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return mask.astype(np.float32) / 255


EMBLEM = render_emblem_mask()

for slug in SLUGS:
    raw = cv2.imread(str(RAW / f"{slug}-front-raw.jpg")).astype(np.float32)
    mask = tee_mask(raw.astype(np.uint8))
    tee_px = raw[mask > 0.9]
    base = np.median(tee_px, axis=0)
    ink_col = [222, 226, 230] if LIGHT_INK[slug] else [26, 25, 25]

    # FRONT
    front, _ = place(raw, mask)
    save(f"{slug}-front", grain(front, 2.5))

    # BACK: remove chest emblem, mirror, add back graphic modulated by garment shading
    ih, iw = raw.shape[:2]
    emb = np.zeros((ih, iw), np.uint8)
    cv2.rectangle(emb, (int(iw * 0.58), int(ih * 0.26)), (int(iw * 0.78), int(ih * 0.66)), 255, -1)
    # tees are near-symmetric: patch the chest emblem with the mirrored plain chest
    em = cv2.GaussianBlur(emb.astype(np.float32) / 255, (0, 0), 7)[..., None]
    back = raw * (1 - em) + raw[:, ::-1] * em
    back = back[:, ::-1]
    bmask = mask[:, ::-1]
    gw_target = int(iw * 0.50)
    s = gw_target / BACK_INK.shape[1]
    art = cv2.resize(BACK_INK, (gw_target, int(BACK_INK.shape[0] * s)), interpolation=cv2.INTER_AREA)
    ah, aw = art.shape
    ax, ay = (iw - aw) // 2, int(ih * 0.20)
    ah = min(ah, ih - ay - int(ih * 0.06)); art = art[:ah]
    shade = cv2.GaussianBlur(cv2.cvtColor(back.astype(np.uint8), cv2.COLOR_BGR2GRAY), (0, 0), 3).astype(np.float32)
    shade = shade[ay:ay + ah, ax:ax + aw] / (base.mean() + 1)
    a = (art * 0.92 * bmask[ay:ay + ah, ax:ax + aw])[..., None]
    col = np.array(ink_col, np.float32)[None, None, :] * np.clip(shade, 0.6, 1.15)[..., None]
    back[ay:ay + ah, ax:ax + aw] = back[ay:ay + ah, ax:ax + aw] * (1 - a) + col * a
    bk, _ = place(back, bmask)
    save(f"{slug}-back", grain(bk, 2.5))

    # DETAIL: chest print close-up on procedural washed jersey
    det = fabric(base, W, H, hash(slug) % 1000)
    print_logo(det, W * 0.5, H * 0.47, H * 0.62, ink_col, EMBLEM)
    yy, xx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.35 * (((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2) * 2.2
    save(f"{slug}-detail", grain(det * vig[..., None], 4))

    # FABRIC: macro jersey
    fab = fabric(base * 1.03, W, H, hash(slug) % 1000 + 7)
    save(f"{slug}-fabric", grain(fab * vig[..., None], 5))
    print(slug, base.round())
