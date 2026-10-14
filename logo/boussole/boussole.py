"""vpn.free — variantes de la piste « Boussole » (diamant fendu par une étoile à 4 branches).
Usage : PYTHONPATH=<dossier shapely> python boussole.py <dossier de sortie>
"""
import math, os, sys
from shapely.geometry import Point, Polygon, MultiPolygon
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

def star(R=150, p=0.3, n=4, twist=0.0, cut=3.5, center=(0, 0)):
    """Étoile à n branches aux côtés concaves ; twist = rotation (°) ajoutée au bout des branches."""
    pts = []
    for i in range(1440):
        t = 2 * math.pi * i / 1440
        if n == 4:
            c, s = math.cos(t), math.sin(t)
            x = R * math.copysign(abs(c) ** (2 / p), c)
            y = R * math.copysign(abs(s) ** (2 / p), s)
        else:
            r = 10 + (R - 10) * abs(math.cos(n * t / 2)) ** 16
            x, y = r * math.sin(t), -r * math.cos(t)
        if twist:
            r = math.hypot(x, y)
            a = math.atan2(y, x) + math.radians(twist) * (r / R) ** 1.3
            x, y = r * math.cos(a), r * math.sin(a)
        pts.append((x + center[0], y + center[1]))
    return Polygon(pts).buffer(0).buffer(cut, 64)

def diamond(hd=110, r=16):
    return soften(Polygon([(0, -hd), (hd, 0), (0, hd), (-hd, 0)]), r)

def build(base, st):
    return fit(soften(base.difference(st), 1.5))

V = {}
# 1. Original
V["01-original"] = ("Original", build(diamond(), star()))
# 2. Penché : cisaillement, effet italique / vitesse
V["02-penche"] = ("Penché", fit(affinity.skew(build(diamond(), star()), xs=-16, origin=(128, 128))))
# 3. Étiré : une gemme élancée
V["03-gemme"] = ("Gemme", fit(affinity.scale(build(diamond(), star()), 0.8, 1.0, origin=(128, 128))))
# 4. Tourbillon : branches torsadées, mouvement de rotation
V["04-tourbillon"] = ("Tourbillon", build(diamond(), star(twist=24, cut=4)))
# 5. Décentré : l'étoile file vers le haut-droite, les quatre éclats deviennent inégaux
V["05-decentre"] = ("Décentré", build(diamond(), star(center=(16, -16))))
# 6. Carré : rotation à 45°, les branches visent les coins
sq = soften(Polygon([(-92, -92), (92, -92), (92, 92), (-92, 92)]), 26)
V["06-carre"] = ("Carré", build(sq, affinity.rotate(star(R=170), 45, origin=(0, 0))))
# 7. Cercle : la boussole dans un globe
V["07-cercle"] = ("Globe", build(Point(0, 0).buffer(104, 256), affinity.rotate(star(R=160), 45, origin=(0, 0))))
# 8. Hexagone : 6 branches, retour aux références hexagonales
hexa = soften(Polygon([(108 * math.cos(math.radians(a)), 108 * math.sin(math.radians(a))) for a in range(-90, 270, 60)]), 14)
V["08-hexagone"] = ("Hexagone", build(hexa, star(R=150, n=6, cut=3.5)))
# 9. Perspective : le losange basculé vers l'arrière (profondeur, tunnel)
def keystone(g, k=0.0042):
    def tf(x, y):
        return x * (1 + y * k), y * (1 + y * k * 0.35)
    polys = g.geoms if isinstance(g, MultiPolygon) else [g]
    out = []
    for poly in polys:
        out.append(Polygon([tf(x - 128, y - 128) for x, y in poly.exterior.coords],
                           [[tf(x - 128, y - 128) for x, y in r.coords] for r in poly.interiors]))
    return fit(MultiPolygon(out))
V["09-perspective"] = ("Perspective", keystone(build(diamond(), star())))

def svg(body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">'
            f"{'<defs>' + defs + '</defs>' if defs else ''}{body}</svg>\n")

BG = ('<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
      '<stop offset="0" stop-color="#6A4BFF"/><stop offset="1" stop-color="#B9A8FF"/></linearGradient>')
for key, (name, g) in V.items():
    d = to_d(g)
    open(os.path.join(OUT, f"{key}.svg"), "w", encoding="utf-8").write(svg(f'<path fill-rule="evenodd" d="{d}"/>'))
    open(os.path.join(OUT, f"{key}-color.svg"), "w", encoding="utf-8").write(svg(
        '<rect width="256" height="256" rx="58" fill="url(#bg)"/>'
        f'<g transform="translate(30.7 30.7) scale(0.76)"><path fill-rule="evenodd" fill="#fff" d="{d}"/></g>', BG))

# bonus : facettes en deux tons (couleur uniquement)
g = V["01-original"][1]
pieces = sorted(g.geoms, key=lambda p: (round(p.centroid.y), p.centroid.x))
tones = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
body = ""
for p in pieces:
    cx, cy = p.centroid.x, p.centroid.y
    op = 1 if (cx - 128) * (cy - 128) < 0 else 0.62
    body += f'<path fill="#fff" fill-opacity="{op}" d="{to_d(p)}"/>'
open(os.path.join(OUT, "10-facettes-color.svg"), "w", encoding="utf-8").write(svg(
    '<rect width="256" height="256" rx="58" fill="url(#bg)"/>'
    f'<g transform="translate(30.7 30.7) scale(0.76)">{body}</g>', BG))
print("\n".join(V))

# ---------------------------------------------------------------- Décentré × Facettes
g5 = V["05-decentre"][1]
c0 = (sum(p.centroid.x for p in g5.geoms) / 4, sum(p.centroid.y for p in g5.geoms) / 4)
def quad(p):
    dx, dy = p.centroid.x - c0[0], p.centroid.y - c0[1]
    return ("T" if dy < 0 else "B") + ("L" if dx < 0 else "R")
def faceted(tones, fill="#fff"):
    out = ""
    for p in g5.geoms:
        t = tones[quad(p)]
        col, op = (t if isinstance(t, tuple) else (fill, t))
        out += f'<path fill="{col}"' + (f' fill-opacity="{op}"' if op != 1 else "") + f' d="{to_d(p)}"/>'
    return out
def tile(bg, body, defs=BG):
    return svg(f'<rect width="256" height="256" rx="58" fill="{bg}"/>'
               f'<g transform="translate(30.7 30.7) scale(0.76)">{body}</g>', defs)
VIO, LIL, NIGHT = "#5B3BFF", "#A28FFF", "#0B0B14"
combos = {
    "11-decentre-facettes": tile("url(#bg)", faceted({"TL": .62, "BR": .62, "TR": 1, "BL": 1})),
    "12-decentre-facettes-inverse": tile("url(#bg)", faceted({"TL": 1, "BR": 1, "TR": .62, "BL": .62})),
    "13-decentre-lumiere": tile("url(#bg)", faceted({"TR": 1, "TL": .82, "BR": .66, "BL": .5})),
    "14-decentre-lavande": tile("#ECE8FF", faceted({"TL": (LIL, 1), "BR": (LIL, 1), "TR": (VIO, 1), "BL": (VIO, 1)}), ""),
    "15-decentre-nuit": tile(NIGHT, faceted({"TL": ("#8E7BFF", 1), "BR": ("#8E7BFF", 1), "TR": ("#fff", 1), "BL": ("#fff", 1)}), ""),
}
for k, s in combos.items():
    open(os.path.join(OUT, f"{k}-color.svg"), "w", encoding="utf-8").write(s)

# lockups
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "concepts", "generate.py"), encoding="utf-8").read()
exec(src[src.index("def wordmark"):src.index("def lockup")])
def lockup(name, bg, body, text, defs=""):
    s, pad = 0.86, 40
    wm, end = wordmark(256 * s + 36, fill=text)
    W = math.ceil(end + 8) + 2 * pad
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 256" width="{W}" height="256">'
        f"{'<defs>' + defs + '</defs>' if defs else ''}"
        f'<rect width="{W}" height="256" rx="40" fill="{bg}"/>'
        f'<g transform="translate({pad} {f(128 - 128 * s)}) scale({s})">{body}</g>'
        f'<g transform="translate({pad} 0)">{wm}</g></svg>\n')
BGW = BG.replace('x2="1" y2="1"', 'x2="1" y2="0"')
lockup("11-decentre-facettes-lockup.svg", "url(#bg)", faceted({"TL": .62, "BR": .62, "TR": 1, "BL": 1}), "#fff", BGW)
lockup("14-decentre-lavande-lockup.svg", "#ECE8FF", faceted({"TL": (LIL, 1), "BR": (LIL, 1), "TR": (VIO, 1), "BL": (VIO, 1)}), "#1C1240")
lockup("15-decentre-nuit-lockup.svg", NIGHT, faceted({"TL": ("#8E7BFF", 1), "BR": ("#8E7BFF", 1), "TR": ("#fff", 1), "BL": ("#fff", 1)}), "#fff")
