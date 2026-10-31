import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { AccueilContenu } from "@/app/_contenu-accueil";

/**
 * Aperçu de la page d'accueil pour l'éditeur visuel.
 *
 * Route dynamique : elle lit le mode brouillon et la session. Le site public
 * (/) reste statique. Sans mode brouillon actif, on renvoie vers la page
 * publique. Jamais indexée.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu : l'accueil",
  robots: { index: false, follow: false },
};

export default async function ApercuAccueilPage() {
  if (!(await draftMode()).isEnabled) redirect("/");
  return <AccueilContenu apercu />;
}
