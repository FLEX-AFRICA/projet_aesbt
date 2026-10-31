import { lireSuggestions, type ChampSuggestion } from "@/lib/api-admin";

/** Suggestions par champ : `{ role: ["Président", ...], filiere: [...] }`. */
export type Suggestions<C extends ChampSuggestion = ChampSuggestion> = Record<C, string[]>;

/**
 * À appeler depuis une page serveur, puis à passer en props aux tiroirs de
 * formulaire (`<ChampSuggere suggestions={suggestions.role} />`).
 *
 * Les suggestions ne sont jamais bloquantes : si l'API échoue, chaque champ
 * reçoit une liste vide et la saisie libre continue de fonctionner.
 *
 * ```ts
 * const suggestions = await chargerSuggestions(["role"]);
 * ```
 */
export async function chargerSuggestions<const C extends ChampSuggestion>(
  champs: readonly C[],
): Promise<Suggestions<C>> {
  let recues: Record<string, string[]> = {};
  try {
    recues = await lireSuggestions(champs);
  } catch {
    // Repli volontaire : voir la description ci-dessus.
  }
  const resultat = {} as Suggestions<C>;
  for (const champ of champs) resultat[champ] = recues[champ] ?? [];
  return resultat;
}
