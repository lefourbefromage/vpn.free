import { Link } from 'react-router-dom';
import { copyText, stagger } from '../hooks';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { ShareButtons } from './ShareButtons';
import { useToast } from './Toast';
import styles from './Footer.module.css';

export function Footer() {
  const toast = useToast();
  return (
    <footer className={styles.footer}>
      <div className={styles.top} data-reveal>
        <div className={styles.brand}>
          <Logo className={styles.logo} />
          <span className={styles.tagline}>Open any website without installing anything.</span>
        </div>
        <nav aria-label="Footer" className={styles.nav}>
          <a href="#help">Help</a>
          <Link to="/changelog">What's new</Link>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
          <a href="#community">Community</a>
        </nav>
        <button type="button" aria-haspopup="listbox" aria-label="Language: English" className={styles.lang}>
          <Icon name="globe" size={16} />
          <span className={styles.langLong}>English</span>
          <span className={styles.langShort}>EN</span>
          <Icon name="chevronDown" size={14} />
        </button>
      </div>
      <div className={styles.share} data-reveal style={stagger(1)}>
        <span className={styles.shareLabel}>
          Share<span className={styles.langShort}> vpn.free</span>
        </span>
        <ShareButtons
          onCopy={async () => {
            await copyText('https://vpn.free');
            toast('Link copied');
          }}
        />
      </div>
    </footer>
  );
}
