import { OngletsFiltre } from "../_gestion/OngletsFiltre";
import { EnTetePageAdmin } from "../_kit";
import { PageListe } from "../_commun/PageListe";
import { charger } from "../_commun/serveur";
import { chargerSuggestions } from "../_commun/suggestions";
import { mediasDisponibles } from "../publications/_medias";
import { DROITS_EDITEUR } from "@/components/droits/catalogue";
import { appelApi } from "@/lib/api-admin";
import type { DroitAffiche } from "./_composants/GestionEditeur";
import { ListeMembres, type MembreAdmin } from "./ListeMembres";

export const metadata = { title: "Bureau et membres" };

const FILTRES = [
  { valeur: undefined, libelle: "Tous" },
  { valeur: "bureau", libelle: "Bureau" },
  { valeur: "cellule", libelle: "Cellule" },
] as const;

export default async function MembresPage({
  searchParams,
}: {
  searchParams: Promise<{ entite?: string }>;
}) {
  const { entite } = await searchParams;
  const filtre = entite === "bureau" || entite === "cellule" ? entite : undefined;

  const [{ donnees, erreur }, medias, suggestions, droitsApi] = await Promise.all([
    charger<{ membres: MembreAdmin[] }>("/api/v1/admin/membres"),
    mediasDisponibles(),
    chargerSuggestions(["role"]),
    appelApi<{ droits: DroitAffiche[] }>("/api/v1/admin/droits-editeur").catch(() => null),
  ]);

  // Repli sur le catalogue local si l'API ne répond pas : la nomination reste possible.
  const catalogueDroits: DroitAffiche[] =
    droitsApi?.droits ??
    DROITS_EDITEUR.map(({ cle, libelle, description }) => ({ cle, libelle, description }));

  const tous = donnees?.membres ?? [];

  return (
    <div>
      <EnTetePageAdmin
        titre="Bureau et membres"
        description="Les personnes affichées sur les pages Association et Cellule. Supprimer un membre ne supprime pas sa photo de la médiathèque."
      />

      <div className="mt-6">
        <OngletsFiltre
          libelle="Filtrer par entité"
          onglets={FILTRES.map((f) => ({
            libelle: f.libelle,
            href: f.valeur ? `/admin/membres?entite=${f.valeur}` : "/admin/membres",
            actif: filtre === f.valeur,
            compte: tous.filter((m) => !f.valeur || m.entite === f.valeur).length,
          }))}
        />
      </div>

      <PageListe erreur={erreur}>
        <ListeMembres
          membres={tous}
          medias={medias}
          filtre={filtre ?? null}
          suggestionsRole={suggestions.role}
          catalogueDroits={catalogueDroits}
        />
      </PageListe>
    </div>
  );
}
