"use client";

import { CalendarDays, ExternalLink, ImageIcon, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import type { AlbumDetail, EvenementOption } from "@/lib/api-admin-galerie";
import { formatDate } from "@/lib/format";

import { BadgeStatut, BarreActionsStatut, type MediaChoisissable } from "../../_kit";
import { urlVignette } from "../../_commun/medias";
import { statutAffichable } from "../../_commun/statut";
import { changerStatutAlbum, modifierAlbum } from "../actions";
import { ChampEvenement } from "../ChampEvenement";
import { TiroirAlbum } from "../TiroirAlbum";

/** En-tête d'un album : nom, date, statut, couverture et événement lié. */
export function EnTeteAlbum({
  album,
  medias,
  evenements,
  peutPublier,
}: {
  album: AlbumDetail;
  medias: MediaChoisissable[];
  evenements: EvenementOption[];
  peutPublier: boolean;
}) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const statut = statutAffichable(album.statut);
  const couverture = urlVignette(album.couverture);
  const evenement = evenements.find((e) => e.id === album.evenement_id);

  const lier = (evenementId: string | null) =>
    demarrer(async () => {
      const r = await modifierAlbum(album.id, {
        titre: album.titre,
        description: album.description,
        date: album.date,
        couverture_id: album.couverture_id,
        evenement_id: evenementId,
      });
      if (r.ok) router.refresh();
      else setErreur(r.message ?? "Le lien avec l'événement n'a pas pu être enregistré.");
    });

  return (
    <header className="mt-4 grid gap-5 rounded-2xl border border-line bg-surface/50 p-4 sm:grid-cols-[200px_1fr] sm:p-5">
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-frost text-muted-ink">
        {couverture ? (
          <img src={couverture} alt="Couverture de l'album" className="size-full object-cover" />
        ) : (
          <div className="grid place-items-center gap-1 px-3 text-center text-[12px]">
            <ImageIcon aria-hidden="true" className="size-6" />
            Pas de couverture
          </div>
        )}
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-[28px]">
              {album.titre}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[14px] text-muted-ink">
              <span>{formatDate(album.date)}</span>
              <BadgeStatut statut={statut} />
            </p>
            {album.description ? (
              <p className="mt-2 max-w-[75ch] text-[14px] leading-relaxed text-muted-ink">
                {album.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setEdition(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            Modifier l'album
          </button>
        </div>

        <BarreActionsStatut
          statut={statut}
          peutPublier={peutPublier}
          urlSite={album.statut === "publie" && album.slug ? `/galerie/${album.slug}` : null}
          onChangerStatut={async (cible) => {
            const r = await changerStatutAlbum(album.id, cible);
            if (r.ok) router.refresh();
            return r;
          }}
        />

        <div className="grid max-w-md gap-2">
          <ChampEvenement
            evenements={evenements}
            valeur={album.evenement_id}
            onChange={lier}
            disabled={enCours}
          />
          {album.evenement_id ? (
            <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted-ink">
              <CalendarDays aria-hidden="true" className="size-4" />
              <span>{evenement?.titre ?? album.evenement_titre ?? "Événement lié"}</span>
              <Link
                href="/admin/evenements"
                className="inline-flex items-center gap-1 font-semibold text-accent-blue hover:underline"
              >
                Voir les événements
                <ExternalLink aria-hidden="true" className="size-3" />
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <TiroirAlbum
        key={edition ? "ouvert" : "ferme"}
        album={album}
        open={edition}
        onOpenChange={setEdition}
        medias={medias}
        evenements={evenements}
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title="Modification impossible"
        description={erreur ?? undefined}
      />
    </header>
  );
}
