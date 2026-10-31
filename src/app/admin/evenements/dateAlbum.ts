import { isoVersLocal } from "../_commun/dates";

/** Date AAAA-MM-JJ locale d'un instant ISO, ou d'aujourd'hui à défaut. */
export function dateAlbumDepuis(local: string): string {
  if (local) return local.slice(0, 10);
  return isoVersLocal(new Date().toISOString()).slice(0, 10);
}
