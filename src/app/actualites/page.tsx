import type { Metadata } from "next";

import { FloatingNav } from "@/components/home/FloatingNav";
import { THEME_CLAIR } from "@/components/home/themes";
import { Footer } from "@/components/layout/Footer";
import { ActualitesPage } from "@/components/news/ActualitesPage";

const TITLE = "Actualités";
const DESCRIPTION =
  "Toutes les actualités et publications officielles de l'Association des Étudiants et Stagiaires Burkinabè en Tunisie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/actualites" },
  openGraph: {
    type: "website",
    url: "/actualites",
    title: `${TITLE} : AESBT`,
    description: DESCRIPTION,
  },
};

export default function NewsListPage() {
  return <ActualitesPage nav={<FloatingNav theme={THEME_CLAIR} />} footer={<Footer />} />;
}
