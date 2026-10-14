import math, os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
S3 = math.sqrt(3) / 2

def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")

def rounded(pts, r):
    """Closed polygon with circular-arc rounded corners. r may be a list per vertex."""
    n = len(pts)
    rs = r if isinstance(r, list) else [r] * n
    segs = []
    for i in range(n):
        A, P, B = pts[i - 1], pts[i], pts[(i + 1) % n]
        ux, uy = A[0] - P[0], A[1] - P[1]; lu = math.hypot(ux, uy); ux /= lu; uy /= lu
        vx, vy = B[0] - P[0], B[1] - P[1]; lv = math.hypot(vx, vy); vx /= lv; vy /= lv
        th = math.acos(max(-1, min(1, ux * vx + uy * vy)))
        ri = rs[i]
        d = ri / math.tan(th / 2) if ri else 0
        d = min(d, lu * 0.45, lv * 0.45)
        ri = d * math.tan(th / 2)
        cross = (P[0] - A[0]) * (B[1] - P[1]) - (P[1] - A[1]) * (B[0] - P[0])
        sweep = 1 if cross > 0 else 0
        segs.append(((P[0] + ux * d, P[1] + uy * d), (P[0] + vx * d, P[1] + vy * d), ri, sweep))
    s = f"M{f(segs[0][1][0])} {f(segs[0][1][1])}"
    for i in range(1, n + 1):
        t1, t2, ri, sw = segs[i % n]
        s += f"L{f(t1[0])} {f(t1[1])}"
        if ri > 0.01:
            s += f"A{f(ri)} {f(ri)} 0 0 {sw} {f(t2[0])} {f(t2[1])}"
    return s + "Z"

def svg(body, w=256, h=256, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{extra}'
            f"{body}</svg>\n")

# flat-top hexagon, centre (128,128), circumradius R
def hexv(R, cx=128, cy=128):
    return [(cx + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a))) for a in (0, 60, 120, 180, 240, 300)]

# ---------------- Concept A — Passage: hexagon split by a forward chevron ----------------
def concept_a(fill="#000", light=None):
    R = 112
    cx, cy = 128, 128
    top, bot = cy - R * S3, cy + R * S3
    xr, xtr = cx + R, cx + R / 2       # right vertex, top-right vertex x
    xtl, xl = cx - R / 2, cx - R
    band, gap = 30, 14
    d1 = band / S3
    d2 = (band + gap) / S3
    right = [(xtr - d1, top), (xtr, top), (xr, cy), (xtr, bot), (xtr - d1, bot), (xr - d1, cy)]
    left = [(xtl, top), (xtr - d2, top), (xr - d2, cy), (xtr - d2, bot), (xtl, bot), (xl, cy)]
    rl = rounded(left, [14, 4, 10, 4, 14, 14])
    rr = rounded(right, [4, 14, 14, 14, 4, 6])
    return f'<path fill="{fill}" d="{rl}"/><path fill="{light or fill}" d="{rr}"/>'

# ---------------- Concept B — Orbit: globe ring woven with a tilted orbit ----------------
def ellipse_pt(t, rx, ry, rot, cx=128, cy=128):
    x, y = rx * math.cos(t), ry * math.sin(t)
    c, s = math.cos(rot), math.sin(rot)
    return cx + x * c - y * s, cy + x * s + y * c

def concept_b(fill="#000", dot=None, bg=None):
    cx, cy, R, W = 118, 138, 82, 36
    ro, ri = R + W / 2, R - W / 2
    a0, a1 = math.radians(-22), math.radians(-68)   # gap (upper-right), ring runs clockwise from a0 round to a1
    def p(r, a): return f"{f(cx + r * math.cos(a))} {f(cy + r * math.sin(a))}"
    d = (f"M{p(ro, a0)}A{f(ro)} {f(ro)} 0 1 1 {p(ro, a1)}L{p(ri, a1)}"
         f"A{f(ri)} {f(ri)} 0 1 0 {p(ri, a0)}Z")
    am = (a0 + a1) / 2
    dr = 24
    dist = ro + 6
    dx, dy = cx + dist * math.cos(am), cy + dist * math.sin(am)
    return f'<path fill="{fill}" d="{d}"/><circle cx="{f(dx)}" cy="{f(dy)}" r="{dr}" fill="{dot or fill}"/>'

# ---------------- Concept C — Fold: a ribbon folded into a V inside a hexagon ----------------
def _ix(p, d, q, e):
    # intersection of lines p + t d and q + u e
    den = d[0] * e[1] - d[1] * e[0]
    t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den
    return (p[0] + t * d[0], p[1] + t * d[1])

def concept_c(fill="#000", light=None):
    O = (104, 226)
    Lt_y, Rt_y = 86, 32
    w, gap = 52, 9
    def unit(a): l = math.hypot(*a); return a[0] / l, a[1] / l
    dl, dr = unit((-70, -142)), unit((112, -194))
    nl = (-dl[1], dl[0]);  nl = nl if nl[0] > 0 else (-nl[0], -nl[1])     # inward (to the right)
    nr = (-dr[1], dr[0]);  nr = nr if nr[0] < 0 else (-nr[0], -nr[1])     # inward (to the left)
    off = lambda q, n, k: (q[0] + n[0] * k, q[1] + n[1] * k)
    hz = lambda y: ((0, y), (1, 0))
    Li, Ri = off(O, nl, w), off(O, nr, w)
    # left arm runs all the way to the apex; bottom closed by the right outer line
    left = [_ix(O, dl, *hz(Lt_y)), _ix(Li, dl, *hz(Lt_y)), _ix(Li, dl, O, dr), O]
    # right arm starts against the left arm (fold), with a gap
    G = off(O, nl, w + gap)
    right = [_ix(O, dr, G, dl), _ix(Ri, dr, G, dl), _ix(Ri, dr, *hz(Rt_y)), _ix(O, dr, *hz(Rt_y))]
    rl = rounded(left, [8, 8, 3, 12])
    rr = rounded(right, [3, 3, 8, 8])
    return f'<path fill="{fill}" d="{rl}"/><path fill="{light or fill}" d="{rr}"/>'

# ---------------- Wordmark "vpn.free" (geometric monoline, concept build with strokes) ----------------
def wordmark(x0, fill="#000", w=22):
    r = 39            # bowl centreline radius → x-height 100 (78..178)
    yb, yx = 178, 78
    g = 16            # spacing between letters (outer edges)
    parts = []
    x = x0
    def stroke(d, cap="butt", join="round"):
        parts.append(f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="{join}"/>')
    # v
    vw = 80
    stroke(f"M{f(x + w/2)} {yx}L{f(x + vw/2)} {f(yb - w*0.55)}L{f(x + vw - w/2)} {yx}", join="round")
    x += vw + g - 4
    # p
    s = x + w / 2
    stroke(f"M{f(s)} {yx}V222")
    parts.append(f'<circle cx="{f(s + r)}" cy="128" r="{r}" fill="none" stroke="{fill}" stroke-width="{w}"/>')
    x = s + 2 * r + w / 2 + g
    # n
    s = x + w / 2
    stroke(f"M{f(s)} {yx}V{yb}")
    stroke(f"M{f(s)} 128A{r} {r} 0 0 1 {f(s + 2*r)} 128V{yb}")
    x = s + 2 * r + w / 2 + g - 2
    # .
    parts.append(f'<circle cx="{f(x + 13)}" cy="{yb - 13}" r="13" fill="{fill}"/>')
    x += 26 + g - 2
    # f
    s = x + w / 2 + 6
    stroke(f"M{f(s)} {yb}V68A{30} {30} 0 0 1 {f(s + 30)} 38H{f(s + 46)}")
    stroke(f"M{f(s - 17)} {yx + w/2}H{f(s + 40)}")
    x = s + 46 + g - 4
    # r
    s = x + w / 2
    stroke(f"M{f(s)} {yx}V{yb}")
    stroke(f"M{f(s)} 128A{r} {r} 0 0 1 {f(s + r)} {yx + w/2}H{f(s + r + 10)}")
    x = s + r + 10 + g
    # e e
    for _ in range(2):
        c = x + r + w / 2
        stroke(f"M{f(c - r)} 128H{f(c + r)}A{r} {r} 0 1 0 {f(c + r*0.72)} {f(128 + r*0.69)}")
        x = c + r + w / 2 + g
    return "".join(parts), x - g

def lockup(symbol_body, name):
    # symbol scaled to 0.82 and vertically centred on the x-height (128)
    sc = 0.86
    tx = 0
    ty = 128 - 128 * sc
    sym = f'<g transform="translate({tx} {f(ty)}) scale({sc})">{symbol_body}</g>'
    wm, end = wordmark(256 * sc + 40)
    W = math.ceil(end + 8)
    open(os.path.join(OUT, name), "w").write(svg(sym + wm, W, 256))

for key, fn in (("a", concept_a), ("b", concept_b), ("c", concept_c)):
    body = fn()
    open(os.path.join(OUT, f"{key}-symbol.svg"), "w").write(svg(body))
    lockup(body, f"{key}-lockup.svg")

# colour previews of each on brand-ish grounds
V, G = "#5B3BFF", "#3DFF8B"
prev = {
    "a-color.svg": svg(f'<rect width="256" height="256" rx="56" fill="{V}"/>' + concept_a("#fff", "#B9FFD6")),
    "b-color.svg": svg(f'<rect width="256" height="256" rx="56" fill="#0B0B12"/>' + concept_b("#fff", G)),
    "c-color.svg": svg(f'<rect width="256" height="256" rx="56" fill="{V}"/>' + concept_c("#fff", "#B3A6FF")),
}
for k, v in prev.items():
    open(os.path.join(OUT, k), "w").write(v)
print("ok")
