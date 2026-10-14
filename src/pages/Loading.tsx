import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useLayerBehavior } from '../components/Layer';
import { LogoSymbol } from '../components/Logo';
import { Spinner } from '../components/ui';
import { autoServer, getServer } from '../data/servers';
import { useIsMobile, useReducedMotion } from '../hooks';
import { useProto, useProtoActions, type LoadingMode } from '../state/proto';
import { Home } from './home/Home';
import styles from './Loading.module.css';

/* Steps and when they finish (seconds) — normal connection. */
const STEPS = [
  { label: 'Finding the site', done: 0.2 },
  { label: 'Opening the tunnel', done: 0.8 },
  { label: 'Fetching the page', done: 2.6 },
  { label: 'Rendering', done: 3.2 },
];
/** A slow site stalls on "Fetching the page"; the warning shows after this many seconds. */
const SLOW_AFTER = 6;
/** Frozen time used for the "paused" mode, matching the reference screen. */
const PAUSED_AT = 2.4;

export function Loading() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, update } = useProto();
  const isMobile = useIsMobile();
  const url = params.get('url') || 'thedailylens.com';
  const mode: LoadingMode = (params.get('mode') as LoadingMode) || state.loadingMode;

  const [elapsed, setElapsed] = useState(mode === 'paused' ? PAUSED_AT : 0);
  const [forcedMode, setForcedMode] = useState<LoadingMode | null>(null);
  const effective = forcedMode ?? mode;

  useEffect(() => {
    if (effective === 'paused') return;
    const start = performance.now() - elapsed * 1000;
    let raf = 0;
    const tick = () => {
      setElapsed((performance.now() - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effective]);

  const slow = effective === 'slow' || (effective === 'paused' && params.get('mode') === 'slow');
  // A slow site never finishes "Fetching the page" on its own.
  const timeline = slow ? Math.min(elapsed, 1.0) : elapsed;
  const finished = !slow && timeline >= STEPS[STEPS.length - 1].done;
  const showSlowWarning = slow && elapsed >= (effective === 'paused' ? 0 : SLOW_AFTER);

  // In production the preview opens on its own once loading is done.
  useEffect(() => {
    if (finished) navigate(`/browse?url=${encodeURIComponent(url)}`, { replace: true });
  }, [finished, navigate, url]);

  const server = getServer(state.supporter ? state.serverId : null) ?? autoServer;

  const activeIndex = STEPS.findIndex((s) => timeline < s.done);
  const stepTimes = STEPS.map((s, i) => {
    const prev = i === 0 ? 0 : STEPS[i - 1].done;
    if (i < activeIndex || activeIndex === -1) return s.done - prev;
    if (i === activeIndex) return Math.max(0, (slow ? elapsed : timeline) - prev);
    return null;
  });

  const progress = slow
    ? Math.min(72, 50 + elapsed * 1.6)
    : Math.min(100, Math.round((timeline / STEPS[STEPS.length - 1].done) ** 1.9 * 100)); // eases in, like the reference

  const cancel = () => navigate('/');
  const tryAnother = () => navigate(`/browse?url=${encodeURIComponent(url)}`);

  useProtoActions('Loading', [
    { label: 'Run normally', run: () => { setForcedMode('normal'); setElapsed(0); } },
    { label: 'Simulate a slow site', run: () => { setForcedMode('slow'); setElapsed(0); } },
    { label: 'Pause here', run: () => setForcedMode('paused') },
    { label: 'Finish now → preview', run: tryAnother },
    { label: 'Make “slow” the default', run: () => update({ loadingMode: 'slow' }) },
  ]);

  return (
    <>
      <Home backdrop backdropUrl={url} />
      <LoadingDialog
        url={url}
        serverLabel={`${server.node} · ${server.city}`}
        elapsed={elapsed}
        slow={slow}
        showSlowWarning={showSlowWarning}
        progress={progress}
        activeIndex={activeIndex}
        stepTimes={stepTimes}
        onCancel={cancel}
        onTryAnother={tryAnother}
        isMobile={isMobile}
      />
    </>
  );
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const rest = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${rest}`;
}

function LoadingDialog(props: {
  url: string;
  serverLabel: string;
  elapsed: number;
  slow: boolean;
  showSlowWarning: boolean;
  progress: number;
  activeIndex: number;
  stepTimes: (number | null)[];
  onCancel: () => void;
  onTryAnother: () => void;
  isMobile: boolean;
}) {
  const { url, serverLabel, elapsed, slow, showSlowWarning, progress, activeIndex, stepTimes, onCancel, onTryAnother, isMobile } = props;
  const ref = useRef<HTMLDivElement>(null);
  useLayerBehavior(ref, onCancel, { modal: true });
  const reduced = useReducedMotion();
  const w = isMobile ? 350 : 476;
  const h = isMobile ? 96 : 112;
  const path = isMobile ? 'M40 62 Q175 -10 306 48' : 'M56 72 Q238 -14 420 56';

  return createPortal(
    <div className={styles.root}>
      <div aria-hidden="true" className={styles.scrim} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ld-title"
        className={`${styles.dialog} ${slow ? styles.slow : ''}`}
      >
        <div aria-hidden="true" className={styles.handle} />

        <div aria-hidden="true" className={styles.banner}>
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className={styles.bannerSvg}>
            <path d={path} fill="none" stroke="#A28FFF" strokeOpacity="0.18" strokeWidth={isMobile ? 5 : 6} />
            <path d={path} fill="none" stroke="#7C62FF" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 8" className={styles.dash} />
            {!reduced && (
              <circle r={isMobile ? 3.5 : 4} fill="#FFFFFF">
                <animateMotion dur={slow ? '4.5s' : '1.8s'} repeatCount="indefinite" path={path} />
              </circle>
            )}
          </svg>
          <div className={styles.you} />
          <span className={styles.youLabel}>You</span>
          <div className={styles.breathe} />
          <div className={styles.ring} />
          <LogoSymbol size={isMobile ? 26 : 32} className={styles.symbol} />
          <span className={`mono ${styles.server}`}>{serverLabel}</span>
        </div>

        <div className={styles.titleRow}>
          <h2 id="ld-title" className={styles.title}>
            Connecting to {url}…
          </h2>
          <span aria-label="Elapsed time" className={`mono ${styles.timer}`}>
            {slow && <span aria-hidden="true" className={styles.timerDot} />}
            {formatElapsed(elapsed)}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Connection progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className={styles.track}
        >
          <div className={styles.bar} style={{ width: `${progress}%` }}>
            <div className={styles.shimmer} />
          </div>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((s, i) => {
            const done = activeIndex === -1 || i < activeIndex;
            const active = i === activeIndex;
            const t = stepTimes[i];
            return (
              <li key={s.label} aria-current={active ? 'step' : undefined} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                {done ? (
                  <span aria-hidden="true" className={styles.check}>
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                ) : active ? (
                  <Spinner size={22} tone={slow ? 'amber' : 'lilac'} />
                ) : (
                  <span aria-hidden="true" className={styles.todo} />
                )}
                <span className={styles.stepLabel}>
                  {s.label}
                  {done && <span className="sr-only">, done</span>}
                </span>
                {t !== null && <span className={`mono ${styles.stepTime}`}>{t.toFixed(1)} s</span>}
              </li>
            );
          })}
        </ol>

        {showSlowWarning && (
          <div role="status" className={styles.warning}>
            <Icon name="clock" size={20} className={styles.warningIcon} />
            <div>
              <span className={styles.warningTitle}>Still working — the site may be slow to respond.</span>
              <span className={styles.warningText}>You can keep waiting, or try another server.</span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="outline" size={isMobile ? 'lg' : 'md'} onClick={onCancel}>
            Cancel
          </Button>
          <Button size={isMobile ? 'lg' : 'md'} onClick={onTryAnother}>
            Try another server
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
