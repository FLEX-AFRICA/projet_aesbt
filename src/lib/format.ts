/** Formatage de date en français, tolérant aux valeurs manquantes. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Date à confirmer";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
