import { cookies } from "next/headers";

/**
 * Appels authentifiés à l'API, depuis le serveur.
 *
 * Le cookie de session est déposé par l'API sur `.aesbt.org` ; les composants
 * serveur de Next ne l'envoient pas d'eux-mêmes et doivent le transmettre
 * explicitement.
 *
 * Contrairement au client public, les erreurs ne sont PAS masquées : dans
 * l'administration, une donnée manquante doit se voir plutôt que de laisser
 * croire que la liste est vide.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiErreur extends Error {
  constructor(
    public readonly statut: number,
    public readonly code: string,
    message: string,
    /** Corps JSON de l'erreur (détails de validation, conflits), s'il existe. */
    public readonly corps: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiErreur";
  }
}

async function enteteCookie(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export interface OptionsAppel {
  methode?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  corps?: unknown;
  /** Les écritures ne doivent jamais être mises en cache. */
  revalidate?: number | false;
}

export async function appelApi<T>(chemin: string, options: OptionsAppel = {}): Promise<T> {
  if (!BASE) {
    throw new ApiErreur(503, "api_non_configuree", "NEXT_PUBLIC_API_URL n'est pas renseignée.");
  }

  const methode = options.methode ?? "GET";

  const reponse = await fetch(`${BASE}${chemin}`, {
    method: methode,
    headers: {
      cookie: await enteteCookie(),
      ...(options.corps !== undefined ? { "content-type": "application/json" } : {}),
      /*
       * L'API refuse toute requête mutante dont l'origine n'est pas connue.
       * Un appel serveur à serveur n'a pas d'origine naturelle : on envoie
       * celle du site, qui figure dans la liste blanche.
       */
      ...(methode !== "GET"
        ? { origin: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000" }
        : {}),
    },
    ...(options.corps !== undefined ? { body: JSON.stringify(options.corps) } : {}),
    cache: "no-store",
  });

  if (!reponse.ok) {
    const corps = (await reponse.json().catch(() => ({}))) as {
      erreur?: string;
      message?: string;
    } & Record<string, unknown>;
    throw new ApiErreur(
      reponse.status,
      corps.erreur ?? "erreur",
      corps.message ?? `L'API a répondu ${reponse.status}.`,
      corps,
    );
  }

  if (reponse.status === 204) return undefined as T;
  return (await reponse.json()) as T;
}

/** Rôles de compte, identiques à `RoleCompte` du backend. */
export type RoleCompte = "etudiant" | "mentor" | "admin" | "editeur";

/** Rôles autorisés à ouvrir l'éditeur visuel et le mode brouillon. */
export function peutEditerContenus(session: SessionAdmin | null): session is SessionAdmin {
  return session !== null && (session.role === "admin" || session.role === "editeur");
}

export interface SessionAdmin {
  userId: string;
  email: string;
  nom: string | null;
  role: RoleCompte;
  statut: string;
  /** Double authentification active sur ce compte. */
  doubleAuthentification: boolean;
  /**
   * Double authentification exigée pour atteindre l'administration.
   *
   * C'est la configuration de l'API qui en décide (`EXIGER_2FA_ADMIN`), pas
   * celle du frontend : dupliquer le réglage ici bloquerait l'administration
   * en développement alors que l'API l'autorise.
   */
  doubleAuthentificationExigee: boolean;
  /** Droits de l'éditeur (tout le catalogue pour un administrateur, vide sinon). */
  droits: string[];
}

/**
 * Session courante, ou null.
 *
 * Interroge `/api/v1/me`, qui exige déjà un compte validé : une seule source
 * de vérité pour l'autorisation, côté backend.
 */
export async function sessionCourante(): Promise<SessionAdmin | null> {
  try {
    const reponse = await appelApi<{
      profil: { user_id: string; role: RoleCompte; statut: string } | undefined;
      email: string;
      nom: string | null;
      double_authentification: boolean;
      double_authentification_exigee?: boolean;
      droits?: unknown;
    }>("/api/v1/me");

    if (!reponse.profil) return null;

    return {
      userId: reponse.profil.user_id,
      email: reponse.email,
      nom: reponse.nom,
      role: reponse.profil.role,
      statut: reponse.profil.statut,
      doubleAuthentification: reponse.double_authentification,
      // Une API plus ancienne n'enverrait pas le champ : l'exiger est le
      // repli prudent.
      doubleAuthentificationExigee: reponse.double_authentification_exigee ?? true,
      // Tolérant : une API plus ancienne n'envoie pas `droits`.
      droits: Array.isArray(reponse.droits)
        ? reponse.droits.filter((d): d is string => typeof d === "string")
        : [],
    };
  } catch {
    return null;
  }
}

/** Champs acceptés par GET /api/v1/admin/suggestions (liste blanche de l'API). */
export type ChampSuggestion =
  | "role"
  | "filiere"
  | "domaine"
  | "universite"
  | "ville"
  | "lieu"
  | "categorie"
  | "categorie_publication";

/**
 * Valeurs distinctes déjà en base pour des champs à saisie répétitive, triées
 * par fréquence puis ordre alphabétique. Lecture serveur uniquement.
 */
export async function lireSuggestions(
  champs: readonly ChampSuggestion[],
): Promise<Record<string, string[]>> {
  if (champs.length === 0) return {};
  const { suggestions } = await appelApi<{ suggestions: Record<string, string[]> }>(
    `/api/v1/admin/suggestions?champ=${encodeURIComponent(champs.join(","))}`,
  );
  return suggestions;
}
