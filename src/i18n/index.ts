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

export { LANGS, getLang, detectLang, type Lang } from './langs';

const MESSAGES: Record<string, Messages> = { en, pt, es, fr, de, it, tr, id, zh, sv, pl, ar, fa };

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
