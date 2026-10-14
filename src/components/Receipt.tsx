import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { copyText } from '../hooks';
import { shortCode } from '../state/proto';
import { Icon } from './Icon';
import { useToast } from './Toast';
import styles from './Receipt.module.css';

/** Square ghost button copying the receipt code. */
export function CopyCodeButton({ code }: { code: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={styles.copySmall}
      aria-label="Copy your code"
      onClick={async () => {
        await copyText(code);
        toast('Code copied');
      }}
    >
      <Icon name="copy" size={16} />
    </button>
  );
}

/** "Your code  02_Rk7v…tgKQ27  [copy]" row. */
export function CodeRow({ code }: { code: string }) {
  return (
    <div className={styles.codeRow}>
      <span className={styles.codeRowLabel}>Your code</span>
      <span className={`mono ${styles.codeRowValue}`}>{shortCode(code)}</span>
      <CopyCodeButton code={code} />
    </div>
  );
}

/** The receipt code itself: mono, dashed lilac border, with order id and timer. */
export function CodeBox({ code, orderId, aside }: { code: string; orderId: string; aside?: ReactNode }) {
  return (
    <div className={styles.codeBoxWrap}>
      <div className={`mono ${styles.codeBox}`}>
        {code}
      </div>
      <div className={`mono ${styles.codeMeta}`}>
        <span>order {orderId}</span>
        {aside}
      </div>
    </div>
  );
}

/** Optional suggestion to link a forum account, so a lost device doesn't lose the access. */
export function ForumLinkCard() {
  return (
    <div className={styles.forum}>
      <span aria-hidden="true" className={styles.forumIcon}>
        <Icon name="chat" size={18} />
      </span>
      <span className={styles.forumText}>
        <span className={styles.forumTitle}>
          Link a forum account <span className={styles.optional}>· optional</span>
        </span>
        <span className={styles.forumBody}>So losing a device doesn't mean losing what you paid for.</span>
      </span>
      <Link to="/account/forum?link=1" className={styles.forumBtn}>
        Link
      </Link>
    </div>
  );
}
