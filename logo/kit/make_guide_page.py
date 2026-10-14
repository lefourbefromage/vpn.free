"""Construit guide-web.html : le guide d'usage du logo vpn.free en page web (SVG maîtres intégrés)."""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(HERE, "masters")

def raw(n):
    s = open(os.path.join(M, n), encoding="utf-8").read().strip()
    return re.sub(r"<title>.*?</title>", "", s)

def inner(n):
    s = raw(n)
    return s[s.index(">") + 1: s.rindex("</svg>")]

def vb(n):
    return re.search(r'viewBox="([^"]+)"', raw(n)).group(1)

def svg(n, cls="", label="vpn.free"):
    return raw(n).replace("<svg ", f'<svg class="{cls}" role="img" aria-label="{label}" ', 1)

# --- zone de protection : logo horizontal + cadre à 1 X (X = hauteur d'x = 100 unités)
_, _, HW, _ = map(float, vb("vpnfree-horizontal.svg").split())
top, bot, X = 17, 238, 100
clear = (f'<svg class="clear" viewBox="{-X - 14} {top - X - 14} {HW + 2 * X + 28} {bot - top + 2 * X + 28}" role="img" '
         f'aria-label="Zone de protection d\'une hauteur d\'x autour du logo">'
         f'<rect x="{-X}" y="{top - X}" width="{HW + 2 * X}" height="{bot - top + 2 * X}" class="cs-zone"/>'
         f'<rect x="0" y="{top}" width="{HW}" height="{bot - top}" class="cs-box"/>'
         f'<rect x="{-X}" y="{top - X}" width="{X}" height="{X}" class="cs-x"/>'
         f'<text x="{-X / 2}" y="{top - X / 2}" class="cs-label">X</text>'
         f'<rect x="{HW}" y="{bot}" width="{X}" height="{X}" class="cs-x"/>'
         f'<text x="{HW + X / 2}" y="{bot + X / 2}" class="cs-label">X</text>'
         f'{inner("vpnfree-horizontal.svg")}</svg>')

sym = inner("vpnfree-symbol.svg")
def dont(transform="", extra="", style="", body=None):
    return (f'<svg viewBox="-40 -40 336 336" class="dont-svg" style="{style}" aria-hidden="true">'
            f'<g transform="{transform}">{body or sym}</g>{extra}</svg>')

recolor = sym.replace("#5B3BFF", "#19B36B").replace("#A28FFF", "#FF8A3D")
donts = [
    ("Étirer ou écraser", dont("translate(-64 0) scale(1.5 1)")),
    ("Faire pivoter", dont("rotate(28 128 128)")),
    ("Recolorer hors palette", dont(body=recolor)),
    ("Ajouter ombre ou lueur", dont(style="filter:drop-shadow(10px 14px 6px rgba(0,0,0,.45))")),
    ("Intervertir les facettes", dont(body=sym.replace("#5B3BFF", "#TMP").replace("#A28FFF", "#5B3BFF").replace("#TMP", "#A28FFF"))),
    ("Ajouter un contour", dont(body=sym.replace("<path ", '<path stroke="#1C1240" stroke-width="10" '))),
]
dont_html = "".join(f'<figure class="dont"><div class="dont-tile">{s}</div><figcaption>{t}</figcaption></figure>' for t, s in donts)

colors = [
    ("Violet", "#5B3BFF", "91 59 255", "64 77 0 0", "Couleur principale, grands éclats", "#FFFFFF"),
    ("Lilas", "#A28FFF", "162 143 255", "36 44 0 0", "Petits éclats, accents. Jamais pour du texte", "#1C1240"),
    ("Lavande", "#ECE8FF", "236 232 255", "7 9 0 0", "Fond clair", "#1C1240"),
    ("Violet nuit", "#1C1240", "28 18 64", "56 72 0 75", "Texte, fond sombre", "#FFFFFF"),
]
color_html = "".join(
    f'<article class="swatch"><div class="chip" style="background:{h};color:{fg}"><span>{n}</span></div>'
    f'<dl><div><dt>HEX</dt><dd><button type="button" class="copy" data-copy="{h}" aria-label="Copier {h}">{h}</button></dd></div>'
    f'<div><dt>RGB</dt><dd>{rgb}</dd></div><div><dt>CMJN</dt><dd>{cmyk}</dd></div></dl><p>{use}</p></article>'
    for n, h, rgb, cmyk, use, fg in colors)

html = f'''<title>Guide du logo vpn.free</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Mise en page : une colonne de lecture, des planches de démonstration pleine largeur posées sur les vraies surfaces de la marque */
:root {{
  --bg: #F7F5FF; --surface: #FFFFFF; --fg: #1C1240; --muted: #5E5683; --line: #DDD6FA; --accent: #5B3BFF;
  --b-violet: #5B3BFF; --b-lilas: #A28FFF; --b-lavande: #ECE8FF; --b-nuit: #1C1240; --b-white: #FFFFFF;
  --no: #D93B5B;
  --display: "Outfit", "Avenir Next", "Segoe UI", system-ui, sans-serif;
  --body: "Outfit", "Segoe UI", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Consolas, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #120B2C; --surface: #1C1240; --fg: #F1EEFF; --muted: #ABA3D6; --line: #34296A; --accent: #A28FFF; --no: #FF7A93; color-scheme: dark }} }}
:root[data-theme="dark"] {{
  --bg: #120B2C; --surface: #1C1240; --fg: #F1EEFF; --muted: #ABA3D6; --line: #34296A; --accent: #A28FFF; --no: #FF7A93; color-scheme: dark }}
* {{ box-sizing: border-box }}
.show-dark {{ display: none !important }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) .show-light {{ display: none !important }} :root:not([data-theme="light"]) .show-dark {{ display: block !important }} }}
:root[data-theme="dark"] .show-light {{ display: none !important }} :root[data-theme="dark"] .show-dark {{ display: block !important }}
body {{ background: var(--bg); color: var(--fg); font: 400 17px/1.6 var(--body); padding-inline: 20px; padding-block: 0 80px }}
.wrap {{ max-width: 1080px; margin: 0 auto; display: grid; gap: 88px }}
header.hero {{ display: grid; gap: 28px; padding-block: 56px 8px }}
.hero-logo {{ width: min(520px, 100%); height: auto }}
.eyebrow {{ font: 500 13px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--accent) }}
h1 {{ font: 700 clamp(34px, 5vw, 52px)/1.08 var(--display); margin: 0; text-wrap: balance; letter-spacing: -.01em }}
h2 {{ font: 600 30px/1.15 var(--display); margin: 0; text-wrap: balance }}
h3 {{ font: 600 19px/1.3 var(--display); margin: 0 }}
p {{ margin: 0; max-width: 65ch }}
.lead {{ font-size: 20px; color: var(--muted); max-width: 60ch }}
section {{ display: grid; gap: 24px }}
section > header {{ display: grid; gap: 10px }}
.muted {{ color: var(--muted) }}
.pillars {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px }}
.pillar {{ border-top: 2px solid var(--accent); padding-top: 14px; display: grid; gap: 6px; min-width: 0 }}
.pillar p {{ color: var(--muted); font-size: 16px }}
/* planches */
.plates {{ display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px }}
.plate {{ border-radius: 22px; padding: clamp(24px, 5vw, 48px); display: grid; place-items: center; gap: 18px; min-width: 0; grid-column: span 3 }}
.plate.wide {{ grid-column: span 6 }}
.plate.third {{ grid-column: span 2 }}
.plate svg {{ max-width: 100%; height: auto; display: block }}
.plate .tag {{ font: 500 12px/1.3 var(--mono); letter-spacing: .04em; opacity: .75; text-align: center }}
.on-white {{ background: var(--b-white); color: var(--b-nuit); box-shadow: inset 0 0 0 1px var(--line) }}
.on-lav {{ background: var(--b-lavande); color: var(--b-nuit) }}
.on-nuit {{ background: var(--b-nuit); color: var(--b-white) }}
.on-grad {{ background: linear-gradient(135deg, #6A4BFF, #B9A8FF); color: var(--b-white) }}
.lock-h {{ width: 520px }} .lock-s {{ width: 230px }} .sym {{ width: 150px }} .wm {{ width: 300px }}
.sizes {{ display: flex; align-items: flex-end; gap: 22px; flex-wrap: wrap; justify-content: center }}
.sizes figure {{ margin: 0; display: grid; justify-items: center; gap: 8px }}
.sizes figcaption {{ font: 500 12px var(--mono) }}
.icons {{ display: flex; gap: 18px; flex-wrap: wrap; justify-content: center }}
.icons svg {{ width: 112px; height: 112px }}
/* couleurs */
.swatches {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px }}
.swatch {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; display: grid; min-width: 0 }}
.chip {{ height: 120px; padding: 16px; display: flex; align-items: flex-end; font: 600 18px var(--display) }}
.swatch dl {{ margin: 0; padding: 14px 16px 4px; display: grid; gap: 4px }}
.swatch dl div {{ display: flex; justify-content: space-between; gap: 12px; font: 400 14px var(--mono); font-variant-numeric: tabular-nums }}
.swatch dt {{ color: var(--muted) }} .swatch dd {{ margin: 0 }}
.swatch p {{ padding: 6px 16px 16px; font-size: 14px; color: var(--muted) }}
.copy {{ font: inherit; color: var(--fg); background: none; border: 0; padding: 0; cursor: pointer; border-bottom: 1px dashed var(--muted) }}
.copy:focus-visible, button:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 3px }}
.gradient-row {{ display: flex; align-items: center; gap: 16px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 16px }}
.gradient-row .bar {{ height: 44px; flex: 1 1 200px; border-radius: 10px; background: linear-gradient(90deg, #6A4BFF, #B9A8FF) }}
.gradient-row code {{ font: 400 14px var(--mono) }}
.note {{ font-size: 15px; color: var(--muted); border-left: 2px solid var(--line); padding-left: 14px }}
/* zone de protection */
.clear-wrap {{ background: var(--b-white); border-radius: 22px; padding: clamp(16px, 4vw, 40px); box-shadow: inset 0 0 0 1px var(--line); overflow-x: auto }}
.clear {{ width: 100%; min-width: 300px; height: auto; display: block }}
.cs-zone {{ fill: none; stroke: #5B3BFF; stroke-width: 2; stroke-dasharray: 10 8 }}
.cs-box {{ fill: none; stroke: #A28FFF; stroke-width: 1.5 }}
.cs-x {{ fill: rgba(91,59,255,.12) }}
.cs-label {{ font: 600 40px var(--display); fill: #5B3BFF; text-anchor: middle; dominant-baseline: central }}
/* tableaux */
.table-wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 18px; background: var(--surface) }}
table {{ border-collapse: collapse; width: 100%; min-width: 520px; font-size: 16px }}
th, td {{ text-align: left; padding: 14px 18px; border-bottom: 1px solid var(--line) }}
tr:last-child td {{ border-bottom: 0 }}
th {{ font: 500 12px var(--mono); letter-spacing: .06em; text-transform: uppercase; color: var(--muted) }}
td.num {{ font-family: var(--mono); font-variant-numeric: tabular-nums }}
/* typo */
.type-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px }}
.type-card {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 24px; display: grid; gap: 12px; min-width: 0 }}
.type-card .spec {{ font-size: 44px; line-height: 1.05; font-family: var(--display); font-weight: 600 }}
/* à ne pas faire */
.donts {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px }}
.dont {{ margin: 0; display: grid; gap: 10px; min-width: 0 }}
.dont-tile {{ position: relative; background: var(--b-lavande); border-radius: 18px; aspect-ratio: 1; display: grid; place-items: center; overflow: hidden; max-width: 100% }}
.dont-tile::after {{ content: ""; position: absolute; inset: 0; background: linear-gradient(to top right, transparent calc(50% - 1.5px), var(--no) calc(50% - 1.5px), var(--no) calc(50% + 1.5px), transparent calc(50% + 1.5px)) }}
.dont-svg {{ width: 70%; height: auto }}
.dont figcaption {{ font-size: 15px; display: flex; gap: 8px; align-items: baseline }}
.dont figcaption::before {{ content: "✕"; color: var(--no); font-weight: 700 }}
/* fichiers */
.files {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px }}
.file {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 20px; display: grid; gap: 8px; align-content: start; min-width: 0 }}
.file code {{ font: 500 14px var(--mono); color: var(--accent); overflow-wrap: anywhere }}
.file p {{ font-size: 15px; color: var(--muted) }}
footer {{ border-top: 1px solid var(--line); padding-top: 24px; color: var(--muted); font-size: 15px }}
.toast {{ position: fixed; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); background: var(--fg); color: var(--bg); padding: 10px 16px; border-radius: 10px; font: 500 14px var(--mono) }}
@media (max-width: 760px) {{ .plate, .plate.third {{ grid-column: span 6 }} .lead {{ font-size: 18px }} }}
@media (prefers-reduced-motion: no-preference) {{ .copy {{ transition: color .15s }} }}
</style>

<div class="wrap">
<header class="hero">
  <span class="eyebrow">Guide d'usage · logo</span>
  {svg("vpnfree-horizontal.svg", "hero-logo show-light")}{svg("vpnfree-horizontal-dark.svg", "hero-logo show-dark")}
  <h1>Un diamant fendu par une étoile qui file vers l'avant.</h1>
  <p class="lead">Le losange est dense et incassable : c'est la sécurité. L'étoile décentrée marque un départ et une direction : c'est la vitesse. Ses quatre branches forment une rose des vents, pour accéder à n'importe quel pays. Les deux tons des facettes donnent le relief d'une pierre taillée.</p>
  <div class="pillars">
    <div class="pillar"><h3>Sécurité</h3><p>Une forme pleine et compacte, sans maillon faible.</p></div>
    <div class="pillar"><h3>Vitesse</h3><p>L'étoile glisse vers le haut à droite, comme un départ.</p></div>
    <div class="pillar"><h3>Monde entier</h3><p>Quatre branches, quatre directions : partout à la fois.</p></div>
  </div>
</header>

<section id="versions">
  <header><span class="eyebrow">Versions</span><h2>Une version pour chaque surface</h2>
  <p class="muted">La version horizontale est la version principale. Chaque version existe en clair et en sombre.</p></header>
  <div class="plates">
    <div class="plate wide on-white">{svg("vpnfree-horizontal.svg", "lock-h")}<span class="tag">Horizontale · version principale</span></div>
    <div class="plate on-lav">{svg("vpnfree-stacked.svg", "lock-s")}<span class="tag">Empilée</span></div>
    <div class="plate on-nuit">{svg("vpnfree-stacked-dark.svg", "lock-s")}<span class="tag">Empilée · sombre</span></div>
    <div class="plate third on-white">{svg("vpnfree-symbol.svg", "sym")}<span class="tag">Symbole seul</span></div>
    <div class="plate third on-nuit">{svg("vpnfree-symbol-dark.svg", "sym")}<span class="tag">Symbole · sombre</span></div>
    <div class="plate third on-lav">{svg("vpnfree-wordmark.svg", "wm")}<span class="tag">Lettrage seul</span></div>
    <div class="plate on-white">
      <div class="sizes">
        <figure>{svg("vpnfree-symbol.svg").replace('width="256" height="256"', 'width="64" height="64"')}<figcaption>64 px</figcaption></figure>
        <figure>{svg("vpnfree-symbol.svg").replace('width="256" height="256"', 'width="32" height="32"')}<figcaption>32 px</figcaption></figure>
        <figure>{svg("vpnfree-symbol-small.svg").replace('width="256" height="256"', 'width="24" height="24"')}<figcaption>24 px · petite</figcaption></figure>
        <figure>{svg("vpnfree-symbol-small.svg").replace('width="256" height="256"', 'width="16" height="16"')}<figcaption>16 px · petite</figcaption></figure>
      </div>
      <span class="tag">Sous 24 px, utiliser la version petite taille, aux jours élargis</span>
    </div>
    <div class="plate on-lav">
      <div class="icons">{svg("vpnfree-app-icon.svg")}{svg("vpnfree-app-icon-light.svg")}{svg("vpnfree-app-icon-night.svg")}</div>
      <span class="tag">Icônes d'app : dégradé · lavande · violet nuit</span>
    </div>
  </div>
</section>

<section id="couleurs">
  <header><span class="eyebrow">Couleurs</span><h2>Quatre couleurs et un dégradé</h2>
  <p class="muted">Cliquez sur un code HEX pour le copier.</p></header>
  <div class="swatches">{color_html}</div>
  <div class="gradient-row"><div class="bar" aria-hidden="true"></div><code>#6A4BFF → #B9A8FF</code><span class="muted">Dégradé réservé à l'icône d'app et aux avatars</span></div>
  <p class="note">Contraste : le violet sur blanc atteint 6:1 et le blanc sur violet nuit 17:1, ce qui convient pour du texte. Le lilas sur blanc reste à 2,6:1 : il est réservé au décor. Les valeurs CMJN sont indicatives et doivent être validées sur épreuve : pour une impression soignée, faites choisir une teinte Pantone sur nuancier.</p>
</section>

<section id="fonds">
  <header><span class="eyebrow">Associations</span><h2>Quel logo sur quel fond</h2></header>
  <div class="plates">
    <div class="plate third on-white">{svg("vpnfree-symbol.svg", "sym")}<span class="tag">Violet + lilas sur blanc</span></div>
    <div class="plate third on-lav">{svg("vpnfree-symbol.svg", "sym")}<span class="tag">Violet + lilas sur lavande</span></div>
    <div class="plate third on-nuit">{svg("vpnfree-symbol-dark.svg", "sym")}<span class="tag">Blanc + blanc transparent sur violet nuit</span></div>
  </div>
  <p class="muted">Pour une impression à une seule encre (gravure, tampon, broderie), utilisez les versions une couleur : noir, blanc, violet ou violet nuit.</p>
</section>

<section id="protection">
  <header><span class="eyebrow">Zone de protection</span><h2>Laissez respirer le logo</h2>
  <p class="muted">L'unité <strong>X</strong> est la hauteur d'x du lettrage, c'est-à-dire la hauteur du « v ». Laissez au moins 1 X de vide tout autour du logo. La zone grandit avec le logo : ne fixez jamais une distance en pixels.</p></header>
  <div class="clear-wrap">{clear}</div>
</section>

<section id="tailles">
  <header><span class="eyebrow">Tailles minimales</span><h2>En dessous, il ne se lit plus</h2></header>
  <div class="table-wrap"><table>
    <thead><tr><th>Version</th><th>Écran</th><th>Impression</th></tr></thead>
    <tbody>
      <tr><td>Horizontale</td><td class="num">96 px de large</td><td class="num">25 mm de large</td></tr>
      <tr><td>Empilée</td><td class="num">64 px de large</td><td class="num">18 mm de large</td></tr>
      <tr><td>Symbole</td><td class="num">24 px</td><td class="num">6 mm</td></tr>
      <tr><td>Symbole petite taille</td><td class="num">16 à 32 px</td><td class="num">—</td></tr>
    </tbody></table></div>
</section>

<section id="typo">
  <header><span class="eyebrow">Typographie</span><h2>Un lettrage dessiné, une police pour le reste</h2></header>
  <div class="type-grid">
    <div class="type-card"><span class="eyebrow">Lettrage du logo</span>{svg("vpnfree-wordmark.svg", "show-light").replace("<svg ", '<svg style="width:240px;max-width:100%;height:auto" ', 1)}{svg("vpnfree-wordmark-dark.svg", "show-dark").replace("<svg ", '<svg style="width:240px;max-width:100%;height:auto" ', 1)}<p class="muted">Dessiné sur mesure et livré en contours vectoriels. Ne le retapez jamais avec une police.</p></div>
    <div class="type-card"><span class="eyebrow">Site et documents</span><span class="spec">Outfit</span><p class="muted">Géométrique, de l'esprit du lettrage, sous licence libre (OFL). Pour plus de lisibilité dans les petits textes, utilisez Plus Jakarta Sans. Police de secours sur le web : <code>system-ui, sans-serif</code>.</p></div>
  </div>
</section>

<section id="interdits">
  <header><span class="eyebrow">À ne pas faire</span><h2>Ce qui abîme le logo</h2></header>
  <div class="donts">{dont_html}</div>
  <p class="muted">Évitez aussi de modifier l'espacement entre le symbole et le lettrage, de poser le logo sur une photo chargée sans aplat, et d'utiliser la version petite taille au-delà de 32 px.</p>
</section>

<section id="fichiers">
  <header><span class="eyebrow">Fichiers</span><h2>Où trouver quoi</h2>
  <p class="muted">Tous les fichiers sont dans le dossier <code>logo/kit/</code> du projet.</p></header>
  <div class="files">
    <div class="file"><code>masters/</code><p>SVG de référence en couleur et en version sombre, en contours vectoriels, sans texte ni traits.</p></div>
    <div class="file"><code>export/symbol/ · export/lockups/</code><p>Versions une couleur (noir, blanc, violet, violet nuit) et PNG de 64 à 1200 px.</p></div>
    <div class="file"><code>export/app-icons/</code><p>Icônes d'app en 1024 px : dégradé, lavande, violet nuit, et un avatar carré.</p></div>
    <div class="file"><code>export/web/</code><p>Favicon, icônes iPhone et PWA, manifest. Collez <code>head-snippet.html</code> dans le <code>&lt;head&gt;</code> du site.</p></div>
  </div>
</section>

<footer>vpn.free · guide d'usage du logo. Avant tout dépôt ou impression en volume, faites une recherche d'antériorité de marque (INPI, EUIPO).</footer>
</div>
<div class="toast" id="toast" hidden></div>
<script>
document.querySelectorAll(".copy").forEach(function (b) {{
  b.addEventListener("click", function () {{
    var v = b.getAttribute("data-copy"), t = document.getElementById("toast");
    function show(msg) {{ t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(function () {{ t.hidden = true; }}, 1600); }}
    function fallback() {{ var r = document.createRange(); r.selectNodeContents(b); var s = getSelection(); s.removeAllRanges(); s.addRange(r); show("Sélectionné : " + v); }}
    try {{ navigator.clipboard.writeText(v).then(function () {{ show("Copié : " + v); }}, fallback); }} catch (e) {{ fallback(); }}
  }});
}});
</script>
'''
open(os.path.join(HERE, "guide-web.html"), "w", encoding="utf-8").write(html)
print("guide-web.html", len(html) // 1024, "Ko")
