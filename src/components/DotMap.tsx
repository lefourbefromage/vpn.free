import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { MapSize, Server } from '../data/servers';
import { useReducedMotion } from '../hooks';
import { Icon } from './Icon';
import { isLand } from './worldmap/landMask';
import { LOOKS, frame, project, sampleDots, tween, type Camera, type GeoPoint, type GridLayer, type Look } from './worldmap/projection';
import styles from './DotMap.module.css';

export interface MapMarker extends GeoPoint {
  /** star = white active pin, dot = visitor location, outline = lilac supporter-only city */
  kind: 'star' | 'dot' | 'outline';
  tooltip?: ReactNode;
  /** Defaults to an automatic choice based on where the two points land. */
  tooltipPlacement?: 'below' | 'above';
  tooltipTone?: 'default' | 'lilac';
}

interface Props {
  size: MapSize;
  origin: MapMarker;
  /** When set, an arc is drawn from the origin and the camera frames both. */
  destination?: MapMarker;
  /** Servers drawn as small hover pins. */
  pins: readonly Server[];
  /** Rendered on top of the map (e.g. the "Protected" card on desktop). */
  children?: ReactNode;
}

type Placement = 'above' | 'below' | 'left' | 'right';

const TRAVEL_MS = 1200;
const TWINKLE_FPS = 24;

/**
 * Flat world dot map in the style of the reference (tilted sheet, curved edges, vignette).
 * The camera glides to frame the origin (and destination) whenever they change.
 * Geography stays left-to-right in RTL layouts.
 */
export function DotMap({ size, origin, destination, pins, children }: Props) {
  const look = LOOKS[size];
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const target = useMemo(
    () => frame(look, origin, destination),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [look, origin.lat, origin.lon, destination?.lat, destination?.lon],
  );

  const camRef = useRef<Camera>(target);
  // Dot grids: laid out for the zoom of the view they belong to (constant spacing at rest);
  // the previous one fades out while the camera travels.
  const gridRef = useRef<GridLayer[]>([{ k: target.k, alpha: 1 }]);
  const [cam, setCam] = useState<Camera>(target);
  const [settled, setSettled] = useState(true);

  // Camera travel.
  useEffect(() => {
    const from = camRef.current;
    if (reduced || (from.lon === target.lon && from.lat === target.lat && from.k === target.k && from.ay === target.ay)) {
      camRef.current = target;
      gridRef.current = [{ k: target.k, alpha: 1 }];
      setCam(target);
      setSettled(true);
      return;
    }
    setSettled(false);
    // Current look of the grid (strongest layer) fades out; the target's grid fades in.
    const fromK = gridRef.current.reduce((a, b) => (b.alpha > a.alpha ? b : a)).k;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / TRAVEL_MS);
      const c = t < 1 ? tween(look, from, target, t) : target;
      const e = t * t * (3 - 2 * t);
      gridRef.current =
        t < 1 && Math.abs(fromK - target.k) > 1e-6
          ? [
              { k: fromK, alpha: 1 - e },
              { k: target.k, alpha: e },
            ]
          : [{ k: target.k, alpha: 1 }];
      camRef.current = c;
      setCam(c);
      if (t < 1) raf = requestAnimationFrame(step);
      else setSettled(true);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, look, reduced]);

  // Canvas: dots follow the camera; a few of them twinkle.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = look.W * dpr;
    canvas.height = look.H * dpr;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let lastCam: Camera | null = null;
    let dots = sampleDots(look, camRef.current, isLand, gridRef.current);
    let lastDraw = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const c = camRef.current;
      const moving = c !== lastCam;
      if (!moving && (reduced || now - lastDraw < 1000 / TWINKLE_FPS)) return;
      if (moving) {
        dots = sampleDots(look, c, isLand, gridRef.current);
        lastCam = c;
      }
      lastDraw = now;
      paint(ctx, look, dots, dpr, reduced ? 0 : now / 1000);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [look, reduced]);

  const desktop = size === 'desktop';
  const at = (p: GeoPoint) => project(look, cam, p.lat, p.lon);
  const visible = (x: number, y: number) => x > -60 && x < look.W + 60 && y > -60 && y < look.H + 60;

  const o = at(origin);
  const d = destination ? at(destination) : null;
  const arc = d ? arcPaths([o.x, o.y], [d.x, d.y], desktop) : null;
  const motionDur = desktop ? '3.2s' : '2.8s';
  // Tooltips: below for a single point. For a mostly horizontal trip, origin below and
  // destination above (clear of the arc); for a mostly vertical one, beside each pin.
  let oPlace: Placement = 'below';
  let dPlace: Placement = 'above';
  if (d && Math.abs(o.x - d.x) < look.W * 0.25) {
    oPlace = o.x <= d.x ? 'left' : 'right';
    dPlace = o.x <= d.x ? 'right' : 'left';
  }
  // Zoomed far out on a phone, city pins shrink to small dimmed stars so they don't pile up.
  const tiny = !desktop && cam.k < look.kDefault * 0.6;
  const focal = new Set([`${origin.lat},${origin.lon}`, destination && `${destination.lat},${destination.lon}`]);

  return (
    <div className={`${styles.stage} ${desktop ? styles.desktop : styles.mobile}`} style={{ width: look.W, height: look.H }} dir="ltr">
      <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} style={{ width: look.W, height: look.H }} />

      {pins.map((s) => {
        if (focal.has(`${s.lat},${s.lon}`)) return null;
        const p = at(s);
        if (!visible(p.x, p.y)) return null;
        return (
          <div key={s.id} aria-hidden="true" className={`${styles.city} ${tiny ? styles.cityTiny : ''}`} style={{ left: p.x, top: p.y }}>
            <Icon name="star" size={desktop ? 13 : 10} />
            <span>
              {s.city}, {s.country}
            </span>
          </div>
        );
      })}

      {arc && (
        <svg
          aria-hidden="true"
          width={look.W}
          height={look.H}
          viewBox={`0 0 ${look.W} ${look.H}`}
          className={`${styles.layer} ${styles.fadeable} ${settled ? styles.shown : ''}`}
        >
          <defs>
            <linearGradient id={`arcGrad-${size}`} gradientUnits="userSpaceOnUse" x1={o.x} y1="0" x2={d!.x} y2="0">
              <stop offset="0" stopColor="#7C62FF" />
              <stop offset="1" stopColor="#A28FFF" />
            </linearGradient>
            <filter id={`arcGlow-${size}`} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation={desktop ? 6 : 4} />
            </filter>
          </defs>
          <path
            d={arc.shadow}
            fill="none"
            stroke="#A28FFF"
            strokeOpacity="0.22"
            strokeWidth={desktop ? 1.5 : 1.25}
            strokeDasharray={desktop ? '2 8' : '2 6'}
            strokeLinecap="round"
          />
          <path d={arc.path} fill="none" stroke="#5B3BFF" strokeOpacity="0.35" strokeWidth={desktop ? 10 : 7} filter={`url(#arcGlow-${size})`} />
          <path
            d={arc.path}
            fill="none"
            stroke={`url(#arcGrad-${size})`}
            strokeWidth={desktop ? 2.5 : 2}
            strokeLinecap="round"
            strokeDasharray={desktop ? '8 10' : '6 8'}
            className={desktop ? styles.dash : styles.dashSm}
          />
          {!reduced && settled && (
            <>
              <circle r={desktop ? 5 : 4} fill="#FFFFFF">
                <animateMotion dur={motionDur} repeatCount="indefinite" path={arc.path} />
              </circle>
              {desktop && (
                <circle r="13" fill="#7C62FF" fillOpacity="0.35">
                  <animateMotion dur={motionDur} repeatCount="indefinite" path={arc.path} />
                </circle>
              )}
            </>
          )}
        </svg>
      )}

      <Marker marker={origin} placement={origin.tooltipPlacement ?? oPlace} x={o.x} y={o.y} look={look} desktop={desktop} settled={settled} />
      {destination && d && (
        <Marker
          marker={destination}
          placement={destination.tooltipPlacement ?? dPlace}
          x={d.x}
          y={d.y}
          look={look}
          desktop={desktop}
          settled={settled}
          delayed
        />
      )}

      {children}
    </div>
  );
}

function paint(ctx: CanvasRenderingContext2D, look: Look, dots: ReturnType<typeof sampleDots>, dpr: number, t: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, look.W, look.H);
  // Batch dots by opacity (quantised) to keep fill-style changes low.
  const buckets = new Map<number, Path2D>();
  for (const dot of dots) {
    const q = Math.round(dot.o * 50) / 50;
    let p = buckets.get(q);
    if (!p) buckets.set(q, (p = new Path2D()));
    p.moveTo(dot.x + dot.r, dot.y);
    p.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
  }
  ctx.fillStyle = '#A28FFF';
  for (const [q, p] of buckets) {
    ctx.globalAlpha = q;
    ctx.fill(p);
  }
  if (!t) return;
  // Twinkle: ~2 % of the dots brighten slowly (4.5–7.5 s cycles), like vfTwinkle.
  ctx.fillStyle = '#D6CCFF';
  for (const dot of dots) {
    const h = (dot.id >>> 0) % 1000;
    if (h >= 20) continue;
    const dur = 4.5 + (h % 7) * 0.5;
    const phase = ((h * 37) % 100) / 100;
    const a = Math.sin(Math.PI * ((t / dur + phase) % 1)) ** 2 * 0.9 * Math.min(1, dot.o * 2.2);
    if (a < 0.02) continue;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function arcPaths(a: readonly [number, number], b: readonly [number, number], desktop: boolean) {
  const dx = Math.abs(a[0] - b[0]);
  const midX = (a[0] + b[0]) / 2;
  const lift = desktop ? Math.min(380, Math.max(70, dx * 0.45)) : Math.min(170, Math.max(40, dx * 0.6));
  const top = Math.max(desktop ? 40 : 20, Math.min(a[1], b[1]) - lift);
  const ground = Math.max(a[1], b[1]) + (desktop ? dx * 0.125 : dx * 0.08);
  const r = (n: number) => Math.round(n);
  return {
    path: `M${r(a[0])} ${r(a[1])} Q${r(midX)} ${r(top)} ${r(b[0])} ${r(b[1])}`,
    shadow: `M${r(a[0])} ${r(a[1])} Q${r(midX)} ${r(ground)} ${r(b[0])} ${r(b[1])}`,
  };
}

function Marker({
  marker,
  placement,
  x,
  y,
  look,
  desktop,
  settled,
  delayed,
}: {
  marker: MapMarker;
  placement: Placement;
  x: number;
  y: number;
  look: Look;
  desktop: boolean;
  settled: boolean;
  delayed?: boolean;
}) {
  const align = x > look.W * 0.78 ? 'end' : x < look.W * 0.22 ? 'start' : 'center';
  const lilac = marker.kind === 'outline';

  return (
    <div className={`${styles.marker} ${desktop ? '' : styles.markerSm}`} style={{ left: x, top: y }}>
      <div aria-hidden="true" className={`${styles.halo} ${lilac ? styles.haloLilac : ''}`} />
      <div
        aria-hidden="true"
        className={`${styles.pulse} ${lilac ? styles.pulseLilac : ''}`}
        style={delayed ? { animationDelay: '0.8s' } : undefined}
      />
      {marker.kind === 'star' && !delayed && (
        <div aria-hidden="true" className={styles.pulse} style={{ animationDelay: '1.3s' }} />
      )}
      {marker.kind === 'star' && <Icon name="star" size={desktop ? 28 : 22} className={styles.starPin} />}
      {marker.kind === 'dot' && <span aria-hidden="true" className={styles.dotPin} />}
      {marker.kind === 'outline' && (
        <svg aria-hidden="true" width={desktop ? 26 : 20} height={desktop ? 26 : 20} viewBox="0 0 24 24" className={styles.outlinePin}>
          <path
            fill="rgba(162,143,255,0.2)"
            stroke="#A28FFF"
            strokeWidth="1.5"
            d="M12 1.5C12.85 8.4 15.6 11.15 22.5 12 15.6 12.85 12.85 15.6 12 22.5 11.15 15.6 8.4 12.85 1.5 12 8.4 11.15 11.15 8.4 12 1.5Z"
          />
        </svg>
      )}
      {marker.tooltip && (
        <div
          className={[
            styles.tooltip,
            styles.fadeable,
            settled ? styles.shown : '',
            placement === 'above' || placement === 'below' ? styles[`align_${align}`] : '',
            styles[placement],
            marker.tooltipTone === 'lilac' ? styles.tooltipLilac : '',
          ].join(' ')}
        >
          {marker.tooltip}
          <span aria-hidden="true" className={styles.arrow} />
        </div>
      )}
    </div>
  );
}

/* Tooltip content helper */

export function TooltipLines({ label, value, note }: { label?: string; value: string; note?: ReactNode }) {
  return (
    <>
      {label && <span className={styles.tLabel}>{label}</span>}
      <span className={`mono ${styles.tValue}`}>{value}</span>
      {note && <span className={styles.tNote}>{note}</span>}
    </>
  );
}
