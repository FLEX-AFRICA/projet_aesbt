"use client";

import { Images, Link2 } from "lucide-react";
import { useState } from "react";

import { StatutPoint, TableauDonnees, type Colonne, type MediaChoisissable } from "../_kit";
import { MenuActionsLigne } from "../_commun/MenuActionsLigne";
import { BarreOutils } from "../_commun/BarreOutils";
import { dateHeure } from "../_commun/dates";
import { statutAffichable } from "../_commun/statut";
import { changerStatutEvenement, supprimerEvenement } from "./actions";
import { TiroirEvenement } from "./TiroirEvenement";

/** Événement tel que renvoyé par GET /admin/evenements. */
export interface EvenementAdmin {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  debute_le: string | null;
  lieu: string | null;
  couverture_id: string | null;
  inscription_url: string | null;
  statut: string;
  /** Lien externe (Google Drive) vers les photos. */
  lien_photos?: string | null;
  /** Albums rattachés à l'événement. */
  albums?: AlbumLie[];
}

export interface AlbumLie {
  id: string;
  slug: string;
  titre: string;
  statut: string;
  nb_photos: number;
}

/** Album de la galerie proposé à la liaison. */
export interface AlbumDisponible {
  id: string;
  titre: string;
  statut: string;
}

export function ListeEvenements({
  evenements,
  albumsLibres,
  medias,
  peutPublier,
  suggestionsLieu,
}: {
  evenements: EvenementAdmin[];
  /** Albums qui ne sont rattachés à aucun événement. */
  albumsLibres: AlbumDisponible[];
  medias: MediaChoisissable[];
  peutPublier: boolean;
  /** Lieux déjà utilisés, proposés dans le formulaire. */
  suggestionsLieu: string[];
}) {
  const [edition, setEdition] = useState<string | "nouveau" | null>(null);
  // L'événement en cours d'édition est relu dans la liste à jour (après liaison d'un album, par exemple).
  const enEdition =
    edition !== null && edition !== "nouveau"
      ? evenements.find((e) => e.id === edition)
      : undefined;

  const colonnes: Colonne<EvenementAdmin>[] = [
    {
      cle: "titre",
      titre: "Événement",
      valeurTri: (e) => e.titre,
      rendu: (e) => (
        <div className="min-w-[14rem]">
          <button
            type="button"
            onClick={() => setEdition(e.id)}
            className="block max-w-full truncate text-left font-semibold text-ink hover:text-accent-blue focus-visible:outline-none focus-visible:underline"
          >
            {e.titre}
          </button>
          <p className="text-[12px] text-muted-ink">{e.lieu ?? "Lieu non précisé"}</p>
        </div>
      ),
    },
    {
      cle: "debut",
      titre: "Date",
      valeurTri: (e) => e.debute_le,
      rendu: (e) => dateHeure(e.debute_le),
    },
    {
      cle: "photos",
      titre: "Photos",
      rendu: (e) => <IndicateursPhotos evenement={e} />,
    },
    {
      cle: "statut",
      titre: "Statut",
      valeurTri: (e) => e.statut,
      rendu: (e) => <StatutPoint statut={statutAffichable(e.statut)} />,
    },
    {
      cle: "actions",
      titre: "",
      classe: "w-14 text-right",
      rendu: (e) => (
        <MenuActionsLigne
          nom={e.titre}
          onModifier={() => setEdition(e.id)}
          urlSite={e.statut === "publie" ? "/evenements" : null}
          statut={{
            statut: statutAffichable(e.statut),
            peutPublier,
            onChanger: (cible) => changerStatutEvenement(e.id, cible),
          }}
          suppression={{
            titre: "Supprimer cet événement ?",
            description: `L'événement « ${e.titre} » sera supprimé définitivement. Son image de couverture reste dans la médiathèque.`,
            action: () => supprimerEvenement(e.id),
          }}
        />
      ),
    },
  ];

  return (
    <>
      <BarreOutils libelle="Nouvel événement" onClick={() => setEdition("nouveau")} />
      <TableauDonnees
        legende="Événements"
        lignes={evenements}
        colonnes={colonnes}
        idLigne={(e) => e.id}
        rechercheTexte={(e) => `${e.titre} ${e.lieu ?? ""}`}
        vide={{
          titre: "Aucun événement",
          description:
            "Créez un premier événement : il restera en brouillon jusqu'à sa publication.",
        }}
      />
      <TiroirEvenement
        key={edition ?? "ferme"}
        evenement={enEdition ?? null}
        albumsLibres={albumsLibres}
        open={edition === "nouveau" || enEdition !== undefined}
        onOpenChange={(ouvert) => {
          if (!ouvert) setEdition(null);
        }}
        medias={medias}
        suggestionsLieu={suggestionsLieu}
      />
    </>
  );
}

/** Pastilles « Album lié » et « Lien photos » de la liste. */
function IndicateursPhotos({ evenement }: { evenement: EvenementAdmin }) {
  const nbAlbums = evenement.albums?.length ?? 0;
  if (nbAlbums === 0 && !evenement.lien_photos) {
    return <span className="text-[13px] text-muted-ink">Aucune</span>;
  }
  const classe =
    "inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[12px] font-medium text-ink-soft";
  return (
    <div className="flex flex-wrap gap-1.5">
      {nbAlbums > 0 && (
        <span className={classe}>
          <Images className="size-3.5" aria-hidden="true" />
          {nbAlbums > 1 ? `Albums liés (${nbAlbums})` : "Album lié"}
        </span>
      )}
      {evenement.lien_photos && (
        <span className={classe}>
          <Link2 className="size-3.5" aria-hidden="true" />
          Lien photos
        </span>
      )}
    </div>
  );
}
