import { EnTetePageAdmin } from "../_kit";
import { PageListe } from "../_commun/PageListe";
import { charger } from "../_commun/serveur";
import { ListeStatistiques, type StatistiqueAdmin } from "./ListeStatistiques";

export const metadata = { title: "Statistiques" };

export default async function StatistiquesPage() {
  const { donnees, erreur } = await charger<{ statistiques: StatistiqueAdmin[] }>(
    "/api/v1/admin/statistiques",
  );

  return (
    <div>
      <EnTetePageAdmin
        titre="Statistiques"
        description="Les chiffres clés affichés sur l'accueil et la page Association. Une valeur vide masque le chiffre sur le site."
      />
      <PageListe erreur={erreur}>
        <ListeStatistiques statistiques={donnees?.statistiques ?? []} />
      </PageListe>
    </div>
  );
}
