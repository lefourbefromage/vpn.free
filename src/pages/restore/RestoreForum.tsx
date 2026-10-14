import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FlowCard, FlowLayout } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { useToast } from '../../components/Toast';
import { FieldError, TextField } from '../../components/ui';
import { expiryFor, resolveSubmit, useProto, useProtoActions } from '../../state/proto';
import styles from './Restore.module.css';

interface Errors extends Record<string, string | undefined> {
  user?: string;
  password?: string;
  form?: string;
}

/**
 * Restore 2 — the forum's own sign-in page, in vpn.free colours.
 * Passkeys exist on the forum only, never on vpn.free.
 */
export function RestoreForum() {
  const { state, update } = useProto();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const linking = params.get('link') === '1';
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<'password' | 'passkey' | null>(null);

  function done() {
    if (linking && state.supporter) {
      toast('Forum account linked');
      navigate(-1);
      return;
    }
    if (!state.supporter) update({ supporter: { plan: 'yearly', expires: expiryFor('yearly'), via: 'forum' } });
    navigate('/account/done?via=forum');
  }

  async function login(e?: FormEvent) {
    e?.preventDefault();
    const result = resolveSubmit<Errors>(
      state.formOutcome,
      () => ({
        user: user.trim() ? undefined : 'Enter your email or username.',
        password: password ? undefined : 'Enter your password.',
      }),
      { form: 'Wrong email, username or password.' },
    );
    if (result.user || result.password) {
      setErrors(result);
      return;
    }
    setErrors({});
    setBusy('password');
    await new Promise((r) => setTimeout(r, 700));
    setBusy(null);
    if (result.form) {
      setErrors(result);
      return;
    }
    done();
  }

  async function passkey() {
    setErrors({});
    setBusy('passkey');
    await new Promise((r) => setTimeout(r, 900));
    setBusy(null);
    if (state.formOutcome === 'error') {
      setErrors({ form: 'No passkey for community.vpn.free was found on this device.' });
      return;
    }
    done();
  }

  useProtoActions('Forum sign in', [
    { label: 'Fill a username', run: () => setUser('mika') },
    { label: 'Submit', run: () => login() },
    { label: 'Use a passkey', run: passkey },
  ]);

  return (
    <FlowLayout
      aside={{ label: 'Back to vpn.free', to: '/' }}
      above={
        <span className={styles.forumChip}>
          <Icon name="chat" size={18} className="lilac" />
          community.vpn.free
        </span>
      }
      title="Welcome"
      accent="back."
      width={440}
    >
      <FlowCard>
        <form className={styles.form} onSubmit={login} noValidate>
          {errors.form && <FieldError id="forum-err">{errors.form}</FieldError>}
          <TextField
            label="Email or username"
            value={user}
            error={errors.user}
            describedBy={errors.form ? 'forum-err' : undefined}
            autoComplete="username"
            onChange={(e) => setUser(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            error={errors.password}
            describedBy={errors.form ? 'forum-err' : undefined}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="#forgot" className={styles.forgot}>
            I forgot my password
          </a>
          <Button type="submit" size="xl" block disabled={busy !== null}>
            {busy === 'password' ? 'Logging in…' : 'Log in'}
          </Button>
          <div role="separator" className={styles.or}>
            <span />
            or
            <span />
          </div>
          <Button variant="ghost" size="xl" block onClick={passkey} disabled={busy !== null} className={styles.passkey}>
            <Icon name="key" size={17} />
            {busy === 'passkey' ? 'Waiting for your passkey…' : 'Log in with a passkey'}
          </Button>
          <p className={styles.signup}>
            Don't have an account? <a href="#signup">Sign up</a>
          </p>
        </form>
      </FlowCard>
    </FlowLayout>
  );
}
