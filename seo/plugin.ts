import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { OG_IMAGE, OG_LOCALES, PAGES, SITE_NAME, SITE_URL, ogImageUrl, type SeoPage } from './pages.mjs';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = (attr: 'name' | 'property', key: string, value: string | number) =>
  `<meta ${attr}="${key}" content="${esc(String(value))}" />`;

const START = '<!-- seo -->';
const END = '<!-- /seo -->';

function headTags(page: SeoPage): string {
  const url = SITE_URL + page.path;
  const image = ogImageUrl(page);
  const alt = page.og.title.join(' ');
  const [locale, ...alternates] = OG_LOCALES;
  const tags = [
    `<title>${esc(page.title)}</title>`,
    meta('name', 'description', page.description),
    `<link rel="canonical" href="${url}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:url', url),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:image', image),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:width', OG_IMAGE.width),
    meta('property', 'og:image:height', OG_IMAGE.height),
    meta('property', 'og:image:alt', alt),
    meta('property', 'og:locale', locale),
    ...alternates.map((l) => meta('property', 'og:locale:alternate', l)),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', page.title),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', alt),
  ];
  if (page.id === 'home') {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE_URL + '/',
      description: page.description,
      image,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
  }
  return `${START}\n    ${tags.join('\n    ')}\n    ${END}`;
}

const withTags = (html: string, page: SeoPage) => {
  const from = html.indexOf(START);
  const to = html.indexOf(END);
  if (from < 0 || to < 0) throw new Error(`seo: index.html needs the ${START} … ${END} markers`);
  return html.slice(0, from) + headTags(page) + html.slice(to + END.length);
};

/**
 * Writes each page's title, description, Open Graph and Twitter tags into the HTML.
 * index.html gets the homepage's; the other shareable pages get their own copy of it
 * (dist/support.html…), which vercel.json serves for that page and every route under it.
 * Also writes sitemap.xml and robots.txt.
 */
export function seo(): Plugin {
  let config: ResolvedConfig;
  const home = PAGES.find((p) => p.id === 'home')!;
  return {
    name: 'vpn-free-seo',
    configResolved(c) {
      config = c;
    },
    transformIndexHtml: (html) => withTags(html, home),
    async closeBundle() {
      if (config.command !== 'build') return;
      const outDir = join(config.root, config.build.outDir);
      const index = await readFile(join(outDir, 'index.html'), 'utf8');
      for (const page of PAGES) {
        if (page.file) await writeFile(join(outDir, page.file), withTags(index, page));
      }
      const urls = PAGES.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc></url>`).join('\n');
      await writeFile(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      await writeFile(
        join(outDir, 'robots.txt'),
        `User-agent: *\nDisallow: /screens\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      );
    },
  };
}
