import type { Metadata } from "next";

import { SiteLayout } from "@/components/layout/SiteLayout";

import { apiConfiguree } from "@/lib/api";
import { recupererEvenements } from "@/data/source";

import { EventsLanding } from "./EventsLanding";
import { evenementsDemo, evenementsDepuisBase } from "./vue";
import { ContactBand } from "@/components/hero-lab/AuroraSections";
import { THEME_CLAIR } from "@/components/home/themes";

const TITLE = "Événements";
const DESCRIPTION =
  "Programme des rencontres, activités et temps forts organisés par l'Association des Étudiants et Stagiaires Burkinabè en Tunisie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/evenements" },
  openGraph: {
    type: "website",
    url: "/evenements",
    title: `${TITLE} — AESBT`,
    description: DESCRIPTION,
  },
};

export default async function EventsPage() {
  // Sans API : programme de démonstration. Avec API : uniquement les
  // événements publiés en base (page statique, régénérée toutes les 5 minutes).
  const evenements = apiConfiguree()
    ? evenementsDepuisBase(await recupererEvenements(), Date.now())
    : evenementsDemo();

  return (
    <SiteLayout>
      <EventsLanding events={evenements} />
      <ContactBand theme={THEME_CLAIR} />
    </SiteLayout>
  );
}
