import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FlowCard, FlowLayout, Stepper } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { CryptoChips, IconTile, UppercaseLabel } from '../../components/ui';
import { PLANS, createOrder, useProto, useProtoActions, type Plan } from '../../state/proto';
import styles from './Premium.module.css';

const BENEFITS = [
  { title: 'Pick any server', text: 'Browse from Paris, New York or any city in Europe and the Americas.' },
  { title: 'Same proxy, same speed', text: 'Free browsing stays unlimited. Your support helps with the bandwidth bill.' },
  { title: 'Still anonymous', text: 'No email, no password, no account. Access is a certificate kept in this browser.' },
];

/** Premium 1 — choose a plan. */
export function PremiumPlan() {
  const { state, update } = useProto();
  const navigate = useNavigate();
  const plan = state.plan;

  const next = () => {
    // A new plan means a new order (and a new receipt code).
    if (!state.order || state.order.plan !== plan) update({ order: createOrder(plan) });
    navigate('/support/code');
  };

  useProtoActions('Choose a plan', [
    { label: 'Select Monthly', run: () => update({ plan: 'monthly' }) },
    { label: 'Select Yearly', run: () => update({ plan: 'yearly' }) },
  ]);

  return (
    <FlowLayout
      aside={{ label: 'Cancel', to: '/' }}
      stepper={<Stepper current={1} />}
      size="lg"
      title="Support"
      accent="vpn.free"
      lead="Choose how long you want to support us. Picking your server is our thank-you."
      width={920}
    >
      <div className={styles.planGrid}>
        <FlowCard className={styles.planCard}>
          <div role="radiogroup" aria-label="Plan" className={styles.radios}>
            {(Object.keys(PLANS) as Plan[]).map((p) => {
              const selected = plan === p;
              return (
                <label key={p} className={`${styles.radio} ${selected ? styles.radioOn : ''}`}>
                  <input
                    type="radio"
                    name="plan"
                    value={p}
                    checked={selected}
                    onChange={() => update({ plan: p })}
                    className="sr-only"
                  />
                  <span className={styles.radioTop}>
                    <span aria-hidden="true" className={styles.radioDot} />
                    {p === 'yearly' && <span className={styles.offBadge}>2 months off</span>}
                  </span>
                  <span className={styles.radioName}>{PLANS[p].label}</span>
                  <span className={styles.radioPrice}>${PLANS[p].price}</span>
                  <span className={`mono ${styles.radioDays}`}>{PLANS[p].days} days of access</span>
                </label>
              );
            })}
          </div>
          <div className={styles.payWith}>
            Pay with <CryptoChips />
          </div>
        </FlowCard>

        <FlowCard className={styles.getCard}>
          <UppercaseLabel>What you get</UppercaseLabel>
          <ul className={styles.getList}>
            {BENEFITS.map((b) => (
              <li key={b.title}>
                <IconTile icon="star" size="sm" />
                <span>
                  <span className={styles.getTitle}>{b.title}</span>
                  <span className={styles.getText}>{b.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </FlowCard>
      </div>

      <div className={styles.ctaBlock}>
        <Button size="xl" onClick={next} className={styles.cta}>
          Continue · ${PLANS[plan].price}
          <Icon name="arrowRight" size={17} />
        </Button>
        <span className={styles.renewNote}>
          <Icon name="reload" size={14} />
          No auto-renewal. It renews only when you renew it.
        </span>
      </div>
    </FlowLayout>
  );
}
