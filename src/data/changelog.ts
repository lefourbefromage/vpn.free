import type { IconName } from '../components/Icon';

export interface ChangelogEntry {
  title: string;
  text: string;
  icon: IconName;
  /** Discord entries use the Discord colour for their tile. */
  tone?: 'discord';
  link?: { label: string; to: string; internal?: boolean };
}

export interface ChangelogDay {
  /** ISO date */
  date: string;
  entries: ChangelogEntry[];
}

// Entries from vpn.free/changelog, newest first.
export const CHANGELOG: ChangelogDay[] = [
  {
    date: '2026-10-09',
    entries: [
      {
        title: 'A vpn.free community on Discord',
        text: 'Chat with other users and with us, ask your questions and get the news first.',
        icon: 'discord',
        tone: 'discord',
        link: { label: 'Join the Discord', to: '#discord' },
      },
      {
        title: 'No more ads on vpn.free',
        text: 'We turned off all our ads, on the homepage and while you browse.',
        icon: 'noAds',
      },
    ],
  },
  {
    date: '2026-10-03',
    entries: [
      {
        title: 'vpn.free Premium: choose your server',
        text: 'With Premium, you choose the city you browse from. Browsing with vpn.free stays free for everyone.',
        icon: 'star',
        link: { label: 'Discover Premium', to: '/support', internal: true },
      },
    ],
  },
  {
    date: '2026-10-02',
    entries: [
      {
        title: 'Share sites with your friends',
        text: "Tap Share in the browsing bar to send the site you're viewing. The shared link opens directly through vpn.free, and we check it first.",
        icon: 'share',
      },
      {
        title: 'A How-to page',
        text: 'Step-by-step help to open sites, choose a server, share a link and fix common problems.',
        icon: 'book',
        link: { label: 'Open the guide', to: '#help' },
      },
    ],
  },
  {
    date: '2026-08-28',
    entries: [
      {
        title: 'vpn.free in 13 languages',
        text: 'Choose your language at the bottom of any page.',
        icon: 'globe',
      },
    ],
  },
];
