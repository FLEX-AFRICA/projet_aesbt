import type { Metadata } from "next";

import { fusionnerContenus } from "@/lib/contenus";
import { obtenirContenus } from "@/lib/api";
import { contenuTexte } from "@/components/editable/contenu";
import { AccueilContenu } from "./_contenu-accueil";

/**
 * SEO de l'accueil : contenus publiés, repli sur les défauts locaux. Ne lit
 * jamais le mode brouillon (la page reste statique, ISR).
 */
export async function generateMetadata(): Promise<Metadata> {
  const reponse = await obtenirContenus("accueil");
  const contenus = fusionnerContenus("accueil", reponse?.contenus ?? null);
  const description = contenuTexte(contenus, "accueil.seo.description");

  return {
    title: { absolute: contenuTexte(contenus, "accueil.seo.titre") },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      title: contenuTexte(contenus, "accueil.seo.og_titre"),
      description,
    },
  };
}

/**
 * Page publique : statique (ISR). C'est la route /apercu/accueil qui lit le
 * mode brouillon (voir `AccueilContenu`).
 */
export default function HomePage() {
  return <AccueilContenu />;
}
