import type { Metadata } from "next";

import { LandingV2 } from "@/components/ui-v2/LandingV2";

/**
 * Variante « sobre et rapide » (ui-v2) : sections Tailwind, apparitions par
 * IntersectionObserver, sans flou ni animation pilotée par le défilement.
 * Conservée sur sa propre route pour comparaison avec le laboratoire immersif.
 */
export const metadata: Metadata = {
  title: { absolute: "AESBT — Variante sobre" },
};

export default function Version4Page() {
  return <LandingV2 />;
}
