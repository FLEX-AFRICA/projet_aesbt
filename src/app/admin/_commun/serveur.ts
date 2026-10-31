import { revalidatePath } from "next/cache";

import { ApiErreur, appelApi, sessionCourante } from "@/lib/api-admin";

import type { Resultat, ResultatCreation } from "../actions";

/**
 * Aides serveur communes aux écrans standards (albums, événements, membres,
 * documents, statistiques, ressources). Les fichiers `actions.ts` de chaque
 * section s'appuient dessus pour ne pas répéter la gestion d'erreur.
 */

/** Message lisible pour une erreur d'API, détails de validation compris. */
export function messageErreur(err: unknown, repli = "Opération impossible. Réessayez."): string {
  if (!(err instanceof ApiErreur)) return repli;

  const details = err.corps["details"];
  if (Array.isArray(details) && details.length > 0) {
    const premier = details[0] as { message?: unknown };
    if (typeof premier?.message === "string") {
      return `Données refusées par le serveur : ${premier.message}`;
    }
  }
  if (err.code === "requete_invalide")
    return "Les données envoyées ont été refusées par le serveur.";
  return err.message;
}

/** Exécute une écriture, puis régénère les chemins d'administration listés. */
export async function executer(
  action: () => Promise<unknown>,
  chemins: readonly string[],
): Promise<Resultat> {
  try {
    await action();
    for (const chemin of chemins) revalidatePath(chemin);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: messageErreur(err) };
  }
}

/** Crée un enregistrement (POST) et renvoie son identifiant. */
export async function creer(
  chemin: string,
  corps: unknown,
  chemins: readonly string[],
): Promise<ResultatCreation> {
  try {
    const { id } = await appelApi<{ id: string }>(chemin, { methode: "POST", corps });
    for (const c of chemins) revalidatePath(c);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, message: messageErreur(err, "Création impossible. Réessayez.") };
  }
}

/** Résultat d'un chargement : l'erreur est rendue visible, jamais convertie en liste vide. */
export interface Chargement<T> {
  donnees: T | null;
  erreur: string | null;
}

export async function charger<T>(chemin: string): Promise<Chargement<T>> {
  try {
    return { donnees: await appelApi<T>(chemin), erreur: null };
  } catch (err) {
    return {
      donnees: null,
      erreur: messageErreur(err, "Les données n'ont pas pu être chargées."),
    };
  }
}

/** Vrai si la session est celle d'un administrateur (seul rôle autorisé à publier). */
export async function estAdministrateur(): Promise<boolean> {
  const session = await sessionCourante();
  return session?.role === "admin";
}

const ROUTE_STATUT = { publie: "publier", archive: "archiver", brouillon: "depublier" } as const;

/**
 * Changement de statut d'un contenu des routes `/publier`, `/archiver` et
 * `/depublier` (albums, événements).
 */
export async function changerStatut(
  base: string,
  id: string,
  cible: keyof typeof ROUTE_STATUT,
  chemins: readonly string[],
): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`${base}/${encodeURIComponent(id)}/${ROUTE_STATUT[cible]}`, {
        methode: "POST",
        corps: {},
      }),
    chemins,
  );
}
