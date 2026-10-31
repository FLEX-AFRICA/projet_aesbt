/**
 * Valide un chemin de redirection : il doit rester sur le site.
 *
 * Refusés : valeur absente, ne commençant pas par `/`, commençant par `//`
 * ou `/\` (URL relative au protocole, interprétée par les navigateurs comme un
 * autre domaine), contenant un schéma (`:` avant le premier `/` ou `?`), un
 * antislash ou un caractère de contrôle. Le repli est alors `repli`.
 */
export function cheminInterne(valeur: string | null | undefined, repli: string): string {
  if (!valeur || !valeur.startsWith("/")) return repli;
  if (valeur.startsWith("//") || valeur.includes("\\")) return repli;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(valeur)) return repli;
  const finChemin = valeur.search(/[?#]/);
  const chemin = finChemin === -1 ? valeur : valeur.slice(0, finChemin);
  if (chemin.includes(":")) return repli;
  return valeur;
}
