import { Link } from 'react-router-dom';
import { DotMap, TooltipLines, type MapMarker, type MapPin } from '../../components/DotMap';
import { Icon } from '../../components/Icon';
import { LogoSymbol } from '../../components/Logo';
import { SERVERS, autoServer, getServer, getVisitor } from '../../data/servers';
import { useProto } from '../../state/proto';
import { useIsMobile } from '../../hooks';
import styles from './MapSection.module.css';
import { useT } from '../../i18n';

/**
 * The map under the hero. Paris is the free server (Automatic).
 * - The arc starts at the visitor's approximate location (from the IP), and is drawn only
 *   when the destination is in another country. Same country: just the destination pin.
 * - City picked without supporter access: the city is "available for supporters" and the
 *   traffic still leaves from Paris.
 * - The other cities are stars you can click (or drag the map to find): the Automatic city
 *   goes back to Automatic, supporter cities are lilac.
 */
export function MapSection({
  serverId,
  supporter,
  onSelect,
}: {
  serverId: string | null;
  supporter: boolean;
  onSelect: (serverId: string | null) => void;
}) {
  const isMobile = useIsMobile();
  const t = useT();
  const visitor = getVisitor(useProto().state.visitorId);
  const size = isMobile ? 'mobile' : 'desktop';
  const picked = getServer(serverId);
  const target = picked ?? autoServer;

  const exit = picked && supporter ? picked : autoServer;
  const locked = Boolean(picked && !supporter);
  const crossBorder = target.country !== visitor.country;
  const targetLabel = `${target.city}, ${target.country}`;

  const targetMarker: MapMarker = locked
    ? {
        lat: target.lat,
        lon: target.lon,
        kind: 'outline',
        tooltipTone: 'lilac',
        tooltip: isMobile ? (
          <TooltipLines value={targetLabel} note={t('supporterLocation')} />
        ) : (
          <div className={styles.lockedTip}>
            <Icon name="star" size={18} />
            <div className={styles.lockedTipText}>
              <TooltipLines value={targetLabel} />
              <span className={styles.locked}>{t('forSupporters')}</span>
              <Link to="/support">
                {t('supportCta')}
                <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </div>
        ),
      }
    : {
        lat: target.lat,
        lon: target.lon,
        kind: 'star',
        tooltip: <TooltipLines label={t('sitesSee')} value={targetLabel} />,
      };

  const visitorMarker: MapMarker = {
    lat: visitor.lat,
    lon: visitor.lon,
    kind: 'dot',
    tooltip: (
      <div className={styles.startTip}>
        <TooltipLines label={t('yourLocation')} value={`${visitor.city}, ${visitor.country}`} note={t('approxIp')} />
      </div>
    ),
  };

  const origin = crossBorder ? visitorMarker : targetMarker;
  const destination = crossBorder ? targetMarker : undefined;

  const pins: MapPin[] = SERVERS.filter((s) => s.id !== target.id).map((s) => {
    const auto = s.id === autoServer.id;
    return {
      id: s.id,
      lat: s.lat,
      lon: s.lon,
      label: `${s.city}, ${s.country}`,
      hint: auto ? t('mapPickAuto') : supporter ? t('mapPick') : t('mapPickSupporter'),
      tone: auto ? 'free' : supporter ? 'default' : 'lilac',
    };
  });

  const protectedCard = (
    <div className={styles.protected}>
      <LogoSymbol size={isMobile ? 34 : 36} />
      <div>
        <div className={styles.protectedTitle}>{t('readyToConnect')}</div>
        <div className={styles.protectedSub}>{t('sitesWillSee', { place: targetLabel })}</div>
        {locked && (
          <div className={styles.protectedNote}>
            <Icon name="star" size={12} className="lilac" />
            {t('supportersOnly')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section aria-label={t('mapLabel')} className={styles.section}>
      <p className="sr-only">
        {t('srSitesSee', { place: `${exit.city}, ${exit.country}` })}
        {locked && ` ${t('srLocked', { city: picked!.city })}`}
      </p>
      <div className={styles.viewport}>
        <DotMap
          size={size}
          pins={pins}
          onPinSelect={(id) => onSelect(id === autoServer.id ? null : id)}
          recenterLabel={t('mapRecenter')}
          dragHint={t('mapDragHint')}
          origin={origin}
          destination={destination}
        >
          {!isMobile && <div className={styles.protectedSlot}>{protectedCard}</div>}
        </DotMap>
      </div>

      {isMobile && (
        <div className={styles.below}>
          {locked && (
            <div className={styles.lockedCard}>
              <div className={styles.lockedTitle}>
                <Icon name="star" size={14} className="lilac" />
                {t('forSupporters')}
              </div>
              <p>{t('lockedBody', { city: autoServer.city })}</p>
              <Link to="/support" className={styles.lockedLink}>
                {t('supportCta')}
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>
          )}
          {protectedCard}
        </div>
      )}
    </section>
  );
}
