/* Language list and browser detection. Kept apart from index.ts so the state
   module can use it without importing the translation hooks. */

export interface Lang {
  code: string;
  /** Native name, as shown in the menu. */
  name: string;
  short: string;
  dir: 'ltr' | 'rtl';
}

export const LANGS: Lang[] = [
  { code: 'en', name: 'English', short: 'EN', dir: 'ltr' },
  { code: 'pt', name: 'Português', short: 'PT', dir: 'ltr' },
  { code: 'es', name: 'Español', short: 'ES', dir: 'ltr' },
  { code: 'fr', name: 'Français', short: 'FR', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', short: 'DE', dir: 'ltr' },
  { code: 'it', name: 'Italiano', short: 'IT', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', short: 'TR', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', short: 'ID', dir: 'ltr' },
  { code: 'zh', name: '中文', short: '中文', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', short: 'SV', dir: 'ltr' },
  { code: 'pl', name: 'Polski', short: 'PL', dir: 'ltr' },
  { code: 'ar', name: 'العربية', short: 'ع', dir: 'rtl' },
  { code: 'fa', name: 'فارسی', short: 'فا', dir: 'rtl' },
];

export const getLang = (code: string) => LANGS.find((l) => l.code === code) ?? LANGS[0];

/** Old or alternate subtags browsers still send. */
const ALIASES: Record<string, string> = { in: 'id' };

/**
 * First supported language in the browser's preference list
 * (`pt-BR` → pt, `zh-TW` → zh), or English when none matches.
 */
export function detectLang(): Lang {
  let prefs: readonly string[] = [];
  try {
    prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  } catch {
    /* no navigator: fall back to English */
  }
  for (const tag of prefs) {
    if (!tag) continue;
    const base = tag.toLowerCase().split(/[-_]/)[0];
    const code = ALIASES[base] ?? base;
    const lang = LANGS.find((l) => l.code === code);
    if (lang) return lang;
  }
  return LANGS[0];
}
