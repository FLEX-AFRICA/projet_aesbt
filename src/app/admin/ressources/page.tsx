import Link from "next/link";

import { sessionCourante } from "@/lib/api-admin";

import { EnTetePageAdmin } from "../_kit";
import { PageListe } from "../_commun/PageListe";
import { charger } from "../_commun/serveur";
import { chargerSuggestions } from "../_commun/suggestions";
import { mediasDisponibles } from "../publications/_medias";
import { ListeRessources, type RessourceAdmin } from "./ListeRessources";

export const metadata = { title: "Ressources et documents" };

const TAILLE = 100;

const FILTRES = [
  { cle: undefined, libelle: "Toutes", requete: "" },
  { cle: "publiques", libelle: "Publiques", requete: "&visibilite=public" },
  { cle: "privees", libelle: "Privées", requete: "&visibilite=prive" },
  { cle: "brouillon", libelle: "Brouillons", requete: "&statut=brouillon" },
  { cle: "propose", libelle: "Propositions des membres", requete: "&statut=propose" },
  { cle: "archive", libelle: "Archivées", requete: "&statut=archive" },
  { cle: "rejete", libelle: "Rejetées", requete: "&statut=rejete" },
] as const;

export default async function RessourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtre = FILTRES.find((f) => f.cle === statut) ?? FILTRES[0];

  // Publier reste réservé aux administrateurs : l'API refuse un éditeur.
  const peutPublier = (await sessionCourante())?.role === "admin";

  const [ressources, suggestions, medias] = await Promise.all([
    charger<{ ressources: RessourceAdmin[] }>(
      `/api/v1/admin/ressources?taille=${TAILLE}${filtre.requete}`,
    ),
    chargerSuggestions(["categorie"]),
    mediasDisponibles(),
  ]);

  const liste = ressources.donnees?.ressources ?? [];

  return (
    <div>
      <EnTetePageAdmin
        titre="Ressources et documents"
        description="Liens et fichiers de la bibliothèque, publics ou réservés aux membres connectés. Classez-les avec les flèches du tableau. Les propositions des membres se valident ou se rejettent depuis la page Modération."
      />

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filtrer les ressources">
        {FILTRES.map((f) => (
          <Link
            key={f.libelle}
            href={f.cle ? `/admin/ressources?statut=${f.cle}` : "/admin/ressources"}
            aria-current={filtre.cle === f.cle ? "page" : undefined}
            className="rounded-full border border-line px-4 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface aria-[current=page]:border-accent-blue aria-[current=page]:bg-accent-blue aria-[current=page]:text-primary-foreground"
          >
            {f.libelle}
          </Link>
        ))}
      </nav>

      {liste.length >= TAILLE ? (
        <p className="mt-4 text-[13px] text-muted-ink">
          Seules les {TAILLE} ressources les plus récentes sont affichées : affinez avec un filtre.
        </p>
      ) : null}

      <PageListe erreur={ressources.erreur}>
        <ListeRessources
          ressources={liste}
          medias={medias}
          suggestionsCategorie={suggestions.categorie}
          peutPublier={peutPublier}
        />
      </PageListe>
    </div>
  );
}
