/* Renders the share images (1200×630) listed in seo/pages.mjs into public/og/.
   Run after changing a page's `og` copy or the brand assets:  npm run og  */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { OG_IMAGE, PAGES } from '../seo/pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const font = (pkg, file) => readFile(require.resolve(`${pkg}/files/${file}`));
const svgUri = async (path) =>
  `data:image/svg+xml;base64,${(await readFile(join(root, path))).toString('base64')}`;

// Brand tokens (src/styles/tokens.css).
const C = {
  bg: '#110a28',
  lilac: '#a28fff',
  body: 'rgba(255, 255, 255, 0.74)',
  border: 'rgba(255, 255, 255, 0.14)',
  chip: 'rgba(91, 59, 255, 0.18)',
};

/** Minimal element factory for satori (it takes React-shaped objects). */
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.flat() },
});
const img = (src, style) => ({ type: 'img', props: { src, style } });

function card(page, { logo, map }) {
  const { width, height } = OG_IMAGE;
  const [line1, line2] = page.og.title;
  return h(
    'div',
    { width, height, position: 'relative', background: C.bg, fontFamily: 'Outfit', color: '#fff' },
    // Dot map on the right, faded out toward the text.
    img(map, { position: 'absolute', left: 300, top: -30, width: 1260, height: 667, opacity: 0.9 }),
    h('div', {
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(90deg, ${C.bg} 30%, rgba(17, 10, 40, 0.55) 62%, rgba(17, 10, 40, 0) 100%)`,
    }),
    h('div', {
      position: 'absolute',
      left: -260,
      top: -220,
      width: 900,
      height: 760,
      backgroundImage: 'radial-gradient(closest-side, rgba(91, 59, 255, 0.34), rgba(91, 59, 255, 0))',
    }),
    h(
      'div',
      { position: 'relative', flexDirection: 'column', width: '100%', height: '100%', padding: '64px 72px' },
      img(logo, { height: 48, width: (993.16 / 256) * 48 }),
      h(
        'div',
        { flexDirection: 'column', marginTop: 'auto' },
        h('div', { fontSize: 78, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.025em' }, line1),
        h(
          'div',
          { fontSize: 78, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.025em', color: C.lilac },
          line2,
        ),
        h('div', { fontSize: 28, lineHeight: 1.45, color: C.body, marginTop: 26, maxWidth: 780 }, page.og.lead),
      ),
      h(
        'div',
        { marginTop: 40, alignItems: 'center', gap: 12 },
        ...page.og.chips.map((c) =>
          h(
            'div',
            {
              fontSize: 22,
              fontWeight: 500,
              padding: '9px 20px',
              borderRadius: 999,
              border: `1.5px solid ${C.border}`,
              background: C.chip,
            },
            c,
          ),
        ),
        h(
          'div',
          { marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: 24, color: C.lilac },
          `vpn.free${page.path === '/' ? '' : page.path}`,
        ),
      ),
    ),
  );
}

const fonts = [
  { name: 'Outfit', weight: 400, data: await font('@fontsource/outfit', 'outfit-latin-400-normal.woff') },
  { name: 'Outfit', weight: 500, data: await font('@fontsource/outfit', 'outfit-latin-500-normal.woff') },
  { name: 'Outfit', weight: 700, data: await font('@fontsource/outfit', 'outfit-latin-700-normal.woff') },
  {
    name: 'JetBrains Mono',
    weight: 500,
    data: await font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
  },
];
const assets = {
  logo: await svgUri('public/assets/logo.svg'),
  map: await svgUri('design/vpn-free-design/assets/map-desktop-europe.svg'),
};

await mkdir(join(root, 'public/og'), { recursive: true });
for (const page of PAGES) {
  const svg = await satori(card(page, assets), { ...OG_IMAGE, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_IMAGE.width } }).render().asPng();
  const out = join(root, 'public/og', `${page.id}.png`);
  await writeFile(out, png);
  console.log(`og: ${out} (${Math.round(png.length / 1024)} KB)`);
}
