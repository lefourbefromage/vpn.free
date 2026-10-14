import { Link } from 'react-router-dom';
import { ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { CryptoChips, IconTile } from '../../components/ui';
import { stagger } from '../../hooks';
import { PLANS } from '../../state/proto';
import { SectionHeading } from './SectionHeading';
import styles from './SupportBlock.module.css';
import { useT } from '../../i18n';

const BENEFITS = [
  { icon: 'star' as const, title: 'benefit1Title', text: 'benefit1Text' },
  { icon: 'minus' as const, title: 'benefit2Title', text: 'benefit2Text' },
  { icon: 'eyeOff' as const, title: 'benefit3Title', text: 'benefit3Text' },
] as const;

export function SupportBlock() {
  const t = useT();
  return (
    <section aria-labelledby="support-title" className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          id="support-title"
          title={t('supportTitle')}
          accent={t('supportAccent')}
          lead={t('supportLead')}
        />
        <div className={styles.block} data-reveal style={stagger(2)}>
          <div className={styles.benefits}>
            <ul className={styles.list}>
              {BENEFITS.map((b) => (
                <li key={b.title}>
                  <IconTile icon={b.icon} />
                  <span className={styles.benefitText}>
                    <span className={styles.benefitTitle}>{t(b.title)}</span>
                    <span className={styles.benefitBody}>{t(b.text)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.ctaRow}>
              <ButtonLink to="/support" size="lg" className={styles.cta}>
                <Icon name="star" size={15} />
                {t('supportCta')}
              </ButtonLink>
              <Link to="/account" className={styles.signin}>
                {t('alreadySupporter')}
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className={styles.visual}>
            <div className={styles.visualGlow} />
            <div className={styles.plans}>
              <div className={styles.plan}>
                <span className={styles.planName}>{t('monthly')}</span>
                <span className={styles.planPrice}>${PLANS.monthly.price}</span>
                <span className={`mono ${styles.planDays}`}>{t('days', { n: PLANS.monthly.days })}</span>
              </div>
              <div className={`${styles.plan} ${styles.planHi}`}>
                <span className={styles.planBadge}>{t('monthsOff')}</span>
                <span className={styles.planName}>{t('yearly')}</span>
                <span className={styles.planPrice}>${PLANS.yearly.price}</span>
                <span className={`mono ${styles.planDays}`}>{t('days', { n: PLANS.yearly.days })}</span>
              </div>
            </div>
            <div className={styles.chips}>
              <CryptoChips />
            </div>
            <span className={styles.renew}>{t('renews')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
