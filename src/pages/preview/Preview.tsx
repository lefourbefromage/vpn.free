import { useRef, useState, type FormEvent, type RefObject } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { LayerHeader, Popover, Sheet } from '../../components/Layer';
import { LogoSymbol } from '../../components/Logo';
import { ShareButtons } from '../../components/ShareButtons';
import { useToast } from '../../components/Toast';
import { Callout, TextArea } from '../../components/ui';
import { autoServer, getServer } from '../../data/servers';
import { copyText, useIsMobile } from '../../hooks';
import { hasErrors, resolveSubmit, useProto, useProtoActions } from '../../state/proto';
import { displayAddress } from '../home/Home';
import { DailyLens } from './DailyLens';
import styles from './Preview.module.css';

type Panel = 'share' | 'report' | null;

/** Screen 3 — the vpn.free bar above the proxied site. */
export function Preview() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useProto();
  const isMobile = useIsMobile();
  const shareRef = useRef<HTMLButtonElement>(null);
  const reportRef = useRef<HTMLButtonElement>(null);

  const host = params.get('url') || 'thedailylens.com';
  const [address, setAddress] = useState(host.includes('/') ? host : `${host}/science/hidden-river`);
  const panel: Panel = pathname.endsWith('/share') ? 'share' : pathname.endsWith('/report') ? 'report' : null;
  const query = params.toString() ? `?${params.toString()}` : '';
  const openPanel = (p: Panel) => navigate(`/browse${p ? `/${p}` : ''}${query}`, { replace: Boolean(panel) });
  const close = () => openPanel(null);

  const server = (state.supporter && getServer(state.serverId)) || autoServer;
  const sitesSee = `${server.city}, ${server.country}`;

  function go(e: FormEvent) {
    e.preventDefault();
    const target = displayAddress(address);
    if (target) navigate(`/connecting?url=${encodeURIComponent(target)}`);
  }

  useProtoActions('Preview', [
    { label: 'Open Share', run: () => openPanel('share') },
    { label: 'Open Report', run: () => openPanel('report') },
    { label: 'Close panel', run: close },
  ]);

  const sitesSeeLink = (
    <Link to="/?servers=open" className={styles.serverBadge} aria-label={`Sites see ${sitesSee}. Change server`}>
      <Icon name="star" size={13} className="lilac" />
      <span className={styles.serverText}>
        <span className={styles.serverLabel}>Sites see</span>
        <span className="mono">{sitesSee}</span>
      </span>
      <Icon name="chevronDown" size={15} className={styles.serverChevron} />
    </Link>
  );

  return (
    <div className={styles.page}>
      <div role="toolbar" aria-label="vpn.free browsing bar" className={styles.bar}>

        <Link to="/" aria-label="vpn.free home" className={styles.home}>
          <LogoSymbol size={isMobile ? 28 : 30} />
        </Link>

        <div className={styles.nav}>
          <button type="button" className={styles.ib} aria-label="Back" onClick={() => navigate(-1)}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <button type="button" className={styles.ib} aria-label="Forward" disabled>
            <Icon name="chevronRight" size={18} />
          </button>
          <button type="button" className={styles.ib} aria-label="Reload" onClick={() => navigate(`/connecting?url=${encodeURIComponent(host)}`)}>
            <Icon name="reload" size={17} />
          </button>
        </div>

        {/* Desktop: one 60 px row. Mobile (CSS grid): address row on top, then 44 px actions. */}
        <form role="search" className={styles.address} onSubmit={go}>
          <span className={styles.shieldMobile} aria-label="Protected" role="img">
            <Icon name="shieldCheck" size={15} />
          </span>
          <label htmlFor="addr" className="sr-only">
            Website address
          </label>
          <input
            id="addr"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className={`mono ${styles.addressInput}`}
          />
          <span className={styles.protected}>
            <Icon name="shieldCheck" size={15} />
            Protected
          </span>
          <Link to="/?servers=open" className={styles.serverChip} aria-label={`Sites see ${sitesSee}. Change server`}>
            <Icon name="star" size={11} className="lilac" />
            {sitesSee}
          </Link>
        </form>
        <div className={styles.spacer} />
        <div className={styles.desktopOnly}>{sitesSeeLink}</div>

        <button
          ref={shareRef}
          type="button"
          className={styles.share}
          aria-haspopup="dialog"
          aria-expanded={panel === 'share'}
          aria-label="Share"
          onClick={() => openPanel(panel === 'share' ? null : 'share')}
        >
          <Icon name="share" size={17} />
          <span className={styles.desktopOnly}>Share</span>
        </button>
        <button
          ref={reportRef}
          type="button"
          className={styles.report}
          aria-haspopup="dialog"
          aria-expanded={panel === 'report'}
          aria-label="Report an issue"
          title="Report an issue"
          onClick={() => openPanel(panel === 'report' ? null : 'report')}
        >
          <Icon name="bug" size={17} />
        </button>
        <ButtonLink to="/support" size="sm" className={`${styles.support} ${styles.desktopOnly}`}>
          <Icon name="star" size={13} />
          Support
        </ButtonLink>
        <span aria-hidden="true" className={`${styles.divider} ${styles.desktopOnly}`} />
        <Link to="/" className={styles.ib} aria-label="Close and go back to vpn.free" title="Exit vpn.free">
          <Icon name="close" size={17} />
        </Link>

        {panel === 'share' && !isMobile && (
          <Popover titleId="share-title" onClose={close} className={styles.sharePop} anchorRef={shareRef}>
            <ShareContent onClose={close} />
          </Popover>
        )}
        {panel === 'report' && !isMobile && <ReportForm onClose={close} anchorRef={reportRef} />}
      </div>

      <main className={styles.site}>
        <DailyLens />
        {panel && !isMobile && <div aria-hidden="true" className={styles.dim} onClick={close} />}
      </main>

      {panel === 'share' && isMobile && (
        <Sheet titleId="share-title" onClose={close} scrim="light">
          <ShareContent onClose={close} />
        </Sheet>
      )}
      {panel === 'report' && isMobile && <ReportForm onClose={close} mobile />}
    </div>
  );
}

function ShareContent({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const link = 'vpn.free/s/thedailylens';
  return (
    <>
      <LayerHeader titleId="share-title" title="Share this site" onClose={onClose} />
      <p className={styles.layerText}>
        Your friends open <span className={styles.white}>The Daily Lens</span> directly through vpn.free. We check every
        shared link against malware lists first.
      </p>
      <div className={styles.linkBox}>
        <span className={`mono ${styles.linkText}`}>{link}</span>
        <Button
          size="sm"
          className={styles.copyBtn}
          onClick={async () => {
            await copyText(`https://${link}`);
            toast('Link copied');
          }}
        >
          <Icon name="copy" size={17} />
          Copy link
        </Button>
      </div>
      <div className={styles.sendWith}>
        <span>Or send it with</span>
        <ShareButtons size={44} />
      </div>
      <div className={styles.checked}>
        <Icon name="shieldCheck" size={15} className={styles.checkedIcon} />
        Link checked · clean
      </div>
    </>
  );
}

function ReportForm({
  onClose,
  mobile,
  anchorRef,
}: {
  onClose: () => void;
  mobile?: boolean;
  anchorRef?: RefObject<HTMLElement>;
}) {
  const { state } = useProto();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errors = resolveSubmit(
      state.formOutcome,
      () => {
        const t = message.trim();
        if (!t) return { message: 'Tell us what went wrong before sending.' };
        if (t.length < 10) return { message: 'Add a few more words so we can reproduce it (10 characters minimum).' };
        return {};
      },
      { message: "Your report couldn't be posted to the forum right now. Try again in a minute." },
    );
    // Input errors show at once; a forced "server" error comes back after the fake round trip.
    if (state.formOutcome === 'auto' && hasErrors(errors)) {
      setError(errors.message);
      return;
    }
    setError(undefined);
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    if (hasErrors(errors)) {
      setError(errors.message);
      return;
    }
    toast('Report posted on the community forum');
    onClose();
  }

  useProtoActions('Report form', [
    { label: 'Fill a valid report', run: () => setMessage('The page stays blank after loading through Paris.') },
    { label: 'Fill a too-short report', run: () => setMessage('blank') },
    { label: 'Clear the field', run: () => setMessage('') },
  ]);

  const body = (
    <>
      <LayerHeader
        titleId="report-title"
        title="Report an issue"
        icon={<Icon name="bug" size={17} className="lilac" />}
        onClose={onClose}
      />
      <p className={styles.layerText}>Tell us what went wrong. Only your message below is sent.</p>
      <TextArea
        label="What went wrong?"
        hideLabel
        placeholder="What went wrong? e.g. the page stays blank after loading"
        value={message}
        error={error}
        onChange={(e) => {
          setMessage(e.target.value);
          if (error) setError(undefined);
        }}
        style={mobile ? { height: 120 } : undefined}
      />
      <Callout tone="warning">
        Your message is posted publicly on our community forum, where anyone can read it. Don't include personal or
        sensitive information.
      </Callout>
      <div className={styles.reportActions}>
        <Button variant="text" size="sm" onClick={onClose} className={styles.reportBtn}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className={styles.reportBtn} disabled={sending}>
          {sending ? 'Sending…' : 'Send report'}
        </Button>
      </div>
    </>
  );

  if (mobile)
    return (
      <Sheet titleId="report-title" onClose={onClose} as="form" onSubmit={submit} scrim="light" className={styles.reportSheet}>
        {body}
      </Sheet>
    );
  return (
    <Popover titleId="report-title" onClose={onClose} as="form" onSubmit={submit} className={styles.reportPop} anchorRef={anchorRef}>
      {body}
    </Popover>
  );
}
