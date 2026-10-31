import { EnTetePageAdmin } from "../_kit";
import { chargerSuggestions } from "../_commun/suggestions";
import { PageListe } from "../_commun/PageListe";
import { charger, estAdministrateur } from "../_commun/serveur";
import { mediasDisponibles } from "../publications/_medias";
import { ListeEvenements, type AlbumDisponible, type EvenementAdmin } from "./ListeEvenements";

export const metadata = { title: "Événements" };

export default async function EvenementsPage() {
  const [{ donnees, erreur }, medias, admin, suggestions, albums] = await Promise.all([
    charger<{ evenements: EvenementAdmin[] }>("/api/v1/admin/evenements"),
    mediasDisponibles(),
    estAdministrateur(),
    chargerSuggestions(["lieu"]),
    charger<{ albums: AlbumDisponible[] }>("/api/v1/admin/albums"),
  ]);

  const evenements = donnees?.evenements ?? [];
  // Un album est « non lié » s'il n'apparaît dans aucun événement. Si la liste
  // des albums n'a pas pu être chargée, la liaison est simplement indisponible.
  const dejaLies = new Set(evenements.flatMap((e) => (e.albums ?? []).map((a) => a.id)));
  const albumsLibres = (albums.donnees?.albums ?? []).filter((a) => !dejaLies.has(a.id));

  return (
    <div>
      <EnTetePageAdmin
        titre="Événements"
        description="Les événements de l'association. Un événement n'est visible qu'une fois publié ; sa couverture reste dans la médiathèque s'il est supprimé."
      />
      <PageListe erreur={erreur}>
        <ListeEvenements
          evenements={evenements}
          albumsLibres={albumsLibres}
          medias={medias}
          suggestionsLieu={suggestions.lieu}
          peutPublier={admin}
        />
      </PageListe>
    </div>
  );
}
