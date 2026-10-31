import type { Metadata } from "next";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { recupererRessources } from "@/data/source";

import { ResourcesLanding } from "./ResourcesLanding";

const TITLE = "Centre de ressources";
const DESCRIPTION =
  "Guides pour étudier en Tunisie, vie pratique, documents de l'association, opportunités et questions fréquentes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ressources" },
  openGraph: {
    type: "website",
    url: "/ressources",
    title: `${TITLE} — AESBT`,
    description: DESCRIPTION,
  },
};

export default async function ResourcesPage() {
  const resources = await recupererRessources();

  return (
    <SiteLayout>
      <ResourcesLanding resources={resources} />
    </SiteLayout>
  );
}
