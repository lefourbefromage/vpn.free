import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { Badge } from '../components/ui';
import { CHANGELOG, type ChangelogEntry } from '../data/changelog';
import { useReveal } from '../hooks';
import { formatDate } from '../state/proto';
import styles from './Changelog.module.css';

/** What's new — chronological timeline, newest first. */
export function Changelog() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={styles.page}>
      <Header />
      <section aria-labelledby="cl-title" className={styles.hero}>
        <div aria-hidden="true" className={styles.glow} />
        <Link to="/" className={styles.back}>
          <Icon name="arrowLeft" size={14} />
          Back to vpn.free
        </Link>
        <h1 id="cl-title" className={styles.title}>
          What's <span className="lilac">new</span>
        </h1>
        <p className={styles.lead}>New features and important changes to vpn.free, newest first.</p>
      </section>

      <section aria-label="Changelog" className={styles.timelineWrap}>
        <div className={styles.timeline}>
          <div aria-hidden="true" className={styles.line} />
          {CHANGELOG.map((day, i) => (
            <div key={day.date} className={styles.day} data-reveal>
              <span aria-hidden="true" className={`${styles.node} ${i === 0 ? styles.nodeLatest : ''}`} />
              <div className={styles.date}>
                <time dateTime={day.date} className={`mono ${i === 0 ? styles.dateLatest : ''}`}>
                  {formatDate(`${day.date}T12:00:00`)}
                </time>
                {i === 0 && (
                  <span>
                    <Badge>Latest</Badge>
                  </span>
                )}
              </div>
              <div className={styles.entries}>
                {day.entries.map((e) => (
                  <Entry key={e.title} entry={e} highlight={i === 0 && e.tone === 'discord'} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Entry({ entry, highlight }: { entry: ChangelogEntry; highlight: boolean }) {
  return (
    <article className={`${styles.entry} ${highlight ? styles.entryHi : ''}`}>
      <span aria-hidden="true" className={`${styles.tile} ${entry.tone === 'discord' ? styles.tileDiscord : ''}`}>
        <Icon name={entry.icon} size={entry.icon === 'discord' ? 24 : entry.icon === 'star' ? 18 : 21} />
      </span>
      <div className={styles.entryBody}>
        <h2 className={styles.entryTitle}>{entry.title}</h2>
        <p className={styles.entryText}>{entry.text}</p>
        {entry.link &&
          (entry.link.internal ? (
            <Link to={entry.link.to} className={styles.entryLink}>
              {entry.link.label}
              <Icon name="arrowRight" size={15} />
            </Link>
          ) : (
            <a href={entry.link.to} className={styles.entryLink}>
              {entry.link.label}
              <Icon name="arrowRight" size={15} />
            </a>
          ))}
      </div>
    </article>
  );
}
