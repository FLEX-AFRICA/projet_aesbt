import Link from "next/link";

import { EnTetePageAdmin } from "../_kit";
import { PageListe } from "../_commun/PageListe";
import { charger } from "../_commun/serveur";
import { Referentiels } from "./Referentiels";
import {
  ONGLETS,
  type FiliereRef,
  type NiveauRef,
  type OngletRef,
  type UniversiteRef,
} from "./onglets";

export const metadata = { title: "Référentiels" };

export default async function ReferentielsPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { onglet } = await searchParams;
  const actif: OngletRef = ONGLETS.find((o) => o.valeur === onglet)?.valeur ?? "filieres";

  const [filieres, universites, niveaux] = await Promise.all([
    charger<{ filieres: FiliereRef[] }>("/api/v1/admin/referentiels/filieres"),
    charger<{ universites: UniversiteRef[] }>("/api/v1/admin/referentiels/universites"),
    charger<{ niveaux: NiveauRef[] }>("/api/v1/admin/referentiels/niveaux"),
  ]);

  const erreur = filieres.erreur ?? universites.erreur ?? niveaux.erreur;

  return (
    <div>
      <EnTetePageAdmin
        titre="Référentiels"
        description="Filières, universités et niveaux proposés dans les formulaires. Les membres peuvent aussi en ajouter eux-mêmes via l'option « Autre » : relisez-les ici. Une entrée désactivée n'est plus proposée mais reste affichée sur les profils et ressources qui l'utilisent."
      />

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Choisir un référentiel">
        {ONGLETS.map((o) => (
          <Link
            key={o.valeur}
            href={`/admin/referentiels?onglet=${o.valeur}`}
            aria-current={actif === o.valeur ? "page" : undefined}
            className="rounded-full border border-line px-4 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface aria-[current=page]:border-accent-blue aria-[current=page]:bg-accent-blue aria-[current=page]:text-primary-foreground"
          >
            {o.libelle}
          </Link>
        ))}
      </nav>

      <PageListe erreur={erreur}>
        <Referentiels
          onglet={actif}
          filieres={filieres.donnees?.filieres ?? []}
          universites={universites.donnees?.universites ?? []}
          niveaux={niveaux.donnees?.niveaux ?? []}
        />
      </PageListe>
    </div>
  );
}
