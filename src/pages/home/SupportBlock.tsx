import { Link } from 'react-router-dom';
import { ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { CryptoChips, IconTile } from '../../components/ui';
import { stagger } from '../../hooks';
import { PLANS } from '../../state/proto';
import { SectionHeading } from './SectionHeading';
import styles from './SupportBlock.module.css';

const BENEFITS = [
  {
    icon: 'star' as const,
    title: 'Pick any server',
    text: 'Paris, New York, São Paulo… Europe or the Americas, your call.',
  },
  {
    icon: 'minus' as const,
    title: 'Same proxy, same speed',
    text: "Nothing is held back from the free version. You're paying for bandwidth, not for a better tier.",
  },
  {
    icon: 'eyeOff' as const,
    title: 'Still anonymous',
    text: 'Paid in crypto. No email, no password, no account, and no auto-renewal.',
  },
];

export function SupportBlock() {
  return (
    <section aria-labelledby="support-title" className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          id="support-title"
          title="Help keep it"
          accent="free for everyone."
          lead="No limits, no paywall. Supporters chip in on the bandwidth bill, and pick their server as a thank-you."
        />
        <div className={styles.block} data-reveal style={stagger(2)}>
          <div className={styles.benefits}>
            <ul className={styles.list}>
              {BENEFITS.map((b) => (
                <li key={b.title}>
                  <IconTile icon={b.icon} />
                  <span className={styles.benefitText}>
                    <span className={styles.benefitTitle}>{b.title}</span>
                    <span className={styles.benefitBody}>{b.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.ctaRow}>
              <ButtonLink to="/support" size="lg" className={styles.cta}>
                <Icon name="star" size={15} />
                Support vpn.free
              </ButtonLink>
              <Link to="/account" className={styles.signin}>
                Already a supporter? Sign in
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className={styles.visual}>
            <div className={styles.visualGlow} />
            <div className={styles.plans}>
              <div className={styles.plan}>
                <span className={styles.planName}>{PLANS.monthly.label}</span>
                <span className={styles.planPrice}>${PLANS.monthly.price}</span>
                <span className={`mono ${styles.planDays}`}>{PLANS.monthly.days} days</span>
              </div>
              <div className={`${styles.plan} ${styles.planHi}`}>
                <span className={styles.planBadge}>2 months off</span>
                <span className={styles.planName}>{PLANS.yearly.label}</span>
                <span className={styles.planPrice}>${PLANS.yearly.price}</span>
                <span className={`mono ${styles.planDays}`}>{PLANS.yearly.days} days</span>
              </div>
            </div>
            <div className={styles.chips}>
              <CryptoChips />
            </div>
            <span className={styles.renew}>Renews only when you renew it.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
