import { SOURCE_MESSAGES } from "@/components/editable/ContenusClient";

import type { ValeurContenu } from "./types";

/**
 * Protocole postMessage côté éditeur (INCHANGÉ, voir ContenusClient.tsx).
 *
 * Reçus de l'aperçu : `{ source, type: "selection", cle }` et
 * `{ source, type: "pret", page }`. Envoyé à l'aperçu :
 * `{ source, type: "valeur", cle, valeur }`.
 */

export type MessageApercu = { type: "selection"; cle: string } | { type: "pret"; page: string };

/**
 * Lit un événement `message`. Renvoie null si l'origine n'est pas la nôtre,
 * si l'expéditeur n'est pas l'iframe attendue ou si la forme est inattendue.
 */
export function lireMessageApercu(
  event: MessageEvent,
  fenetreApercu: Window | null | undefined,
): MessageApercu | null {
  if (event.origin !== window.location.origin) return null;
  if (!fenetreApercu || event.source !== fenetreApercu) return null;
  const d: unknown = event.data;
  if (typeof d !== "object" || d === null) return null;
  const m = d as { source?: unknown; type?: unknown; cle?: unknown; page?: unknown };
  if (m.source !== SOURCE_MESSAGES) return null;
  if (m.type === "selection" && typeof m.cle === "string") return { type: "selection", cle: m.cle };
  if (m.type === "pret" && typeof m.page === "string") return { type: "pret", page: m.page };
  return null;
}

/** Envoie une valeur à l'aperçu (origine cible stricte, jamais "*"). */
export function envoyerValeur(
  fenetreApercu: Window | null | undefined,
  cle: string,
  valeur: ValeurContenu,
): void {
  fenetreApercu?.postMessage(
    { source: SOURCE_MESSAGES, type: "valeur", cle, valeur },
    window.location.origin,
  );
}
