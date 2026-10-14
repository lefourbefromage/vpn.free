export interface SeoPage {
  id: string;
  path: string;
  file: string | null;
  title: string;
  description: string;
  og: { title: [string, string]; lead: string; chips: string[] };
}

export const SITE_URL: string;
export const SITE_NAME: string;
export const OG_LOCALES: string[];
export const PAGES: SeoPage[];
export const ogImageUrl: (page: SeoPage) => string;
export const OG_IMAGE: { width: number; height: number };
