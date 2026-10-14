/* Source strings (English). Every other locale must define the same keys.
   `{name}` placeholders are filled by t(key, { name }). */
export const en = {
  // Header
  home: 'vpn.free home',
  signIn: 'Sign in',
  supportCta: 'Support vpn.free',
  forum: 'Forum',
  discord: 'Discord',
  menu: 'Menu',

  // Hero
  heroTitle: 'Open any website',
  heroAccent: 'without installing anything.',
  heroLead: 'Right in your browser, no account. Sites see our server, not you.',
  urlLabel: 'Website address or search',
  urlPlaceholder: 'Enter a URL or search',
  go: 'Go',
  urlEmpty: 'Type a website address, or what you want to search for.',
  urlServer: "We couldn't reach this address. Check the spelling, or try again in a moment.",

  // Server picker
  automatic: 'Automatic — fastest',
  closestNow: 'Closest server, right now',
  supporterBadge: 'Supporter',
  serverLocation: 'Server location',
  changeServer: 'change server location',
  pickerNote: 'Picking a location is a thank-you for supporters. Automatic stays free and unlimited.',
  regionEurope: 'Europe',
  regionAmericas: 'Americas',

  // Map
  mapLabel: 'How your connection travels',
  sitesSee: 'Sites see',
  yourLocation: 'Your location',
  approxIp: 'approx., from your IP',
  forSupporters: 'Available for supporters',
  supporterLocation: 'Supporter location',
  protected: 'Protected',
  trafficFrom: 'Your traffic leaves from {city}',
  lockedBody: 'Until then you keep browsing through {city}, free and unlimited.',
  srSitesSee: 'Sites see {place}.',
  srLocked: '{city} is available for supporters.',

  // Promises
  promisesTitle: 'Three promises.',
  promisesAccent: 'No fine print.',
  promisesLead: 'What vpn.free does, said plainly. Nothing more is promised.',
  fast: 'Fast',
  fastText: 'Servers in Europe and the Americas. Automatic picks the closest one for you.',
  safe: 'Safe',
  safeText: 'Links shared through vpn.free are checked against malware lists before they open.',
  private: 'Private',
  privateText: "Sites see our server's address. Not yours.",
  closest: 'Closest',
  checkedClean: 'Checked · clean',
  malwareBlocked: 'On a malware list · blocked',
  yourIp: 'Your IP',

  // Support block
  supportTitle: 'Help keep it',
  supportAccent: 'free for everyone.',
  supportLead: 'No limits, no paywall. Supporters chip in on the bandwidth bill, and pick their server as a thank-you.',
  benefit1Title: 'Pick any server',
  benefit1Text: 'Paris, New York, São Paulo… Europe or the Americas, your call.',
  benefit2Title: 'Same proxy, same speed',
  benefit2Text: "Nothing is held back from the free version. You're paying for bandwidth, not for a better tier.",
  benefit3Title: 'Still anonymous',
  benefit3Text: 'Paid in crypto. No email, no password, no account, and no auto-renewal.',
  alreadySupporter: 'Already a supporter? Sign in',
  monthly: 'Monthly',
  yearly: 'Yearly',
  days: '{n} days',
  monthsOff: '2 months off',
  renews: 'Renews only when you renew it.',

  // Community
  nowOnDiscord: 'Now on Discord',
  communityTitle: 'Join the',
  communityAccent: 'community.',
  communityLead: 'Get help, tell us which sites to fix, and hear about new features first.',
  joinDiscord: 'Join our Discord',
  discordMsg1: 'thedailylens.com shows a blank page through Paris.',
  discordMsg2: "Thanks! Fixed in today's update.",
  newsFirst: 'Get the news here first',

  // Footer
  tagline: 'Open any website without installing anything.',
  footerNav: 'Footer',
  help: 'Help',
  whatsNew: "What's new",
  privacy: 'Privacy',
  terms: 'Terms',
  contact: 'Contact',
  community: 'Community',
  language: 'Language',
  share: 'Share',
  shareOn: 'Share on {network}',
  copyLink: 'Copy link',
  linkCopied: 'Link copied',

  // Cookie banner
  cookiesTitle: 'Cookies',
  cookiesText: "We use cookies to make the site work and to measure how it's used.",
  cookiesPolicy: 'Privacy and data',
  cookiesNecessary: 'Necessary only',
  cookiesAccept: 'Accept',

  // Supporter city gate (URL form)
  close: 'Close',
  gateTitle: 'Browse from {city} as a supporter',
  gateBody: 'Picking a location is a thank-you for supporters. Without it, your visit goes through {city}, free and unlimited.',
  gateContinue: 'Continue via {city}',
};

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
