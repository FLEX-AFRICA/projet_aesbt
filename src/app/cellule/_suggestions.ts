import { appelApi } from "@/lib/api-admin";

/** Champs acceptés par GET /api/v1/suggestions (liste blanche de l'API, côté membre). */
export type ChampSuggestionMembre =
  "filiere" | "domaine" | "universite" | "ville" | "categorie";

/**
 * Valeurs déjà en base pour les champs de saisie répétitive de la cellule.
 * À appeler depuis une page serveur. Jamais bloquant : si l'API échoue, chaque
 * champ reçoit une liste vide et la saisie libre continue de fonctionner.
 */
export async function chargerSuggestionsMembre<const C extends ChampSuggestionMembre>(
  champs: readonly C[],
): Promise<Record<C, string[]>> {
  let recues: Record<string, string[]> = {};
  try {
    const r = await appelApi<{ suggestions: Record<string, string[]> }>(
      `/api/v1/suggestions?champ=${encodeURIComponent(champs.join(","))}`,
    );
    recues = r.suggestions;
  } catch {
    // Repli volontaire : voir la description ci-dessus.
  }
  const resultat = {} as Record<C, string[]>;
  for (const champ of champs) resultat[champ] = recues[champ] ?? [];
  return resultat;
}
