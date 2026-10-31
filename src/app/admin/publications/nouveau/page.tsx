import Link from "next/link";

import { EditeurPublication } from "../EditeurPublication";
import { chargerSuggestions } from "../../_commun/suggestions";
import { mediasDisponibles } from "../_medias";

export const metadata = { title: "Nouveau contenu" };

export default async function NouvellePublicationPage() {
  const [medias, suggestions] = await Promise.all([
    mediasDisponibles(),
    chargerSuggestions(["categorie_publication"]),
  ]);

  return (
    <div>
      <Link
        href="/admin/publications"
        className="text-[13px] font-semibold text-accent-blue hover:underline"
      >
        ← Publications
      </Link>

      <h1 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
        Nouveau contenu
      </h1>
      <p className="mt-2 text-[15px] text-muted-ink">
        Rien n'est visible du public tant que vous n'avez pas publié.
      </p>

      <EditeurPublication
        medias={medias}
        suggestionsCategorie={suggestions.categorie_publication}
        initiales={{
          type: "actualite",
          titre: "",
          chapeau: "",
          corps: "",
          categorie: "",
          couverture_id: "",
          source_url: "",
        }}
      />
    </div>
  );
}
