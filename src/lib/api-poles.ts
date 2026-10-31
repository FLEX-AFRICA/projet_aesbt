import { appelApi } from "@/lib/api-admin";

/**
 * Lectures et écritures des notifications et des pôles côté membre.
 * Serveur uniquement : tout passe par `appelApi`, qui relaie le cookie de session.
 */

export type TypeNotification =
  | "bureau_ajout"
  | "bureau_retrait"
  | "bureau_modification"
  | "pole_ajout"
  | "pole_retrait"
  | "pole_demande_recue"
  | "pole_demande_validee"
  | "pole_demande_refusee"
  | "editeur_nomme"
  | "editeur_retire"
  | "editeur_droits_modifies"
  | "inscription_validee"
  | "inscription_refusee";

export interface Notification {
  id: string;
  type: TypeNotification | string;
  titre: string;
  message: string;
  lien: string | null;
  lu_le: string | null;
  created_at: string;
  lue: boolean;
}

export interface PageNotifications {
  notifications: Notification[];
  non_lues: number;
  total: number;
  page: number;
  taille: number;
}

export type StatutPole = "en_attente" | "valide" | "refuse";

export interface Pole {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  /** Clé d'icône (batiment, industriel, sante, economie, data, sciences) ; absente : sciences. */
  icone?: string | null;
  nb_membres: number;
  mon_statut: StatutPole | null;
  mon_motif_refus: string | null;
}

export interface ListePoles {
  poles: Pole[];
  demandes_en_attente: number;
  max_demandes_en_attente: number;
}

export function lireNotifications(
  page: number,
  taille: number,
  seulementNonLues: boolean,
): Promise<PageNotifications> {
  const q = new URLSearchParams({ page: String(page), taille: String(taille) });
  if (seulementNonLues) q.set("non_lues", "1");
  return appelApi<PageNotifications>(`/api/v1/me/notifications?${q}`);
}

export async function lireCompteurNotifications(): Promise<number> {
  const r = await appelApi<{ non_lues: number }>("/api/v1/me/notifications/compteur");
  return r.non_lues;
}

export function marquerNotificationLue(id: string): Promise<{ lue: boolean; non_lues: number }> {
  return appelApi(`/api/v1/me/notifications/${encodeURIComponent(id)}/lue`, {
    methode: "POST",
    corps: {},
  });
}

export function marquerToutesLues(): Promise<unknown> {
  return appelApi("/api/v1/me/notifications/toutes-lues", { methode: "POST", corps: {} });
}

export function supprimerNotification(id: string): Promise<unknown> {
  return appelApi(`/api/v1/me/notifications/${encodeURIComponent(id)}`, { methode: "DELETE" });
}

export function lirePoles(): Promise<ListePoles> {
  return appelApi<ListePoles>("/api/v1/poles");
}

export async function lireMembresPole(id: string): Promise<string[]> {
  const r = await appelApi<{ membres: { nom: string }[] }>(
    `/api/v1/poles/${encodeURIComponent(id)}/membres`,
  );
  return r.membres.map((m) => m.nom);
}

export function demanderPole(id: string, message: string): Promise<unknown> {
  return appelApi(`/api/v1/poles/${encodeURIComponent(id)}/demande`, {
    methode: "POST",
    corps: message.trim() ? { message: message.trim() } : {},
  });
}

export function annulerDemandePole(id: string): Promise<unknown> {
  return appelApi(`/api/v1/poles/${encodeURIComponent(id)}/demande`, { methode: "DELETE" });
}

export function quitterPole(id: string): Promise<unknown> {
  return appelApi(`/api/v1/poles/${encodeURIComponent(id)}/quitter`, {
    methode: "POST",
    corps: {},
  });
}
