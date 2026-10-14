import { HOLES, LAND } from '../../data/land';

/* Land lookup: the outlines are rasterised once into an equirectangular bitmap
   (0.175° per cell), so testing a point is a single array read. */

const MW = 2048;
const MH = 1024;
let mask: Uint8Array | null = null;

function build(): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = MW;
  canvas.height = MH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const toX = (lon: number) => ((lon + 180) / 360) * MW;
  const toY = (lat: number) => ((90 - lat) / 180) * MH;
  const trace = (ring: ReadonlyArray<readonly [number, number]>) => {
    ctx.beginPath();
    ring.forEach(([lon, lat], i) => (i ? ctx.lineTo(toX(lon), toY(lat)) : ctx.moveTo(toX(lon), toY(lat))));
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = '#fff';
  LAND.forEach(trace);
  ctx.globalCompositeOperation = 'destination-out';
  HOLES.forEach(trace);
  const data = ctx.getImageData(0, 0, MW, MH).data;
  const out = new Uint8Array(MW * MH);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3] > 127 ? 1 : 0;
  return out;
}

export function isLand(lon: number, lat: number): boolean {
  if (!mask) mask = build();
  const x = Math.min(MW - 1, Math.max(0, Math.floor(((lon + 180) / 360) * MW)));
  const y = Math.min(MH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MH)));
  return mask[y * MW + x] === 1;
}
