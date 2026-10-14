import type { ReactNode } from 'react';
import { Icon } from '../../components/Icon';
import { stagger } from '../../hooks';
import { SectionHeading } from './SectionHeading';
import styles from './Promises.module.css';

/* "Three promises" — 3 cards with a small illustrated UI on a dotted well.
   No section background on purpose: no frame inside a frame. */

export function Promises() {
  return (
    <section aria-labelledby="promises-title" className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          id="promises-title"
          title="Three promises."
          accent="No fine print."
          lead="What vpn.free does, said plainly. Nothing more is promised."
        />
        <div className={styles.grid}>
          <PromiseCard i={0} title="Fast" text="Servers in Europe and the Americas. Automatic picks the closest one for you.">
            <FastArt />
          </PromiseCard>
          <PromiseCard i={1} title="Safe" text="Links shared through vpn.free are checked against malware lists before they open.">
            <SafeArt />
          </PromiseCard>
          <PromiseCard i={2} title="Private" text="Sites see our server's address. Not yours.">
            <PrivateArt />
          </PromiseCard>
        </div>
      </div>
    </section>
  );
}

function PromiseCard({ i, title, text, children }: { i: number; title: string; text: string; children: ReactNode }) {
  return (
    <article className={styles.card} data-reveal style={stagger(i)}>
      <div aria-hidden="true" className={styles.well}>
        <div className={styles.wellGlow} />
        {children}
      </div>
      <div className={styles.copy}>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function FastArt() {
  const rows = [
    { city: 'Frankfurt', cc: 'DE', o: 0.85 },
    { city: 'London', cc: 'GB', o: 0.6 },
    { city: 'New York', cc: 'US', o: 0.35 },
  ];
  return (
    <div className={styles.menu}>
      <div className={styles.menuHead}>
        <Icon name="star" size={12} className="lilac" />
        Automatic — fastest
      </div>
      <div className={styles.menuActive}>
        <span className={styles.dotOn} />
        <span className={styles.menuCity}>Paris</span>
        <span className={styles.closest}>Closest</span>
        <span className={`mono ${styles.cc}`}>FR</span>
      </div>
      {rows.map((r) => (
        <div key={r.city} className={styles.menuRow} style={{ opacity: r.o }}>
          <span className={styles.dotOff} />
          <span className={styles.menuCity}>{r.city}</span>
          <span className={`mono ${styles.cc}`}>{r.cc}</span>
        </div>
      ))}
    </div>
  );
}

function SafeArt() {
  return (
    <div className={styles.links}>
      <div className={styles.linkCard}>
        <div className={styles.linkUrl}>
          <Icon name="link" size={14} />
          <span className="mono">vpn.free/s/thedailylens</span>
        </div>
        <span className={`${styles.pill} ${styles.pillOk}`}>
          <Icon name="shieldCheck" size={12} strokeWidth={2.2} />
          Checked · clean
        </span>
      </div>
      <div className={`${styles.linkCard} ${styles.linkBad}`}>
        <div className={styles.linkUrl}>
          <Icon name="link" size={14} />
          <span className="mono">free-prizes.example</span>
        </div>
        <span className={`${styles.pill} ${styles.pillBad}`}>
          <Icon name="blocked" size={12} />
          On a malware list · blocked
        </span>
      </div>
    </div>
  );
}

function PrivateArt() {
  return (
    <div className={styles.route}>
      <div className={`${styles.hop} ${styles.hopYou}`}>
        <Icon name="eyeOff" size={16} />
        <div className={styles.hopText}>
          <span className={styles.hopLabel}>Your IP</span>
          <span className={`mono ${styles.hopValue}`}>••.•••.•••.••</span>
        </div>
      </div>
      <div className={styles.dots} />
      <div className={styles.node}>
        <Icon name="star" size={22} />
      </div>
      <div className={styles.dots} />
      <div className={`${styles.hop} ${styles.hopServer}`}>
        <Icon name="globe" size={16} strokeWidth={1.9} />
        <div className={styles.hopText}>
          <span className={styles.hopLabel}>Sites see</span>
          <span className={`mono ${styles.hopValue}`}>Paris, FR · PAR-03</span>
        </div>
      </div>
    </div>
  );
}
