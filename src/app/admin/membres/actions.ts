"use server";

import { revalidatePath } from "next/cache";

import { ApiErreur, appelApi } from "@/lib/api-admin";
import { rechercherComptesApi } from "@/lib/api-admin-poles";

import type { Resultat, ResultatCreation } from "../actions";
import { estAdministrateur, messageErreur } from "../_commun/serveur";
import type { ResultatRechercheComptes } from "../poles/actions";

/** Actions d'administration du bureau et des cellules (routes /api/v1/admin/membres). */

const BASE = "/api/v1/admin/membres";
const CHEMINS = ["/admin/membres", "/association", "/cellule"] as const;

export type EntiteMembre = "bureau" | "cellule";

/** Membre sans compte (cellule, ou ancien membre du bureau). */
export interface ChampsMembre {
  entite: EntiteMembre;
  nom: string | null;
  role: string;
  photo_id: string | null;
  ordre?: number;
  mandat_debut: string | null;
  mandat_fin: string | null;
  actif: boolean;
  /** Rattache un ancien membre à un compte (une seule fois). */
  user_id?: string;
}

/** Membre du bureau créé depuis un compte : nom et photo viennent du compte. */
export interface ChampsMembreCompte {
  entite: "bureau";
  user_id: string;
  role: string;
  ordre?: number;
  mandat_debut: string | null;
  mandat_fin: string | null;
  actif: boolean;
}

/** Seuls champs modifiables d'un membre lié à un compte. */
export interface ChampsMembreLie {
  role: string;
  mandat_debut: string | null;
  mandat_fin: string | null;
  actif: boolean;
}

/** Messages français précis selon le code d'erreur de l'API. */
function messageMembre(err: unknown, repli: string): string {
  if (err instanceof ApiErreur) {
    switch (err.code) {
      case "compte_introuvable":
        return "Ce compte est introuvable. Il a peut-être été supprimé.";
      case "compte_non_valide":
        return "Ce compte n'est pas validé : il ne peut pas devenir membre du bureau.";
      case "deja_membre_bureau":
        return "Cette personne est déjà membre du bureau.";
      case "champs_non_modifiables": {
        const champs = err.corps["champs"];
        const liste = Array.isArray(champs) ? champs.map(String).join(", ") : "";
        return `Ces informations viennent du compte de la personne et ne sont pas modifiables ici${
          liste ? ` (${liste})` : ""
        }.`;
      }
    }
  }
  return messageErreur(err, repli);
}

async function executer(action: () => Promise<unknown>, repli: string): Promise<Resultat> {
  try {
    await action();
    for (const chemin of CHEMINS) revalidatePath(chemin);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: messageMembre(err, repli) };
  }
}

export async function creerMembre(
  champs: ChampsMembre | ChampsMembreCompte,
): Promise<ResultatCreation> {
  try {
    const { id } = await appelApi<{ id: string }>(BASE, { methode: "POST", corps: champs });
    for (const chemin of CHEMINS) revalidatePath(chemin);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, message: messageMembre(err, "Création impossible. Réessayez.") };
  }
}

export async function modifierMembre(
  id: string,
  champs: ChampsMembre | ChampsMembreLie,
): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs }),
    "La modification a échoué. Réessayez.",
  );
}

export async function supprimerMembre(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "DELETE" }),
    "La suppression a échoué. Réessayez.",
  );
}

/**
 * Réordonnancement : l'API n'a pas de route dédiée, on met à jour le champ
 * `ordre` des seuls membres déplacés. Les écritures sont séquentielles et
 * s'arrêtent à la première erreur.
 */
export async function reordonnerMembres(
  ordres: { id: string; ordre: number }[],
): Promise<Resultat> {
  return executer(async () => {
    for (const { id, ordre } of ordres) {
      await appelApi(`${BASE}/${encodeURIComponent(id)}`, {
        methode: "PATCH",
        corps: { ordre },
      });
    }
  }, "Le réordonnancement a échoué.");
}

/**
 * Recherche de comptes validés pour un membre du bureau. Un administrateur
 * utilise la recherche complète (e-mail inclus) ; un éditeur, la route dédiée
 * qui masque l'e-mail.
 */
export async function rechercherComptesMembres(q: string): Promise<ResultatRechercheComptes> {
  const net = q.trim();
  // Requête vide : les comptes récents. Un seul caractère : rien à chercher.
  if (net.length === 1) return { ok: true, comptes: [] };
  try {
    const chemin = (await estAdministrateur())
      ? "/api/v1/admin/comptes/recherche"
      : `${BASE}/comptes-recherche`;
    return { ok: true, comptes: await rechercherComptesApi(net.slice(0, 80), chemin) };
  } catch (err) {
    return {
      ok: false,
      comptes: [],
      message: messageErreur(err, "La recherche a échoué. Réessayez."),
    };
  }
}
