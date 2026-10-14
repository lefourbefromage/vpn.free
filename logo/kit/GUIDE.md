# vpn.free — Guide d'usage du logo

## 1. Le logo

**Idée :** un diamant fendu par une étoile à quatre branches qui file vers le haut à droite. Le diamant est dense et incassable : c'est la **sécurité**. L'étoile décentrée marque un départ et une direction : c'est la **vitesse**. Ses quatre branches forment une rose des vents : c'est **n'importe quel pays**. Les deux tons des facettes donnent le relief d'une pierre taillée.

**Versions**

| Version | Fichier maître | Usage |
|---|---|---|
| Horizontale (principale) | `masters/vpnfree-horizontal.svg` | en-tête du site, documents, signatures |
| Empilée | `masters/vpnfree-stacked.svg` | formats carrés ou hauts, affiches, goodies |
| Symbole seul | `masters/vpnfree-symbol.svg` | avatar, icône, rappel de marque |
| Lettrage seul | `masters/vpnfree-wordmark.svg` | quand le symbole figure déjà à proximité |
| Petite taille | `masters/vpnfree-symbol-small.svg` | 16 à 32 px uniquement (jours élargis) |

Chaque version existe aussi en `-dark` pour les fonds sombres (blanc et blanc transparent à 55 % sur violet nuit).

## 2. Couleurs

| Nom | HEX | RGB | CMJN (indicatif) | Rôle |
|---|---|---|---|---|
| **Violet** | `#5B3BFF` | 91 59 255 | 64 77 0 0 | couleur principale, grands éclats |
| **Lilas** | `#A28FFF` | 162 143 255 | 36 44 0 0 | petits éclats, accents |
| **Lavande** | `#ECE8FF` | 236 232 255 | 7 9 0 0 | fond clair |
| **Violet nuit** | `#1C1240` | 28 18 64 | 56 72 0 75 | texte, fond sombre |
| Dégradé de l'icône | `#6A4BFF` → `#B9A8FF` | — | — | icône d'app et avatars uniquement |

Les valeurs CMJN sont des conversions à valider sur épreuve avec l'imprimeur. Le violet électrique sort mal en quadrichromie ; pour l'impression soignée, faire choisir une teinte Pantone sur nuancier.

**Accessibilité :** le violet sur blanc atteint un contraste de 6:1 et le blanc sur violet nuit 17:1, ce qui convient pour du texte. Le lilas sur blanc reste à 2,6:1 : il est réservé au décor, jamais au texte.

**Associations logo / fond autorisées**
- Violet et lilas, avec texte violet nuit, sur blanc ou sur lavande : **version principale**.
- Blanc et blanc transparent (55 %), avec texte blanc, sur violet nuit : **version sombre**.
- Blanc à 100 % et 62 % sur le dégradé violet → lilas : **icône d'app** uniquement.
- Une couleur : noir, blanc, violet ou violet nuit (`export/`) pour les usages à une seule encre (gravure, tampon, broderie, fax…).

## 3. Zone de protection

L'unité **X** est la hauteur d'x du lettrage, c'est-à-dire la hauteur du « v ». Laissez au moins **1 X** de vide tout autour du logo. La zone grandit avec le logo : ne fixez jamais une distance en pixels.

## 4. Tailles minimales

| Version | Écran | Impression |
|---|---|---|
| Horizontale | 96 px de large | 25 mm de large |
| Empilée | 64 px de large | 18 mm de large |
| Symbole | 24 px (en dessous, utiliser `vpnfree-symbol-small`) | 6 mm |
| Favicon | 16 px (`export/web/`) | — |

## 5. Typographie

Le lettrage « vpn.free » est **dessiné sur mesure** et livré en contours vectoriels. Ne le retapez jamais avec une police.

Pour le site et les documents, une géométrique à l'esprit proche, sous licence libre (OFL), convient : **Outfit**, ou **Plus Jakarta Sans** pour plus de lisibilité en petit. Repli web : `system-ui, sans-serif`.

## 6. À ne pas faire

- Étirer, écraser, incliner ou faire pivoter le logo.
- Recolorer hors palette, ou intervertir les tons des facettes.
- Ajouter une ombre, un contour, une lueur ou un dégradé en dehors de l'icône d'app.
- Changer la taille relative ou l'espacement entre le symbole et le lettrage.
- Poser le logo sur une photo chargée sans aplat ni cartouche.
- Utiliser la version petite taille au-delà de 32 px.

## 7. Fichiers

```
logo/kit/
├── masters/        SVG maîtres en couleur (contours vectoriels, sans texte ni traits)
├── export/
│   ├── symbol/     symbole : noir, blanc, violet, violet nuit, PNG 64 / 512 / 1024
│   ├── lockups/    horizontal, empilé, lettrage : couleur, sombre, noir, blanc, violet, PNG 1200
│   ├── app-icons/  icônes d'app 1024 px (dégradé, lavande, nuit) + avatar carré
│   └── web/        favicon.ico / .svg, PNG 16–512, apple-touch-icon, manifest, head-snippet.html
├── presentation.html + slides/   présentation et mises en situation
├── apercu-kit.html / .png        aperçu rapide
└── build_kit.py                  régénère les maîtres (géométrie paramétrée)
```

**Intégration web :** copiez le contenu de `export/web/` à la racine du site et collez `head-snippet.html` dans le `<head>`.

## 8. Notes

- **Marque :** faites une recherche d'antériorité (INPI, EUIPO, recherche d'image inversée) avant de déposer ou d'imprimer en volume. L'étoile à quatre branches est une forme répandue ; c'est la combinaison diamant + étoile décentrée + facettes qui fait la singularité du logo.
- **Fichiers d'impression :** les SVG s'ouvrent dans Illustrator, Inkscape ou Affinity pour un export PDF ou EPS en CMJN.
