import { ApiErreur, appelApi } from "./api-admin";

/**
 * Appels d'administration des pôles de la Cellule Scientifique et recherche de
 * comptes (routes /api/v1/admin/poles et /api/v1/admin/comptes/recherche).
 * Construit sur `appelApi` : lecture et écriture côté serveur uniquement.
 */

const BASE = "/api/v1/admin/poles";

export interface PoleResume {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  /** Clé d'icône ; absente de la réponse : repli sur sciences. */
  icone?: string | null;
  ordre: number;
  actif: boolean;
  nb_membres: number;
  nb_en_attente: number;
}

/** Adhésion à un pôle (membre ou demande), avec les informations du compte. */
export interface AdhesionPole {
  adhesion_id: string;
  user_id: string;
  statut: string;
  /** "demande" (le compte a postulé) ou "admin" (ajouté par un administrateur). */
  origine: string;
  message: string | null;
  demande_le: string | null;
  traite_le: string | null;
  nom: string | null;
  email: string | null;
  filiere_nom: string | null;
}

export interface DetailPole {
  pole: PoleResume;
  membres: AdhesionPole[];
  demandes: AdhesionPole[];
}

/** Demande en attente, tous pôles confondus. */
export interface DemandePole {
  id: string;
  pole_id: string;
  user_id: string;
  message: string | null;
  demande_le: string | null;
  pole_nom: string;
  nom: string | null;
  email: string | null;
  filiere_nom: string | null;
}

export interface CompteRecherche {
  id: string;
  nom: string | null;
  email: string | null;
  role: string;
  filiere: string | null;
  /** Date d'inscription (ISO), absente selon la version de l'API. */
  inscrit_le?: string | null;
}

export interface IconePole {
  cle: string;
  libelle: string;
}

export interface ChampsPole {
  nom: string;
  description?: string | null;
  icone?: string;
  ordre?: number;
  actif?: boolean;
}

export async function listerPoles(): Promise<PoleResume[]> {
  return (await appelApi<{ poles: PoleResume[] }>(BASE)).poles;
}

export async function listerIconesPoles(): Promise<IconePole[]> {
  return (await appelApi<{ icones: IconePole[] }>(`${BASE}/icones`)).icones;
}

export async function lireDetailPole(id: string): Promise<DetailPole> {
  return appelApi<DetailPole>(`${BASE}/${encodeURIComponent(id)}`);
}

export async function listerDemandesPoles(): Promise<DemandePole[]> {
  return (await appelApi<{ demandes: DemandePole[] }>(`${BASE}/demandes`)).demandes;
}

export async function creerPoleApi(champs: ChampsPole): Promise<{ id: string; slug: string }> {
  return appelApi(BASE, { methode: "POST", corps: champs });
}

export async function modifierPoleApi(id: string, champs: Partial<ChampsPole>): Promise<void> {
  await appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "PATCH", corps: champs });
}

export async function supprimerPoleApi(id: string): Promise<void> {
  await appelApi(`${BASE}/${encodeURIComponent(id)}`, { methode: "DELETE" });
}

export async function ajouterMembrePoleApi(poleId: string, userId: string): Promise<void> {
  await appelApi(`${BASE}/${encodeURIComponent(poleId)}/membres`, {
    methode: "POST",
    corps: { user_id: userId },
  });
}

export async function retirerMembrePoleApi(poleId: string, userId: string): Promise<void> {
  await appelApi(`${BASE}/${encodeURIComponent(poleId)}/membres/${encodeURIComponent(userId)}`, {
    methode: "DELETE",
  });
}

export async function validerDemandeApi(demandeId: string): Promise<void> {
  await appelApi(`${BASE}/demandes/${encodeURIComponent(demandeId)}/valider`, {
    methode: "POST",
    corps: {},
  });
}

export async function refuserDemandeApi(demandeId: string, motif: string): Promise<void> {
  await appelApi(`${BASE}/demandes/${encodeURIComponent(demandeId)}/refuser`, {
    methode: "POST",
    corps: { motif },
  });
}

/**
 * Recherche de comptes validés (20 résultats au plus). Sans `q` (vide), l'API
 * renvoie les comptes les plus récemment inscrits ; avec `q`, 2 à 80 caractères.
 */
export async function rechercherComptesApi(
  q: string,
  chemin = "/api/v1/admin/comptes/recherche",
): Promise<CompteRecherche[]> {
  const url = q ? `${chemin}?q=${encodeURIComponent(q)}` : chemin;
  return (await appelApi<{ comptes: CompteRecherche[] }>(url)).comptes;
}

/** Messages français précis selon le code d'erreur de l'API. */
const MESSAGES_CODES: Record<string, string> = {
  pole_non_vide:
    "Ce pôle a encore des membres ou des demandes en attente : il ne peut pas être supprimé. Désactivez-le plutôt.",
  deja_membre: "Cette personne est déjà membre de ce pôle.",
  compte_non_valide: "Ce compte n'est pas validé : il ne peut pas rejoindre un pôle.",
  pole_inactif: "Ce pôle est désactivé : réactivez-le avant d'y ajouter des membres.",
  compte_introuvable: "Ce compte est introuvable. Il a peut-être été supprimé.",
};

export function messageErreurPole(
  err: unknown,
  repli = "Opération impossible. Réessayez.",
): string {
  if (!(err instanceof ApiErreur)) return repli;
  const connu = MESSAGES_CODES[err.code];
  if (connu) return connu;
  if (err.statut === 404) return "Élément introuvable. Actualisez la page.";
  if (err.statut === 400) return "Les données envoyées ont été refusées par le serveur.";
  return err.message || repli;
}
