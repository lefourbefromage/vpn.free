import { useCallback } from 'react';
import { useProto } from '../state/proto';
import { en, type MessageKey, type Messages } from './en';
import { ar } from './locales/ar';
import { de } from './locales/de';
import { es } from './locales/es';
import { fa } from './locales/fa';
import { fr } from './locales/fr';
import { id } from './locales/id';
import { it } from './locales/it';
import { pl } from './locales/pl';
import { pt } from './locales/pt';
import { sv } from './locales/sv';
import { tr } from './locales/tr';
import { zh } from './locales/zh';

/* Prototype i18n: the homepage, header, footer and server picker are translated.
   Other screens stay in English for now. */

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

const MESSAGES: Record<string, Messages> = { en, pt, es, fr, de, it, tr, id, zh, sv, pl, ar, fa };

export const getLang = (code: string) => LANGS.find((l) => l.code === code) ?? LANGS[0];

export type T = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function useT(): T {
  const lang = useProto().state.lang;
  return useCallback<T>(
    (key, vars) => {
      let s = (MESSAGES[lang] ?? en)[key] ?? en[key];
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );
}
