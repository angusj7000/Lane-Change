"""
Background photo for the coming-soon (password) page.

Takes the approved design (design/reference/coming-soon.webp), removes the
baked-in UI text (logo, ENTER, centre lockup, email form, footer links) by
inpainting only the bright text strokes, and writes:
  src/assets/images/coming-soon.jpg         desktop (landscape)
  src/assets/images/coming-soon-mobile.jpg  phones (portrait crop on the model)

Usage:  python3 tools/build_coming_soon.py
Needs:  pip install numpy opencv-python-headless
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
img = cv2.imread(str(ROOT / "design/reference/coming-soon.webp"))
H, W = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)

# (x0, y0, x1, y1, mode)  mode: 'text' = bright strokes only, 'all' = whole box
BOXES = [
    (78, 24, 288, 108, "text"),      # logo top-left
    (1338, 46, 1478, 78, "text"),    # ENTER ——
    (512, 478, 1018, 632, "text"),   # LANE CHANGE wordmark
    (566, 612, 968, 642, "text"),    # International Street Sports
    (736, 657, 800, 675, "text"),    # short rule
    (476, 692, 1060, 731, "text"),   # Different Lanes. Same Vision.
    (666, 747, 874, 783, "text"),    # Coming Soon
    (514, 812, 1022, 876, "text"),   # email field outline + placeholder
    (884, 816, 1018, 872, "all"),    # solid white Notify Me button
    (66, 944, 274, 976, "text"),     # Instagram  TikTok
    (1234, 944, 1480, 976, "text"),  # AUS — Worldwide ——
]

mask = np.zeros((H, W), np.uint8)
for x0, y0, x1, y1, mode in BOXES:
    if mode == "all":
        mask[y0:y1, x0:x1] = 255
        continue
    sub = gray[y0:y1, x0:x1]
    local = cv2.medianBlur(sub.astype(np.uint8), 15).astype(np.float32)
    strokes = ((sub - local) > 28) | (sub > 175)
    mask[y0:y1, x0:x1][strokes] = 255
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=1)
clean = cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA).astype(np.float32)

# put photographic grain back where we filled, so patches don't look smooth
rng = np.random.default_rng(5)
noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.8) * 4.0
m = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.2)[..., None]
clean = clean + noise[..., None] * m


def up(im, factor):
    big = cv2.resize(im, None, fx=factor, fy=factor, interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(big, (0, 0), 1.2)
    return cv2.addWeighted(big, 1.3, blur, -0.3, 0)


out = ROOT / "src/assets/images"
desktop = up(clean, 1.25)                                  # 1920 x 1280
cv2.imwrite(str(out / "coming-soon.jpg"), np.clip(desktop, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
cx = 1090                                                  # model's centre line
cw = int(H * 0.62)
x0 = min(max(cx - cw // 2, 0), W - cw)
mobile = up(clean[:, x0:x0 + cw], 1.4)
cv2.imwrite(str(out / "coming-soon-mobile.jpg"), np.clip(mobile, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
cv2.imwrite(str(ROOT / "design/source/coming-soon-mask.png"), mask)
print("coming-soon.jpg", desktop.shape[:2], "coming-soon-mobile.jpg", mobile.shape[:2])
