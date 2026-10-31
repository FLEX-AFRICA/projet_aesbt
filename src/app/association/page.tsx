import type { Metadata } from "next";

import { contenuTexte } from "@/components/editable/contenu";
import { chargerContenus } from "@/lib/contenus";
import { AssociationContenu } from "./_contenu";

/**
 * Référencement : titre et description viennent des contenus publiés (repli
 * sur les défauts locaux si l'API est absente). `chargerContenus` ne lit ni
 * cookies ni mode brouillon : la page reste statique (ISR).
 */
export async function generateMetadata(): Promise<Metadata> {
  const contenus = await chargerContenus("association");
  const titre = contenuTexte(contenus, "association.seo.titre", "L'association");
  const description = contenuTexte(contenus, "association.seo.description");

  return {
    title: titre,
    description,
    alternates: { canonical: "/association" },
    openGraph: {
      type: "website",
      url: "/association",
      title: `${titre} : AESBT`,
      description,
    },
  };
}

/**
 * Page publique : statique (ISR). Elle ne lit JAMAIS le mode brouillon ; c'est
 * la route /apercu/association qui le fait (voir `AssociationContenu`).
 */
export default function AssociationPage() {
  return <AssociationContenu />;
}
