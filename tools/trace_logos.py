"""
Vectorise the Lane Change wordmark (homepage mockup) and LC monogram (logo sheet)
into clean SVGs (src/assets/brand/*.svg). Swap these for the final vector
artwork from the designer when available — same filenames.

Needs: pip install pillow numpy opencv-python-headless potracer
"""
from pathlib import Path
import cv2
import numpy as np
import potrace

ROOT = Path(__file__).resolve().parent.parent
SRC = cv2.imread(str(ROOT / "design/reference/homepage-mockup.png"))
OUT = ROOT / "src/assets/brand"
OUT.mkdir(parents=True, exist_ok=True)


def trace(crop, scale, thresh, name, blur=1.6, turd=40, open_k=0, close_k=0, dark=False, drop_box=None):
    g = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    g = cv2.resize(g, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    g = cv2.GaussianBlur(g, (0, 0), blur)
    bw = ((g < thresh) if dark else (g > thresh)).astype(np.uint8)
    if drop_box:  # erase a separate element (e.g. the star beside the monogram)
        x0, y0, x1, y1 = (int(v * scale) for v in drop_box)
        bw[y0:y1, x0:x1] = 0
    if close_k:
        bw = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, np.ones((close_k, close_k), np.uint8))
    if open_k:
        bw = cv2.morphologyEx(bw, cv2.MORPH_OPEN, np.ones((open_k, open_k), np.uint8))
    ys, xs = np.nonzero(bw)
    pad = 4
    x0, x1, y0, y1 = xs.min() - pad, xs.max() + pad, ys.min() - pad, ys.max() + pad
    bw = bw[y0:y1, x0:x1]
    bmp = potrace.Bitmap(~bw.astype(bool))
    plist = bmp.trace(turdsize=turd, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                      alphamax=0.9, opticurve=True, opttolerance=0.3)
    parts = []
    for curve in plist:
        s = curve.start_point
        d = [f"M{s.x:.1f} {s.y:.1f}"]
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}")
            else:
                d.append(f"C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}")
        d.append("Z")
        parts.append("".join(d))
    h, w = bw.shape
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor">'
           f'<path fill-rule="evenodd" d="{"".join(parts)}"/></svg>\n')
    (OUT / f"{name}.svg").write_text(svg)
    print(name, w, h, len(svg))


# Header wordmark: white on dark
trace(SRC[12:78, 525:695], 10, 150, "wordmark", blur=4, turd=200)
# LC monogram — "secondary tag mark" on the logo sheet (black on paper)
SHEET = cv2.imread(str(ROOT / "design/reference/logo-system.png"))
trace(SHEET[712:874, 182:350], 8, 110, "monogram", blur=2, turd=200, dark=True, drop_box=(104, 18, 168, 70))
