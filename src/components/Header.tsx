import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from './Button';
import { Icon } from './Icon';
import { LayerHeader, Sheet } from './Layer';
import { Logo } from './Logo';
import styles from './Header.module.css';

/**
 * Site header. No navigation on purpose (HANDOFF §4): logo, "Sign in", "Support vpn.free".
 * `aside` replaces the actions with a single quiet link (Cancel, Back to vpn.free…).
 */
export function Header({ aside }: { aside?: { label: string; to: string } }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link to="/" aria-label="vpn.free home" className={styles.logo}>
        <Logo className={styles.logoImg} />
      </Link>
      <div className={styles.spacer} />
      {aside ? (
        <Link to={aside.to} className={styles.quiet}>
          {aside.label}
        </Link>
      ) : (
        <div className={styles.actions}>
          <Link to="/account" className={`${styles.quiet} ${styles.desktopOnly}`}>
            Sign in
          </Link>
          <ButtonLink to="/support" size="sm" className={styles.support} aria-label="Support vpn.free">
            <Icon name="star" size={14} />
            <span className={styles.desktopOnly}>Support vpn.free</span>
          </ButtonLink>
          <button
            type="button"
            className={`${styles.menuBtn} ${styles.mobileOnly}`}
            aria-label="Menu"
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
          <LayerHeader titleId="menu-title" title="Menu" onClose={() => setMenuOpen(false)} big />
          <nav aria-label="Menu" className={styles.menuList}>
            <Link to="/account" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
            <Link to="/changelog" onClick={() => setMenuOpen(false)}>
              What's new
            </Link>
            <a href="#help">Help</a>
            <a href="#community">Community</a>
          </nav>
        </Sheet>
      )}
    </header>
  );
}
