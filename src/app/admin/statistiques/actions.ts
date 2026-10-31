"use server";

import { appelApi } from "@/lib/api-admin";

import type { Resultat } from "../actions";
import { executer } from "../_commun/serveur";

/** Actions d'administration des chiffres clés (route PATCH /api/v1/admin/statistiques/:cle). */

export async function modifierStatistique(
  cle: string,
  champs: { valeur?: string | null; libelle?: string },
): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/admin/statistiques/${encodeURIComponent(cle)}`, {
        methode: "PATCH",
        corps: champs,
      }),
    ["/admin/statistiques", "/", "/association"],
  );
}
