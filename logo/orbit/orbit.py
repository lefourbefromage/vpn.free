"""vpn.free — concept « Orbite » : un anneau (le monde) entrelacé avec une orbite (la connexion).
Génère le symbole (vrais entrelacs, sans tracés de fond) et des déclinaisons en dégradé.
Usage : PYTHONPATH=<dossier shapely> python orbit.py <dossier de sortie>
"""
import math, os, sys
from shapely.geometry import Point, LinearRing, LineString, Polygon, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

OUT = sys.argv[1] if len(sys.argv) > 1 else "."
os.makedirs(OUT, exist_ok=True)

def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")

# ---------------------------------------------------------------- géométrie
R, W = 70, float(os.environ.get("ORBIT_W", 21))   # anneau : rayon médian, épaisseur
RX, RY, ROT = 38, 130, 40     # orbite : demi-axes, inclinaison (°)
GAP = float(os.environ.get("ORBIT_GAP", 6))     # jour autour des passages « dessus »

def ell_pt(t):
    x, y = RX * math.cos(t), RY * math.sin(t)
    c, s = math.cos(math.radians(ROT)), math.sin(math.radians(ROT))
    return x * c - y * s, x * s + y * c

N = 720
ring_line = LinearRing([(R * math.cos(2 * math.pi * i / N), R * math.sin(2 * math.pi * i / N)) for i in range(N)])
ell_line = LinearRing([ell_pt(2 * math.pi * i / N) for i in range(N)])
circle = Point(0, 0).buffer(R + W / 2, 256).difference(Point(0, 0).buffer(R - W / 2, 256))
orbit = Polygon(ell_line).buffer(W / 2, 256).difference(Polygon(ell_line).buffer(-W / 2, 256))

# croisements des lignes médianes, triés le long de l'orbite
xs = list(ring_line.intersection(ell_line).geoms)
TT = [i * 2 * math.pi / 4000 for i in range(4000)]
def t_of(p):
    return min(TT, key=lambda t: math.dist(ell_pt(t), p.coords[0]))
ts = sorted(t_of(p) for p in xs)
angs = [math.atan2(*reversed(ell_pt(t))) for t in ts]
CLEAR = W + GAP + 3          # un segment « dessus » doit dépasser entièrement l'autre bande

def adiff(a, b):
    return abs((a - b + math.pi) % (2 * math.pi) - math.pi)

def arc_piece(a0, da):       # morceau d'anneau, extrémités radiales
    pts = [(R * math.cos(a0 + da * (2 * i / 80 - 1)), R * math.sin(a0 + da * (2 * i / 80 - 1))) for i in range(81)]
    return LineString(pts).buffer(W / 2, 64, cap_style="flat")

def ell_piece(t0, dt):       # morceau d'orbite
    return LineString([ell_pt(t0 + dt * (2 * i / 80 - 1)) for i in range(81)]).buffer(W / 2, 64, cap_style="flat")

for k, (t, a) in enumerate(zip(ts, angs)):
    if k % 2 == 0:   # l'anneau passe dessus → on coupe l'orbite
        cap = 0.5 * min(adiff(a, b) for b in angs if b != a)
        da = 0.02
        while da < cap and ell_line.distance(Point(R * math.cos(a + da), R * math.sin(a + da))) < CLEAR \
                or ell_line.distance(Point(R * math.cos(a - da), R * math.sin(a - da))) < CLEAR and da < cap:
            da += 0.01
        orbit = orbit.difference(arc_piece(a, da).buffer(GAP, 64))
    else:            # l'orbite passe dessus → on coupe l'anneau
        cap = 0.5 * min(adiff(t, u) for u in ts if u != t)
        dt = 0.02
        while dt < cap and (abs(math.hypot(*ell_pt(t + dt)) - R) < CLEAR or abs(math.hypot(*ell_pt(t - dt)) - R) < CLEAR):
            dt += 0.01
        circle = circle.difference(ell_piece(t, dt).buffer(GAP, 64))

# adoucit très légèrement les angles vifs des coupes
circle = circle.buffer(-2.6, 64).buffer(2.6, 64)
orbit = orbit.buffer(-2.6, 64).buffer(2.6, 64)

# cadrage dans 256×256 avec 12 de marge
allg = unary_union([circle, orbit])
minx, miny, maxx, maxy = allg.bounds
sc = 232 / max(maxx - minx, maxy - miny)
def place(g):
    g = affinity.translate(g, -(minx + maxx) / 2, -(miny + maxy) / 2)
    g = affinity.scale(g, sc, sc, origin=(0, 0))
    return affinity.translate(g, 128, 128).simplify(0.04)
circle, orbit = place(circle), place(orbit)

def to_d(g):
    polys = g.geoms if isinstance(g, MultiPolygon) else [g]
    d = ""
    for poly in polys:
        for ring in [poly.exterior, *poly.interiors]:
            c = list(ring.coords)[:-1]
            d += "M" + "L".join(f"{f(x)} {f(y)}" for x, y in c) + "Z"
    return d

D_CIRCLE, D_ORBIT = to_d(circle), to_d(orbit)

# axe de l'orbite (pour orienter le dégradé le long de la trajectoire)
ax = ell_pt(math.pi / 2)
A1 = (128 - ax[0] * sc, 128 - ax[1] * sc)
A2 = (128 + ax[0] * sc, 128 + ax[1] * sc)

# ---------------------------------------------------------------- rendu
def grad(gid, stops, p1=(0, 0), p2=(256, 256)):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"' + (f' stop-opacity="{a}"' if a != 1 else "") + "/>"
                for o, c, a in stops)
    return (f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{f(p1[0])}" y1="{f(p1[1])}" '
            f'x2="{f(p2[0])}" y2="{f(p2[1])}">{s}</linearGradient>')

def mark(c_fill, o_fill, tx=0, ty=0, s=1):
    return (f'<g transform="translate({f(tx)} {f(ty)}) scale({f(s)})">'
            f'<path fill-rule="evenodd" fill="{c_fill}" d="{D_CIRCLE}"/>'
            f'<path fill-rule="evenodd" fill="{o_fill}" d="{D_ORBIT}"/></g>')

def svg(body, w=256, h=256, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f"<defs>{defs}</defs>{body}</svg>\n")

def write(name, content):
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(content)

# wordmark repris du générateur de concepts
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "concepts", "generate.py"), encoding="utf-8").read()
exec(src[src.index("def wordmark"):src.index("def lockup")])

def tile(bg_defs, bg_fill, c_fill, o_fill, defs):
    # icône carrée, symbole à 76 %
    s = 0.76
    o = 128 * (1 - s)
    return svg(f'<rect width="256" height="256" rx="58" fill="{bg_fill}"/>' + mark(c_fill, o_fill, o, o, s),
               defs=bg_defs + defs)

def lockup(name, c_fill, o_fill, text, defs="", bg=None):
    s = 0.86
    wm, end = wordmark(256 * s + 36, fill=text, w=float(os.environ.get("WORDMARK_W", 22)))
    W_ = math.ceil(end + 8)
    pad = 40 if bg else 0
    body = mark(c_fill, o_fill, pad, 128 - 128 * s, s) + f'<g transform="translate({pad} 0)">{wm}</g>'
    if bg:
        body = f'<rect width="{W_ + 2 * pad}" height="256" rx="40" fill="{bg}"/>' + body
    write(name, svg(body, W_ + 2 * pad, 256, defs))

# 0. noir pur (référence de forme)
write("orbit-black.svg", svg(mark("#000", "#000")))

# palettes
NIGHT, VIOLET, MINT, CYAN, LIME = "#0B0B14", "#5B3BFF", "#3DFF8B", "#00C8FF", "#C6FF3D"
variants = {
    # 1. Nuit : anneau blanc, orbite vert → cyan
    "1-nuit": dict(bg_defs="", bg=NIGHT,
                   defs=grad("o", [(0, MINT, 1), (1, CYAN, 1)], A2, A1), c="#FFFFFF", o="url(#o)", text="#FFFFFF"),
    # 2. Violet : anneau blanc, orbite blanche qui s'efface (traînée de vitesse)
    "2-violet": dict(bg_defs="", bg=VIOLET,
                     defs=grad("o", [(0, "#FFFFFF", 1), (0.55, "#FFFFFF", 0.9), (1, "#FFFFFF", 0.12)], A2, A1),
                     c="#FFFFFF", o="url(#o)", text="#FFFFFF"),
    # 3. Aurore : fond dégradé violet → bleu électrique, orbite blanc → menthe
    "3-aurore": dict(bg_defs=grad("bg", [(0, "#8A2BFF", 1), (0.5, "#5B3BFF", 1), (1, "#1E40FF", 1)]), bg="url(#bg)",
                     defs=grad("o", [(0, "#FFFFFF", 1), (1, MINT, 1)], A1, A2), c="#FFFFFF", o="url(#o)", text="#FFFFFF"),
    # 4. Néon : anneau dégradé violet → cyan, orbite vert → lime, sur noir
    "4-neon": dict(bg_defs="", bg=NIGHT,
                   defs=grad("c", [(0, "#7B5CFF", 1), (1, CYAN, 1)], (40, 40), (216, 216))
                        + grad("o", [(0, LIME, 1), (1, MINT, 1)], A1, A2),
                   c="url(#c)", o="url(#o)", text="#FFFFFF"),
    # 5. Clair : sur blanc, anneau encre, orbite violet → cyan
    "5-clair": dict(bg_defs="", bg="#F3F2FF",
                    defs=grad("o", [(0, VIOLET, 1), (1, CYAN, 1)], A2, A1), c=NIGHT, o="url(#o)", text=NIGHT),
}
# déclinaisons « violet » sur fonds plus clairs ; l'orbite garde sa traînée qui s'efface
FADE_W = grad("o", [(0, "#FFFFFF", 1), (0.55, "#FFFFFF", 0.9), (1, "#FFFFFF", 0.12)], A2, A1)
FADE_V = grad("o", [(0, VIOLET, 1), (0.55, VIOLET, 0.9), (1, VIOLET, 0.15)], A2, A1)
variants.update({
    # 6. Violet doux : un cran plus clair, toujours en blanc
    "6-violet-doux": dict(bg_defs="", bg="#7E66FF", defs=FADE_W, c="#FFFFFF", o="url(#o)", text="#FFFFFF"),
    # 7. Dégradé lumineux : violet → lilas, du coin haut-gauche vers le bas-droite
    "7-lilas": dict(bg_defs=grad("bg", [(0, "#6A4BFF", 1), (1, "#B9A8FF", 1)]), bg="url(#bg)",
                    defs=FADE_W, c="#FFFFFF", o="url(#o)", text="#FFFFFF"),
    # 8. Lavande : fond très clair, logo violet
    "8-lavande": dict(bg_defs="", bg="#ECE8FF", defs=FADE_V, c=VIOLET, o="url(#o)", text="#1C1240"),
    # 9. Brume : fond lavande → blanc, logo violet
    "9-brume": dict(bg_defs=grad("bg", [(0, "#D9D0FF", 1), (1, "#FFFFFF", 1)]), bg="url(#bg)",
                    defs=FADE_V, c=VIOLET, o="url(#o)", text="#1C1240"),
})
for key, v in variants.items():
    write(f"orbit-{key}.svg", tile(v["bg_defs"], v["bg"], v["c"], v["o"], v["defs"]))
    lockup(f"orbit-{key}-lockup.svg", v["c"], v["o"], v["text"], v["bg_defs"] + v["defs"], v["bg"])
print("croisements:", len(xs))
