import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ButtonAnchor, ButtonLink } from './Button';
import { Icon } from './Icon';
import { LayerHeader, Sheet } from './Layer';
import { Logo } from './Logo';
import styles from './Header.module.css';
import { useT } from '../i18n';
import { useProto } from '../state/proto';

/**
 * Site header. No navigation on purpose (HANDOFF §4): logo, "Sign in", "Support vpn.free".
 * Supporters (access in this browser) get the community links instead: Forum and Discord.
 * `aside` replaces the actions with a single quiet link (Cancel, Back to vpn.free…).
 */
export function Header({ aside }: { aside?: { label: string; to: string } }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();
  const supporter = Boolean(useProto().state.supporter);

  return (
    <header className={styles.header}>
      <Link to="/" aria-label={t('home')} className={styles.logo}>
        <Logo className={styles.logoImg} />
      </Link>
      <div className={styles.spacer} />
      {aside ? (
        <Link to={aside.to} className={styles.quiet}>
          {aside.label}
        </Link>
      ) : (
        <div className={styles.actions}>
          {supporter ? (
            <>
              <a href="#forum" className={`${styles.quiet} ${styles.desktopOnly}`}>
                {t('forum')}
              </a>
              <ButtonAnchor href="#discord" variant="discord" size="sm" className={styles.support} aria-label={t('joinDiscord')}>
                <Icon name="discord" size={16} />
                <span className={styles.desktopOnly}>{t('joinDiscord')}</span>
              </ButtonAnchor>
            </>
          ) : (
            <>
              <Link to="/account" className={`${styles.quiet} ${styles.desktopOnly}`}>
                {t('signIn')}
              </Link>
              <ButtonLink to="/support" size="sm" className={styles.support} aria-label={t('supportCta')}>
                <Icon name="star" size={14} />
                <span className={styles.desktopOnly}>{t('supportCta')}</span>
              </ButtonLink>
            </>
          )}
          <button
            type="button"
            className={`${styles.menuBtn} ${styles.mobileOnly}`}
            aria-label={t('menu')}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      )}

      {menuOpen && (
        // The ☰ menu is still to be defined in the design (HANDOFF §4); this is a minimal placeholder.
        <Sheet titleId="menu-title" onClose={() => setMenuOpen(false)}>
          <LayerHeader titleId="menu-title" title={t('menu')} onClose={() => setMenuOpen(false)} big />
          <nav aria-label={t('menu')} className={styles.menuList}>
            {supporter ? (
              <>
                <a href="#forum">{t('forum')}</a>
                <a href="#discord">{t('joinDiscord')}</a>
              </>
            ) : (
              <Link to="/account" onClick={() => setMenuOpen(false)}>
                {t('signIn')}
              </Link>
            )}
            <Link to="/changelog" onClick={() => setMenuOpen(false)}>
              {t('whatsNew')}
            </Link>
            <a href="#help">{t('help')}</a>
            <a href="#community">{t('community')}</a>
          </nav>
        </Sheet>
      )}
    </header>
  );
}
