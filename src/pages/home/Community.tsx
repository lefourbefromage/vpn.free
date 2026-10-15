import { ButtonAnchor } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { LogoSymbol } from '../../components/Logo';
import { stagger } from '../../hooks';
import styles from './Community.module.css';
import { useT } from '../../i18n';

const CHANNELS = ['announcements', 'help', 'site-requests', 'off-topic'];

export function Community() {
  const t = useT();
  return (
    <section id="community" aria-labelledby="community-title" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.text}>
          <span className={styles.chip} data-reveal>
            <Icon name="discord" size={15} />
            {t('nowOnDiscord')}
          </span>
          <h2 id="community-title" className={styles.title} data-reveal style={stagger(1)}>
            {t('communityTitle')} <span className="lilac">{t('communityAccent')}</span>
          </h2>
          <p className={styles.lead} data-reveal style={stagger(2)}>
            {t('communityLead')}
          </p>
        </div>

        <div className={styles.cta} data-reveal style={stagger(3)}>
          <ButtonAnchor href="#discord" variant="discord" size="xl" className={styles.discordBtn}>
            <Icon name="discord" size={22} className={styles.btnLogo} />
            {t('joinDiscord')}
            <Icon name="arrowRight" size={18} strokeWidth={2.2} />
          </ButtonAnchor>
        </div>

        <div aria-hidden="true" className={styles.visual} data-reveal style={stagger(1)}>
          <div className={styles.glow} />
          <Icon name="discord" size={206} className={styles.watermark} />

          <div className={styles.server}>
            <div className={styles.serverHead}>
              <span className={styles.avatar}>
                <LogoSymbol size={20} />
              </span>
              vpn.free
            </div>
            {CHANNELS.map((c) => (
              <div key={c} className={`${styles.channel} ${c === 'site-requests' ? styles.channelActive : ''}`}>
                <span className="mono">#</span>
                <span className={styles.channelName}>{c}</span>
              </div>
            ))}
          </div>

          <div className={styles.thread}>
            <span className={styles.threadTitle}>
              <span className="mono">#</span> site-requests
            </span>
            <div className={styles.msg}>
              <span className={styles.msgAvatar}>MK</span>
              <div className={styles.msgBody}>
                <span className={styles.msgMeta}>
                  <span className={styles.msgName}>mika</span>
                  <span className={`mono ${styles.msgTime}`}>10:42</span>
                </span>
                <span className={styles.msgText}>{t('discordMsg1')}</span>
              </div>
            </div>
            <div className={styles.msg}>
              <span className={`${styles.msgAvatar} ${styles.msgAvatarTeam}`}>
                <LogoSymbol size={20} />
              </span>
              <div className={styles.msgBody}>
                <span className={styles.msgMeta}>
                  <span className={styles.msgName}>vpn.free</span>
                  <span className={styles.team}>TEAM</span>
                  <span className={`mono ${styles.msgTime}`}>10:58</span>
                </span>
                <span className={styles.msgText}>{t('discordMsg2')}</span>
              </div>
            </div>
            {/* More of the conversation, shown when the thread has the room (see the CSS). */}
            <div className={`${styles.msg} ${styles.msgExtra}`}>
              <span className={`${styles.msgAvatar} ${styles.msgAvatarAlt}`}>LE</span>
              <div className={styles.msgBody}>
                <span className={styles.msgMeta}>
                  <span className={styles.msgName}>lea</span>
                  <span className={`mono ${styles.msgTime}`}>11:04</span>
                </span>
                <span className={styles.msgText}>{t('discordMsg3')}</span>
              </div>
            </div>
            <div className={`${styles.msg} ${styles.msgExtra} ${styles.msgMore}`}>
              <span className={styles.msgAvatar}>JO</span>
              <div className={styles.msgBody}>
                <span className={styles.msgMeta}>
                  <span className={styles.msgName}>jo</span>
                  <span className={`mono ${styles.msgTime}`}>11:20</span>
                </span>
                <span className={styles.msgText}>{t('discordMsg4')}</span>
              </div>
            </div>
            {/* Hangs off the bottom of the thread, so it follows the card when a translation
                makes the messages longer. */}
            <div className={styles.news}>
              <span className={styles.newsDot} />
              {t('newsFirst')}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
