/**
 * Client de l'API AESBT.
 *
 * Règle de conception : **une API injoignable ne doit jamais casser le
 * build**. Vercel régénère les pages à la publication ; si le VPS est en
 * maintenance à cet instant, le déploiement doit aboutir avec les dernières
 * données connues plutôt qu'échouer. Chaque fonction renvoie donc une valeur
 * de repli, et l'incident est journalisé.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** Durée de mise en cache par défaut, en secondes. */
const REVALIDATION = 300;

export interface Media {
  chemin: string | null;
  alt: string | null;
  largeur: number | null;
  hauteur: number | null;
}

export interface Publication {
  id: string;
  slug: string;
  titre: string;
  chapeau: string | null;
  corps?: string | null;
  categorie: string | null;
  publie_le: string | null;
  source_url: string | null;
  universite_nom?: string | null;
  chemin: string | null;
  alt: string | null;
  largeur: number | null;
  hauteur: number | null;
}

export interface Ressource {
  id: string;
  slug: string;
  titre: string;
  description: string;
  corps?: string | null;
  type: string;
  url: string | null;
  categorie: string | null;
  niveau_id?: string | null;
  publie_le: string | null;
  filiere_nom: string | null;
}

export interface Album {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  date: string;
  chemin: string | null;
  alt: string | null;
  /** Événement auquel l'album est rattaché, absent ou null sinon. */
  evenement?: { slug: string; titre: string } | null;
  photos?: {
    chemin: string;
    alt: string;
    legende: string | null;
    largeur?: number | null;
    hauteur?: number | null;
  }[];
}

export interface Evenement {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  debute_le: string | null;
  /** Ancien champ de fin, plus saisi : tolérer sa présence sans l'afficher. */
  termine_le?: string | null;
  lieu: string | null;
  inscription_url: string | null;
  chemin: string | null;
  alt: string | null;
  /** Lien externe (Google Drive) vers les photos, absent ou null sinon. */
  lien_photos?: string | null;
  /** Albums publiés rattachés à l'événement. */
  albums?: { slug: string; titre: string }[];
}

/** L'API est-elle configurée ? Sinon, le site retombe sur `src/data/`. */
export function apiConfiguree(): boolean {
  return BASE.length > 0;
}

// `urlsMedia` vit dans `lib/url-media.ts` (module pur, utilisable côté client) ;
// réexporté ici pour ne rien changer aux appelants.
export { urlsMedia } from "@/lib/url-media";

async function recuperer<T>(
  chemin: string,
  repli: T,
  revalidate = REVALIDATION,
  tags: string[] = [],
): Promise<T> {
  if (!BASE) return repli;

  try {
    const reponse = await fetch(`${BASE}/api/v1${chemin}`, {
      next: { revalidate, tags },
      signal: AbortSignal.timeout(10_000),
    });

    if (!reponse.ok) {
      if (reponse.status !== 404) {
        console.warn(`[api] ${chemin} a répondu ${reponse.status}`);
      }
      return repli;
    }

    return (await reponse.json()) as T;
  } catch (err) {
    console.warn(`[api] ${chemin} injoignable :`, err instanceof Error ? err.message : err);
    return repli;
  }
}

// --- Publications ---------------------------------------------------------

export async function listerPublications(
  type = "actualite",
  options: { universite?: string; taille?: number } = {},
): Promise<Publication[]> {
  const params = new URLSearchParams({ type, taille: String(options.taille ?? 20) });
  if (options.universite) params.set("universite", options.universite);

  const { publications } = await recuperer<{ publications: Publication[] }>(
    `/publications?${params}`,
    { publications: [] },
  );
  return publications;
}

export async function obtenirPublication(type: string, slug: string): Promise<Publication | null> {
  const { publication } = await recuperer<{ publication: Publication | null }>(
    `/publications/${type}/${encodeURIComponent(slug)}`,
    { publication: null },
  );
  return publication;
}

// --- Ressources -----------------------------------------------------------

export async function listerRessources(
  options: { filiere?: string; categorie?: string } = {},
): Promise<Ressource[]> {
  const params = new URLSearchParams({ taille: "100" });
  if (options.filiere) params.set("filiere", options.filiere);
  if (options.categorie) params.set("categorie", options.categorie);

  const { ressources } = await recuperer<{ ressources: Ressource[] }>(`/ressources?${params}`, {
    ressources: [],
  });
  return ressources;
}

export async function obtenirRessource(slug: string): Promise<Ressource | null> {
  const { ressource } = await recuperer<{ ressource: Ressource | null }>(
    `/ressources/${encodeURIComponent(slug)}`,
    { ressource: null },
  );
  return ressource;
}

// --- Albums ---------------------------------------------------------------

export async function listerAlbums(): Promise<Album[]> {
  const { albums } = await recuperer<{ albums: Album[] }>("/albums", { albums: [] });
  return albums;
}

export async function obtenirAlbum(slug: string): Promise<Album | null> {
  const { album } = await recuperer<{ album: Album | null }>(
    `/albums/${encodeURIComponent(slug)}`,
    { album: null },
  );
  return album;
}

// --- Événements -----------------------------------------------------------

export async function listerEvenements(): Promise<Evenement[]> {
  const { evenements } = await recuperer<{ evenements: Evenement[] }>("/evenements", {
    evenements: [],
  });
  return evenements;
}

// --- Association et configuration -----------------------------------------

export interface Association {
  membres: {
    id: string;
    entite: string;
    nom: string | null;
    role: string;
    chemin: string | null;
  }[];
  statistiques: { id: string; cle: string; libelle: string; valeur: string | null }[];
  documents: { id: string; titre: string; description: string | null; chemin: string | null }[];
}

export async function obtenirAssociation(): Promise<Association> {
  return recuperer<Association>("/association", {
    membres: [],
    statistiques: [],
    documents: [],
  });
}

export async function obtenirParametres(): Promise<Record<string, string | null>> {
  const { parametres } = await recuperer<{ parametres: Record<string, string | null> }>(
    "/parametres",
    { parametres: {} },
    REVALIDATION,
    ["parametres"],
  );
  return parametres;
}

/**
 * Contenus publiés d'une page de marque, indexés par clé du registre
 * (`association.hero.titre`, etc.). Renvoie `null` si l'API est absente,
 * injoignable ou ne connaît pas la page : l'appelant retombe alors sur ses
 * défauts locaux (voir `src/lib/contenus.ts`).
 *
 * Tag de cache `contenus:<page>` : `revalidateTag` permet de l'invalider.
 */
export async function obtenirContenus(
  page: string,
): Promise<{ contenus: Record<string, unknown>; medias: Record<string, unknown> } | null> {
  const reponse = await recuperer<{
    contenus: Record<string, unknown>;
    medias?: Record<string, unknown>;
  } | null>(`/contenus/${encodeURIComponent(page)}`, null, REVALIDATION, [`contenus:${page}`]);
  if (!reponse?.contenus) return null;
  // `medias` : table { identifiant: { chemin, alt } } des images référencées.
  return { contenus: reponse.contenus, medias: reponse.medias ?? {} };
}

// --- Écriture -------------------------------------------------------------

/**
 * Envoi du formulaire de contact.
 *
 * Appelée depuis le navigateur : `credentials` est nécessaire pour que le
 * cookie de session circule entre aesbt.org et api.aesbt.org.
 */
export async function envoyerMessageContact(donnees: {
  nom: string;
  email: string;
  sujet?: string;
  message: string;
}): Promise<{ ok: boolean; message?: string }> {
  if (!BASE) {
    return { ok: false, message: "Le service de messagerie n'est pas encore connecté." };
  }

  try {
    const reponse = await fetch(`${BASE}/api/v1/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(donnees),
    });

    if (reponse.ok) return { ok: true };

    const corps = (await reponse.json().catch(() => ({}))) as { message?: string };
    return {
      ok: false,
      message:
        reponse.status === 429
          ? "Trop de messages envoyés. Réessayez dans un moment."
          : (corps.message ?? "L'envoi a échoué. Réessayez plus tard."),
    };
  } catch {
    return { ok: false, message: "Service injoignable. Réessayez plus tard." };
  }
}
