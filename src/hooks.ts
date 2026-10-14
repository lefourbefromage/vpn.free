import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      // Some environments (device emulation) resize without firing `change`.
      window.addEventListener('resize', cb);
      return () => {
        mql.removeEventListener('change', cb);
        window.removeEventListener('resize', cb);
      };
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** < 768 px: compact header, sheets instead of popovers, mobile map. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Reveals every [data-reveal] element inside `root` as it scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
        }
      },
      // No negative bottom margin: the last rows of the page (footer) could never get past it.
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Seconds left, ticking down once per second. */
export function useCountdown(initialSeconds: number) {
  const [left, setLeft] = useState(initialSeconds);
  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);
  return left;
}

export function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Inline style that staggers a [data-reveal] element by its position. */
export function stagger(i: number): CSSProperties {
  return { '--reveal-i': i } as CSSProperties;
}
