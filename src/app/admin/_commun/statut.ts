import type { StatutContenu } from "../_kit";

/** Statut inconnu de l'interface : repli sur brouillon plutôt qu'un badge vide. */
export function statutAffichable(statut: string): StatutContenu {
  return statut === "publie" || statut === "archive" || statut === "en_attente"
    ? statut
    : "brouillon";
}
