import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import { expiryFor, useProto, type FormOutcome, type LoadingMode } from '../state/proto';
import { VISITORS } from '../data/servers';
import { SCREEN_GROUPS } from './screens';
import styles from './ProtoOverlay.module.css';

const OUTCOMES: { value: FormOutcome; label: string; hint: string }[] = [
  { value: 'auto', label: 'Real rules', hint: 'Forms validate their input normally.' },
  { value: 'success', label: 'Always valid', hint: 'Every submit succeeds, whatever is typed.' },
  { value: 'error', label: 'Always error', hint: 'Every submit fails with its server error.' },
];

const LOADING: { value: LoadingMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Slow site' },
  { value: 'paused', label: 'Paused' },
];

/**
 * Prototype control panel (not part of the product).
 * Forces form outcomes, triggers page states, toggles supporter / RTL, jumps to any screen.
 * Toggle with the floating button or the ` key.
 */
export function ProtoOverlay() {
  const { state, update, reset, groups } = useProto();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const here = location.pathname + location.search;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === '`') setOpen((o) => !o);
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const actionGroups = groups.filter((g) => g.actions.length);

  return (
    <div className={styles.root} data-proto-overlay>
      {open && (
        <aside className={styles.panel} aria-label="Prototype controls">
          <div className={styles.head}>
            <span className={styles.tag}>Prototype</span>
            <span className={styles.headTitle}>Controls</span>
            <button type="button" className={styles.iconBtn} aria-label="Close prototype controls" onClick={() => setOpen(false)}>
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className={styles.body}>
            <fieldset className={styles.group}>
              <legend>Form submissions</legend>
              <div className={styles.segmented} role="radiogroup" aria-label="Form submissions">
                {OUTCOMES.map((o) => (
                  <label key={o.value} className={state.formOutcome === o.value ? styles.segOn : ''} title={o.hint}>
                    <input
                      type="radio"
                      name="proto-outcome"
                      className="sr-only"
                      checked={state.formOutcome === o.value}
                      onChange={() => update({ formOutcome: o.value })}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
              <p className={styles.hint}>{OUTCOMES.find((o) => o.value === state.formOutcome)?.hint}</p>
            </fieldset>

            {actionGroups.map((g) => (
              <section key={g.title} className={styles.group}>
                <h3>On this page · {g.title}</h3>
                <div className={styles.actions}>
                  {g.actions.map((a) => (
                    <button key={a.label} type="button" className={styles.action} title={a.hint} onClick={a.run}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <section className={styles.group}>
              <h3>State</h3>
              <label className={styles.switchRow}>
                <span>Supporter access in this browser</span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={Boolean(state.supporter)}
                  onChange={(e) =>
                    update({
                      supporter: e.target.checked ? { plan: 'yearly', expires: expiryFor('yearly'), via: 'payment' } : null,
                    })
                  }
                />
              </label>
              <label className={styles.switchRow}>
                <span>Right-to-left layout</span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={state.dir === 'rtl'}
                  onChange={(e) => update({ dir: e.target.checked ? 'rtl' : 'ltr' })}
                />
              </label>
              <div className={styles.row}>
                <span>Visitor location (IP)</span>
                <select value={state.visitorId} onChange={(e) => update({ visitorId: e.target.value })}>
                  {VISITORS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.city}, {v.country}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.row}>
                <span>Loading speed</span>
                <select value={state.loadingMode} onChange={(e) => update({ loadingMode: e.target.value as LoadingMode })}>
                  {LOADING.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  reset();
                  navigate('/');
                  toast('Prototype state reset', 'info');
                }}
              >
                Reset everything
              </button>
            </section>

            <nav className={styles.group} aria-label="All screens">
              <h3>
                Screens <Link to="/screens">index</Link>
              </h3>
              {SCREEN_GROUPS.map((g) => (
                <div key={g.title} className={styles.screenGroup}>
                  <span className={styles.screenTitle}>{g.title}</span>
                  {g.screens.map((s) => (
                    <Link key={s.to} to={s.to} aria-current={here === s.to ? 'page' : undefined} className={styles.screen}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}

      <button
        type="button"
        className={styles.fab}
        aria-expanded={open}
        aria-label={open ? 'Hide prototype controls' : 'Show prototype controls'}
        title="Prototype controls ( ` )"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="sliders" size={18} />
        {state.formOutcome !== 'auto' && <span className={styles.dot} aria-hidden="true" />}
      </button>
    </div>
  );
}
