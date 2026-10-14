import { useEffect, useRef, type FormEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import styles from './Layer.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus management shared by sheets, popovers and modals:
 * focuses the first control (or `initialFocus`), traps Tab when modal,
 * closes on Escape (and outside click when not modal), restores focus on close.
 */
export function useLayerBehavior(
  ref: RefObject<HTMLElement>,
  onClose: (() => void) | undefined,
  { modal, initialFocus, ignoreRef }: { modal: boolean; initialFocus?: RefObject<HTMLElement>; ignoreRef?: RefObject<HTMLElement> },
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current ?? node.querySelector<HTMLElement>(FOCUSABLE) ?? node;
    target.focus({ preventScroll: true });

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && onCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (modal && e.key === 'Tab' && node) {
        const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    function onPointer(e: PointerEvent) {
      const t = e.target as Node;
      if (node && !node.contains(t) && !ignoreRef?.current?.contains(t)) onCloseRef.current?.();
    }
    document.addEventListener('keydown', onKey);
    if (!modal) document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function useScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

/* ---------- Bottom sheet (mobile) ---------- */

export function Sheet({
  titleId,
  onClose,
  children,
  as: Tag = 'div',
  onSubmit,
  className,
  scrim = 'default',
}: {
  titleId: string;
  onClose?: () => void;
  children: ReactNode;
  as?: 'div' | 'form';
  onSubmit?: (e: FormEvent<HTMLElement>) => void;
  className?: string;
  scrim?: 'default' | 'strong' | 'light';
}) {
  const ref = useRef<HTMLDivElement & HTMLFormElement>(null);
  useLayerBehavior(ref, onClose, { modal: true });
  useScrollLock();
  return createPortal(
    <div className={styles.sheetRoot}>
      <div aria-hidden="true" className={`${styles.scrim} ${styles[`scrim_${scrim}`]}`} onClick={onClose} />
      <Tag
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${styles.sheet} ${className ?? ''}`}
        onSubmit={onSubmit}
        noValidate={Tag === 'form' ? true : undefined}
      >
        <div aria-hidden="true" className={styles.handle} />
        {children}
      </Tag>
    </div>,
    document.body,
  );
}

/* ---------- Popover (desktop) ---------- */

export function Popover({
  titleId,
  label,
  onClose,
  children,
  className,
  role = 'dialog',
  as: Tag = 'div',
  onSubmit,
  anchorRef,
}: {
  titleId?: string;
  label?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  role?: 'dialog' | 'listbox';
  as?: 'div' | 'form';
  onSubmit?: (e: FormEvent<HTMLElement>) => void;
  /** Trigger element: clicks on it don't count as "outside". */
  anchorRef?: RefObject<HTMLElement>;
}) {
  const ref = useRef<HTMLDivElement & HTMLFormElement>(null);
  useLayerBehavior(ref, onClose, { modal: false, ignoreRef: anchorRef });
  return (
    <Tag
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      aria-label={label}
      className={`${styles.popover} ${className ?? ''}`}
      onSubmit={onSubmit}
      noValidate={Tag === 'form' ? true : undefined}
    >
      {children}
    </Tag>
  );
}

/* ---------- Header row used inside sheets and popovers ---------- */

export function LayerHeader({
  titleId,
  title,
  icon,
  onClose,
  big,
}: {
  titleId: string;
  title: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  big?: boolean;
}) {
  return (
    <div className={`${styles.layerHeader} ${big ? styles.layerHeaderBig : ''}`}>
      <h2 id={titleId} className={styles.layerTitle}>
        {icon}
        {title}
      </h2>
      {onClose && (
        <button type="button" className={`${styles.close} ${big ? styles.closeBig : ''}`} aria-label="Close" onClick={onClose}>
          <Icon name="close" size={big ? 18 : 17} />
        </button>
      )}
    </div>
  );
}
