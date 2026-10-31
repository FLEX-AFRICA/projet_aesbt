/**
 * Types de contenu du site AESBT.
 *
 * Ces interfaces décrivent la forme des données attendues. Elles permettent
 * de remplacer les données de démonstration (src/data/*) par un système de
 * gestion de contenu (création / modification / suppression / publication)
 * sans modifier les composants d'affichage.
 */

export type PublicationStatus = "brouillon" | "publie";

/** Image d'illustration. `src` est null tant que la photo réelle n'existe pas. */
export type ContentImage = {
  src: string | null;
  alt: string;
  /** Dimensions d'origine en pixels, quand la base les fournit. */
  width?: number | null;
  height?: number | null;
  /** Légende de la photo (albums). Absente ou vide : rien n'est affiché. */
  caption?: string;
};

export type Attachment = {
  label: string;
  /** URL du document téléchargeable — null si non disponible. */
  url: string | null;
};

export type NewsCategory = string;

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  /** Date ISO (AAAA-MM-JJ). */
  date: string;
  category: NewsCategory;
  excerpt: string;
  /** Corps de l'article, en paragraphes. */
  body: string[];
  cover: ContentImage;
  gallery?: ContentImage[];
  attachments?: Attachment[];
  /** Lien vers une publication sur les réseaux sociaux. */
  socialUrl?: string | null;
  status: PublicationStatus;
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  cover: ContentImage;
  photos: ContentImage[];
  /** Événement rattaché à l'album, s'il y en a un. */
  event?: { slug: string; title: string } | null;
  status: PublicationStatus;
};

export const RESOURCE_CATEGORIES = [
  "Étudier en Tunisie",
  "Vie pratique",
  "Documents AESBT",
  "Opportunités",
  "FAQ",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  /** Contenu détaillé, en paragraphes. */
  body: string[];
  document?: Attachment | null;
  publishedAt: string;
  status: PublicationStatus;
};

/** Événement — alimenté ultérieurement par FLEXHUB. */
export type AesbtEvent = {
  id: string;
  slug: string;
  title: string;
  /** Date ISO. */
  startsAt: string | null;
  location: string | null;
  description: string;
  cover?: ContentImage;
  /** Lien d'inscription (FLEXHUB) — null tant qu'il n'est pas fourni. */
  registrationUrl?: string | null;
  /** Lien externe (Google Drive) vers les photos. */
  photosUrl?: string | null;
  /** Albums publiés rattachés à l'événement. */
  albums?: { slug: string; title: string }[];
};

export type BureauMember = {
  id: string;
  /** Nom complet — à renseigner par l'association. */
  name: string | null;
  role: string;
  photo: ContentImage;
};

export type Statistic = {
  id: string;
  label: string;
  /** Valeur officielle — null tant qu'elle n'est pas communiquée. */
  value: string | null;
};

export type InstitutionalDocument = {
  id: string;
  title: string;
  description: string;
  file: Attachment;
};
