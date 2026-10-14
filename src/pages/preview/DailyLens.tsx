import styles from './DailyLens.module.css';

/* A fictional third-party site shown through the proxy. Its own look, not vpn.free's. */

function Img({ hue, className }: { hue: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.img} ${className ?? ''}`}
      style={{ background: `linear-gradient(160deg, hsl(${hue},38%,72%), hsl(${hue + 30},30%,46%))` }}
    >
      <div className={styles.imgHill} style={{ background: `hsla(${hue + 60},40%,88%,0.35)` }} />
      <div className={styles.imgSun} />
    </div>
  );
}

const MORE = [
  { hue: 140, title: 'Inside the race to rebuild old bridges' },
  { hue: 300, title: 'The quiet comeback of the paper map' },
  { hue: 60, title: 'Five recipes for the first cold week' },
  { hue: 230, title: 'What the new tide tables tell us' },
];

export function DailyLens() {
  return (
    <div aria-label="The Daily Lens (fictional website)" role="region" className={styles.site}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <span>Wednesday, October 14, 2026</span>
          <span>Subscribe · Log in</span>
        </div>
        <div className={styles.mobileBar}>
          <span aria-hidden="true">☰</span>
          <span className={styles.mobileMast}>The Daily Lens</span>
          <span className={styles.mobileLogin}>Log in</span>
        </div>
        <div className={styles.masthead}>The Daily Lens</div>
        <nav aria-label="Sections" className={styles.sections}>
          {['World', 'Politics', 'Business', 'Science', 'Culture', 'Sport', 'Opinion'].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </nav>

        <div className={styles.front}>
          <article className={styles.lead}>
            <Img hue={200} className={styles.leadImg} />
            <div className={styles.kicker}>Science</div>
            <h1 className={styles.headline}>Glacier researchers map a hidden river beneath the ice sheet</h1>
            <p className={styles.standfirst}>
              A three-year survey reveals meltwater channels running for hundreds of kilometres, changing how scientists
              model the coastline.
            </p>
            <div className={styles.byline}>By Elena Marsh · 6 min read</div>
          </article>

          <div className={styles.side}>
            <div className={`${styles.sideItem} ${styles.sideFirst}`}>
              <Img hue={28} className={styles.sideImg} />
              <div className={styles.sideTitle}>The small towns betting on night trains again</div>
            </div>
            <div className={styles.sideItem}>
              <div className={styles.kicker}>Business</div>
              <div className={styles.sideTitleSm}>Why coffee prices keep climbing this autumn</div>
            </div>
            <div className={styles.sideItem}>
              <div className={styles.kicker}>Culture</div>
              <div className={styles.sideTitleSm}>A museum of lost sounds opens its doors</div>
            </div>
          </div>
        </div>

        <div className={styles.more}>
          {MORE.map((m) => (
            <div key={m.title} className={styles.moreItem}>
              <Img hue={m.hue} className={styles.moreImg} />
              <div className={styles.moreTitle}>{m.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
