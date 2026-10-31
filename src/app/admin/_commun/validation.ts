import type { z } from "zod";

/** Erreurs de champ, indexées par nom de champ. */
export type ErreursChamps = Partial<Record<string, string>>;

export type ResultatValidation<S extends z.ZodType> =
  { ok: true; donnees: z.output<S> } | { ok: false; erreurs: ErreursChamps };

/**
 * Valide des valeurs de formulaire avec un schéma zod aligné sur celui du
 * backend. Seule la première erreur de chaque champ est retenue.
 */
export function valider<S extends z.ZodType>(schema: S, valeurs: unknown): ResultatValidation<S> {
  const resultat = schema.safeParse(valeurs);
  if (resultat.success) return { ok: true, donnees: resultat.data };

  const erreurs: ErreursChamps = {};
  for (const probleme of resultat.error.issues) {
    const cle = String(probleme.path[0] ?? "formulaire");
    erreurs[cle] ??= probleme.message;
  }
  return { ok: false, erreurs };
}

/** Texte vide ou blanc devient null, comme attendu par les schémas `nullable` de l'API. */
export function nullSiVide(valeur: string): string | null {
  const net = valeur.trim();
  return net === "" ? null : net;
}

/** Adresse http ou https uniquement, comme l'exige la politique du site. */
export function estUrlHttp(valeur: string): boolean {
  try {
    const { protocol } = new URL(valeur);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
