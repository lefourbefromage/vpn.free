import { useRef, useState, type KeyboardEvent } from 'react';
import { LANGS, getLang, useT } from '../i18n';
import { useIsMobile } from '../hooks';
import { useProto } from '../state/proto';
import { Icon } from './Icon';
import { LayerHeader, Popover, Sheet } from './Layer';
import styles from './LanguagePicker.module.css';

/**
 * Footer language menu: a listbox opening upwards on desktop, a bottom sheet on mobile.
 * Picking Arabic or Persian switches the page to right-to-left.
 */
export function LanguagePicker() {
  const { state, update } = useProto();
  const t = useT();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = getLang(state.lang);

  const choose = (code: string) => {
    const lang = getLang(code);
    update({ lang: lang.code, dir: lang.dir });
    setOpen(false);
  };

  const list = <LangList value={current.code} onChoose={choose} label={t('language')} roomy={isMobile} />;

  return (
    <div className={styles.wrap}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('language')}: ${current.name}`}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="globe" size={16} />
        <span className={styles.long}>{current.name}</span>
        <span className={styles.short}>{current.short}</span>
        <Icon name={open && !isMobile ? 'chevronUp' : 'chevronDown'} size={14} />
      </button>

      {open && !isMobile && (
        <Popover label={t('language')} onClose={() => setOpen(false)} className={styles.dropdown} anchorRef={triggerRef}>
          {list}
        </Popover>
      )}
      {open && isMobile && (
        <Sheet titleId="lang-sheet-title" onClose={() => setOpen(false)}>
          <LayerHeader titleId="lang-sheet-title" title={t('language')} onClose={() => setOpen(false)} big />
          {list}
        </Sheet>
      )}
    </div>
  );
}

function LangList({ value, onChoose, label, roomy }: { value: string; onChoose: (code: string) => void; label: string; roomy: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  // Roving focus: ↑ ↓ Home End, Enter/Space selects.
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

  return (
    <div ref={ref} role="listbox" aria-label={label} className={`${styles.list} ${roomy ? styles.roomy : ''}`} onKeyDown={onKeyDown}>
      {LANGS.map((l) => {
        const selected = l.code === value;
        return (
          <div
            key={l.code}
            role="option"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            lang={l.code}
            className={`${styles.option} ${selected ? styles.selected : ''}`}
            onClick={() => onChoose(l.code)}
          >
            <span className={styles.name}>{l.name}</span>
            {selected && <Icon name="check" size={16} className={styles.check} />}
          </div>
        );
      })}
    </div>
  );
}
