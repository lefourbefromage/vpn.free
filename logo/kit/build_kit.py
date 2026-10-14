"""vpn.free — construction des fichiers maîtres du logo final (Boussole décentrée à facettes).

Tout est en contours vectoriels (pas de texte ni de traits) : symbole, version petite taille,
lettrage « vpn.free » vectorisé, logos horizontal / empilé, icônes d'app.
Usage : PYTHONPATH=<dossier shapely> python build_kit.py
"""
import math, os
from shapely.geometry import Point, Polygon, LineString, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "masters")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- palette
VIOLET = "#5B3BFF"     # couleur principale (grands éclats)
LILAS = "#A28FFF"      # couleur secondaire (petits éclats)
LAVANDE = "#ECE8FF"    # fond clair
NUIT = "#1C1240"       # texte, fond sombre
GRAD = ("#6A4BFF", "#B9A8FF")   # dégradé de l'icône d'app

TITLE = "vpn.free"

# ---------------------------------------------------------------- outils
def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")

def polys(g):
    return list(g.geoms) if isinstance(g, MultiPolygon) else [g]

def to_d(g):
    d = ""
    for poly in polys(g):
        for ring in [poly.exterior, *poly.interiors]:
            d += "M" + "L".join(f"{f(x)} {f(y)}" for x, y in list(ring.coords)[:-1]) + "Z"
    return d

def soften(g, r):
    return g.buffer(-r, 64).buffer(2 * r, 64).buffer(-r, 64)

def fit(g, size=232, cx=128, cy=128):
    minx, miny, maxx, maxy = g.bounds
    s = size / max(maxx - minx, maxy - miny)
    g = affinity.translate(g, -(minx + maxx) / 2, -(miny + maxy) / 2)
    g = affinity.scale(g, s, s, origin=(0, 0))
    return affinity.translate(g, cx, cy)

def svg(body, w, h, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" width="{f(w)}" height="{f(h)}">'
            f"<title>{TITLE}</title>{'<defs>' + defs + '</defs>' if defs else ''}{body}</svg>\n")

def write(name, content):
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(content)

# ---------------------------------------------------------------- symbole
def star(R=150, p=0.3, cut=3.5, center=(16, -16)):
    pts = []
    for i in range(1440):
        t = 2 * math.pi * i / 1440
        c, s = math.cos(t), math.sin(t)
        pts.append((R * math.copysign(abs(c) ** (2 / p), c) + center[0],
                    R * math.copysign(abs(s) ** (2 / p), s) + center[1]))
    return Polygon(pts).buffer(0).buffer(cut, 64)

def symbol(cut=3.5, p=0.3, center=(16, -16), corner=16):
    hd = 110
    diamond = soften(Polygon([(0, -hd), (hd, 0), (0, hd), (-hd, 0)]), corner)
    g = soften(diamond.difference(star(p=p, cut=cut, center=center)), 1.5)
    return fit(g).simplify(0.1)

MAIN = symbol()
SMALL = symbol(cut=10, p=0.26, center=(12, -12), corner=20)   # jours élargis pour 16–32 px

def facets(g, primary, secondary, op2=1.0):
    """Grands éclats (haut-droite, bas-gauche) en couleur principale, petits en secondaire."""
    ps = polys(g)
    cx = sum(p.centroid.x for p in ps) / len(ps)
    cy = sum(p.centroid.y for p in ps) / len(ps)
    out = ""
    for p in ps:
        dx, dy = p.centroid.x - cx, p.centroid.y - cy
        main = dx * dy < 0
        col = primary if main else secondary
        op = "" if main or op2 == 1 else f' fill-opacity="{op2}"'
        out += f'<path fill="{col}"{op} d="{to_d(p)}"/>'
    return out

# ---------------------------------------------------------------- lettrage « vpn.free » (vectorisé)
def arc(cx, cy, r, a0, a1, n=96):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

def wordmark(x0, w=22):
    """Géométrie du lettrage ; hauteur d'x 100 (y 78→178), base 178. Renvoie (géométrie, x de fin)."""
    r, yb, yx, g = 39, 178, 78, 16
    hw = w / 2
    line = lambda pts: LineString(pts).buffer(hw, 64, cap_style="flat", join_style="round")
    ring = lambda cx, cy: Point(cx, cy).buffer(r + hw, 256).difference(Point(cx, cy).buffer(r - hw, 256))
    parts, x = [], x0
    # v
    vw = 80
    parts.append(line([(x + hw, yx), (x + vw / 2, yb - w * 0.55), (x + vw - hw, yx)]))
    x += vw + g - 4
    # p
    s = x + hw
    parts += [line([(s, yx), (s, 222)]), ring(s + r, 128)]
    x = s + 2 * r + hw + g
    # n
    s = x + hw
    parts += [line([(s, yx), (s, yb)]), line([*arc(s + r, 128, r, math.pi, 2 * math.pi), (s + 2 * r, yb)])]
    x = s + 2 * r + hw + g - 2
    # .
    parts.append(Point(x + 13, yb - 13).buffer(13, 128))
    x += 26 + g - 2
    # f
    s = x + hw + 6
    parts += [line([(s, yb), *arc(s + 30, 68, 30, math.pi, 1.5 * math.pi), (s + 46, 38)]),
              line([(s - 17, yx + hw), (s + 40, yx + hw)])]
    x = s + 46 + g - 4
    # r
    s = x + hw
    parts += [line([(s, yx), (s, yb)]), line([*arc(s + r, 128, r, math.pi, 1.5 * math.pi), (s + r + 10, yx + hw)])]
    x = s + r + 10 + g
    # e e
    end_a = math.atan2(0.69, 0.72) - 2 * math.pi
    for _ in range(2):
        c = x + r + hw
        parts.append(line([(c - r, 128), *arc(c, 128, r, 0, end_a, 192)]))
        x = c + r + hw + g
    return unary_union(parts), x - g

WM, WM_END = wordmark(0)
WM = WM.simplify(0.12)
wm_minx, wm_miny, wm_maxx, wm_maxy = WM.bounds

def wm_d(dx=0, dy=0, s=1):
    return to_d(affinity.translate(affinity.scale(WM, s, s, origin=(0, 0)), dx, dy))

# ---------------------------------------------------------------- variantes de couleur
DARK_OP = 0.55   # petits éclats en blanc transparent sur fond sombre

SCHEMES = {
    "":      dict(primary=VIOLET, secondary=LILAS, text=NUIT),            # sur fond clair (version principale)
    "-dark": dict(primary="#FFFFFF", secondary="#FFFFFF", op2=DARK_OP, text="#FFFFFF"),  # sur violet nuit / fonds sombres
}

def sym_body(g, sc, tx=0, ty=0, s=1):
    return f'<g transform="translate({f(tx)} {f(ty)}) scale({f(s)})">{facets(g, sc["primary"], sc["secondary"], sc.get("op2", 1.0))}</g>'

for suffix, sc in SCHEMES.items():
    # symbole seul
    write(f"vpnfree-symbol{suffix}.svg", svg(sym_body(MAIN, sc), 256, 256))
    write(f"vpnfree-symbol-small{suffix}.svg", svg(sym_body(SMALL, sc), 256, 256))

    # horizontal : symbole à la hauteur ~ x-height × 1.9, centré sur la hauteur d'x
    s = 0.86
    sym_w = 256 * s
    gap = 40
    W = sym_w + gap + wm_maxx + 4
    body = sym_body(MAIN, sc, 0, 128 - 128 * s, s) + f'<path fill="{sc["text"]}" d="{wm_d(sym_w + gap)}"/>'
    write(f"vpnfree-horizontal{suffix}.svg", svg(body, W, 256))

    # empilé : symbole au-dessus, lettrage centré dessous
    ww = wm_maxx - wm_minx
    sym_size = 260
    top_pad = 0
    wm_top = sym_size + 56
    H = wm_top + (wm_maxy - wm_miny)
    Wst = max(ww, sym_size)
    body = (sym_body(MAIN, sc, (Wst - sym_size) / 2, top_pad, sym_size / 256)
            + f'<path fill="{sc["text"]}" d="{wm_d((Wst - ww) / 2 - wm_minx, wm_top - wm_miny)}"/>')
    write(f"vpnfree-stacked{suffix}.svg", svg(body, Wst, H))

    # lettrage seul
    write(f"vpnfree-wordmark{suffix}.svg",
          svg(f'<path fill="{sc["text"]}" d="{wm_d(-wm_minx + 2, -wm_miny + 2)}"/>', ww + 4, wm_maxy - wm_miny + 4))

# ---------------------------------------------------------------- icônes d'app (carré arrondi, symbole à 72 %)
def app_icon(bg, defs, primary, secondary, op2=1.0, g=MAIN, scale=0.72):
    o = 128 * (1 - scale)
    return svg(f'<rect width="256" height="256" rx="56" fill="{bg}"/>'
               f'<g transform="translate({f(o)} {f(o)}) scale({scale})">{facets(g, primary, secondary, op2)}</g>',
               256, 256, defs)

GRAD_DEF = (f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{GRAD[0]}"/>'
            f'<stop offset="1" stop-color="{GRAD[1]}"/></linearGradient>')
write("vpnfree-app-icon.svg", app_icon("url(#bg)", GRAD_DEF, "#FFFFFF", "#FFFFFF", 0.62))
write("vpnfree-app-icon-light.svg", app_icon(LAVANDE, "", VIOLET, LILAS))
write("vpnfree-app-icon-night.svg", app_icon(NUIT, "", "#FFFFFF", "#FFFFFF", DARK_OP))
write("vpnfree-app-icon-small.svg", app_icon("url(#bg)", GRAD_DEF, "#FFFFFF", "#FFFFFF", 0.62, SMALL, 0.78))

# ---------------------------------------------------------------- symbole « carré » pour avatars (réseaux sociaux)
write("vpnfree-avatar.svg", app_icon("url(#bg)", GRAD_DEF, "#FFFFFF", "#FFFFFF", 0.62).replace('rx="56"', 'rx="0"'))

print("écrit dans", OUT)
for n in sorted(os.listdir(OUT)):
    print(" ", n)
