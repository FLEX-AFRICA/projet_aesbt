import { appelApi } from "@/lib/api-admin";

/** Résultat d'un chargement isolé : un échec reste local à sa carte. */
export type Chargement<T> = { ok: true; donnees: T } | { ok: false };

/** Appelle l'API sans jamais lever : l'échec est rendu par la carte concernée. */
export async function charger<T>(chemin: string): Promise<Chargement<T>> {
  try {
    return { ok: true, donnees: await appelApi<T>(chemin) };
  } catch {
    return { ok: false };
  }
}
