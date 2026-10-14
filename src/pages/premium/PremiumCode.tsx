import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { BackLink, FlowCard, FlowLayout, Stepper } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { CodeBox } from '../../components/Receipt';
import { useToast } from '../../components/Toast';
import { Checkbox, FieldError } from '../../components/ui';
import { copyText, formatMMSS, useCountdown } from '../../hooks';
import { PLANS, createOrder, resolveSubmit, useProto, useProtoActions } from '../../state/proto';
import styles from './Premium.module.css';

/** Premium 2 — save the receipt code before paying. Pay stays disabled until both boxes are ticked. */
export function PremiumCode() {
  const { state, update } = useProto();
  const navigate = useNavigate();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string>();
  const [opening, setOpening] = useState(false);
  const left = useCountdown(15 * 60 - 1);

  // Deep link without an order: create one for the selected plan.
  useEffect(() => {
    if (!state.order) update({ order: createOrder(state.plan) });
  }, [state.order, state.plan, update]);

  const order = state.order;
  const plan = PLANS[order?.plan ?? state.plan];
  const expired = left === 0;
  const canPay = saved && terms && !expired;

  function saveFile() {
    if (!order) return;
    const text = `vpn.free — receipt code\n\nCode:     ${order.code}\nOrder ID: ${order.orderId}\nPlan:     ${plan.label} ($${plan.price}, ${plan.days} days, no auto-renewal)\n\nThis code is the only proof of purchase. Keep it somewhere safe.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vpn-free-receipt.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast('Receipt file saved');
  }

  async function pay() {
    const errors = resolveSubmit<{ pay?: string }>(
      state.formOutcome,
      () => ({}),
      { pay: "We couldn't open the payment page. Nothing was charged — try again in a moment." },
    );
    setError(undefined);
    setOpening(true);
    await new Promise((r) => setTimeout(r, 800));
    setOpening(false);
    if (errors.pay) {
      setError(errors.pay);
      return;
    }
    // Prototype: Sheepy is an external page; we go straight to the waiting screen.
    toast('Sheepy would open in a new tab (simulated)', 'info');
    navigate('/support/waiting');
  }

  useProtoActions('Save your code', [
    { label: 'Tick both boxes', run: () => (setSaved(true), setTerms(true)) },
    { label: 'Untick both boxes', run: () => (setSaved(false), setTerms(false)) },
    { label: 'New order (new code)', run: () => update({ order: createOrder(state.plan) }) },
  ]);

  return (
    <FlowLayout
      aside={{ label: 'Cancel', to: '/' }}
      stepper={<Stepper current={2} />}
      title="Save your code"
      accent="before you pay."
      lead="This code is your receipt, and the only one there is."
      width={640}
    >
      <div className={styles.summary}>
        <span className={styles.summaryText}>
          <span className={styles.summaryTitle}>{plan.label} support</span>
          <span className={`mono ${styles.summaryMeta}`}>{plan.days} days · no auto-renewal</span>
        </span>
        <span className={styles.summaryPrice}>${plan.price}</span>
      </div>

      <FlowCard>
        <span className={styles.saveBadge}>
          <Icon name="star" size={10} />
          Save this first
        </span>
        <p className={styles.body}>
          There's no account, so we can't email it to you or look it up. If you lose it before your access is activated,
          the payment is lost.
        </p>

        {order && (
          <CodeBox
            code={order.code}
            orderId={order.orderId}
            aside={
              <span className={expired ? styles.expired : undefined}>
                {expired ? (
                  'order expired'
                ) : (
                  <>
                    pay within <span className={styles.white}>{formatMMSS(left)}</span>
                  </>
                )}
              </span>
            }
          />
        )}

        <div className={styles.saveRow}>
          <Button variant="white" size="md" className={styles.saveBtn} onClick={saveFile}>
            <Icon name="download" size={16} />
            Save the file
          </Button>
          <Button
            variant="ghost"
            size="md"
            className={styles.saveBtn}
            onClick={async () => {
              if (order) await copyText(order.code);
              toast('Code copied');
            }}
          >
            <Icon name="copy" size={16} />
            Copy
          </Button>
        </div>

        <div className={styles.checks}>
          <Checkbox checked={saved} onChange={setSaved}>
            Saved. I understand nobody can recover it for me.
          </Checkbox>
          <Checkbox checked={terms} onChange={setTerms}>
            Start immediately. I agree to the <a href="#terms">Terms of Use</a> and understand that, because access starts
            at once, I give up my 14-day right to withdraw.
          </Checkbox>
        </div>

        <div className={styles.rule} />

        <div className={styles.payBlock}>
          {error && <FieldError id="pay-err">{error}</FieldError>}
          {expired && <FieldError id="pay-expired">This order expired. Start a new one to get a fresh code.</FieldError>}
          <Button
            size="xl"
            block
            disabled={!canPay || opening}
            onClick={pay}
            aria-describedby={!canPay ? 'pay-hint' : error ? 'pay-err' : undefined}
          >
            {opening ? 'Opening Sheepy…' : `Pay $${plan.price} with crypto`}
            <Icon name="external" size={16} />
          </Button>
          {!canPay && !expired && (
            <span id="pay-hint" className={styles.payHint}>
              Tick both boxes above to continue.
            </span>
          )}
          <span className={styles.caption}>
            Opens <span className={`mono ${styles.captionMono}`}>sheepy.com</span>, our crypto payment partner · Bitcoin,
            USDT and others
          </span>
        </div>
      </FlowCard>

      <BackLink to="/support">Change plan or cancel this order</BackLink>
    </FlowLayout>
  );
}
