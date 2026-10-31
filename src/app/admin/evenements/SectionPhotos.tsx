"use client";

import { Images, Link2Off, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { classeChamp } from "../_kit";
import { isoVersLocal } from "../_commun/dates";
import { dateAlbumDepuis } from "./dateAlbum";
import { creerAlbumPourEvenement, lierAlbum } from "./actions";
import type { AlbumDisponible, EvenementAdmin } from "./ListeEvenements";

const classeBouton =
  "inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 disabled:opacity-50";

const LIBELLE_STATUT: Record<string, string> = {
  brouillon: "brouillon",
  publie: "publié",
  archive: "archivé",
};

/**
 * Albums d'un événement existant : créer l'album, lier un album libre, délier
 * un album déjà lié. Chaque opération est une action serveur ; la liste se met
 * à jour par `router.refresh()`.
 */
export function GestionAlbums({
  evenement,
  albumsLibres,
}: {
  evenement: EvenementAdmin;
  albumsLibres: AlbumDisponible[];
}) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [choix, setChoix] = useState("");
  const liés = evenement.albums ?? [];

  const lancer = (action: () => Promise<{ ok: boolean; message?: string; id?: string }>) => {
    setErreur(null);
    demarrer(async () => {
      const r = await action();
      if (!r.ok) {
        setErreur(r.message ?? "L'opération a échoué.");
        return;
      }
      setChoix("");
      if (r.id) router.push(`/admin/galerie/${encodeURIComponent(r.id)}`);
      else router.refresh();
    });
  };

  return (
    <div className="grid gap-4">
      {liés.length > 0 ? (
        <ul className="grid gap-2" aria-label="Albums liés à cet événement">
          {liés.map((album) => (
            <li
              key={album.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2"
            >
              <Link
                href={`/admin/galerie/${encodeURIComponent(album.id)}`}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-accent-blue underline-offset-4 hover:underline"
              >
                <Images className="size-4" aria-hidden="true" />
                {album.titre}
                <span className="text-[12px] font-normal text-muted-ink">
                  ({LIBELLE_STATUT[album.statut] ?? album.statut}, {album.nb_photos} photo
                  {album.nb_photos > 1 ? "s" : ""})
                </span>
              </Link>
              <button
                type="button"
                className={classeBouton}
                disabled={enCours}
                onClick={() => lancer(() => lierAlbum(album.id, null))}
              >
                <Link2Off className="size-4" aria-hidden="true" />
                Délier
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-muted-ink">Aucun album n'est lié à cet événement.</p>
      )}

      <div>
        <button
          type="button"
          className={classeBouton}
          disabled={enCours}
          onClick={() =>
            lancer(() =>
              creerAlbumPourEvenement(
                evenement.id,
                evenement.titre,
                dateAlbumDepuis(isoVersLocal(evenement.debute_le)),
              ),
            )
          }
        >
          <Plus className="size-4" aria-hidden="true" />
          Créer l'album de cet événement
        </button>
        <p className="mt-1.5 text-[12px] text-muted-ink">
          L'album est créé en brouillon avec le titre et la date de l'événement, puis ouvert pour
          ajouter les photos.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="grid min-w-0 flex-1 gap-1 text-[13px] font-medium text-ink">
          Lier un album existant
          <select
            className={classeChamp}
            value={choix}
            disabled={enCours || albumsLibres.length === 0}
            onChange={(e) => setChoix(e.target.value)}
          >
            <option value="">
              {albumsLibres.length === 0 ? "Aucun album disponible" : "Choisir un album"}
            </option>
            {albumsLibres.map((a) => (
              <option key={a.id} value={a.id}>
                {a.titre} ({LIBELLE_STATUT[a.statut] ?? a.statut})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={classeBouton}
          disabled={enCours || choix === ""}
          onClick={() => lancer(() => lierAlbum(choix, evenement.id))}
        >
          Lier
        </button>
      </div>

      {erreur && (
        <p role="alert" className="text-[13px] text-accent-red">
          {erreur}
        </p>
      )}
    </div>
  );
}
