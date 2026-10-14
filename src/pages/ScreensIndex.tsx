import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SCREEN_GROUPS } from '../proto/screens';
import styles from './ScreensIndex.module.css';

/** Prototype index: every screen of the design reference, reachable by URL. */
export function ScreensIndex({ notFound }: { notFound?: boolean }) {
  return (
    <div className={styles.page}>
      <Header aside={{ label: 'Back to vpn.free', to: '/' }} />
      <main className={styles.main}>
        <h1 className={styles.title}>
          {notFound ? 'This page does not exist.' : 'All screens'} <span className="lilac">Prototype index.</span>
        </h1>
        <p className={styles.lead}>
          Each screen of the design reference has its own URL. Use the prototype controls (bottom corner, or the{' '}
          <kbd>`</kbd> key) to force form outcomes and trigger states.
        </p>
        <div className={styles.groups}>
          {SCREEN_GROUPS.map((g) => (
            <section key={g.title} aria-labelledby={`sg-${g.title}`}>
              <h2 id={`sg-${g.title}`} className={styles.groupTitle}>
                {g.title}
              </h2>
              <ul className={styles.list}>
                {g.screens.map((s) => (
                  <li key={s.to}>
                    <Link to={s.to} className={styles.card}>
                      <span className={styles.label}>{s.label}</span>
                      <span className={`mono ${styles.meta}`}>
                        {s.to} · {s.ref}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
