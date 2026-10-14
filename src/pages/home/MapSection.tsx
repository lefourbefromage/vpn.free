import { Link } from 'react-router-dom';
import { DotMap, TooltipLines, type MapMarker } from '../../components/DotMap';
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
 */
export function MapSection({ serverId, supporter }: { serverId: string | null; supporter: boolean }) {
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
          <>
            <TooltipLines value={targetLabel} />
            <span className={styles.locked}>
              <Icon name="star" size={12} className="lilac" />
              {t('forSupporters')}
            </span>
            <Link to="/support">
              {t('supportCta')}
              <Icon name="arrowRight" size={14} />
            </Link>
          </>
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
    tooltip: <TooltipLines label={t('yourLocation')} value={`${visitor.city}, ${visitor.country}`} note={t('approxIp')} />,
  };

  const origin = crossBorder ? visitorMarker : targetMarker;
  const destination = crossBorder ? targetMarker : undefined;

  const pins = SERVERS.filter((s) => s.id !== target.id);

  const protectedCard = (
    <div className={styles.protected}>
      <LogoSymbol size={isMobile ? 34 : 36} />
      <div>
        <div className={styles.protectedTitle}>{t('protected')}</div>
        <div className={styles.protectedSub}>{t('trafficFrom', { city: exit.city })}</div>
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
        <DotMap size={size} pins={pins} origin={origin} destination={destination}>
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
