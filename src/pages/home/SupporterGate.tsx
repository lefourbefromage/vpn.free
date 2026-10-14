import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Button, ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { useLayerBehavior } from '../../components/Layer';
import { Badge } from '../../components/ui';
import { useT } from '../../i18n';
import styles from './SupporterGate.module.css';

/**
 * Shown when the URL form is sent with a supporter city picked but no supporter access.
 * Nothing opens until the visitor chooses: support, or continue through Automatic.
 * Centered dialog on desktop, bottom sheet on mobile.
 */
export function SupporterGate({
  city,
  autoCity,
  onContinue,
  onClose,
}: {
  city: string;
  autoCity: string;
  onContinue: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useLayerBehavior(ref, onClose, { modal: true });

  return createPortal(
    <div className={styles.root}>
      <div aria-hidden="true" className={styles.scrim} onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        aria-describedby="gate-body"
        className={styles.dialog}
      >
        <div aria-hidden="true" className={styles.handle} />
        <div className={styles.top}>
          <Badge star>{t('supporterBadge')}</Badge>
          <button type="button" className={styles.close} aria-label={t('close')} onClick={onClose}>
            <Icon name="close" size={17} />
          </button>
        </div>
        <h2 id="gate-title" className={styles.title}>
          {t('gateTitle', { city })}
        </h2>
        <p id="gate-body" className={styles.body}>
          {t('gateBody', { city: autoCity })}
        </p>
        <div className={styles.actions}>
          <ButtonLink to="/support" size="md">
            {t('supportCta')}
          </ButtonLink>
          <Button variant="outline" size="md" onClick={onContinue}>
            {t('gateContinue', { city: autoCity })}
          </Button>
        </div>
        <Link to="/account" className={styles.signin}>
          {t('alreadySupporter')}
        </Link>
      </div>
    </div>,
    document.body,
  );
}
