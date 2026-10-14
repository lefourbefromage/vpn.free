"""Construit apercu-kit.html (vue d'ensemble du kit) à partir des SVG maîtres."""
import os
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), "masters")
r = lambda n: open(os.path.join(M, n), encoding="utf-8").read()
sz = lambda n, s: r(n).replace("<svg ", f'<svg style="width:{s}px;height:{s}px" ')
w = lambda n, s: r(n).replace("<svg ", f'<svg style="width:{s}px" ')
html = f'''<!doctype html><meta charset="utf-8"><title>vpn.free — aperçu du kit</title><style>
body{{margin:0;padding:40px;background:#f6f5f2;font:16px system-ui;width:1520px;color:#1C1240}}
h1{{margin:0 0 20px}} .row{{display:flex;gap:20px;margin-bottom:20px}}
.b{{border-radius:20px;padding:40px;display:flex;align-items:center;justify-content:center}}
.b svg{{max-width:100%;height:auto}} .lav{{background:#ECE8FF}} .nuit{{background:#1C1240}} .w{{background:#fff}}
.sz{{display:flex;gap:18px;align-items:end}} .sz svg{{display:block}}</style>
<h1>vpn.free — aperçu du kit</h1>
<div class="row"><div class="b w" style="flex:1">{w("vpnfree-horizontal.svg", 640)}</div>
<div class="b nuit" style="flex:1">{w("vpnfree-horizontal-dark.svg", 640)}</div></div>
<div class="row"><div class="b lav" style="flex:1">{w("vpnfree-stacked.svg", 300)}</div>
<div class="b nuit" style="flex:1">{w("vpnfree-stacked-dark.svg", 300)}</div>
<div class="b w" style="flex:1.3;flex-direction:column;gap:24px">
<div class="sz">{sz("vpnfree-app-icon.svg", 128)}{sz("vpnfree-app-icon-light.svg", 128)}{sz("vpnfree-app-icon-night.svg", 128)}</div>
<div class="sz">{sz("vpnfree-symbol.svg", 64)}{sz("vpnfree-symbol.svg", 32)}{sz("vpnfree-symbol-small.svg", 24)}{sz("vpnfree-symbol-small.svg", 16)}{sz("vpnfree-app-icon-small.svg", 48)}</div></div></div>'''
open(os.path.join(os.path.dirname(M), "apercu-kit.html"), "w", encoding="utf-8").write(html)
