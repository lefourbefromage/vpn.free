import { useEffect } from 'react';
import { ButtonLink } from '../../components/Button';
import { FlowCard, FlowLayout, Stepper } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { CopyCodeButton, ForumLinkCard } from '../../components/Receipt';
import { SuccessMark, SummaryList } from '../../components/ui';
import { PLANS, createOrder, expiryFor, formatDate, shortCode, useProto } from '../../state/proto';
import styles from './Premium.module.css';

/** Premium 3 — payment confirmed. */
export function PremiumDone() {
  const { state, update } = useProto();

  // Deep link straight to this screen: make the prototype consistent.
  useEffect(() => {
    const patch: Parameters<typeof update>[0] = {};
    if (!state.order) patch.order = createOrder(state.plan);
    if (!state.supporter) {
      const plan = state.order?.plan ?? state.plan;
      patch.supporter = { plan, expires: expiryFor(plan), via: 'payment' };
    }
    if (Object.keys(patch).length) update(patch);
  }, [state.order, state.supporter, state.plan, update]);

  const plan = PLANS[state.supporter?.plan ?? state.plan];
  const expires = state.supporter?.expires ?? expiryFor(state.plan);
  const code = state.order?.code;

  return (
    <FlowLayout
      aside={{ label: 'Back to vpn.free', to: '/' }}
      stepper={<Stepper current={4} />}
      above={<SuccessMark />}
      title="Thank you."
      accent="You're a supporter."
      lead={
        <>
          Payment received. Your access is active in this browser until{' '}
          <span className={`mono ${styles.white}`}>{formatDate(expires)}</span>.
        </>
      }
      width={560}
    >
      <FlowCard>
        <SummaryList
          rows={[
            { label: 'Plan', value: `${plan.label} · $${plan.price}` },
            {
              label: 'Server',
              value: (
                <>
                  <Icon name="star" size={12} className="lilac" />
                  Any city, your pick
                </>
              ),
            },
            {
              label: 'Your code',
              value: code ? (
                <>
                  <span className={`mono ${styles.codeValue}`}>{shortCode(code)}</span>
                  <CopyCodeButton code={code} />
                </>
              ) : (
                '—'
              ),
            },
          ]}
        />
        <p className={styles.bodySm}>Keep your code: it restores your access on another browser or after you clear your data.</p>
        <ForumLinkCard />
        <ButtonLink to="/?servers=open" size="xl" block>
          Pick a server and browse
          <Icon name="arrowRight" size={17} />
        </ButtonLink>
      </FlowCard>
    </FlowLayout>
  );
}
