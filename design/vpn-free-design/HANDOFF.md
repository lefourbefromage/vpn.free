# vpn.free — Design handoff

Refonte UI de vpn.free : proxy web gratuit dans le navigateur, avec un Premium optionnel (« Support »).
Ce dossier contient la référence visuelle. Il ne s'agit pas de code à copier tel quel.

## Contenu du dossier

| Dossier | Contenu |
|---|---|
| `index.html` | Sommaire cliquable de tous les écrans, groupés par flow. |
| `screens/*.html` | 36 écrans en HTML autonome. Ils s'ouvrent dans un navigateur et sont reliés par des liens : c'est le prototype. |
| `assets/` | Logo, symbole et cartes en points (SVG pré-rendus). |
| `source-dc/` | Les fichiers source de l'outil de design (`.dc.html`), pour référence uniquement. |
| `tools/map-generator/` | Scripts Python qui ont généré les cartes : projection, inclinaison et fondu des points. |

Les écrans sont maquettés en largeur fixe : desktop en 1440 px, mobile en 390 px.
**En code, chaque page doit être un seul composant responsive, pas deux pages.**
Les écrans `*-Mobile` montrent comment la mise en page doit se réorganiser sous les breakpoints.

---

## 1. Règles produit (à ne pas trahir)

- C'est un **proxy dans le navigateur**, pas un VPN système. On n'installe rien.
- **Rapide** : serveurs en Europe et dans les Amériques.
- **Sûr** : les liens partagés sont vérifiés contre des listes de malware.
- **Privé** : les sites voient l'IP du serveur, pas celle de l'utilisateur.
- **Le gratuit est illimité.** Sa seule limite : le serveur est choisi automatiquement (le plus proche).
- **Premium = soutenir le projet.** Le choix du serveur est un remerciement. Même proxy, même vitesse.
  Ne jamais suggérer que le gratuit est bridé, plus lent ou moins sûr.
- Prix :
  - Monthly : $10 pour 30 jours.
  - Yearly : $99 pour 365 jours (« 2 months off »).
  - **Pas de renouvellement automatique.**
- Paiement **uniquement en crypto**, via le prestataire **Sheepy** (page externe).
- **Aucun compte requis.** L'accès Premium est un certificat stocké dans le navigateur, et le code de reçu est la seule preuve d'achat.
  Le compte forum est **optionnel**. Il sert uniquement à ne pas perdre l'accès si on perd un appareil.
- **Interdit** : « no logs », « military-grade encryption » et toute autre promesse de ce type.
- Toutes les données affichées dans les maquettes sont fictives : codes, order IDs, villes détectées, etc.

## 2. Design tokens

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#110A28` | Fond de page (mode sombre uniquement) |
| `--surface` | `#1C1240` | Cartes, barre de navigation (preview), panneaux |
| `--surface-sheet` | `#221650` | Bottom sheets mobiles |
| `--surface-pop` | `rgba(30,20,70,0.98)` | Popovers et dropdowns, avec un `backdrop-filter: blur(20px)` |
| `--surface-tooltip` | `#261A57` | Tooltips de la carte |
| `--field` | `rgba(17,10,40,0.7)` | Champs de saisie sur fond sombre |
| `--primary` | `#5B3BFF` | Boutons primaires, texte blanc et léger glow |
| `--primary-border` | `#7C62FF` | Bordure de sélection, anneau actif |
| `--lilac` | `#A28FFF` | Accents, mots mis en couleur dans les titres, icônes |
| `--lavender` | `#ECE8FF` | Petits détails uniquement : badges (« Supporter », « Latest », « 2 months off ») avec texte `#1C1240` |
| `--success` | `#7EEBC0` | Coches, « Protected », lien vérifié |
| `--warning` | `#FFB84D` / `#F5B946`, texte `#FFD9A0` | Avertissements (code à sauvegarder, site lent, message public) |
| `--error` | `#FF8A8A`, texte `#FFB3B3` | Erreurs de champ |
| `--discord` | `#5865F2` | Bouton et bloc Discord uniquement |
| `--hero-field` | `#FFFFFF`, texte `#1C1240`, placeholder `#6B6390` | Champ URL du hero : c'est l'élément le plus visible de la page |

- **Texte** : blanc à 100 %. Le corps de texte est à `rgba(255,255,255,0.74)`, les infos secondaires à `0.66`, les placeholders à `0.56`.
- **Bordures** : `rgba(255,255,255, 0.08 | 0.12 | 0.14)`.
- Le dégradé `#6A4BFF → #B9A8FF` est réservé à l'icône d'app et aux avatars. Les barres de progression utilisent `#5B3BFF → #A28FFF`.

### Typographie

- **Outfit**, graisses 400 à 700. Tout le texte de l'interface, les titres en 600-700.
- **JetBrains Mono**, graisses 400 et 500. Données techniques : URLs, villes, codes, timers, IDs.

| Rôle | Desktop | Mobile |
|---|---|---|
| H1 du hero | 68 / 1.04, 700, -0.025em | 38 / 1.08 |
| H1 de page (Premium, Restore, What's new) | 40–60 | 28–42 |
| H2 de section | 48 / 1.08, 700 | 30 / 1.12 |
| Lead (sous-titre) | 18–20 / 1.5 | 15–17 |
| Body | 15–16 / 1.5 | 15 |
| Meta | 13–14 | 13 |
| Label en capitales | 12–13, 600, letter-spacing 0.08em | même chose |

Le titre met en lilas sa seconde partie, par exemple « Open any website **without installing anything.** ».

### Rayons, espacements, ombres

- **Rayons** :
  - contrôles : 10, 12 ou 14 ;
  - cartes : 18 ou 20 ;
  - panneaux : 24 ;
  - grand conteneur (bloc support) : 28 ;
  - pills : 999.
- **Hauteurs de boutons** :
  - CTA du hero : 56 ;
  - CTA de page : 52–58 ;
  - secondaires : 48 ;
  - header et compacts : 40 ;
  - zone tactile mobile : 44 minimum.
- **Glow des boutons primaires** : `box-shadow: 0 10px 30px rgba(91,59,255,0.45)`.
- **Panneaux flottants** : `0 32px 80px rgba(4,1,16,0.6)`.
- **Largeur de contenu** : 1360 max. Gouttière de 40 en desktop, 16 en mobile.

### Breakpoints

| Breakpoint | Effet |
|---|---|
| ≤ 960 px | Le bloc Community passe sur une colonne. |
| ≤ 760 px | La timeline What's new passe sur une colonne. |
| ≤ 720 px | Les « Three promises » passent sur une colonne. Elles restent sur 3 colonnes au-dessus. |
| < 768 px | Mise en page mobile générale : header compact, sheets à la place des popovers, barre de preview en haut. |

## 3. Logo et motifs

- `assets/logo.svg` est le logo officiel, à utiliser **tel quel** : pas de glow, d'ombre, de rotation ni de recoloration.
- `assets/logo-symbol.svg` est le symbole seul : badge « Protected », barre de preview, chargement.
- **Étoile à 4 branches** : marqueurs, badges, puces. SVG `viewBox 0 0 24 24` :
  `M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z`
- Les icônes réseaux (Facebook, Instagram, Telegram, WhatsApp, X, Reddit) et Discord sont des SVG inline dans `screens/Main.html`. Elles viennent du site actuel.

## 4. Composants récurrents

| Composant | Où le voir | Notes |
|---|---|---|
| Header | toutes les pages | Logo, espace, « Sign in » (lien discret) et bouton « Support vpn.free » (primaire avec étoile). **Pas de nav**, pour éviter les points de fuite. Sur mobile : bouton Support en icône (le menu ☰ reste à définir). |
| Champ URL du hero | Main | Fond blanc, icône globe, bouton Go violet. Le champ chevauche le tiers haut de la carte (`margin-top: -240px` sur la section carte). |
| Sélecteur de serveur | Main, ServerMenu | Pill « Automatic — fastest ». Il ouvre un dropdown sur desktop, une bottom sheet sur mobile. La liste des villes défile (max-height 280), le choix Automatic et la note restent fixes. Les villes portent un badge « Supporter ». |
| Carte | Main, Supporter | SVG de points pré-rendu, puis par-dessus : points scintillants, pins de villes (affichées au survol), pin actif avec halo et pulsation, tooltip « Sites see ». Avec un autre serveur : arc parabolique animé de « Your location » vers la ville choisie, plus son ombre au sol. Carte « Protected — Your traffic leaves from … ». |
| Cartes « promises » | Main | 3 cartes avec une mini-UI illustrée sur fond pointillé. Pas de fond de section : pas de cadre dans un cadre. |
| Bloc support | Main | 2 colonnes : bénéfices et CTA d'un côté, plans et cryptos de l'autre. « Renews only when you renew it. » |
| Bloc community | Main | Chip « Now on Discord », bouton `#5865F2`, cartes de canaux et de thread, logo Discord en filigrane pivoté. |
| Footer | Main, Changelog | Logo, accroche, liens (Help, What's new, Privacy, Terms, Contact, Community), bouton de langue, icônes de partage rondes de 40 px. |
| Modal / sheet de chargement | Loading-* | Bandeau avec arc animé, titre, timer en mono, barre de progression et 4 étapes. Variante lente en ambre. Boutons Cancel et Try another server. |
| Barre de preview | Preview-* | Desktop : barre de 60 px en haut. Mobile : en haut aussi, sur 2 rangées (adresse, puis actions de 44 px). Badge « Protected », « Sites see Paris, FR », Share, Bug (report), Support, Close. |
| Popover / sheet | Preview Share et Report | Popover de 380–440 px sur desktop, bottom sheet avec poignée sur mobile. |
| Stepper | Premium | 3 étapes : Choose a plan, Save your code, Pay. Étape faite = coche menthe, étape active = pastille violette avec anneau. |
| Carte de plan (radio) | Premium-1 | Sélectionnée : fond violet à 18 % et anneau `#7C62FF`. |
| Boîte de code | Premium-2, Restore | Mono, bordure pointillée lilas. « Save the file » (bouton blanc, action principale) et « Copy » (secondaire). |
| Encadrés (notes) | partout | Neutre : `rgba(255,255,255,0.03)` avec une étoile lilas. Info : violet à 12 %. Avertissement : ambre à 8 %. |
| Champ avec erreur | Restore-*-Error | Bordure `#FF8A8A`, halo de 4 px, message `role="alert"` avec `aria-invalid` et `aria-describedby`. |

## 5. Écrans et flows

Le libellé d'un bouton est indiqué entre guillemets. L'écran visé suit la flèche.

### Homepage

- **`Main`** (desktop) et **`Mobile`**
  - Go → `Loading`
  - Sélecteur de serveur → `ServerMenu`
  - « Sign in » → `Restore`
  - « Support » → `Premium-1`
  - « What's new » → `Changelog`
- **`Desktop-ServerMenu` / `Mobile-ServerMenu`**
  - New York → `*-Supporter`
  - Automatic ou fermeture → retour à la homepage
- **`*-Supporter`** : état « ville réservée aux supporters », avec arc animé et lien Support.

### Chargement (écran 2)

- **`Loading-*`** et **`Loading-*-Slow`**
  - Cancel → homepage
  - « Try another server » → `Preview`
- En production, la preview s'ouvre automatiquement à la fin du chargement.

### Preview (écran 3)

- **`Preview-*`** : la barre vpn.free au-dessus d'un faux site tiers, *The Daily Lens*.
  - Share → `*-Share`
  - Bug → `*-Report`
  - Support → `Premium-1`
  - Badge serveur → `ServerMenu`
  - Croix → homepage
- **`*-Share`** : lien `vpn.free/s/…` avec « Copy link », icônes réseaux et « Link checked · clean ».
- **`*-Report`** : textarea « What went wrong? ».
  - Avertissement : le message est publié sur le forum public.
  - Boutons Cancel et Send report.

### Premium (écran 4)

1. **`Premium-1`** : choix du plan.
   - « Continue · $99 » → `Premium-2`
2. **`Premium-2`** : sauvegarde du code de reçu (avant de payer).
   - L'écran montre le code, l'order ID et le timer « pay within ».
   - Deux cases à cocher : « Saved… » et les conditions d'utilisation avec renonciation au droit de rétractation de 14 jours.
   - Le bouton Pay doit être **désactivé tant que les deux cases ne sont pas cochées**.
   - « Pay $99 with crypto » ouvre Sheepy et mène à `Premium-3a`.
3. **`Premium-3a`** : en attente de confirmation.
   - Affiché aussi quand on revient du site Sheepy, tant que la commande est active.
   - Étapes : Order created → Payment confirming → Access ready.
   - « Open the payment page » (retour vers Sheepy), « Check now » et « Cancel this order ».
4. **`Premium-3`** : paiement confirmé.
   - « Thank you. You're a supporter. », avec la date de fin de l'accès.
   - Suggestion optionnelle « Link a forum account ».
   - « Pick a server and browse ».

### Restore / Sign in (écran 5)

1. **`Restore-*`** : « Your account ».
   - « Sign in through the forum » → `*-Forum`
   - « I already have a code » → `*-Code`
   - Encadré « Prefer to stay anonymous? ».
2. **`*-Code`** : champs code (43 caractères) et Order ID, bouton « Find my access ». **`*-Error`** est l'état « aucune correspondance ».
3. **`*-Forum`** : page de connexion du forum aux couleurs de la marque (email ou nom d'utilisateur, mot de passe, passkey, inscription).
   - La passkey existe **uniquement sur le forum**, pas sur vpn.free.
4. **`*-Done`** : « Access restored », avec un récapitulatif et la suggestion « Link a forum account ».

### What's new

- **`Changelog` / `Changelog-Mobile`** : timeline chronologique, du plus récent au plus ancien.
  - Contenu : les entrées de `vpn.free/changelog`.
  - Badge « Latest » sur la plus récente, annonces regroupées par date.

## 6. Animations

| Élément | Comportement |
|---|---|
| Hero | Au chargement, le titre, le sous-titre, le champ puis le sélecteur montent en fondu (`vfUp`, 0.9 s, décalages 0 / 0.12 / 0.24 / 0.34 s). La carte apparaît en fondu (1.4 s). |
| Scroll reveal | Les titres de section, les cartes, le bloc support, le bloc community et le footer se révèlent en montant de 36 px avec une légère mise à l'échelle. Le prototype utilise des animations liées au scroll (`animation-timeline: view()`) avec un décalage par position d'enfant. En production, on peut utiliser IntersectionObserver ou la lib d'animation du projet. |
| Carte | Points qui scintillent lentement (`vfTwinkle`, 4,5–7,5 s, délais aléatoires), pulsation du pin actif, arc en pointillés animé et point qui suit le trajet de l'arc. |
| Chargement | Anneau en pointillés qui tourne, halo qui respire et reflet qui balaie la barre. La variante lente est plus calme et en ambre. |
| Micro-interactions | Survol des pins de villes (tooltip), boutons de partage, bordures des cartes au survol. |
| Accessibilité | Tout est coupé avec `prefers-reduced-motion: reduce`. |

## 7. Accessibilité et internationalisation

- Contraste AA visé sur tout le texte. Sur fond blanc, le placeholder du hero `#6B6390` passe l'AA.
- Focus visible : `outline: 2px solid #ECE8FF; outline-offset: 3px`.
- Les mises en page doivent fonctionner en **RTL** (13 langues sur le site). Utiliser des propriétés logiques (`margin-inline`, `inset-inline`) et ne rien coder en dur à gauche ou à droite.
- Rôles ARIA à garder : `role="search"`, `listbox`/`option`, `dialog`/`aria-modal`, `progressbar`, `status`, `alert`, `aria-current="step"`.

## 8. Prompt suggéré pour Claude Code

> Implémente la refonte décrite dans `design/vpn-free-design/HANDOFF.md`. Les fichiers `screens/*.html` sont la référence visuelle : ouvre-les pour comparer, ne copie pas leur HTML inline.
> 1. Crée les design tokens (couleurs, typo, rayons, ombres) et les composants partagés de la section 4.
> 2. Implémente la homepage comme un seul composant responsive (desktop et mobile), avec les animations de la section 6.
> 3. Enchaîne avec les écrans dans l'ordre : chargement, preview, Premium, Restore, What's new.
> Respecte strictement les règles produit de la section 1 et la carte des liens de la section 5. Compare ton rendu aux écrans de référence (capture d'écran) avant de passer à l'écran suivant.
