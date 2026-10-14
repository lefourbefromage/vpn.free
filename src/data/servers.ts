export type Region = 'Europe' | 'Americas';

export type MapSize = 'desktop' | 'mobile';

export interface Server {
  id: string;
  city: string;
  country: string;
  region: Region;
  /** Short server name shown in technical spots (loading, promises card). */
  node: string;
  lat: number;
  lon: number;
}

export const SERVERS: readonly Server[] = [
  {
    id: 'paris',
    city: 'Paris',
    country: 'FR',
    region: 'Europe',
    node: 'PAR-03',
    lat: 48.86,
    lon: 2.35,
  },
  {
    id: 'frankfurt',
    city: 'Frankfurt',
    country: 'DE',
    region: 'Europe',
    node: 'FRA-01',
    lat: 50.11,
    lon: 8.68,
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    country: 'NL',
    region: 'Europe',
    node: 'AMS-02',
    lat: 52.37,
    lon: 4.9,
  },
  {
    id: 'london',
    city: 'London',
    country: 'GB',
    region: 'Europe',
    node: 'LON-02',
    lat: 51.51,
    lon: -0.13,
  },
  {
    id: 'madrid',
    city: 'Madrid',
    country: 'ES',
    region: 'Europe',
    node: 'MAD-01',
    lat: 40.42,
    lon: -3.7,
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'US',
    region: 'Americas',
    node: 'NYC-01',
    lat: 40.71,
    lon: -74.0,
  },
  {
    id: 'toronto',
    city: 'Toronto',
    country: 'CA',
    region: 'Americas',
    node: 'YYZ-01',
    lat: 43.65,
    lon: -79.38,
  },
  {
    id: 'sao-paulo',
    city: 'São Paulo',
    country: 'BR',
    region: 'Americas',
    node: 'GRU-01',
    lat: -23.55,
    lon: -46.63,
  },
];

/** Where the free "Automatic" mode lands for this (fictional) visitor. */
export const AUTO_SERVER_ID = 'paris';

export interface Visitor {
  id: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

/** Approximate visitor locations, as detected from the IP (fictional; switchable in the prototype overlay). */
export const VISITORS: readonly Visitor[] = [
  { id: 'marseille', city: 'Marseille', country: 'FR', lat: 43.3, lon: 5.37 },
  { id: 'berlin', city: 'Berlin', country: 'DE', lat: 52.52, lon: 13.4 },
  { id: 'montreal', city: 'Montréal', country: 'CA', lat: 45.5, lon: -73.57 },
  { id: 'lagos', city: 'Lagos', country: 'NG', lat: 6.52, lon: 3.38 },
  { id: 'mumbai', city: 'Mumbai', country: 'IN', lat: 19.08, lon: 72.88 },
  { id: 'tokyo', city: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.69 },
  { id: 'sydney', city: 'Sydney', country: 'AU', lat: -33.87, lon: 151.21 },
  { id: 'auckland', city: 'Auckland', country: 'NZ', lat: -36.85, lon: 174.76 },
];

export const getVisitor = (id: string | undefined) => VISITORS.find((v) => v.id === id) ?? VISITORS[0];

export function getServer(id: string | null | undefined): Server | undefined {
  return SERVERS.find((s) => s.id === id);
}

export const autoServer = getServer(AUTO_SERVER_ID)!;

export const REGIONS: readonly Region[] = ['Europe', 'Americas'];
