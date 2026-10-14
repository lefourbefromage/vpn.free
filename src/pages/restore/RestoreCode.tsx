import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { BackLink, FlowCard, FlowLayout } from '../../components/FlowLayout';
import { Callout, FieldError, TextField } from '../../components/ui';
import {
  CODE_LENGTH,
  SAMPLE_CODE,
  SAMPLE_ORDER_ID,
  expiryFor,
  resolveSubmit,
  useProto,
  useProtoActions,
} from '../../state/proto';
import styles from './Restore.module.css';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_MATCH = 'No access matches this code and order ID.';

interface Errors extends Record<string, string | undefined> {
  code?: string;
  orderId?: string;
  /** Shared message: both fields point at it. */
  match?: string;
}

/** Restore 2 — paste the code. ?error=1 shows the "no match" state from the reference. */
export function RestoreCode() {
  const { state, update } = useProto();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState('');
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get('error')) {
      setCode(SAMPLE_CODE.slice(0, 39));
      setOrderId(SAMPLE_ORDER_ID);
      setErrors({ match: lengthHint(SAMPLE_CODE.slice(0, 39)) });
    }
  }, [params]);

  function lengthHint(c: string) {
    return `${NO_MATCH} Your code has ${c.length} characters instead of ${CODE_LENGTH}: check that nothing was cut when you pasted it.`;
  }

  function validate(): Errors {
    const c = code.trim();
    const o = orderId.trim();
    const e: Errors = {};
    if (!c) e.code = 'Paste the code you saved at checkout.';
    if (!o) e.orderId = 'Paste the order ID from the same file.';
    if (e.code || e.orderId) return e;
    if (c.length !== CODE_LENGTH) return { match: lengthHint(c) };
    if (!UUID.test(o)) return { match: `${NO_MATCH} The order ID should look like 9f3c1a72-…, with 36 characters.` };
    const known = [
      { code: SAMPLE_CODE, orderId: SAMPLE_ORDER_ID },
      ...(state.order ? [{ code: state.order.code, orderId: state.order.orderId }] : []),
    ];
    if (!known.some((k) => k.code === c && k.orderId.toLowerCase() === o.toLowerCase()))
      return { match: `${NO_MATCH} Check both against the file you saved.` };
    return {};
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    const result = resolveSubmit<Errors>(state.formOutcome, validate, { match: `${NO_MATCH} Check both against the file you saved.` });
    // Empty fields are caught before any lookup.
    if (result.code || result.orderId) {
      setErrors(result);
      return;
    }
    setErrors({});
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    if (result.match) {
      setErrors(result);
      return;
    }
    const plan = state.order?.plan ?? 'yearly';
    update({ supporter: { plan, expires: expiryFor(plan), via: 'code' } });
    navigate('/account/done?via=code');
  }

  const valid = state.order ?? { code: SAMPLE_CODE, orderId: SAMPLE_ORDER_ID };
  useProtoActions('Paste your code', [
    { label: 'Fill a valid code', run: () => (setCode(valid.code), setOrderId(valid.orderId)) },
    { label: 'Fill a truncated code', run: () => (setCode(valid.code.slice(0, 39)), setOrderId(valid.orderId)) },
    { label: 'Fill an unknown code', run: () => (setCode(`02_${'x'.repeat(40)}`), setOrderId(crypto.randomUUID())) },
    { label: 'Clear fields', run: () => (setCode(''), setOrderId(''), setErrors({})) },
    { label: 'Submit', run: () => submit() },
  ]);

  const shared = errors.match ? 'code-err' : undefined;

  return (
    <FlowLayout
      aside={{ label: 'Back to vpn.free', to: '/' }}
      title="Paste the code"
      accent="you saved."
      lead="New phone, new laptop, cleared browser: the code is all we need, because it's all there ever was."
      width={520}
    >
      <BackLink to="/account">Back</BackLink>
      <FlowCard>
        <form className={styles.form} onSubmit={submit} noValidate>
          <TextField
            id="rc"
            label="Your code"
            mono
            placeholder={`the ${CODE_LENGTH}-character code`}
            value={code}
            error={errors.code}
            describedBy={shared}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextField
            id="oid"
            label="Order ID"
            mono
            placeholder="9f3c1a72-…"
            value={orderId}
            error={errors.orderId}
            describedBy={shared}
            onChange={(e) => setOrderId(e.target.value)}
          />
          {errors.match && <FieldError id="code-err">{errors.match}</FieldError>}
          <Button type="submit" size="xl" block disabled={busy}>
            {busy ? 'Looking it up…' : 'Find my access'}
          </Button>
        </form>
      </FlowCard>
      <Callout>
        <strong>Lost it?</strong> Then we can't help: there's no email on file and no name to search. That's the deal that
        keeps the rest of it true. If the certificate is still on one of your devices, it keeps working until it expires.
      </Callout>
    </FlowLayout>
  );
}
