import type { AesbtEvent } from "@/types/content";

/**
 * Événements.
 *
 * FLEXHUB n'est PAS connecté : aucune API n'est appelée ici. Cette fonction
 * constitue le point d'intégration unique. Lorsque FLEXHUB sera branché,
 * remplacer l'implémentation par la récupération réelle des événements.
 */
export function listEvents(): AesbtEvent[] {
  return [];
}

export function getNextEvent(): AesbtEvent | null {
  const [next] = listEvents();
  return next ?? null;
}

export function getEventBySlug(slug: string): AesbtEvent | undefined {
  return listEvents().find((e) => e.slug === slug);
}
