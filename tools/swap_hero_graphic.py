"""
Put the Gothic Stack back graphic on the homepage hero shirt.

Input:  design/source/hero-campaign-flagship.jpg  (hero as cut from the mockup,
        written by extract_mockup_assets.py) and the back graphic on
        design/reference/logo-system.png.
Output: src/assets/images/hero-campaign.jpg        desktop hero
        src/assets/images/hero-campaign-mobile.jpg portrait crop for phones

The original print is lifted off the shirt with a grey-scale morphological
opening (removes light strokes, keeps fabric folds), then the new graphic is
printed back on as light ink, shaded by the folds and lightly cracked.

Usage:  python3 tools/swap_hero_graphic.py
Needs:  pip install numpy opencv-python-headless
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design/source/hero-campaign-flagship.jpg"
SHEET = ROOT / "design/reference/logo-system.png"
OUT = ROOT / "src/assets/images"
rng = np.random.default_rng(11)

img = cv2.imread(str(SRC)).astype(np.float32)
H, W = img.shape[:2]

# ---- 1. lift the existing print off the back of the shirt -------------------
PX0, PY0, PX1, PY1 = 1000, 285, 1515, 905          # print area on the shirt
region = img[PY0:PY1, PX0:PX1]
lum = cv2.cvtColor(region.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
fabric = cv2.morphologyEx(lum, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (33, 33)))
fabric = cv2.GaussianBlur(fabric, (0, 0), 3)
ink = ((lum - fabric) > 9).astype(np.uint8) * 255
ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
ink = cv2.dilate(ink, np.ones((7, 7), np.uint8))
# fill every masked stroke from the surrounding fabric
filled = cv2.inpaint(region.astype(np.uint8), ink, 9, cv2.INPAINT_TELEA).astype(np.float32)
# inpainting is smooth; add back grain matched to the jersey beside the print (no tiling seams)
tex = img[430:590, 1525:1610]
sigma = float(np.std(tex - cv2.GaussianBlur(tex, (0, 0), 2.5)))
noise = cv2.GaussianBlur(rng.normal(0, 1, region.shape[:2]).astype(np.float32), (0, 0), 1.2)
noise = noise / (noise.std() + 1e-6) * sigma * 0.4
tiled = np.repeat(noise[..., None], 3, axis=2)
mk = cv2.GaussianBlur(ink.astype(np.float32) / 255, (0, 0), 1.5)[..., None]
clean = region * (1 - mk) + (filled + tiled * 0.9) * mk
# feather the edit into the untouched photo
m = np.zeros((PY1 - PY0, PX1 - PX0), np.float32)
m[12:-12, 12:-12] = 1
m = cv2.GaussianBlur(m, (0, 0), 8)[..., None]
img[PY0:PY1, PX0:PX1] = clean * m + region * (1 - m)

# ---- 2. the Gothic Stack graphic as an ink alpha -----------------------------
sheet = cv2.imread(str(SHEET), cv2.IMREAD_GRAYSCALE)
art = sheet[165:950, 590:1510].astype(np.float32)
art[780:, 740:] = 255                              # drop the sheet's corner caption
alpha = np.clip((235 - art) / 170, 0, 1)

GW = 525                                           # printed width on the hero
s = GW / alpha.shape[1]
alpha = cv2.resize(alpha, (GW, int(alpha.shape[0] * s)), interpolation=cv2.INTER_AREA)
alpha = cv2.GaussianBlur(alpha, (0, 0), 0.7)       # match the photo's softness
gh, gw = alpha.shape
cx, top = 1260, 312                                # centre of the back, below the collar
x0, y0 = int(cx - gw / 2), top

# cracked screen-print: break the ink up a little
crack = cv2.GaussianBlur(rng.random(alpha.shape).astype(np.float32), (0, 0), 1.1)
alpha *= np.clip(0.62 + crack * 0.75, 0, 1)

# shade the ink with the shirt's folds so it sits in the fabric
patch = img[y0:y0 + gh, x0:x0 + gw]
plum = cv2.cvtColor(np.clip(patch, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
fold = cv2.GaussianBlur(plum, (0, 0), 6)
fold = np.clip(fold / (fold.mean() + 1e-3), 0.55, 1.35)
ink_col = np.array([168, 170, 172], np.float32)    # washed grey ink (BGR), as on the original print
col = ink_col[None, None, :] * fold[..., None]
a = (alpha * 0.93)[..., None]
img[y0:y0 + gh, x0:x0 + gw] = patch * (1 - a) + col * a

img = np.clip(img, 0, 255)
cv2.imwrite(str(OUT / "hero-campaign.jpg"), img.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])

# ---- 3. portrait crop for phones (same framing as the mockup's model crop) ----
mobile = img[0:H, 864:1616]
mobile = cv2.resize(mobile, (893, 1159), interpolation=cv2.INTER_CUBIC)
cv2.imwrite(str(OUT / "hero-campaign-mobile.jpg"), mobile.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
print("hero-campaign.jpg + hero-campaign-mobile.jpg written")
