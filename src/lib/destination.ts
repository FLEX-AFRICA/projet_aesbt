/**
 * Où mène la connexion, selon le rôle.
 *
 * Une seule source de vérité : la page de connexion, le formulaire et les
 * écrans d'accès refusé en ont tous besoin, et trois réponses différentes
 * finiraient par diverger.
 */

/** Accueil de l'espace réservé correspondant au rôle. */
export function accueilSelonRole(role: string): string {
  return role === "admin" ? "/admin" : "/cellule";
}

/**
 * Destination après une connexion réussie.
 *
 * `suite` est le chemin demandé avant l'authentification, déjà validé comme
 * interne par la page de connexion. Il n'est honoré que si le rôle y a accès :
 * sans ce contrôle, un étudiant renvoyé vers `/admin` atterrirait sur un
 * « accès réservé » au lieu de son espace.
 */
export function destinationApresConnexion(role: string, suite: string | null): string {
  const defaut = accueilSelonRole(role);

  if (!suite) return defaut;
  if (suite.startsWith("/admin") && role !== "admin") return defaut;

  return suite;
}

/**
 * Chemin interne, ou null.
 *
 * Redirection ouverte : sans ce contrôle,
 * « /connexion?suite=https://site-malveillant » renverrait la personne
 * ailleurs juste après l'authentification. `//` est écarté car le navigateur
 * le lit comme une URL absolue sans schéma.
 */
export function cheminInterne(valeur: string | undefined): string | null {
  if (!valeur) return null;
  if (!valeur.startsWith("/")) return null;
  if (valeur.startsWith("//")) return null;

  return valeur;
}
