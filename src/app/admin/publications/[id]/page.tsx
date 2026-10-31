import Link from "next/link";
import { notFound } from "next/navigation";

import { appelApi, ApiErreur } from "@/lib/api-admin";

import { chargerSuggestions } from "../../_commun/suggestions";
import { EditeurPublication } from "../EditeurPublication";
import { mediasDisponibles } from "../_medias";

export const metadata = { title: "Modifier un contenu" };

interface Publication {
  id: string;
  type: string;
  slug: string;
  titre: string;
  chapeau: string | null;
  corps: string | null;
  categorie: string | null;
  couverture_id: string | null;
  source_url: string | null;
  statut: string;
  planifie_le: string | null;
}

export default async function ModifierPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let publication: Publication;
  try {
    ({ publication } = await appelApi<{ publication: Publication }>(
      `/api/v1/admin/publications/${id}`,
    ));
  } catch (err) {
    if (err instanceof ApiErreur && err.statut === 404) notFound();
    throw err;
  }

  const [medias, suggestions] = await Promise.all([
    mediasDisponibles(),
    chargerSuggestions(["categorie_publication"]),
  ]);

  return (
    <div>
      <Link
        href={`/admin/publications?type=${publication.type}`}
        className="text-[13px] font-semibold text-accent-blue hover:underline"
      >
        ← Publications
      </Link>

      <h1 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
        {publication.titre}
      </h1>
      <p className="mt-2 text-[13px] text-muted-ink">
        {publication.type}, /{publication.slug}
      </p>

      <EditeurPublication
        medias={medias}
        suggestionsCategorie={suggestions.categorie_publication}
        initiales={{
          id: publication.id,
          type: publication.type,
          titre: publication.titre,
          chapeau: publication.chapeau ?? "",
          corps: publication.corps ?? "",
          categorie: publication.categorie ?? "",
          couverture_id: publication.couverture_id ?? "",
          source_url: publication.source_url ?? "",
          statut: publication.statut,
          planifie_le: publication.planifie_le,
        }}
      />
    </div>
  );
}
