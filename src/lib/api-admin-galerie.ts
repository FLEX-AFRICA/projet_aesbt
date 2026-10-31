import { ApiErreur, appelApi } from "@/lib/api-admin";

import { messageErreur, type Chargement } from "@/app/admin/_commun/serveur";

/**
 * Accès serveur à la Galerie d'administration : albums, événements liés et
 * bibliothèque d'images. Les champs ajoutés par le backend (`evenement_id`,
 * `evenement_titre`, `nb_photos`) sont tolérés absents tant qu'il n'est pas livré.
 */

export interface AlbumGalerie {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  date: string;
  statut: string;
  couverture: string | null;
  couverture_id: string | null;
  nb_photos: number;
  evenement_id: string | null;
  evenement_titre: string | null;
}

export interface PhotoDetail {
  media_id: string;
  ordre: number;
  legende: string | null;
  chemin: string;
  alt: string;
}

export interface AlbumDetail extends AlbumGalerie {
  photos: PhotoDetail[];
}

export interface EvenementOption {
  id: string;
  titre: string;
  debute_le: string | null;
}

export interface ImageBibliotheque {
  id: string;
  chemin: string;
  alt: string;
  largeur: number | null;
  hauteur: number | null;
  taille: number;
  created_at: string;
  uploade_par_nom: string | null;
  /** Nombre d'usages, si l'API l'indique. */
  nb_usages?: number | null;
  /** Indicateur d'usage, si l'API l'indique. */
  utilise?: boolean | null;
}

type AlbumBrut = Partial<AlbumGalerie> & { id: string; photos?: PhotoDetail[] };

/** Complète un album de l'API avec des valeurs neutres pour les champs facultatifs. */
function normaliser(brut: AlbumBrut, nbPhotos: number): AlbumGalerie {
  return {
    id: brut.id,
    slug: brut.slug ?? "",
    titre: brut.titre ?? "",
    description: brut.description ?? null,
    date: brut.date ?? "",
    statut: brut.statut ?? "brouillon",
    couverture: brut.couverture ?? null,
    couverture_id: brut.couverture_id ?? null,
    nb_photos: nbPhotos,
    evenement_id: brut.evenement_id ?? null,
    evenement_titre: brut.evenement_titre ?? null,
  };
}

/**
 * Liste des albums. Si la liste ne donne pas `nb_photos` ou la couverture
 * (backend pas encore livré), on complète avec le détail de l'album concerné.
 * Un échec fait échouer le chargement entier, pour ne rien masquer.
 */
export async function chargerAlbums(): Promise<Chargement<AlbumGalerie[]>> {
  try {
    const { albums } = await appelApi<{ albums: AlbumBrut[] }>("/api/v1/admin/albums");
    const complets = await Promise.all(
      albums.map(async (a) => {
        if (typeof a.nb_photos === "number" && a.couverture_id !== undefined) {
          return normaliser(a, a.nb_photos);
        }
        const { album } = await appelApi<{ album: AlbumBrut }>(
          `/api/v1/admin/albums/${encodeURIComponent(a.id)}`,
        );
        return normaliser({ ...a, ...album }, album.photos?.length ?? 0);
      }),
    );
    return { donnees: complets, erreur: null };
  } catch (err) {
    return { donnees: null, erreur: messageErreur(err, "Les albums n'ont pas pu être chargés.") };
  }
}

export async function chargerAlbum(
  id: string,
): Promise<Chargement<AlbumDetail> & { introuvable: boolean }> {
  try {
    const { album } = await appelApi<{ album: AlbumBrut & { photos: PhotoDetail[] } }>(
      `/api/v1/admin/albums/${encodeURIComponent(id)}`,
    );
    const base = normaliser(album, album.photos.length);
    return { donnees: { ...base, photos: album.photos }, erreur: null, introuvable: false };
  } catch (err) {
    const introuvable = err instanceof ApiErreur && err.statut === 404;
    return {
      donnees: null,
      erreur: messageErreur(err, "L'album n'a pas pu être chargé."),
      introuvable,
    };
  }
}

/** Événements proposés pour lier un album ; liste vide si l'API est indisponible. */
export async function chargerEvenementsLiables(): Promise<EvenementOption[]> {
  try {
    const { evenements } = await appelApi<{ evenements: EvenementOption[] }>(
      "/api/v1/admin/evenements",
    );
    return evenements.map((e) => ({ id: e.id, titre: e.titre, debute_le: e.debute_le ?? null }));
  } catch {
    return [];
  }
}

export async function chargerImages(): Promise<Chargement<ImageBibliotheque[]>> {
  try {
    const { medias } = await appelApi<{ medias: ImageBibliotheque[] }>(
      "/api/v1/admin/medias?taille=100",
    );
    return { donnees: medias, erreur: null };
  } catch (err) {
    return { donnees: null, erreur: messageErreur(err, "Les images n'ont pas pu être chargées.") };
  }
}
