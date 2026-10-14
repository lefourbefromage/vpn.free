/* World dot map — projection and camera.
   Same recipe as design/vpn-free-design/tools/map-generator/mk2.py: a Mercator sheet tilted
   back by 40° (perspective), edges curved down a little, and a soft vignette. The sheet repeats
   horizontally, so the camera can sit anywhere and arcs always take the shorter way round. */

import type { MapSize } from '../../data/servers';

export interface Camera {
  lon: number;
  lat: number;
  /** Zoom: pixels per degree of longitude on the flat sheet. */
  k: number;
  /** Screen y where the camera centre lands. */
  ay: number;
}

export interface Look {
  W: number;
  H: number;
  /** Perspective focal length (px). */
  f: number;
  /** Tilt (radians). */
  th: number;
  /** Edge curvature (px at the far left/right). */
  cv: number;
  /** Dot spacing on the sheet (px). */
  sp: number;
  /** Dot radius at scale 1. */
  r: number;
  /** Edge fade width (px). */
  edge: number;
  /** Baseline of the tilted sheet. */
  Hb: number;
  /** Screen y of the camera centre: one point / midpoint of two points. */
  anchorSingle: number;
  anchorPair: number;
  /** Zoom used for a single point, and the furthest zoom-out allowed. */
  kDefault: number;
  kMin: number;
  /** Screen box both points must fit in when framing two points (leaves room for tooltips,
      the hero overlapping the top of the map and the "Protected" card at the bottom). */
  box: { x0: number; x1: number; y0: number; y1: number };
}

const deg = Math.PI / 180;

export const LOOKS: Record<MapSize, Look> = {
  desktop: {
    W: 1360, H: 720, f: 1800, th: 40 * deg, cv: 150, sp: 11, r: 2.1, edge: 230, Hb: 710,
    anchorSingle: 370, anchorPair: 430, kDefault: 22, kMin: 2.2,
    box: { x0: 210, x1: 1150, y0: 320, y1: 520 },
  },
  mobile: {
    W: 390, H: 380, f: 800, th: 40 * deg, cv: 50, sp: 8, r: 1.5, edge: 48, Hb: 372,
    anchorSingle: 199, anchorPair: 215, kDefault: 13, kMin: 0.6,
    box: { x0: 60, x1: 330, y0: 80, y1: 300 },
  },
};

export const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * deg) / 2));
export const invMerc = (y: number) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / deg;

/** Longitude difference folded into [-180, 180). */
export const wrap = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Sheet offset of the camera centre so that it lands on `anchorY`. */
function anchorDv(look: Look, ay: number) {
  const a = ay - look.Hb;
  return (a * look.f) / (look.f * Math.cos(look.th) + a * Math.sin(look.th));
}

/** Tilted, curved projection of a point given in sheet coordinates (dv down, X right of centre). */
export function projectSheet(look: Look, dv: number, X: number) {
  const s = look.f / (look.f - dv * Math.sin(look.th));
  const x = look.W / 2 + X * s;
  const nx = (x - look.W / 2) / (look.W / 2);
  const y = look.Hb + dv * Math.cos(look.th) * s + look.cv * nx * nx;
  return { x, y, s };
}

export function project(look: Look, cam: Camera, lat: number, lon: number) {
  const R = cam.k / deg;
  const dv = anchorDv(look, cam.ay) + (merc(cam.lat) - merc(lat)) * R;
  return projectSheet(look, dv, wrap(lon - cam.lon) * cam.k);
}

/** Opacity of a dot at screen (x, y): edge fades and vignette, as in mk2.py. */
export function dotOpacity(look: Look, x: number, y: number, s: number) {
  const { W, H, edge: e, cv } = look;
  const nx = (x - W / 2) / (W / 2);
  const yp = y - cv * nx * nx;
  const fx = clamp01(Math.min(x, W - x) / e);
  const ft = clamp01(yp / (e * 1.2));
  const fb = clamp01((H - y) / (e * 0.6));
  const dy = (yp - H * 0.55) / (H * 0.62);
  const rr = clamp01((1.08 - Math.hypot(nx, dy)) / 0.38);
  let o = fx * ft * fb * rr;
  o = o * o * (3 - 2 * o);
  return o < 0.04 ? 0 : o * (0.22 + 0.42 * s);
}

export interface Dot {
  x: number;
  y: number;
  r: number;
  o: number;
  /** Stable id of the sheet cell, for twinkling. */
  id: number;
}

export interface GridLayer {
  /** Zoom the grid is laid out for: at cam.k === k the dots are exactly `sp` apart. */
  k: number;
  /** Opacity multiplier (cross-fade between two grids while the camera travels). */
  alpha: number;
}

/**
 * Dots for the current camera. Each grid is anchored to the world (degrees, not pixels), so dots
 * travel with the land while the camera pans and zooms. A grid is laid out for the zoom of the
 * view it belongs to, so at rest the dots are always `sp` apart, whatever the zoom; while the
 * camera travels the old grid fades out and the new one fades in.
 */
export function sampleDots(
  look: Look,
  cam: Camera,
  isLand: (lon: number, lat: number) => boolean,
  layers: GridLayer[] = [{ k: cam.k, alpha: 1 }],
): Dot[] {
  const out: Dot[] = [];
  for (const layer of layers) {
    if (layer.alpha > 0.01) sampleLayer(look, cam, isLand, layer, out);
  }
  return out;
}

function sampleLayer(look: Look, cam: Camera, isLand: (lon: number, lat: number) => boolean, layer: GridLayer, out: Dot[]) {
  const { sp, W, H } = look;
  const R = cam.k / deg;
  const dv0 = anchorDv(look, cam.ay);
  const worldYc = -merc(cam.lat) * R;
  // Grid step in degrees of longitude (= Mercator units in degrees). When the camera is zoomed
  // out far past the grid's zoom (mid-trip), keep every 2nd/4th… cell so it never gets too dense.
  let gLon = sp / layer.k;
  while (gLon * cam.k < sp * 0.6) gLon *= 2;
  const step = gLon * R * deg; // row spacing in sheet px
  const stepX = gLon * cam.k;
  const shift = cam.lon * cam.k;
  // Rows from just below the bottom edge up to the horizon.
  const jStart = Math.floor((sp * 3 - dv0 + worldYc) / step);
  for (let j = jStart; j > jStart - 4000; j--) {
    const worldY = j * step;
    const lat = invMerc(-worldY / R);
    if (lat > 86) break;
    if (lat < -80) continue;
    const dv = dv0 + worldY - worldYc;
    const row = projectSheet(look, dv, 0);
    if (row.y < -40) break;
    if (row.y > H + 10) continue;
    const s = row.s;
    const xMin = (-5 - W / 2) / s;
    const xMax = (W / 2 + 5) / s;
    const iStart = Math.ceil((xMin + shift) / stepX - 0.5);
    const iEnd = Math.floor((xMax + shift) / stepX - 0.5);
    for (let i = iStart; i <= iEnd; i++) {
      const worldX = (i + 0.5) * stepX;
      const lon = wrap(worldX / cam.k);
      if (!isLand(lon, lat)) continue;
      const p = projectSheet(look, dv, worldX - shift);
      const o = dotOpacity(look, p.x, p.y, s) * layer.alpha;
      if (o < 0.01) continue;
      const id = (Math.round(lon * 40) * 73856093) ^ (Math.round(lat * 40) * 19349663);
      out.push({ x: p.x, y: p.y, r: look.r * s, o, id });
    }
  }
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

/**
 * Camera framing one point (default zoom), or two points: centred between them (shorter way
 * round), zoomed out step by step until both land inside `look.box` on screen.
 */
export function frame(look: Look, a: GeoPoint, b?: GeoPoint): Camera {
  if (!b) return { lon: a.lon, lat: a.lat, k: look.kDefault, ay: look.anchorSingle };
  const lon = wrap(a.lon + wrap(b.lon - a.lon) / 2);
  const lat = invMerc((merc(a.lat) + merc(b.lat)) / 2);
  const { x0, x1, y0, y1 } = look.box;
  const mid = (y0 + y1) / 2;
  let cam: Camera = { lon, lat, k: look.kDefault, ay: look.anchorPair };
  for (let k = look.kDefault; k >= look.kMin; k *= 0.94) {
    cam = { lon, lat, k, ay: look.anchorPair };
    // Re-centre vertically: the tilt makes the midpoint drift.
    for (let n = 0; n < 2; n++) {
      const pa = project(look, cam, a.lat, a.lon);
      const pb = project(look, cam, b.lat, b.lon);
      cam = { ...cam, ay: cam.ay + mid - (pa.y + pb.y) / 2 };
    }
    const pa = project(look, cam, a.lat, a.lon);
    const pb = project(look, cam, b.lat, b.lon);
    const fits = [pa, pb].every((p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1);
    if (fits) return cam;
  }
  return cam;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Camera between `from` and `to` at progress t ∈ [0, 1]; zooms out a little on long trips. */
export function tween(look: Look, from: Camera, to: Camera, t: number): Camera {
  const e = easeInOut(t);
  const dLon = wrap(to.lon - from.lon);
  const my = merc(from.lat) + (merc(to.lat) - merc(from.lat)) * e;
  const travel = Math.hypot(dLon, (merc(to.lat) - merc(from.lat)) / deg) * Math.min(from.k, to.k);
  const bump = Math.min(0.45, travel / (look.W * 2));
  const logK = Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e;
  return {
    lon: wrap(from.lon + dLon * e),
    lat: invMerc(my),
    k: Math.exp(logK) * (1 - bump * Math.sin(Math.PI * e)),
    ay: from.ay + (to.ay - from.ay) * e,
  };
}
