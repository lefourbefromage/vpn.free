import { Icon, type IconName } from './Icon';
import styles from './ShareButtons.module.css';
import { useT } from '../i18n';

const NETWORKS: { name: string; icon: IconName }[] = [
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Telegram', icon: 'telegram' },
  { name: 'WhatsApp', icon: 'whatsapp' },
  { name: 'X', icon: 'x' },
  { name: 'Reddit', icon: 'reddit' },
];

/** Round share buttons (40 px in the footer, 44 px in the share sheet). */
export function ShareButtons({ size = 40, onCopy }: { size?: 40 | 44; onCopy?: () => void }) {
  const t = useT();
  return (
    <div className={styles.row}>
      {NETWORKS.map((n) => (
        <a
          key={n.name}
          href={`#share-${n.icon}`}
          aria-label={t('shareOn', { network: n.name })}
          className={`${styles.btn} ${size === 44 ? styles.big : ''}`}
          onClick={(e) => e.preventDefault()}
        >
          <Icon name={n.icon} size={n.icon === 'x' ? 16 : 18} />
        </a>
      ))}
      {onCopy && (
        <button type="button" aria-label={t('copyLink')} className={styles.btn} onClick={onCopy}>
          <Icon name="link" size={18} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
