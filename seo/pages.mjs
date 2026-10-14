/* Share metadata (Open Graph, Twitter, description) for each shareable page.
   Read by `scripts/og-images.mjs` (renders public/og/*.png) and by the `seo` plugin in
   vite.config.ts (writes the <head> tags into the built HTML, since crawlers don't run JS). */

export const SITE_URL = 'https://vpn.free';
export const SITE_NAME = 'vpn.free';

/** Locales of the site (src/i18n), as Open Graph expects them. */
export const OG_LOCALES = [
  'en_US', 'pt_BR', 'es_ES', 'fr_FR', 'de_DE', 'it_IT', 'tr_TR',
  'id_ID', 'zh_CN', 'sv_SE', 'pl_PL', 'ar_AR', 'fa_IR',
];

/**
 * `path`: canonical route; it and every route under it get this page's tags.
 * `file`: HTML file written next to index.html at build time (null = index.html itself).
 * `og`: what the share image says. The second line of the title is lilac, like the site's headings.
 */
export const PAGES = [
  {
    id: 'home',
    path: '/',
    file: null,
    title: 'vpn.free — Open any website without installing anything',
    description:
      'Right in your browser, no account. Sites see our server, not you. Free and unlimited, with servers in Europe and the Americas.',
    og: {
      title: ['Open any website', 'without installing anything.'],
      lead: 'Right in your browser, no account. Sites see our server, not you.',
      chips: ['Free & unlimited', 'No account', 'No install'],
    },
  },
  {
    id: 'support',
    path: '/support',
    file: 'support.html',
    title: 'Support vpn.free',
    description:
      'Help keep vpn.free free for everyone. Supporters chip in on the bandwidth bill and pick their server as a thank-you. No email, no account.',
    og: {
      title: ['Help keep it', 'free for everyone.'],
      lead: 'Supporters chip in on the bandwidth bill. No limits, no paywall.',
      chips: ['No auto-renewal', 'No email', 'Pick your server'],
    },
  },
  {
    id: 'changelog',
    path: '/changelog',
    file: 'changelog.html',
    title: "What's new — vpn.free",
    description: 'New features and important changes to vpn.free, newest first.',
    og: {
      title: ["What's new", 'on vpn.free.'],
      lead: 'New features and important changes, newest first.',
      chips: ['Changelog'],
    },
  },
];

export const ogImageUrl = (page) => `${SITE_URL}/og/${page.id}.png`;
export const OG_IMAGE = { width: 1200, height: 630 };
