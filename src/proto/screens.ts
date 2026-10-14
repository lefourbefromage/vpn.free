/* Every screen of the design reference, mapped to a route of the prototype.
   Used by the prototype overlay and the /screens index. */

export interface ScreenLink {
  label: string;
  to: string;
  /** Reference file(s) in design/vpn-free-design/screens */
  ref: string;
}

export const SCREEN_GROUPS: { title: string; screens: ScreenLink[] }[] = [
  {
    title: 'Homepage',
    screens: [
      { label: 'Homepage', to: '/', ref: 'Main · Mobile' },
      { label: 'Server menu open', to: '/?servers=open', ref: '*-ServerMenu' },
      { label: 'Supporter city picked', to: '/?server=new-york', ref: '*-Supporter' },
    ],
  },
  {
    title: 'Loading',
    screens: [
      { label: 'Connecting', to: '/connecting?url=thedailylens.com&mode=paused', ref: 'Loading-*' },
      { label: 'Connecting, slow site', to: '/connecting?url=thedailylens.com&mode=slow', ref: 'Loading-*-Slow' },
      { label: 'Connecting, live (auto-opens)', to: '/connecting?url=thedailylens.com', ref: '—' },
    ],
  },
  {
    title: 'Preview',
    screens: [
      { label: 'Browsing bar', to: '/browse', ref: 'Preview-*' },
      { label: 'Share', to: '/browse/share', ref: 'Preview-*-Share' },
      { label: 'Report an issue', to: '/browse/report', ref: 'Preview-*-Report' },
    ],
  },
  {
    title: 'Premium',
    screens: [
      { label: '1 · Choose a plan', to: '/support', ref: 'Premium-1-*' },
      { label: '2 · Save your code', to: '/support/code', ref: 'Premium-2-*' },
      { label: '3a · Waiting for payment', to: '/support/waiting', ref: 'Premium-3a-*' },
      { label: '3 · Paid, supporter', to: '/support/done', ref: 'Premium-3-*' },
    ],
  },
  {
    title: 'Restore / Sign in',
    screens: [
      { label: 'Your account', to: '/account', ref: 'Restore-*' },
      { label: 'Paste your code', to: '/account/code', ref: 'Restore-*-Code' },
      { label: 'Code not found', to: '/account/code?error=1', ref: 'Restore-*-Error' },
      { label: 'Forum sign in', to: '/account/forum', ref: 'Restore-*-Forum' },
      { label: 'Access restored', to: '/account/done', ref: 'Restore-*-Done' },
    ],
  },
  {
    title: "What's new",
    screens: [{ label: 'Changelog', to: '/changelog', ref: 'Changelog*' }],
  },
];
