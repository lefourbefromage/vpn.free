import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Icon } from './Icon';
import styles from './FlowLayout.module.css';

/** Page shell for the Premium and Restore flows: quiet header, glow, centred column. */
export function FlowLayout({
  aside,
  stepper,
  title,
  accent,
  lead,
  above,
  width = 640,
  size = 'md',
  children,
}: {
  aside: { label: string; to: string };
  stepper?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  lead?: ReactNode;
  /** Shown above the title (success mark, forum chip…). */
  above?: ReactNode;
  /** Column width in px on desktop. */
  width?: number;
  /** Title scale: lg = 48 px (plan choice), md = 40–44 px. */
  size?: 'lg' | 'md';
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div aria-hidden="true" className={styles.glow} />
      <Header aside={aside} />
      <main className={`${styles.main} ${stepper ? styles.withStepper : ''}`}>
        {stepper && <div className={styles.stepper}>{stepper}</div>}
        <div className={styles.head}>
          {above}
          <h1 className={`${styles.title} ${size === 'lg' ? styles.titleLg : ''}`}>
            {title}
            {accent && (
              <>
                {' '}
                <span className="lilac">{accent}</span>
              </>
            )}
          </h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
        <div className={styles.column} style={{ maxWidth: width }}>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Large card holding the main content of a flow step. */
export function FlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>;
}

const STEPS = ['Choose a plan', 'Save your code', 'Pay'];

/** Premium stepper. Done = mint check, active = violet dot with a ring. */
export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol aria-label={`Step ${Math.min(current, 3)} of 3`} className={styles.steps}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className={styles.stepItem} aria-current={active ? 'step' : undefined}>
            {i > 0 && <span aria-hidden="true" className={`${styles.stepLine} ${n <= current ? styles.stepLineDone : ''}`} />}
            <span className={`${styles.stepDot} ${done ? styles.stepDone : ''} ${active ? styles.stepActive : ''}`}>
              {done ? <Icon name="check" size={14} /> : <span className="mono">{n}</span>}
            </span>
            <span className={`${styles.stepLabel} ${active ? styles.stepLabelActive : ''}`}>
              {label}
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Quiet "← Back" style link above or below a flow card. */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.back}>
      <Icon name="arrowLeft" size={16} />
      {children}
    </Link>
  );
}
