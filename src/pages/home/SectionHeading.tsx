import type { ReactNode } from 'react';
import { stagger } from '../../hooks';
import styles from './SectionHeading.module.css';

/** Section title whose second half is lilac, plus a lead line. */
export function SectionHeading({
  id,
  title,
  accent,
  lead,
  align = 'center',
}: {
  id: string;
  title: string;
  accent: string;
  lead: ReactNode;
  align?: 'center' | 'start';
}) {
  return (
    <div className={`${styles.head} ${align === 'start' ? styles.start : ''}`}>
      <h2 id={id} className={styles.title} data-reveal>
        {title} <span className="lilac">{accent}</span>
      </h2>
      <p className={styles.lead} data-reveal style={stagger(1)}>
        {lead}
      </p>
    </div>
  );
}
