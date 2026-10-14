import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonLink } from '../../components/Button';
import { FlowCard, FlowLayout } from '../../components/FlowLayout';
import { Icon } from '../../components/Icon';
import { ForumLinkCard } from '../../components/Receipt';
import { SuccessMark, SummaryList } from '../../components/ui';
import { PLANS, daysLeft, expiryFor, formatDate, useProto } from '../../state/proto';
import styles from './Restore.module.css';

/** Restore 3 — access restored. */
export function RestoreDone() {
  const { state, update } = useProto();
  const [params] = useSearchParams();
  const via = params.get('via') === 'forum' ? 'forum' : 'code';

  // Deep link straight to this screen: make the prototype consistent.
  useEffect(() => {
    if (!state.supporter) update({ supporter: { plan: 'yearly', expires: expiryFor('yearly'), via } });
  }, [state.supporter, update, via]);

  const supporter = state.supporter ?? { plan: 'yearly' as const, expires: expiryFor('yearly'), via };

  return (
    <FlowLayout
      aside={{ label: 'Back to vpn.free', to: '/' }}
      above={<SuccessMark />}
      title="Access"
      accent="restored."
      lead={
        <>
          You're a supporter on this browser again, until{' '}
          <span className={`mono ${styles.white}`}>{formatDate(supporter.expires)}</span>.
        </>
      }
      width={520}
    >
      <FlowCard>
        <SummaryList
          rows={[
            { label: 'Plan', value: PLANS[supporter.plan].label },
            { label: 'Days left', value: <span className="mono">{daysLeft(supporter.expires)}</span> },
            { label: 'Restored with', value: via === 'forum' ? 'Forum account' : 'Your code' },
          ]}
        />
        {via === 'code' && <ForumLinkCard />}
        <ButtonLink to="/?servers=open" size="xl" block>
          Pick a server and browse
          <Icon name="arrowRight" size={17} />
        </ButtonLink>
      </FlowCard>
    </FlowLayout>
  );
}
