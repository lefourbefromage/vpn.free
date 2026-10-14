"""vpn.free — 2e série de pistes abstraites (noir, 256×256).
Usage : PYTHONPATH=<dossier shapely> python gen2.py <dossier de sortie>
"""
import math, os, sys
from shapely.geometry import Point, Polygon, LineString, box, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
os.makedirs(OUT, exist_ok=True)

def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")

def to_d(g):
    polys = g.geoms if isinstance(g, MultiPolygon) else [g]
    d = ""
    for poly in polys:
        for ring in [poly.exterior, *poly.interiors]:
            d += "M" + "L".join(f"{f(x)} {f(y)}" for x, y in list(ring.coords)[:-1]) + "Z"
    return d

def fit(g, size=232):
    minx, miny, maxx, maxy = g.bounds
    s = size / max(maxx - minx, maxy - miny)
    g = affinity.translate(g, -(minx + maxx) / 2, -(miny + maxy) / 2)
    g = affinity.scale(g, s, s, origin=(0, 0))
    return affinity.translate(g, 128, 128).simplify(0.04)

def soften(g, r):
    return g.buffer(-r, 64).buffer(2 * r, 64).buffer(-r, 64)

def arch(w, bottom, aspect=1.05, h=None):
    h = h or w * aspect
    top = bottom - h
    return unary_union([Point(0, top + w / 2).buffer(w / 2, 128),
                        box(-w / 2, top + w / 2, w / 2, bottom)])

# A — Tunnel : arches emboîtées qui rétrécissent vers la sortie (profondeur + vitesse)
def tunnel():
    bands, gap = [], 9
    w, h = 210, 222
    for t in (30, 21, 14, 9):
        bands.append(arch(w, 232, h=h).difference(arch(w - 2 * t, 233, h=h - t)))
        w, h = w - 2 * t - 2 * gap, h - t - gap
    return fit(soften(unary_union(bands), 1.5))

# B — Boussole : un losange (le diamant) fendu par une étoile à 4 branches (toutes les directions)
def boussole():
    hd = 110
    diamond = Polygon([(0, -hd), (hd, 0), (0, hd), (-hd, 0)])
    diamond = soften(diamond, 16)
    R, p = 150, 0.3
    pts = []
    for i in range(720):
        t = 2 * math.pi * i / 720
        c, s = math.cos(t), math.sin(t)
        x = R * math.copysign(abs(c) ** (2 / p), c)
        y = R * math.copysign(abs(s) ** (2 / p), s)
        pts.append((x, y))
    star = Polygon(pts).buffer(3.5, 64)
    return fit(soften(diamond.difference(star), 1.5))

# C — Transit : un globe découpé en bandes qui avancent (le monde en mouvement, vers l'avant)
def transit():
    R, n, gap = 104, 5, 10
    hband = (2 * R - (n - 1) * gap) / n
    disc = Point(0, 0).buffer(R, 256)
    parts = []
    for i in range(n):
        y0 = -R + i * (hband + gap)
        band = disc.intersection(box(-R - 1, y0, R + 1, y0 + hband))
        shift = 42 * (1 - abs(i - (n - 1) / 2) / ((n - 1) / 2))
        parts.append(affinity.translate(soften(band, 3), shift, 0))
    return fit(unary_union(parts))

# D — Faisceau : des rayons qui convergent en V (V de VPN, lumière, tous les chemins mènent à un point sûr)
def faisceau():
    n, spread = 7, 45
    parts = []
    for i in range(n):
        a = math.radians(-spread + 2 * spread * i / (n - 1))
        r0 = 74
        r1 = 122 + 84 * abs(math.degrees(a)) / spread
        dx, dy = math.sin(a), -math.cos(a)
        parts.append(LineString([(r0 * dx, r0 * dy), (r1 * dx, r1 * dy)]).buffer(6.5, 32, cap_style="flat"))
    parts.append(Point(0, -18).buffer(17, 64))   # le point de convergence : vous
    return fit(soften(unary_union(parts), 1.2))

marks = {"a-tunnel": tunnel(), "b-boussole": boussole(), "c-transit": transit(), "d-faisceau": faisceau()}

src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "concepts", "generate.py"), encoding="utf-8").read()
exec(src[src.index("def wordmark"):src.index("def lockup")])

def svg(body, w=256, h=256, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f"{'<defs>' + defs + '</defs>' if defs else ''}{body}</svg>\n")

def write(name, s):
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(s)

def grad(gid, a, b):
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>')

for key, g in marks.items():
    d = to_d(g)
    write(f"{key}.svg", svg(f'<path fill-rule="evenodd" fill="#000" d="{d}"/>'))
    s = 0.86
    wm, end = wordmark(256 * s + 36)
    W = math.ceil(end + 8)
    write(f"{key}-lockup.svg", svg(f'<g transform="translate(0 {f(128 - 128 * s)}) scale({s})">'
                                    f'<path fill-rule="evenodd" fill="#000" d="{d}"/></g>{wm}', W, 256))
    # aperçu couleur dans l'univers violet → lilas retenu
    write(f"{key}-color.svg", svg('<rect width="256" height="256" rx="58" fill="url(#bg)"/>'
                                  f'<g transform="translate(30.7 30.7) scale(0.76)"><path fill-rule="evenodd" fill="#fff" d="{d}"/></g>',
                                  defs=grad("bg", "#6A4BFF", "#B9A8FF")))
print("ok")
