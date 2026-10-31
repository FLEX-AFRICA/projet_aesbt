/** Conversions entre les champs HTML de date et les formats de l'API. */

/** ISO UTC (API) vers la valeur d'un `datetime-local` (heure locale du navigateur). */
export function isoVersLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const decale = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return decale.toISOString().slice(0, 16);
}

/** Valeur d'un `datetime-local` vers ISO UTC, ou null si vide ou invalide. */
export function localVersIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Date et heure lisibles en français, ou texte de repli. */
export function dateHeure(iso: string | null | undefined, repli = "À confirmer"): string {
  if (!iso) return repli;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return repli;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
