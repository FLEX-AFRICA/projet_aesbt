import { DROITS_EDITEUR } from "@/components/droits/catalogue";
import type { BasculeEspace } from "@/components/espace";

/**
 * Lien vers l'autre espace : l'administration pour un administrateur, l'espace
 * éditeur (première section autorisée par ses droits) pour un éditeur qui en a
 * au moins un. Aucun lien pour les autres comptes.
 */
export function basculeVersAdministration(session: {
  role: string;
  droits: readonly string[];
}): BasculeEspace | null {
  if (session.role === "admin") {
    return { href: "/admin", libelle: "Administration", icone: "tableauDeBord" };
  }
  if (session.role === "editeur") {
    const droit = DROITS_EDITEUR.find((d) => session.droits.includes(d.cle));
    if (droit) return { href: droit.chemin, libelle: "Espace éditeur", icone: "editeur" };
  }
  return null;
}
