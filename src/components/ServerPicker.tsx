import { useRef, type KeyboardEvent } from 'react';
import { REGIONS, SERVERS, autoServer, getServer } from '../data/servers';
import { useIsMobile } from '../hooks';
import { Icon } from './Icon';
import { LayerHeader, Popover, Sheet } from './Layer';
import { Badge } from './ui';
import styles from './ServerPicker.module.css';

interface Props {
  value: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (serverId: string | null) => void;
  supporter: boolean;
}

/**
 * "Automatic — fastest" pill. Opens a dropdown on desktop and a bottom sheet on mobile.
 * Cities scroll (max 280 px); Automatic and the note stay put.
 */
export function ServerPicker({ value, open, onOpenChange, onSelect, supporter }: Props) {
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const server = getServer(value);

  const choose = (id: string | null) => {
    onSelect(id);
    onOpenChange(false);
  };

  const list = <ServerList value={value} onChoose={choose} supporter={supporter} roomy={isMobile} />;
  const note = (
    <p className={styles.note}>
      Picking a location is a thank-you for supporters. Automatic stays free and unlimited.
    </p>
  );

  return (
    <div className={styles.wrap}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.pill} ${open && !isMobile ? styles.pillOpen : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {server ? (
          <>
            <Icon name="starOutline" size={14} className={styles.pillStar} />
            {server.city}, {server.country}
            {!supporter && <Badge>Supporter</Badge>}
          </>
        ) : (
          <>
            <Icon name="star" size={14} className={styles.pillStar} />
            Automatic — fastest
          </>
        )}
        <Icon name={open && !isMobile ? 'chevronUp' : 'chevronDown'} size={16} />
        <span className="sr-only">, change server location</span>
      </button>

      {open && !isMobile && (
        <Popover label="Server location" onClose={() => onOpenChange(false)} className={styles.dropdown} anchorRef={triggerRef}>
          {list}
          {note}
        </Popover>
      )}

      {open && isMobile && (
        <Sheet titleId="server-sheet-title" onClose={() => onOpenChange(false)} className={styles.sheet}>
          <LayerHeader titleId="server-sheet-title" title="Server location" onClose={() => onOpenChange(false)} big />
          {list}
          {note}
        </Sheet>
      )}
    </div>
  );
}

function ServerList({
  value,
  onChoose,
  supporter,
  roomy,
}: {
  value: string | null;
  onChoose: (id: string | null) => void;
  supporter: boolean;
  roomy: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Roving focus between options: ↑ ↓ Home End, Enter/Space selects.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const options = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const i = options.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = Math.min(options.length - 1, i + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, i - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    else if ((e.key === 'Enter' || e.key === ' ') && i >= 0) {
      e.preventDefault();
      options[i].click();
      return;
    } else return;
    e.preventDefault();
    options[next]?.focus();
    options[next]?.scrollIntoView({ block: 'nearest' });
  }

  const selectedIndex = value ? SERVERS.findIndex((s) => s.id === value) + 1 : 0;
  let index = 0;
  const tab = () => (index++ === selectedIndex ? 0 : -1);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label="Server location"
      className={`${styles.list} ${roomy ? styles.roomy : ''}`}
      onKeyDown={onKeyDown}
    >
      <div
        role="option"
        aria-selected={value === null}
        tabIndex={tab()}
        className={`${styles.auto} ${value === null ? styles.autoSelected : ''}`}
        onClick={() => onChoose(null)}
      >
        <Icon name="star" size={18} className={styles.autoStar} />
        <span className={styles.autoText}>
          <span className={styles.autoTitle}>Automatic — fastest</span>
          <span className={styles.autoSub}>
            Closest server, right now{' '}
            <span className="mono">
              {autoServer.city}, {autoServer.country}
            </span>
          </span>
        </span>
        {value === null && <Icon name="check" size={roomy ? 20 : 18} className={styles.check} />}
      </div>

      <div className={styles.scroll}>
        {REGIONS.map((region) => (
          <div key={region} role="group" aria-labelledby={`region-${region}`}>
            <div id={`region-${region}`} className={styles.region}>
              {region}
            </div>
            {SERVERS.filter((s) => s.region === region).map((s) => {
              const selected = value === s.id;
              return (
                <div
                  key={s.id}
                  role="option"
                  aria-selected={selected}
                  tabIndex={tab()}
                  className={`${styles.city} ${selected ? styles.citySelected : ''}`}
                  onClick={() => onChoose(s.id)}
                >
                  <span className={styles.cityName}>{s.city}</span>
                  <span className={`mono ${styles.country}`}>{s.country}</span>
                  {supporter ? (
                    selected && <Icon name="check" size={16} className={styles.check} />
                  ) : (
                    <Badge star>Supporter</Badge>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div aria-hidden="true" className={styles.scrollEnd} />
      </div>
    </div>
  );
}
