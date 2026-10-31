import {
  apiConfiguree,
  urlsMedia,
  listerAlbums,
  listerEvenements,
  listerPublications,
  listerRessources,
  obtenirAlbum,
  obtenirAssociation,
  obtenirPublication,
  obtenirRessource,
  type Album as AlbumApi,
  type Evenement as EvenementApi,
  type Publication,
  type Ressource as RessourceApi,
} from "@/lib/api";
import type {
  AesbtEvent,
  Album,
  BureauMember,
  InstitutionalDocument,
  NewsArticle,
  Resource,
  ResourceCategory,
  Statistic,
} from "@/types/content";

import { DEMO_ALBUMS } from "./albums";
import { BUREAU_MEMBERS, INSTITUTIONAL_DOCUMENTS, STATISTICS } from "./association";
import { DEMO_NEWS } from "./news";
import { DEMO_RESOURCES } from "./resources";

/**
 * Source unique des contenus du site.
 *
 * Tant que `NEXT_PUBLIC_API_URL` n'est pas renseignée, les données de
 * démonstration de `src/data/` continuent d'alimenter le site : la bascule
 * vers le backend se fait par configuration, sans toucher au code.
 *
 * Les composants d'affichage ne connaissent que les types de
 * `src/types/content.ts` : les réponses de l'API sont adaptées ici, et
 * nulle part ailleurs.
 */

/**
 * Image de contenu. `chemin` est stocké sans extension côté backend : l'URL
 * affichable est reconstituée avec `NEXT_PUBLIC_MEDIA_URL` (null si la
 * variable est absente ou si le chemin est vide).
 */
function enImage(
  chemin: string | null,
  alt: string | null,
  largeur?: number | null,
  hauteur?: number | null,
) {
  return {
    src: urlsMedia(chemin).src,
    alt: alt ?? "",
    ...(largeur ? { width: largeur } : {}),
    ...(hauteur ? { height: hauteur } : {}),
  };
}

function enActualite(p: Publication): NewsArticle {
  return {
    id: p.id,
    slug: p.slug,
    title: p.titre,
    date: p.publie_le?.slice(0, 10) ?? "",
    category: p.categorie ?? "",
    excerpt: p.chapeau ?? "",
    body: p.corps ? p.corps.split("\n\n") : [],
    cover: enImage(p.chemin, p.alt),
    gallery: [],
    attachments: [],
    socialUrl: p.source_url,
    status: "publie",
  };
}

function enAlbum(a: AlbumApi): Album {
  return {
    id: a.id,
    slug: a.slug,
    title: a.titre,
    date: a.date,
    description: a.description ?? "",
    cover: enImage(a.chemin, a.alt),
    photos: (a.photos ?? []).map((photo) => {
      const legende = photo.legende?.trim();
      return {
        ...enImage(photo.chemin, photo.alt ?? photo.legende, photo.largeur, photo.hauteur),
        ...(legende ? { caption: legende } : {}),
      };
    }),
    event: a.evenement ? { slug: a.evenement.slug, title: a.evenement.titre } : null,
    status: "publie",
  };
}

function enRessource(r: RessourceApi): Resource {
  return {
    id: r.id,
    slug: r.slug,
    title: r.titre,
    description: r.description,
    category: (r.categorie ?? "Étudier en Tunisie") as ResourceCategory,
    body: r.corps ? r.corps.split("\n\n") : [],
    document: r.url ? { label: "Consulter la ressource", url: r.url } : null,
    publishedAt: r.publie_le?.slice(0, 10) ?? "",
    status: "publie",
  };
}

function enEvenement(e: EvenementApi): AesbtEvent {
  return {
    id: e.id,
    slug: e.slug,
    title: e.titre,
    startsAt: e.debute_le,
    location: e.lieu,
    description: e.description ?? "",
    cover: enImage(e.chemin, e.alt),
    registrationUrl: e.inscription_url,
    photosUrl: e.lien_photos ?? null,
    albums: (e.albums ?? []).map((a) => ({ slug: a.slug, title: a.titre })),
  };
}

// --- Actualités -----------------------------------------------------------

export async function recupererActualites(): Promise<NewsArticle[]> {
  if (!apiConfiguree()) return DEMO_NEWS.filter((a) => a.status === "publie");
  return (await listerPublications("actualite")).map(enActualite);
}

export async function recupererActualite(slug: string): Promise<NewsArticle | undefined> {
  if (!apiConfiguree()) {
    return DEMO_NEWS.find((a) => a.slug === slug && a.status === "publie");
  }
  const publication = await obtenirPublication("actualite", slug);
  return publication ? enActualite(publication) : undefined;
}

// --- Albums ---------------------------------------------------------------

export async function recupererAlbums(): Promise<Album[]> {
  if (!apiConfiguree()) return DEMO_ALBUMS.filter((a) => a.status === "publie");
  return (await listerAlbums()).map(enAlbum);
}

export async function recupererAlbum(slug: string): Promise<Album | undefined> {
  if (!apiConfiguree()) {
    return DEMO_ALBUMS.find((a) => a.slug === slug && a.status === "publie");
  }
  const album = await obtenirAlbum(slug);
  return album ? enAlbum(album) : undefined;
}

// --- Ressources -----------------------------------------------------------

export async function recupererRessources(): Promise<Resource[]> {
  if (!apiConfiguree()) return DEMO_RESOURCES.filter((r) => r.status === "publie");
  return (await listerRessources()).map(enRessource);
}

export async function recupererRessource(slug: string): Promise<Resource | undefined> {
  if (!apiConfiguree()) {
    return DEMO_RESOURCES.find((r) => r.slug === slug && r.status === "publie");
  }
  const ressource = await obtenirRessource(slug);
  return ressource ? enRessource(ressource) : undefined;
}

// --- Événements -----------------------------------------------------------

export async function recupererEvenements(): Promise<AesbtEvent[]> {
  if (!apiConfiguree()) return [];
  return (await listerEvenements()).map(enEvenement);
}

// --- Association ----------------------------------------------------------

export interface DonneesAssociation {
  membres: BureauMember[];
  statistiques: Statistic[];
  documents: InstitutionalDocument[];
}

export async function recupererAssociation(): Promise<DonneesAssociation> {
  if (!apiConfiguree()) {
    return {
      membres: BUREAU_MEMBERS,
      statistiques: STATISTICS,
      documents: INSTITUTIONAL_DOCUMENTS,
    };
  }

  const donnees = await obtenirAssociation();

  return {
    membres: donnees.membres
      .filter((m) => m.entite === "bureau")
      .map((m) => ({
        id: m.id,
        name: m.nom,
        role: m.role,
        photo: enImage(m.chemin, m.nom ? `Portrait de ${m.nom}` : "Portrait à venir"),
      })),
    statistiques: donnees.statistiques.map((s) => ({
      id: s.id,
      label: s.libelle,
      value: s.valeur,
    })),
    documents: donnees.documents.map((d) => ({
      id: d.id,
      title: d.titre,
      description: d.description ?? "",
      file: { label: "Télécharger", url: d.chemin },
    })),
  };
}
