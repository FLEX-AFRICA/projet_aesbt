"use client";

import {
  Archive,
  CalendarDays,
  Eye,
  EyeOff,
  Images,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AlbumGalerie, EvenementOption } from "@/lib/api-admin-galerie";
import { formatDate } from "@/lib/format";

import { BadgeStatut, classeChamp, type MediaChoisissable, type StatutCible } from "../_kit";
import { Pastille } from "../_gestion/Pastille";
import { BarreOutils } from "../_commun/BarreOutils";
import { statutAffichable } from "../_commun/statut";
import { changerStatutAlbum, supprimerAlbum } from "./actions";
import { CarteAlbum } from "./CarteAlbum";
import { TiroirAlbum } from "./TiroirAlbum";

const ACTIONS_STATUT: Record<
  StatutCible,
  { libelle: string; titre: string; texte: string; confirmer: string }
> = {
  publie: {
    libelle: "Publier",
    titre: "Publier cet album ?",
    texte: "Il sera visible par tous les visiteurs du site.",
    confirmer: "Publier",
  },
  archive: {
    libelle: "Archiver",
    titre: "Archiver cet album ?",
    texte: "Il disparaîtra du site public mais restera consultable ici.",
    confirmer: "Archiver",
  },
  brouillon: {
    libelle: "Repasser en brouillon",
    titre: "Repasser cet album en brouillon ?",
    texte: "Il ne sera plus visible sur le site tant qu'il n'est pas republié.",
    confirmer: "Repasser en brouillon",
  },
};

const PROPOSEES: Record<string, StatutCible[]> = {
  brouillon: ["publie"],
  en_attente: ["publie", "brouillon"],
  publie: ["archive", "brouillon"],
  archive: ["publie", "brouillon"],
};

const ICONES_STATUT = { publie: Eye, archive: Archive, brouillon: EyeOff } as const;

/** Grille de cartes d'albums : recherche, création, modification, statut et suppression. */
export function GrilleAlbums({
  albums,
  medias,
  evenements,
  peutPublier,
}: {
  albums: AlbumGalerie[];
  medias: MediaChoisissable[];
  evenements: EvenementOption[];
  peutPublier: boolean;
}) {
  const router = useRouter();
  const [edition, setEdition] = useState<AlbumGalerie | "nouveau" | null>(null);
  const [recherche, setRecherche] = useState("");
  const [changement, setChangement] = useState<{ album: AlbumGalerie; cible: StatutCible } | null>(
    null,
  );
  const [aSupprimer, setASupprimer] = useState<AlbumGalerie | null>(null);
  const [erreur, setErreur] = useState<{ titre: string; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return q ? albums.filter((a) => a.titre.toLowerCase().includes(q)) : albums;
  }, [albums, recherche]);

  const appliquerStatut = (a: AlbumGalerie, cible: StatutCible) =>
    demarrer(async () => {
      const r = await changerStatutAlbum(a.id, cible);
      if (r.ok) router.refresh();
      else
        setErreur({ titre: "Action impossible", message: r.message ?? "Le changement a échoué." });
    });

  const supprimer = (a: AlbumGalerie) =>
    demarrer(async () => {
      const r = await supprimerAlbum(a.id);
      if (r.ok) router.refresh();
      else
        setErreur({
          titre: "Suppression impossible",
          message: r.message ?? "La suppression a échoué.",
        });
    });

  const confirmee = changement ? ACTIONS_STATUT[changement.cible] : null;

  return (
    <>
      <BarreOutils libelle="Nouvel album" onClick={() => setEdition("nouveau")}>
        <label className="relative block">
          <span className="sr-only">Rechercher un album par nom</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
          />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un album"
            className={`${classeChamp} w-64 max-w-full pl-9`}
          />
        </label>
      </BarreOutils>

      {albums.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface/40 px-6 py-10 text-center text-[14px] text-muted-ink">
          Aucun album pour le moment. Créez le premier avec le bouton Nouvel album, puis ajoutez-y
          des photos.
        </p>
      ) : visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface/40 px-6 py-10 text-center text-[14px] text-muted-ink">
          Aucun album ne correspond à « {recherche.trim()} ».
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map((a) => {
            const statut = statutAffichable(a.statut);
            return (
              <li key={a.id}>
                <CarteAlbum
                  titre={a.titre}
                  date={formatDate(a.date)}
                  couverture={a.couverture}
                  href={`/admin/galerie/${a.id}`}
                  discret={statut === "archive"}
                  pastilles={
                    <>
                      <BadgeStatut statut={statut} />
                      <Pastille icone={Images} ton="accent">
                        {a.nb_photos} photo{a.nb_photos > 1 ? "s" : ""}
                      </Pastille>
                      {a.evenement_id ? (
                        <Pastille icone={CalendarDays} ton="gris" className="max-w-full">
                          <span className="truncate">{a.evenement_titre ?? "Événement lié"}</span>
                        </Pastille>
                      ) : null}
                    </>
                  }
                  menu={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={enCours}
                          aria-label={`Actions pour ${a.titre}`}
                          className="grid size-8 place-items-center rounded-lg bg-white/90 text-[#4a4a4a] shadow-sm transition-colors hover:bg-white hover:text-[#2E7D4F] focus-visible:outline-2 focus-visible:outline-[#2E7D4F] disabled:opacity-50"
                        >
                          <MoreHorizontal aria-hidden="true" className="size-4.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEdition(a)}>
                          <Pencil aria-hidden="true" className="size-4" />
                          Modifier
                        </DropdownMenuItem>
                        {(PROPOSEES[a.statut] ?? PROPOSEES["brouillon"] ?? []).map((cible) => {
                          const Icone = ICONES_STATUT[cible];
                          return (
                            <DropdownMenuItem
                              key={cible}
                              disabled={!peutPublier}
                              onSelect={() => setChangement({ album: a, cible })}
                            >
                              <Icone aria-hidden="true" className="size-4" />
                              {ACTIONS_STATUT[cible].libelle}
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setASupprimer(a)}
                          className="text-red-700 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      {!peutPublier && albums.length > 0 ? (
        <p className="mt-3 text-[12px] text-muted-ink">
          Seul un administrateur peut publier ou archiver un album.
        </p>
      ) : null}

      <TiroirAlbum
        key={edition === null ? "ferme" : edition === "nouveau" ? "nouveau" : edition.id}
        album={edition === "nouveau" ? null : edition}
        open={edition !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setEdition(null);
        }}
        medias={medias}
        evenements={evenements}
      />
      <StatusDialog
        open={changement !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setChangement(null);
        }}
        variant="warning"
        title={confirmee?.titre ?? ""}
        description={confirmee?.texte}
        action={{
          label: confirmee?.confirmer ?? "Confirmer",
          onClick: () => {
            if (changement) appliquerStatut(changement.album, changement.cible);
          },
        }}
        secondaryAction={{ label: "Annuler" }}
      />
      <StatusDialog
        open={aSupprimer !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setASupprimer(null);
        }}
        variant="warning"
        title="Supprimer cet album ?"
        description={
          aSupprimer
            ? `L'album « ${aSupprimer.titre} » et ses liaisons de photos seront supprimés définitivement. Les images restent dans la bibliothèque.`
            : undefined
        }
        action={{
          label: "Supprimer définitivement",
          onClick: () => {
            if (aSupprimer) supprimer(aSupprimer);
          },
        }}
        secondaryAction={{ label: "Annuler" }}
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title={erreur?.titre ?? ""}
        description={erreur?.message}
      />
    </>
  );
}
