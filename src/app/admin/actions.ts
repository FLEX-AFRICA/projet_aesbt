"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { appelApi, ApiErreur } from "@/lib/api-admin";

/**
 * Actions d'administration.
 *
 * Elles s'exécutent sur le serveur Next, qui relaie vers l'API en
 * transmettant le cookie de session. Le navigateur n'appelle jamais l'API
 * directement pour ces opérations : l'origine reste maîtrisée et la logique
 * d'autorisation demeure côté backend.
 */

export interface Resultat {
  ok: boolean;
  message?: string;
}

async function executer(
  action: () => Promise<unknown>,
  cheminsARevalider: string[],
): Promise<Resultat> {
  try {
    await action();
    for (const chemin of cheminsARevalider) revalidatePath(chemin);
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiErreur) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Opération impossible. Réessayez." };
  }
}

// --- Comptes (F03) --------------------------------------------------------

export async function validerCompte(userId: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/comptes/${userId}/valider`, { methode: "POST", corps: {} }),
    ["/admin", "/admin/comptes"],
  );
}

export async function refuserCompte(userId: string, motif: string): Promise<Resultat> {
  if (motif.trim().length < 10) {
    return { ok: false, message: "Un motif d'au moins 10 caractères est exigé." };
  }
  return executer(
    () =>
      appelApi(`/api/v1/admin/comptes/${userId}/refuser`, {
        methode: "POST",
        corps: { motif: motif.trim() },
      }),
    ["/admin", "/admin/comptes"],
  );
}

/** Rôles attribuables depuis l'interface : jamais `admin` (voir le backend pour le reste). */
const ROLES_ATTRIBUABLES: readonly string[] = ["etudiant", "mentor", "editeur"];

export async function changerRole(userId: string, role: string): Promise<Resultat> {
  if (!ROLES_ATTRIBUABLES.includes(role)) {
    return { ok: false, message: "Ce rôle ne peut pas être attribué depuis cette interface." };
  }
  return executer(
    () => appelApi(`/api/v1/admin/comptes/${userId}/role`, { methode: "POST", corps: { role } }),
    ["/admin/comptes"],
  );
}

export async function changerStatutCompte(userId: string, statut: string): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/admin/comptes/${userId}/statut`, { methode: "POST", corps: { statut } }),
    ["/admin/comptes"],
  );
}

// --- Modération -----------------------------------------------------------

export async function publierContenu(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/publications/${id}/publier`, { methode: "POST", corps: {} }),
    ["/admin", "/admin/moderation", "/admin/publications", "/actualites"],
  );
}

export async function archiverContenu(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/publications/${id}/archiver`, { methode: "POST", corps: {} }),
    ["/admin/publications", "/actualites"],
  );
}

export async function validerRessource(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/ressources/${id}/publier`, { methode: "POST", corps: {} }),
    ["/admin", "/admin/moderation", "/ressources"],
  );
}

export async function rejeterRessource(id: string, motif: string): Promise<Resultat> {
  if (motif.trim().length < 10) {
    return { ok: false, message: "Un motif d'au moins 10 caractères est exigé." };
  }
  return executer(
    () =>
      appelApi(`/api/v1/admin/ressources/${id}/rejeter`, {
        methode: "POST",
        corps: { motif: motif.trim() },
      }),
    ["/admin", "/admin/moderation"],
  );
}

export async function traiterSignalement(id: string, statut: string): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/admin/signalements/${id}/traiter`, { methode: "POST", corps: { statut } }),
    ["/admin", "/admin/moderation"],
  );
}

export async function marquerMessage(id: string, statut: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/messages/${id}`, { methode: "PATCH", corps: { statut } }),
    ["/admin", "/admin/messages"],
  );
}

// --- Rédaction ------------------------------------------------------------

export interface ChampsPublication {
  type: string;
  titre: string;
  chapeau: string | null;
  corps: string | null;
  categorie: string | null;
  couverture_id: string | null;
  universite_id: string | null;
  source_url: string | null;
  publier: boolean;
  planifie_le: string | null;
}

export interface ResultatCreation extends Resultat {
  id?: string;
}

export async function creerPublication(champs: ChampsPublication): Promise<ResultatCreation> {
  try {
    const { id } = await appelApi<{ id: string }>("/api/v1/admin/publications", {
      methode: "POST",
      corps: champs,
    });

    revalidatePath("/admin/publications");
    revalidatePath("/actualites");
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof ApiErreur ? err.message : "Création impossible.",
    };
  }
}

export async function modifierPublication(
  id: string,
  champs: Partial<Omit<ChampsPublication, "type" | "publier">>,
): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/publications/${id}`, { methode: "PATCH", corps: champs }),
    ["/admin/publications", `/admin/publications/${id}`, "/actualites"],
  );
}

export async function programmerPublication(id: string, quand: string): Promise<Resultat> {
  return executer(
    () =>
      appelApi(`/api/v1/admin/publications/${id}/publier`, {
        methode: "POST",
        corps: { planifie_le: quand },
      }),
    ["/admin/publications", `/admin/publications/${id}`],
  );
}

// --- Médias ---------------------------------------------------------------

/**
 * Téléversement d'un média.
 *
 * Le fichier passe par le serveur Next, qui le relaie à l'API. Le navigateur
 * n'appelle donc jamais l'API directement, et l'origine reste maîtrisée.
 */
export async function televerserMedia(formulaire: FormData): Promise<ResultatCreation> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) return { ok: false, message: "L'API n'est pas configurée." };

  const fichier = formulaire.get("fichier");
  const alt = String(formulaire.get("alt") ?? "").trim();

  if (!(fichier instanceof File) || fichier.size === 0) {
    return { ok: false, message: "Aucun fichier sélectionné." };
  }
  if (alt.length < 3) {
    return {
      ok: false,
      message: "Décrivez l'image en quelques mots : c'est ce que lisent les personnes malvoyantes.",
    };
  }

  const relais = new FormData();
  // L'ordre n'a pas d'importance : l'API parcourt explicitement les parties.
  relais.append("alt", alt);
  relais.append("fichier", fichier, fichier.name);

  try {
    const jar = await cookies();
    const reponse = await fetch(`${base}/api/v1/admin/medias`, {
      method: "POST",
      headers: {
        cookie: jar
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
        origin: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      },
      body: relais,
    });

    const corps = (await reponse.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!reponse.ok) {
      return { ok: false, message: corps.message ?? "Téléversement refusé." };
    }

    revalidatePath("/admin/galerie");
    return { ok: true, ...(corps.id ? { id: corps.id } : {}) };
  } catch {
    return { ok: false, message: "Service injoignable. Réessayez plus tard." };
  }
}

export async function supprimerMedia(id: string): Promise<Resultat> {
  return executer(
    () => appelApi(`/api/v1/admin/medias/${id}`, { methode: "DELETE" }),
    ["/admin/galerie"],
  );
}

export async function corrigerAlt(id: string, alt: string): Promise<Resultat> {
  if (alt.trim().length < 3) {
    return { ok: false, message: "Le texte alternatif doit faire au moins 3 caractères." };
  }
  return executer(
    () => appelApi(`/api/v1/admin/medias/${id}`, { methode: "PATCH", corps: { alt: alt.trim() } }),
    ["/admin/galerie"],
  );
}

// --- Paramètres -----------------------------------------------------------

export async function enregistrerParametres(
  valeurs: Record<string, string | null>,
): Promise<Resultat> {
  return executer(
    () => appelApi("/api/v1/admin/parametres", { methode: "PUT", corps: valeurs }),
    ["/admin/parametres", "/contact", "/"],
  );
}
