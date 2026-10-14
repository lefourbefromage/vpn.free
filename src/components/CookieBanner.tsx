import { useEffect, useRef } from 'react';
import { useT } from '../i18n';
import { useProto } from '../state/proto';
import { Button } from './Button';
import styles from './CookieBanner.module.css';

/**
 * Bottom bar asking for cookie consent, shown until the visitor answers.
 * Both choices carry the same weight. The answer is kept with the prototype state.
 */
export function CookieBanner() {
  const { state, update } = useProto();
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const open = state.cookies === null;

  // Reserve room at the bottom of the page so the bar never hides the footer.
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty('--cookie-bar', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--cookie-bar');
    };
  }, [open]);

  if (!open) return null;

  return (
    <section ref={ref} className={styles.bar} role="region" aria-labelledby="cookie-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="cookie-title" className={styles.title}>
            {t('cookiesTitle')}
          </h2>
          <p className={styles.text}>{t('cookiesText')}</p>
          <a href="#privacy" className={styles.link}>
            {t('cookiesPolicy')}
          </a>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => update({ cookies: 'necessary' })}>
            {t('cookiesNecessary')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => update({ cookies: 'all' })}>
            {t('cookiesAccept')}
          </Button>
        </div>
      </div>
    </section>
  );
}
