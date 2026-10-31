/**
 * Contrôle de l'origine d'une requête à effet de bord.
 *
 * Les routes `/api/brouillon/*` posent ou retirent un cookie en réponse à un
 * GET. Pour qu'un site tiers ne puisse pas les déclencher (image, lien, iframe
 * ou navigation depuis un autre site), on refuse les requêtes que le
 * navigateur déclare `cross-site` via l'en-tête `Sec-Fetch-Site`.
 *
 * Acceptés : `same-origin`, `same-site`, `none` (saisie directe, favori) et
 * toute valeur absente (anciens navigateurs qui n'envoient pas l'en-tête).
 */
export function origineAutorisee(secFetchSite: string | null | undefined): boolean {
  if (!secFetchSite) return true;
  return secFetchSite.trim().toLowerCase() !== "cross-site";
}
