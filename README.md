# vpn.free — prototype

Implémentation de la refonte décrite dans [`design/vpn-free-design/HANDOFF.md`](design/vpn-free-design/HANDOFF.md).
Vite + React + TypeScript, CSS Modules. Toutes les données sont fictives.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de production
```

## Écrans

Chaque écran de la maquette a sa propre URL (liste complète sur `/screens`).
Une page = un seul composant responsive ; la mise en page mobile s'applique sous 768 px.

| Route | Maquettes |
|---|---|
| `/` · `/?servers=open` · `/?server=new-york` | Main, Mobile, *-ServerMenu, *-Supporter |
| `/connecting?url=…` (`&mode=slow` / `&mode=paused`) | Loading-* |
| `/browse` · `/browse/share` · `/browse/report` | Preview-* |
| `/support` · `/support/code` · `/support/waiting` · `/support/done` | Premium-1, 2, 3a, 3 |
| `/account` · `/account/code` (`?error=1`) · `/account/forum` · `/account/done` | Restore-* |
| `/changelog` | Changelog* |

## Overlay de prototype

Onglet sur le bord droit de l'écran, ou touche <kbd>`</kbd>. Il ne fait pas partie du produit.

- **Form submissions** : *Real rules* (validation normale), *Always valid* (tout passe), *Always error* (chaque envoi renvoie son erreur serveur).
- **On this page** : raccourcis propres à l'écran (remplir un code valide / tronqué / inconnu, cocher les cases, confirmer le paiement, simuler un site lent…).
- **State** : accès supporter on/off, mise en page RTL, position du visiteur (IP fictive : Marseille, Tokyo, Sydney…), vitesse du chargement, remise à zéro.
- **Screens** : accès direct à chaque écran.

L'état du prototype (plan, commande, accès supporter…) est gardé dans le `localStorage` du navigateur.

## Structure

- `src/styles/tokens.css` — design tokens (HANDOFF §2) ; `base.css` — reset, focus, keyframes, reduced motion.
- `src/components/` — composants partagés (HANDOFF §4) : Header, Footer, ServerPicker, DotMap, Sheet/Popover, Stepper, champs, encadrés…
- `src/pages/` — un dossier ou fichier par écran.
- `src/state/proto.tsx` — état fictif et règles de l'overlay.
- `src/components/worldmap/` — carte du monde en points : même recette que `tools/map-generator/mk2.py` (Mercator incliné, bords arrondis, vignettage), rendue en canvas avec une caméra qui cadre le visiteur et la destination par le chemin le plus court.
- `src/data/` — serveurs et positions de visiteur (lat/lon), contours des terres (`land.py` + Océanie, Japon, Asie du Sud-Est), changelog.

## Carte

- L'arc part de la position approximative du visiteur (IP). Destination dans le même pays : pas d'arc. Autre pays : un arc.
- Paris est le serveur gratuit (Automatic). Une ville choisie sans accès supporter reste « Available for supporters ».

## Partage (Open Graph)

- `seo/pages.mjs` — titre, description et texte de l'image de partage de chaque page partageable (`/`, `/support`, `/changelog`).
- `npm run og` — régénère les images 1200×630 dans `public/og/` (Satori + resvg, polices Outfit / JetBrains Mono, carte en points). À relancer après avoir changé ce texte.
- Au build, le plugin `seo/plugin.ts` écrit les balises `<title>`, description, canonical, Open Graph, Twitter et JSON-LD dans `index.html`, en crée une copie par page (`support.html`, `changelog.html`, servies par `vercel.json` pour la page et ses sous-routes) et génère `sitemap.xml` et `robots.txt`. Les URL absolues (canonical, `og:url`, `og:image`) viennent du domaine du déploiement Vercel (`VERCEL_PROJECT_PRODUCTION_URL` en production), ou de la variable `SITE_URL` si elle est définie.
