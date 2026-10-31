import type { Album } from "@/types/content";

/** DONNÉES DE DÉMONSTRATION — à remplacer par les albums photo officiels. */
export const DEMO_ALBUMS: Album[] = [
  {
    id: "demo-album-1",
    slug: "exemple-album-1",
    title: "[Titre de l'album]",
    date: "2025-01-01",
    description: "[Description de l'album. Contenu de démonstration.]",
    cover: { src: null, alt: "Photo de couverture de l'album — à venir" },
    photos: [
      { src: null, alt: "Photo de l'album — à venir" },
      { src: null, alt: "Photo de l'album — à venir" },
      { src: null, alt: "Photo de l'album — à venir" },
    ],
    status: "publie",
  },
  {
    id: "demo-album-2",
    slug: "exemple-album-2",
    title: "[Titre de l'album]",
    date: "2025-01-01",
    description: "[Description de l'album. Contenu de démonstration.]",
    cover: { src: null, alt: "Photo de couverture de l'album — à venir" },
    photos: [{ src: null, alt: "Photo de l'album — à venir" }],
    status: "publie",
  },
  {
    id: "demo-album-3",
    slug: "exemple-album-3",
    title: "[Titre de l'album]",
    date: "2025-01-01",
    description: "[Description de l'album. Contenu de démonstration.]",
    cover: { src: null, alt: "Photo de couverture de l'album — à venir" },
    photos: [{ src: null, alt: "Photo de l'album — à venir" }],
    status: "publie",
  },
];

export function listAlbums(): Album[] {
  return DEMO_ALBUMS.filter((a) => a.status === "publie");
}

export function getAlbumBySlug(slug: string): Album | undefined {
  return listAlbums().find((a) => a.slug === slug);
}
