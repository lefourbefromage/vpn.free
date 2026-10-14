import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { ServerPicker } from '../../components/ServerPicker';
import { FieldError } from '../../components/ui';
import { autoServer, getServer } from '../../data/servers';
import { useReveal } from '../../hooks';
import { resolveSubmit, useProto, useProtoActions } from '../../state/proto';
import { Community } from './Community';
import { MapSection } from './MapSection';
import { Promises } from './Promises';
import { SupportBlock } from './SupportBlock';
import { SupporterGate } from './SupporterGate';
import styles from './Home.module.css';
import { useT } from '../../i18n';

/** Strips the scheme and trailing slash so the address reads like the mockups. */
export function displayAddress(raw: string) {
  return raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

interface HomeProps {
  /** Rendered as an inert backdrop (behind the loading dialog). */
  backdrop?: boolean;
  backdropUrl?: string;
}

export function Home({ backdrop, backdropUrl }: HomeProps) {
  const { state, update } = useProto();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = useReveal<HTMLDivElement>();
  const t = useT();

  const [url, setUrl] = useState(backdropUrl ?? '');
  const [error, setError] = useState<string>();
  /** Address waiting for the visitor's answer in the supporter gate. */
  const [gated, setGated] = useState<string | null>(null);

  // Deep links: /?server=new-york selects a city, /?servers=open opens the menu.
  const paramServer = params.get('server');
  useEffect(() => {
    if (backdrop || paramServer === null) return;
    update({ serverId: paramServer === 'auto' ? null : getServer(paramServer)?.id ?? null });
    const next = new URLSearchParams(params);
    next.delete('server');
    setParams(next, { replace: true });
  }, [paramServer]); // eslint-disable-line react-hooks/exhaustive-deps

  // React 18 has no `inert` prop: set it on the DOM node.
  useEffect(() => {
    if (ref.current) ref.current.inert = Boolean(backdrop);
  }, [backdrop, ref]);

  const menuOpen = !backdrop && params.get('servers') === 'open';
  const setMenuOpen = (open: boolean) => {
    const next = new URLSearchParams(params);
    if (open) next.set('servers', 'open');
    else next.delete('servers');
    setParams(next, { replace: true });
  };

  function go(e?: FormEvent) {
    e?.preventDefault();
    const errors = resolveSubmit(
      state.formOutcome,
      () => ({ url: url.trim() ? undefined : t('urlEmpty') }),
      { url: t('urlServer') },
    );
    if (errors.url) {
      setError(errors.url);
      return;
    }
    setError(undefined);
    const target = displayAddress(url) || 'thedailylens.com';
    // A supporter city without supporter access: ask before connecting, never switch silently.
    if (lockedCity) {
      setGated(target);
      return;
    }
    connect(target);
  }

  function connect(target: string) {
    navigate(`/connecting?url=${encodeURIComponent(target)}`);
  }

  const lockedCity = state.supporter ? null : getServer(state.serverId)?.city ?? null;

  useProtoActions(
    'Homepage',
    backdrop
      ? []
      : [
          { label: 'Fill “thedailylens.com”', run: () => setUrl('thedailylens.com') },
          { label: 'Submit the URL form', run: () => go() },
          { label: 'Open server menu', run: () => setMenuOpen(true) },
          { label: 'Pick New York (supporter city)', run: () => update({ serverId: 'new-york' }) },
          { label: 'Back to Automatic', run: () => update({ serverId: null }) },
        ],
  );

  return (
    <div ref={ref} className={styles.page} aria-hidden={backdrop || undefined}>
      <Header />

      <section aria-labelledby="hero-title" className={styles.hero}>
        <div aria-hidden="true" className={styles.heroGlow} />
        <h1 id="hero-title" className={styles.title}>
          {t('heroTitle')} <span className={styles.titleAccent}>{t('heroAccent')}</span>
        </h1>
        <p className={styles.lead}>{t('heroLead')}</p>

        <form role="search" className={`${styles.search} ${error ? styles.searchInvalid : ''}`} onSubmit={go} noValidate>
          <Icon name="globe" size={22} className={styles.searchGlobe} />
          <label htmlFor="url-main" className="sr-only">
            {t('urlLabel')}
          </label>
          <input
            id="url-main"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('urlPlaceholder')}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(undefined);
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'url-main-err' : undefined}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.go}>
            {t('go')}
            <Icon name="arrowRight" size={18} className={styles.goArrow} />
          </button>
        </form>
        {error && (
          <div className={styles.searchError}>
            <FieldError id="url-main-err">{error}</FieldError>
          </div>
        )}

        <div className={styles.picker}>
          <ServerPicker
            value={state.serverId}
            supporter={Boolean(state.supporter)}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onSelect={(id) => update({ serverId: id })}
          />
        </div>
      </section>

      <MapSection serverId={state.serverId} supporter={Boolean(state.supporter)} />
      <Promises />
      <SupportBlock />
      <Community />
      <Footer />

      {gated !== null && lockedCity && (
        <SupporterGate
          city={lockedCity}
          autoCity={autoServer.city}
          onClose={() => setGated(null)}
          onContinue={() => {
            update({ serverId: null });
            connect(gated);
          }}
        />
      )}
    </div>
  );
}
