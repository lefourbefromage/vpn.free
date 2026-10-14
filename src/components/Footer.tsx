import { Link } from 'react-router-dom';
import { copyText, stagger } from '../hooks';
import { Logo } from './Logo';
import { ShareButtons } from './ShareButtons';
import { useToast } from './Toast';
import styles from './Footer.module.css';
import { LanguagePicker } from './LanguagePicker';
import { useT } from '../i18n';

export function Footer() {
  const toast = useToast();
  const t = useT();
  return (
    <footer className={styles.footer}>
      <div className={styles.top} data-reveal>
        <div className={styles.brand}>
          <Logo className={styles.logo} />
          <span className={styles.tagline}>{t('tagline')}</span>
        </div>
        <nav aria-label={t('footerNav')} className={styles.nav}>
          <a href="#help">{t('help')}</a>
          <Link to="/changelog">{t('whatsNew')}</Link>
          <a href="#privacy">{t('privacy')}</a>
          <a href="#terms">{t('terms')}</a>
          <a href="#contact">{t('contact')}</a>
          <a href="#community">{t('community')}</a>
        </nav>
        <div className={styles.lang}>
          <LanguagePicker />
        </div>
      </div>
      <div className={styles.share} data-reveal style={stagger(1)}>
        <span className={styles.shareLabel}>
          {t('share')}<span className={styles.langShort}> vpn.free</span>
        </span>
        <ShareButtons
          onCopy={async () => {
            await copyText('https://vpn.free');
            toast(t('linkCopied'));
          }}
        />
      </div>
    </footer>
  );
}
