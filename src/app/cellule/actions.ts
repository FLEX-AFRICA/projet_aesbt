"use server";

import { revalidatePath } from "next/cache";

import { appelApi, ApiErreur } from "@/lib/api-admin";

/**
 * Actions de l'espace membre.
 *
 * Comme pour l'administration, elles passent par le serveur Next qui relaie
 * à l'API avec le cookie de session. Les autorisations restent décidées
 * côté backend : ces fonctions ne font que transmettre.
 */

export interface Resultat {
  ok: boolean;
  message?: string;
}

async function executer(action: () => Promise<unknown>, chemins: string[]): Promise<Resultat> {
  try {
    await action();
    for (const chemin of chemins) revalidatePath(chemin);
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiErreur) return { ok: false, message: err.message };
    return { ok: false, message: "Opération impossible. Réessayez." };
  }
}

// --- Mentorat -------------------------------------------------------------

export async function demanderMentorat(mentorId: string, message: string): Promise<Resultat> {
  if (message.trim().length < 20) {
    return {
      ok: false,
      message: "Présentez-vous en quelques phrases : au moins 20 caractères.",
    };
  }

  return executer(
    () =>
      appelApi("/api/v1/mentorat/demandes", {
        methode: "POST",
        corps: { mentor_id: mentorId, message: message.trim() },
      }),
    ["/cellule", "/cellule/mentors", "/cellule/mentorat"],
  );
}

export async function accepterDemande(id: string, message: string): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/mentorat/demandes/${id}/accepter`, {
        methode: "POST",
        corps: message.trim() ? { message: message.trim() } : {},
      }),
    ["/cellule", "/cellule/mentorat"],
  );
}

export async function refuserDemande(id: string, message: string): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/mentorat/demandes/${id}/refuser`, {
        methode: "POST",
        corps: message.trim() ? { message: message.trim() } : {},
      }),
    ["/cellule", "/cellule/mentorat"],
  );
}

export async function annulerDemande(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/mentorat/demandes/${id}/annuler`, { methode: "POST", corps: {} }),
    ["/cellule", "/cellule/mentorat"],
  );
}

export async function terminerRelation(id: string, motif: string): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/mentorat/relations/${id}/terminer`, {
        methode: "POST",
        corps: { statut: "terminee", ...(motif.trim() ? { motif: motif.trim() } : {}) },
      }),
    ["/cellule", "/cellule/mentorat"],
  );
}

export async function signaler(
  cibleType: string,
  cibleId: string,
  motif: string,
  description: string,
): Promise<Resultat> {
  if (motif.trim().length < 3) {
    return { ok: false, message: "Indiquez un motif." };
  }

  return executer(
    () =>
      appelApi("/api/v1/signalements", {
        methode: "POST",
        corps: {
          cible_type: cibleType,
          cible_id: cibleId,
          motif: motif.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
        },
      }),
    ["/cellule/mentorat"],
  );
}

// --- Profil (F04) ---------------------------------------------------------

export interface ChampsProfil {
  filiere_id: string | null;
  universite_id: string | null;
  niveau_id: string | null;
  annee_arrivee: number | null;
  bio: string | null;
  centres_interet: string | null;
  telephone: string | null;
  whatsapp: string | null;
}

export async function enregistrerProfil(champs: ChampsProfil): Promise<Resultat> {
  return executer(
    () => appelApi("/api/v1/me", { methode: "PATCH", corps: champs }),
    ["/cellule", "/cellule/profil", "/cellule/mentors"],
  );
}

export async function enregistrerReglagesMentor(champs: {
  presentation: string | null;
  capacite_max: number;
  disponible: boolean;
}): Promise<Resultat> {
  return executer(
    () => appelApi("/api/v1/me/mentor", { methode: "PATCH", corps: champs }),
    ["/cellule", "/cellule/profil", "/cellule/mentors"],
  );
}

// --- Ressources -----------------------------------------------------------

export async function proposerRessource(champs: {
  titre: string;
  description: string;
  url: string;
  filiere_id: string | null;
  niveau_id: string | null;
  categorie: string | null;
}): Promise<Resultat> {
  return executer(
    () => appelApi("/api/v1/ressources/propositions", { methode: "POST", corps: champs }),
    ["/cellule/ressources"],
  );
}

export async function retirerProposition(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/ressources/propositions/${id}`, { methode: "DELETE" }),
    ["/cellule/ressources"],
  );
}
