/**
 * Adresse de l'API vue depuis le navigateur.
 *
 * `NEXT_PUBLIC_API_URL` vaut `http://localhost:4000` en développement, ce qui
 * ne veut rien dire pour un téléphone du réseau local : « localhost » y
 * désigne le téléphone lui-même. L'hôte est donc repris de la page en cours,
 * et seul le port est conservé.
 *
 * Ce n'est pas qu'un confort d'affichage : le cookie de session est déposé
 * par l'API sur son propre hôte. Appeler l'API par l'IP du Mac depuis une
 * page servie sur « localhost » déposerait le cookie sur un hôte que le
 * serveur Next ne verrait jamais, et la session paraîtrait vide.
 *
 * En production, l'API est sur un autre domaine (api.aesbt.org) : la valeur
 * configurée est alors la bonne et rien n'est réécrit.
 */

const CONFIGUREE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const HOTES_LOCAUX = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function baseApi(): string {
  if (!CONFIGUREE) return "";

  // Rendu serveur : il n'y a pas de page en cours, et « localhost » est
  // exactement ce qu'il faut pour un appel du Mac vers lui-même.
  if (typeof window === "undefined") return CONFIGUREE;

  let configuree: URL;
  try {
    configuree = new URL(CONFIGUREE);
  } catch {
    return CONFIGUREE;
  }

  if (!HOTES_LOCAUX.has(configuree.hostname)) return CONFIGUREE;
  if (HOTES_LOCAUX.has(window.location.hostname)) return CONFIGUREE;

  configuree.hostname = window.location.hostname;
  return configuree.origin;
}
