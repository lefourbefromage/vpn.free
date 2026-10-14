import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FlowCard, FlowLayout, Stepper } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { CodeRow } from '../../components/Receipt';
import { useToast } from '../../components/Toast';
import { Spinner } from '../../components/ui';
import { formatMMSS, useCountdown } from '../../hooks';
import { createOrder, expiryFor, resolveSubmit, useProto, useProtoActions } from '../../state/proto';
import styles from './Premium.module.css';

/** Premium 3a — waiting for the crypto payment to confirm. Also shown when coming back from Sheepy. */
export function PremiumWaiting() {
  const { state, update } = useProto();
  const navigate = useNavigate();
  const toast = useToast();
  const left = useCountdown(12 * 60 + 41);
  const [checking, setChecking] = useState(false);
  const [notYet, setNotYet] = useState(false);

  useEffect(() => {
    if (!state.order) update({ order: createOrder(state.plan) });
  }, [state.order, state.plan, update]);
  const order = state.order;

  function confirm() {
    const plan = order?.plan ?? state.plan;
    update({ supporter: { plan, expires: expiryFor(plan), via: 'payment' } });
    navigate('/support/done');
  }

  async function checkNow() {
    setNotYet(false);
    setChecking(true);
    await new Promise((r) => setTimeout(r, 1200));
    setChecking(false);
    const errors = resolveSubmit<{ payment?: string }>(state.formOutcome, () => ({}), { payment: 'not confirmed' });
    if (errors.payment) setNotYet(true);
    else confirm();
  }

  function cancelOrder() {
    update({ order: null });
    toast('Order cancelled. Nothing was charged.', 'info');
    navigate('/');
  }

  useProtoActions('Waiting for payment', [
    { label: 'Payment confirmed → done', run: confirm },
    { label: 'Not confirmed yet', run: () => setNotYet(true) },
  ]);

  const shortOrder = order ? `${order.orderId.slice(0, 4)}…${order.orderId.slice(-4)}` : '';

  return (
    <FlowLayout
      aside={{ label: 'Cancel', to: '/' }}
      stepper={<Stepper current={3} />}
      title="Waiting for your"
      accent="payment to confirm."
      lead="You can close this page and come back with your code any time."
      width={600}
    >
      <FlowCard>
        <div role="status" className={styles.statusBox}>
          <ol className={styles.statusSteps}>
            <li>
              <span className={styles.stDone} aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
              <span className={styles.stText}>
                <span className={styles.stTitleDone}>Order created</span>
                <span className={`mono ${styles.stSub}`}>order {shortOrder}</span>
              </span>
            </li>
            <li aria-current="step">
              <span className={styles.stIcon}>
                <Spinner size={20} />
              </span>
              <span className={styles.stText}>
                <span className={styles.stTitle}>Payment confirming</span>
                <span className={styles.stSub}>Crypto payments usually confirm within 10–30 minutes.</span>
              </span>
            </li>
            <li>
              <span className={styles.stIcon}>
                <span className={styles.stTodo} aria-hidden="true" />
              </span>
              <span className={styles.stText}>
                <span className={styles.stTitleTodo}>Access ready to collect</span>
              </span>
            </li>
          </ol>
          <div aria-hidden="true" className={styles.stTrack}>
            <div className={styles.stBar} />
          </div>
          {notYet && (
            <p className={styles.notYet}>
              <Icon name="clock" size={16} />
              Not confirmed yet. We'll keep checking — you can also come back later with your code.
            </p>
          )}
        </div>

        {order && <CodeRow code={order.code} />}

        <div className={styles.waitActions}>
          <Button size="lg" className={styles.waitBtn} onClick={() => toast('Sheepy would open in a new tab (simulated)', 'info')}>
            Open the payment page
            <Icon name="external" size={16} />
          </Button>
          <Button variant="ghost" size="lg" className={styles.waitBtn} onClick={checkNow} disabled={checking}>
            {checking ? <Spinner size={16} /> : <Icon name="reload" size={16} />}
            {checking ? 'Checking…' : 'Check now'}
          </Button>
        </div>

        <div className={styles.waitFoot}>
          <span>
            Payment page open for <span className={`mono ${styles.white}`}>{formatMMSS(left)}</span>
          </span>
          <button type="button" className={styles.linkBtn} onClick={cancelOrder}>
            Cancel this order
          </button>
        </div>
      </FlowCard>
      <p className={styles.helpLine}>
        Lost this page? <Link to="/account/code">Paste your code</Link> to pick up where you left off.
      </p>
    </FlowLayout>
  );
}
