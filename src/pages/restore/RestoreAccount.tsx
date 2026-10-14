import { ButtonLink } from '../../components/Button';
import { FlowCard, FlowLayout } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { Callout } from '../../components/ui';

/** Restore 1 — "Your account". An account is optional. */
export function RestoreAccount() {
  return (
    <FlowLayout
      aside={{ label: 'Back to vpn.free', to: '/' }}
      title="Your"
      accent="account."
      lead="An account is optional. It exists for one reason: so that losing a device doesn't mean losing what you paid for."
      width={520}
    >
      <FlowCard>
        <Callout tone="info" icon="chat">
          <strong>Signing in uses the vpn.free community forum</strong>, an account you may already have. We never see your
          password, and your email stays with the forum: this site only stores an opaque id that means nothing anywhere
          else.
        </Callout>
        <ButtonLink to="/account/forum" size="xl" block>
          Sign in through the forum
          <Icon name="arrowRight" size={17} />
        </ButtonLink>
        <ButtonLink to="/account/code" variant="ghost" size="xl" block style={{ height: 54, fontSize: 16 }}>
          I already have a code
        </ButtonLink>
      </FlowCard>
      <Callout>
        <strong>Prefer to stay anonymous?</strong> Then do nothing. Supporting without an account works exactly as before,
        and the code you save at checkout is all you need. The trade: with no account, there's nothing to look you up by,
        so a lost code can't be recovered.
      </Callout>
    </FlowLayout>
  );
}
