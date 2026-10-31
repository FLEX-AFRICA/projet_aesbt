import type { NewsArticle } from "@/types/content";

/**
 * DONNÉES DE DÉMONSTRATION — à remplacer par les publications officielles.
 * Aucune information réelle de l'AESBT n'est renseignée ici.
 */
export const DEMO_NEWS: NewsArticle[] = [
  {
    id: "demo-1",
    slug: "exemple-actualite-1",
    title: "[Titre de l'actualité]",
    date: "2025-01-01",
    category: "Vie associative",
    excerpt:
      "[Extrait de l'actualité. Ce texte de démonstration sera remplacé par le contenu officiel de l'AESBT.]",
    body: [
      "[Premier paragraphe de l'article. Contenu de démonstration.]",
      "[Deuxième paragraphe de l'article. Contenu de démonstration.]",
    ],
    cover: { src: null, alt: "Illustration de l'actualité — à venir" },
    gallery: [],
    attachments: [],
    socialUrl: null,
    status: "publie",
  },
  {
    id: "demo-2",
    slug: "exemple-actualite-2",
    title: "[Titre de l'actualité]",
    date: "2025-01-01",
    category: "Association",
    excerpt:
      "[Extrait de l'actualité. Ce texte de démonstration sera remplacé par le contenu officiel de l'AESBT.]",
    body: ["[Paragraphe de démonstration.]"],
    cover: { src: null, alt: "Illustration de l'actualité — à venir" },
    status: "publie",
  },
  {
    id: "demo-3",
    slug: "exemple-actualite-3",
    title: "[Titre de l'actualité]",
    date: "2025-01-01",
    category: "Vie pratique",
    excerpt:
      "[Extrait de l'actualité. Ce texte de démonstration sera remplacé par le contenu officiel de l'AESBT.]",
    body: ["[Paragraphe de démonstration.]"],
    cover: { src: null, alt: "Illustration de l'actualité — à venir" },
    status: "publie",
  },
];

/** Accès lecture — remplacer l'implémentation par un appel au futur CMS. */
export function listNews(): NewsArticle[] {
  return DEMO_NEWS.filter((n) => n.status === "publie");
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return listNews().find((n) => n.slug === slug);
}

export function listLatestNews(count = 3): NewsArticle[] {
  return listNews()
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}
