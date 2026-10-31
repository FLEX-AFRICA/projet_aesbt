import type { AesbtEvent } from "@/types/content";

/**
 * Données d'affichage de la page événements.
 *
 * Les champs facultatifs sont absents (et non vides) quand la base ne les
 * fournit pas : le composant les masque.
 */
export type EventStatus = "a-venir" | "passe";

export type EventView = {
  id: string;
  /** Identifiant d'ancre de la carte (slug en base). */
  slug: string;
  title: string;
  /** Catégorie : absente en base (démonstration uniquement). */
  category?: string;
  /** Date de l'événement (ISO), null si non planifiée. */
  date: string | null;
  location: string | null;
  description: string;
  status: EventStatus;
  registrationUrl?: string;
  /** Lien externe (Google Drive) vers les photos, uniquement s'il est en http ou https. */
  photosUrl?: string;
  /** Albums publiés de la galerie rattachés à l'événement. */
  albums: { slug: string; title: string }[];
  /** Image de couverture (deux formats de cadrage), null si absente. */
  image: { featured: string; card: string; alt: string } | null;
};

type DemoEvent = Omit<EventView, "image" | "slug" | "albums">;

/** Renvoie l'adresse si elle est en http ou https, sinon undefined (jamais de lien dangereux). */
export function urlHttpSure(valeur: string | null | undefined): string | undefined {
  if (!valeur) return undefined;
  try {
    const { protocol } = new URL(valeur);
    return protocol === "http:" || protocol === "https:" ? valeur : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Événements de démonstration, pour prévisualiser le rendu tant que l'API
 * n'est pas configurée. Le statut (à venir / passé) est fixé explicitement
 * plutôt que calculé depuis la date du jour, pour que la page ait toujours la
 * même allure, quelle que soit la date de consultation. Les images viennent
 * de picsum.photos (placeholders, graine fixe).
 */
const DEMO_EVENTS: DemoEvent[] = [
  {
    id: "integration-2026",
    title: "Journée d'intégration 2026",
    category: "Intégration",
    date: "2026-11-15",
    location: "Maison de l'étudiant, Tunis",
    description:
      "Accueil des nouveaux arrivants : présentation de l'association, jeux de rencontre et premiers repères sur la vie étudiante en Tunisie.",
    status: "a-venir",
    registrationUrl: "#",
  },
  {
    id: "conference-carrieres",
    title: "Conférence orientation & carrières",
    category: "Académique",
    date: "2026-12-02",
    location: "Amphithéâtre ISET Rades",
    description:
      "Rencontre avec des diplômés et professionnels pour échanger sur les parcours, les stages et les opportunités après les études.",
    status: "a-venir",
    registrationUrl: "#",
  },
  {
    id: "tournoi-sportif",
    title: "Tournoi sportif inter-promotions",
    category: "Sport",
    date: "2027-01-24",
    location: "Complexe sportif El Menzah",
    description:
      "Football, basketball et jeux collectifs entre promotions, suivis d'une remise de médailles et d'un moment convivial.",
    status: "a-venir",
  },
  {
    id: "gala-2025",
    title: "Gala annuel de l'AESBT",
    category: "Social",
    date: "2025-06-14",
    location: "Salle des fêtes, La Marsa",
    description:
      "Soirée de clôture de l'année : discours, remise de distinctions honorifiques et soirée dansante entre membres de l'association.",
    status: "passe",
  },
  {
    id: "ftour-ramadan",
    title: "Ftour collectif de Ramadan",
    category: "Communauté",
    date: "2025-03-18",
    location: "Résidence universitaire, Tunis",
    description:
      "Un repas de rupture du jeûne partagé entre étudiants, pour resserrer les liens de la communauté pendant le mois sacré.",
    status: "passe",
  },
  {
    id: "sortie-culturelle",
    title: "Sortie culturelle à Sidi Bou Said",
    category: "Culture",
    date: "2025-05-10",
    location: "Sidi Bou Said",
    description:
      "Une après-midi de visite guidée dans les ruelles bleues et blanches, suivie d'un goûter face à la mer.",
    status: "passe",
  },
  {
    id: "journee-integration-2025",
    title: "Journée d'intégration 2025",
    category: "Intégration",
    date: "2025-09-20",
    location: "Maison de l'étudiant, Tunis",
    description:
      "La précédente édition de la journée d'accueil, pour se faire une idée de l'ambiance avant celle de cette année.",
    status: "passe",
  },
];

export function evenementsDemo(): EventView[] {
  return DEMO_EVENTS.map((event) => ({
    ...event,
    slug: event.id,
    albums: [],
    image: {
      featured: `https://picsum.photos/seed/${event.id}/800/900`,
      card: `https://picsum.photos/seed/${event.id}/700/525`,
      alt: "",
    },
  }));
}

/**
 * Adapte les événements publiés en base. « À venir » = date de début dans le
 * futur (ou non planifiée) ; les à venir sont triés du plus proche au plus
 * lointain, les passés du plus récent au plus ancien.
 */
export function evenementsDepuisBase(evenements: AesbtEvent[], maintenant: number): EventView[] {
  const vues = evenements.map((e): EventView => {
    const debut = e.startsAt ? new Date(e.startsAt).getTime() : Number.NaN;
    const passe = !Number.isNaN(debut) && debut < maintenant;
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      date: e.startsAt,
      location: e.location,
      description: e.description,
      status: passe ? "passe" : "a-venir",
      ...(e.registrationUrl ? { registrationUrl: e.registrationUrl } : {}),
      ...(urlHttpSure(e.photosUrl) ? { photosUrl: urlHttpSure(e.photosUrl) as string } : {}),
      albums: e.albums ?? [],
      image: e.cover?.src ? { featured: e.cover.src, card: e.cover.src, alt: e.cover.alt } : null,
    };
  });

  const valeur = (v: EventView) => (v.date ? new Date(v.date).getTime() : Number.POSITIVE_INFINITY);
  const aVenir = vues.filter((v) => v.status === "a-venir").sort((a, b) => valeur(a) - valeur(b));
  const passes = vues.filter((v) => v.status === "passe").sort((a, b) => valeur(b) - valeur(a));
  return [...aVenir, ...passes];
}
