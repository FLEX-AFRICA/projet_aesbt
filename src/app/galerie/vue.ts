import type { Album } from "@/types/content";

/**
 * Données d'affichage de la galerie : une mosaïque de photos, chacune reliée
 * à un album (appelé « événement » dans l'interface).
 */
export type GalleryEvent = {
  id: string;
  title: string;
  date: string;
};

export type GalleryPhoto = {
  id: string;
  eventId: string;
  width: number;
  height: number;
  alt: string;
  /** Légende de la photo, vide quand elle n'en a pas. */
  caption?: string;
  /** Image de la mosaïque. */
  src: string;
  /** Image de la visionneuse. */
  fullSrc: string;
};

export type GalleryData = { events: GalleryEvent[]; photos: GalleryPhoto[] };

/**
 * Événements et photos de démonstration, pour prévisualiser le rendu en
 * attendant le vrai catalogue de médias de l'association. Les images
 * viennent de picsum.photos (placeholders), chacune avec une graine fixe
 * pour rester stable entre deux rendus.
 */
const DEMO_EVENTS: GalleryEvent[] = [
  { id: "integration", title: "Journée d'intégration 2025", date: "2025-09-20" },
  { id: "gala", title: "Gala annuel de l'AESBT", date: "2025-06-14" },
  { id: "ftour", title: "Ftour collectif de Ramadan", date: "2025-03-18" },
  { id: "tournoi", title: "Tournoi sportif inter-promotions", date: "2025-04-05" },
  { id: "conference", title: "Conférence orientation & carrières", date: "2025-11-02" },
  { id: "sortie", title: "Sortie culturelle à Sidi Bou Said", date: "2025-05-10" },
];

type DemoPhoto = Omit<GalleryPhoto, "src" | "fullSrc">;

const DEMO_PHOTOS: DemoPhoto[] = [
  {
    id: "p01",
    eventId: "integration",
    width: 800,
    height: 1000,
    alt: "Accueil des nouveaux étudiants",
  },
  {
    id: "p02",
    eventId: "integration",
    width: 900,
    height: 650,
    alt: "Jeux de présentation en groupe",
  },
  {
    id: "p03",
    eventId: "integration",
    width: 800,
    height: 800,
    alt: "Photo de groupe de la promotion",
  },
  { id: "p04", eventId: "gala", width: 800, height: 1050, alt: "Discours d'ouverture du gala" },
  { id: "p05", eventId: "gala", width: 1000, height: 700, alt: "La salle du gala, pleine" },
  { id: "p06", eventId: "gala", width: 800, height: 950, alt: "Remise des diplômes honorifiques" },
  { id: "p07", eventId: "gala", width: 900, height: 650, alt: "Piste de danse en fin de soirée" },
  { id: "p08", eventId: "ftour", width: 900, height: 620, alt: "Tables dressées pour le ftour" },
  {
    id: "p09",
    eventId: "ftour",
    width: 800,
    height: 1000,
    alt: "Partage du repas entre étudiants",
  },
  {
    id: "p10",
    eventId: "tournoi",
    width: 1000,
    height: 700,
    alt: "Match de football inter-promotions",
  },
  { id: "p11", eventId: "tournoi", width: 800, height: 900, alt: "Remise des médailles" },
  { id: "p12", eventId: "tournoi", width: 800, height: 800, alt: "Équipe gagnante du tournoi" },
  { id: "p13", eventId: "conference", width: 900, height: 1100, alt: "Intervenant sur l'estrade" },
  {
    id: "p14",
    eventId: "conference",
    width: 1000,
    height: 680,
    alt: "Public attentif pendant la conférence",
  },
  {
    id: "p15",
    eventId: "sortie",
    width: 800,
    height: 1000,
    alt: "Groupe devant les façades bleues et blanches",
  },
  {
    id: "p16",
    eventId: "sortie",
    width: 900,
    height: 650,
    alt: "Vue sur la mer depuis Sidi Bou Said",
  },
];

export function galerieDemo(): GalleryData {
  return {
    events: DEMO_EVENTS,
    photos: DEMO_PHOTOS.map((photo) => ({
      ...photo,
      src: `https://picsum.photos/seed/${photo.id}/${photo.width}/${photo.height}`,
      fullSrc: `https://picsum.photos/seed/${photo.id}/${photo.width * 2}/${photo.height * 2}`,
    })),
  };
}

/** Cadrage de repli quand la base ne fournit pas les dimensions d'une photo. */
const LARGEUR_REPLI = 4;
const HAUTEUR_REPLI = 3;

/**
 * Adapte les albums publiés en base (avec leurs photos). Les albums sans
 * photo affichable n'apparaissent pas (rien à montrer dans la mosaïque).
 */
export function galerieDepuisBase(albums: Album[]): GalleryData {
  const events: GalleryEvent[] = [];
  const photos: GalleryPhoto[] = [];

  for (const album of albums) {
    const affichables = album.photos.filter((photo) => photo.src);
    if (affichables.length === 0) continue;

    events.push({ id: album.id, title: album.title, date: album.date });
    affichables.forEach((photo, index) => {
      const src = photo.src as string;
      photos.push({
        id: `${album.id}-${index}`,
        eventId: album.id,
        width: photo.width ?? LARGEUR_REPLI,
        height: photo.height ?? HAUTEUR_REPLI,
        alt: photo.alt,
        ...(photo.caption ? { caption: photo.caption } : {}),
        src,
        fullSrc: src,
      });
    });
  }

  return { events, photos };
}
