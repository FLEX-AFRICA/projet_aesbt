import type { Metadata } from "next";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { SITE } from "@/config/site";

import { chargerCoordonnees } from "@/lib/parametres";

import { AccueilClassique } from "./AccueilClassique";

/**
 * Variante « classique » de l'accueil, conservée pour comparaison avec la
 * page d'accueil actuelle (AuroraPage). Le contenu vit dans un composant
 * client, framer-motion imposant l'hydratation.
 */
export const metadata: Metadata = {
  title: { absolute: "AESBT : accueil (version classique)" },
  description: SITE.description,
};

export default async function AccueilClassiquePage() {
  const coordonnees = await chargerCoordonnees();

  return (
    <SiteLayout>
      <AccueilClassique coordonnees={coordonnees} />
    </SiteLayout>
  );
}
