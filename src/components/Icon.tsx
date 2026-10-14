import type { SVGProps } from 'react';

/* Inline icon set taken from the design reference (HANDOFF §3).
   Stroke icons inherit currentColor. Directional ones carry .flip-rtl. */

export const STAR_PATH =
  'M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z';
export const STAR_OUTLINE_PATH =
  'M12 1.5C12.85 8.4 15.6 11.15 22.5 12 15.6 12.85 12.85 15.6 12 22.5 11.15 15.6 8.4 12.85 1.5 12 8.4 11.15 11.15 8.4 12 1.5Z';
export const DISCORD_PATH =
  'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z';

export type IconName =
  | 'star'
  | 'starOutline'
  | 'arrowRight'
  | 'arrowLeft'
  | 'chevronDown'
  | 'chevronUp'
  | 'chevronLeft'
  | 'chevronRight'
  | 'globe'
  | 'close'
  | 'menu'
  | 'check'
  | 'shieldCheck'
  | 'link'
  | 'blocked'
  | 'eyeOff'
  | 'minus'
  | 'reload'
  | 'share'
  | 'bug'
  | 'copy'
  | 'download'
  | 'external'
  | 'chat'
  | 'key'
  | 'clock'
  | 'alert'
  | 'noAds'
  | 'book'
  | 'discord'
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'whatsapp'
  | 'x'
  | 'reddit'
  | 'sliders';

const DIRECTIONAL = new Set<IconName>(['arrowRight', 'arrowLeft', 'chevronLeft', 'chevronRight']);

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, strokeWidth, className, ...rest }: IconProps) {
  const cls = [DIRECTIONAL.has(name) ? 'flip-rtl' : '', className].filter(Boolean).join(' ') || undefined;
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: strokeWidth ?? 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, className: cls, ...rest };

  switch (name) {
    case 'star':
      return (
        <svg {...common}>
          <path fill="currentColor" d={STAR_PATH} />
        </svg>
      );
    case 'starOutline':
      return (
        <svg {...common}>
          <path fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? 2} d={STAR_OUTLINE_PATH} />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'arrowLeft':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case 'chevronUp':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M6 15l6-6 6 6" />
        </svg>
      );
    case 'chevronLeft':
      return (
        <svg {...common} {...stroke}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg {...common} {...stroke}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 1.75}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 1.75}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2.2}>
          <path d="M5 12l5 5 9-10" />
        </svg>
      );
    case 'shieldCheck':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'link':
      return (
        <svg {...common} {...stroke}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
    case 'blocked':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2.2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M6 6l12 12" />
        </svg>
      );
    case 'noAds':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 1.8}>
          <circle cx="12" cy="12" r="9" />
          <path d="M5.6 5.6l12.8 12.8" />
        </svg>
      );
    case 'eyeOff':
      return (
        <svg {...common} {...stroke}>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 8.5 4 9.5 6-.4.9-1.2 2.1-2.3 3.2" />
          <path d="M6.6 6.6C4.6 8 3.1 10 2.5 12c1 2 4.5 6 9.5 6 1.7 0 3.2-.4 4.5-1.1" />
        </svg>
      );
    case 'minus':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2.4}>
          <path d="M5 12h14" />
        </svg>
      );
    case 'reload':
      return (
        <svg {...common} {...stroke}>
          <path d="M20 11a8 8 0 1 0-2.3 5.7" />
          <path d="M20 4v7h-7" />
        </svg>
      );
    case 'share':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 3v12M7 8l5-5 5 5M5 13v6h14v-6" />
        </svg>
      );
    case 'bug':
      return (
        <svg {...common} {...stroke}>
          <rect x="8" y="7" width="8" height="13" rx="4" />
          <path d="M9.5 7a2.5 2.5 0 0 1 5 0M12 11v9M4 12h4M16 12h4M5 7l3 2M19 7l-3 2M5 18l3-2M19 18l-3-2" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...common} {...stroke}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      );
    case 'download':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
      );
    case 'external':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common} {...stroke}>
          <path d="M4 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-4-3h-3" />
        </svg>
      );
    case 'key':
      return (
        <svg {...common} {...stroke}>
          <circle cx="8" cy="15" r="4" />
          <path d="M11 12l9-9M17 6l3 3M15 8l2 2" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 1.8}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common} {...stroke} strokeWidth={strokeWidth ?? 1.8}>
          <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
          <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" />
          <path d="M9 7.5h6" />
        </svg>
      );
    case 'sliders':
      return (
        <svg {...common} {...stroke}>
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );
    case 'discord':
      return (
        <svg {...common}>
          <path fill="currentColor" d={DISCORD_PATH} />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.3-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v2.8h2.5V21z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="3.8" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'telegram':
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M20.7 4.1 2.9 11c-1 .4-1 1.4 0 1.7l4.5 1.4 1.7 5.3c.2.6.9.7 1.3.3l2.5-2.3 4.6 3.4c.6.4 1.3.1 1.5-.6l3-14.3c.2-.9-.5-1.4-1.3-1.1zM9.8 14.4l-.4 3.5-1.3-4.2 9.7-6.1-8 6.8z"
          />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common}>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinejoin="round"
            d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z"
          />
          <path
            fill="currentColor"
            d="M9.1 7.6c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.6 2 2.6 2.5.2.1.4.1.5 0l.7-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.4 0 .6-.3 1.4-1 1.7-.7.3-1.6.4-3.3-.4-1.7-.8-3.3-2.6-3.8-3.6-.6-1.1-.5-2.2.2-2.9.3-.3.6-.4 1-.4z"
          />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M17.8 3.5h3l-6.6 7.5 7.8 9.5h-6.1l-4.8-6-5.5 6h-3l7-7.9L2.2 3.5h6.2l4.3 5.5zm-1 15.2h1.7L7.3 5.2H5.5z"
          />
        </svg>
      );
    case 'reddit':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <ellipse cx="12" cy="14.5" rx="7.5" ry="5" />
          <path d="M12 9.5 13.2 4l4.3 1" />
          <circle cx="18.6" cy="5.2" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9.2" cy="13.8" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.8" cy="13.8" r="1" fill="currentColor" stroke="none" />
          <path d="M9.5 16.8c1.5 1 3.5 1 5 0" />
        </svg>
      );
  }
}
