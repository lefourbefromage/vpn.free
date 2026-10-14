import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

/* Small shared building blocks (HANDOFF §4). */

export function Badge({ children, star, size = 'md' }: { children: ReactNode; star?: boolean; size?: 'sm' | 'md' }) {
  return (
    <span className={`${styles.badge} ${size === 'sm' ? styles.badgeSm : ''}`}>
      {star && <Icon name="star" size={9} className={styles.badgeStar} />}
      {children}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className={styles.chip}>{children}</span>;
}

export function CryptoChips() {
  return (
    <>
      <Chip>Bitcoin</Chip>
      <Chip>USDT</Chip>
      <Chip>and others</Chip>
    </>
  );
}

type CalloutTone = 'neutral' | 'info' | 'warning';

export function Callout({
  tone = 'neutral',
  icon,
  children,
  role,
}: {
  tone?: CalloutTone;
  icon?: IconName;
  children: ReactNode;
  role?: 'status' | 'note';
}) {
  const fallback: IconName = tone === 'warning' ? 'alert' : tone === 'info' ? 'chat' : 'star';
  const name = icon ?? fallback;
  return (
    <div className={`${styles.callout} ${styles[`callout_${tone}`]}`} role={role}>
      <span className={styles.calloutIcon}>
        <Icon name={name} size={name === 'star' ? 14 : 18} />
      </span>
      <div>{children}</div>
    </div>
  );
}

export function SuccessMark() {
  return (
    <span className={styles.success}>
      <span aria-hidden="true" className={styles.successPing} />
      <Icon name="check" size={28} />
    </span>
  );
}

export function SummaryList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className={styles.summary}>
      {rows.map((r) => (
        <div key={r.label} className={styles.summaryRow}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Square tile holding an icon, used in lists of benefits. */
export function IconTile({ icon, size = 'md' }: { icon: IconName; size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden="true" className={`${styles.tile} ${size === 'sm' ? styles.tileSm : ''}`}>
      <Icon name={icon} size={icon === 'star' ? 12 : 14} />
    </span>
  );
}

export function UppercaseLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  if (htmlFor)
    return (
      <label htmlFor={htmlFor} className={styles.upper}>
        {children}
      </label>
    );
  return <span className={styles.upper}>{children}</span>;
}

/* ---------- Form fields ---------- */

interface FieldBase {
  label: string;
  error?: string;
  /** Shared error element id when several fields point at one message. */
  describedBy?: string;
  hideLabel?: boolean;
  mono?: boolean;
}

export function TextField({
  label,
  error,
  describedBy,
  hideLabel,
  mono,
  id,
  className,
  ...rest
}: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errId = `${fieldId}-err`;
  const invalid = Boolean(error) || Boolean(describedBy);
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={hideLabel ? 'sr-only' : styles.upper}>
        {label}
      </label>
      <input
        id={fieldId}
        className={[styles.input, mono && 'mono', invalid && styles.invalid, className].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
        aria-describedby={error ? errId : describedBy}
        spellCheck={false}
        autoComplete="off"
        {...rest}
      />
      {error && <FieldError id={errId}>{error}</FieldError>}
    </div>
  );
}

export function TextArea({
  label,
  error,
  hideLabel,
  id,
  ...rest
}: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errId = `${fieldId}-err`;
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={hideLabel ? 'sr-only' : styles.upper}>
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`${styles.textarea} ${error ? styles.invalid : ''}`}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errId : undefined}
        {...rest}
      />
      {error && <FieldError id={errId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} role="alert" className={styles.error}>
      <Icon name="alert" size={16} className={styles.errorIcon} />
      <span>{children}</span>
    </span>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
  invalid,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  invalid?: boolean;
}) {
  return (
    <label className={styles.check}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span aria-hidden="true" className={`${styles.checkBox} ${invalid ? styles.checkInvalid : ''}`}>
        {checked && <Icon name="check" size={14} />}
      </span>
      <span>{children}</span>
    </label>
  );
}

export function Spinner({ size = 20, tone = 'lilac' }: { size?: number; tone?: 'lilac' | 'amber' }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.spinner} ${tone === 'amber' ? styles.spinnerAmber : ''}`}
      style={{ width: size, height: size }}
    />
  );
}
