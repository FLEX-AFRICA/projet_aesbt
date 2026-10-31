import type { Resource } from "@/types/content";

/** DONNÉES DE DÉMONSTRATION — à remplacer par les ressources officielles. */
export const DEMO_RESOURCES: Resource[] = [
  {
    id: "demo-res-1",
    slug: "exemple-ressource-etudier",
    title: "[Titre de la ressource]",
    description: "[Description courte de la ressource. Contenu de démonstration.]",
    category: "Étudier en Tunisie",
    body: ["[Contenu détaillé de la ressource. Démonstration.]"],
    document: null,
    publishedAt: "2025-01-01",
    status: "publie",
  },
  {
    id: "demo-res-2",
    slug: "exemple-ressource-vie-pratique",
    title: "[Titre de la ressource]",
    description: "[Description courte de la ressource. Contenu de démonstration.]",
    category: "Vie pratique",
    body: ["[Contenu détaillé de la ressource. Démonstration.]"],
    document: null,
    publishedAt: "2025-01-01",
    status: "publie",
  },
  {
    id: "demo-res-3",
    slug: "exemple-ressource-documents",
    title: "[Titre du document AESBT]",
    description: "[Description courte du document. Contenu de démonstration.]",
    category: "Documents AESBT",
    body: ["[Contenu détaillé. Démonstration.]"],
    document: { label: "Document à venir", url: null },
    publishedAt: "2025-01-01",
    status: "publie",
  },
  {
    id: "demo-res-4",
    slug: "exemple-ressource-opportunites",
    title: "[Titre de l'opportunité]",
    description: "[Description courte. Contenu de démonstration.]",
    category: "Opportunités",
    body: ["[Contenu détaillé. Démonstration.]"],
    document: null,
    publishedAt: "2025-01-01",
    status: "publie",
  },
  {
    id: "demo-res-5",
    slug: "exemple-ressource-faq",
    title: "[Question fréquente]",
    description: "[Réponse courte. Contenu de démonstration.]",
    category: "FAQ",
    body: ["[Réponse détaillée. Démonstration.]"],
    document: null,
    publishedAt: "2025-01-01",
    status: "publie",
  },
];

export function listResources(): Resource[] {
  return DEMO_RESOURCES.filter((r) => r.status === "publie");
}

export function getResourceBySlug(slug: string): Resource | undefined {
  return listResources().find((r) => r.slug === slug);
}
