/**
 * Utilitaires de référencement.
 *
 * L'URL de base conditionne la résolution des balises Open Graph et des URL
 * canoniques. En production, renseigner NEXT_PUBLIC_SITE_URL sur Vercel.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
