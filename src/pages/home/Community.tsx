import { ButtonAnchor } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { LogoSymbol } from '../../components/Logo';
import { stagger } from '../../hooks';
import styles from './Community.module.css';

const CHANNELS = ['announcements', 'help', 'site-requests', 'off-topic'];

export function Community() {
  return (
    <section id="community" aria-labelledby="community-title" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.text}>
          <span className={styles.chip} data-reveal>
            <Icon name="discord" size={15} />
            Now on Discord
          </span>
          <h2 id="community-title" className={styles.title} data-reveal style={stagger(1)}>
            Join the <span className="lilac">community.</span>
          </h2>
          <p className={styles.lead} data-reveal style={stagger(2)}>
            Get help, tell us which sites to fix, and hear about new features first.
          </p>
        </div>

        <div className={styles.cta} data-reveal style={stagger(3)}>
          <ButtonAnchor href="#discord" variant="discord" size="xl" className={styles.discordBtn}>
            Join our Discord
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
                {c}
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
                <span className={styles.msgText}>thedailylens.com shows a blank page through Paris.</span>
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
                <span className={styles.msgText}>Thanks! Fixed in today's update.</span>
              </div>
            </div>
          </div>

          <div className={styles.news}>
            <span className={styles.newsDot} />
            Get the news here first
          </div>
        </div>
      </div>
    </section>
  );
}
