import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { detectLang } from '../i18n/langs';

/* Prototype state. Everything here is fake and lives in this browser only:
   it lets the flows chain together (pay → supporter → pick a server) and lets
   the prototype overlay force form outcomes. */

export type Plan = 'monthly' | 'yearly';
export type FormOutcome = 'auto' | 'success' | 'error';
export type LoadingMode = 'normal' | 'slow' | 'paused';
/** Answer to the cookie banner. null = not answered yet, the banner shows. */
export type CookieChoice = 'necessary' | 'all' | null;

export interface Order {
  plan: Plan;
  code: string;
  orderId: string;
}

export interface Supporter {
  plan: Plan;
  /** ISO date */
  expires: string;
  via: 'payment' | 'code' | 'forum';
}

export interface ProtoState {
  supporter: Supporter | null;
  /** Chosen city. null = Automatic — fastest. */
  serverId: string | null;
  plan: Plan;
  order: Order | null;
  formOutcome: FormOutcome;
  loadingMode: LoadingMode;
  dir: 'ltr' | 'rtl';
  /** Interface language (see src/i18n). Picking Arabic or Persian also switches `dir`. */
  lang: string;
  /** True once the visitor picked a language. Until then it follows the browser's. */
  langPicked: boolean;
  /** Fictional IP-based location of the visitor. */
  visitorId: string;
  cookies: CookieChoice;
}

export const PLANS: Record<Plan, { label: string; price: number; days: number }> = {
  monthly: { label: 'Monthly', price: 10, days: 30 },
  yearly: { label: 'Yearly', price: 99, days: 365 },
};

// Fictional sample values, as in the design reference.
export const SAMPLE_CODE = '02_Rk7vTq2Lmxw9pZd41UB6HFcNy3JeaW8SX5tgKQ27';
export const SAMPLE_ORDER_ID = '7f2c91d4-3a8e-4b60-9e15-c04d8a6b2e71';

const DEFAULT_STATE: ProtoState = {
  supporter: null,
  serverId: null,
  plan: 'yearly',
  order: null,
  formOutcome: 'auto',
  loadingMode: 'normal',
  dir: 'ltr',
  lang: 'en',
  langPicked: false,
  visitorId: 'marseille',
  cookies: null,
};

const STORAGE_KEY = 'vpnfree-proto-v1';

/** Until the visitor picks a language, use the browser's. */
function withBrowserLang(state: ProtoState): ProtoState {
  if (state.langPicked) return state;
  const lang = detectLang();
  return { ...state, lang: lang.code, dir: lang.dir };
}

function load(): ProtoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return withBrowserLang({ ...DEFAULT_STATE, ...JSON.parse(raw) });
  } catch {
    /* storage unavailable: start fresh */
  }
  return withBrowserLang(DEFAULT_STATE);
}

function save(state: ProtoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function expiryFor(plan: Plan, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + PLANS[plan].days);
  return d.toISOString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export function shortCode(code: string): string {
  return `${code.slice(0, 7)}…${code.slice(-6)}`;
}

/* ---------- Overlay actions registered by pages ---------- */

export interface ProtoAction {
  label: string;
  run: () => void;
  hint?: string;
}

export interface ProtoActionGroup {
  title: string;
  actions: ProtoAction[];
}

interface ProtoContextValue {
  state: ProtoState;
  update: (patch: Partial<ProtoState>) => void;
  reset: () => void;
  groups: ProtoActionGroup[];
  registerGroup: (id: string, group: ProtoActionGroup | null) => void;
}

const ProtoContext = createContext<ProtoContextValue | null>(null);

export function ProtoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProtoState>(load);
  const [groupMap, setGroupMap] = useState<Record<string, ProtoActionGroup>>({});

  useEffect(() => save(state), [state]);

  useEffect(() => {
    document.documentElement.dir = state.dir;
  }, [state.dir]);

  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  const update = useCallback((patch: Partial<ProtoState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const reset = useCallback(() => setState(withBrowserLang(DEFAULT_STATE)), []);

  const registerGroup = useCallback((id: string, group: ProtoActionGroup | null) => {
    setGroupMap((m) => {
      const next = { ...m };
      if (group) next[id] = group;
      else delete next[id];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ state, update, reset, groups: Object.values(groupMap), registerGroup }),
    [state, update, reset, groupMap, registerGroup],
  );

  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>;
}

export function useProto() {
  const ctx = useContext(ProtoContext);
  if (!ctx) throw new Error('useProto must be used inside ProtoProvider');
  return ctx;
}

/** Registers page-specific shortcuts in the prototype overlay while the page is mounted. */
export function useProtoActions(title: string, actions: ProtoAction[]) {
  const { registerGroup } = useProto();
  const idRef = useRef(`g${Math.random().toString(36).slice(2)}`);
  // Keep the latest closures without re-registering on every render.
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const labels = actions.map((a) => a.label).join('|');

  useEffect(() => {
    const id = idRef.current;
    registerGroup(id, {
      title,
      actions: actionsRef.current.map((a, i) => ({
        ...a,
        run: () => actionsRef.current[i]?.run(),
      })),
    });
    return () => registerGroup(id, null);
  }, [title, labels, registerGroup]);
}

/**
 * Applies the overlay's "form outcome" setting to a form submission.
 * auto → real validation; success → always passes; error → always fails with `forcedError`.
 */
export function resolveSubmit<E extends Record<string, string | undefined>>(
  outcome: FormOutcome,
  validate: () => E,
  forcedError: E,
): E {
  if (outcome === 'success') return {} as E;
  if (outcome === 'error') return forcedError;
  return validate();
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

/* ---------- Fake order generation ---------- */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomChars(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** A fictional receipt: 43-character code + order UUID. */
export function createOrder(plan: Plan): Order {
  return { plan, code: `02_${randomChars(40)}`, orderId: crypto.randomUUID() };
}

export const CODE_LENGTH = 43;
