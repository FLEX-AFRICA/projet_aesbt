"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import {
  ChampFormulaire,
  ChampSuggere,
  classeChamp,
  TiroirFormulaire,
  type MediaChoisissable,
} from "../_kit";
import { ChampCouverture } from "../_commun/ChampCouverture";
import { isoVersLocal, localVersIso } from "../_commun/dates";
import { useEnregistrement } from "../_commun/useEnregistrement";
import { nullSiVide, valider } from "../_commun/validation";
import {
  creerAlbumPourEvenement,
  creerEvenement,
  creerEvenementEtAlbum,
  modifierEvenement,
} from "./actions";
import type { AlbumDisponible, EvenementAdmin } from "./ListeEvenements";
import { dateAlbumDepuis } from "./dateAlbum";
import { GestionAlbums } from "./SectionPhotos";
import { schemaEvenement } from "./validation";

/** Création (événement nul) ou modification d'un événement. */
export function TiroirEvenement({
  evenement,
  open,
  onOpenChange,
  medias,
  suggestionsLieu,
  albumsLibres,
}: {
  evenement: EvenementAdmin | null;
  open: boolean;
  onOpenChange: (ouvert: boolean) => void;
  medias: MediaChoisissable[];
  /** Lieux déjà en base, proposés pendant la saisie (la saisie libre reste permise). */
  suggestionsLieu: string[];
  /** Albums non rattachés à un événement, proposés à la liaison. */
  albumsLibres: AlbumDisponible[];
}) {
  const router = useRouter();
  const [titre, setTitre] = useState(evenement?.titre ?? "");
  const [description, setDescription] = useState(evenement?.description ?? "");
  const [date, setDate] = useState(isoVersLocal(evenement?.debute_le));
  const [lieu, setLieu] = useState(evenement?.lieu ?? "");
  const [inscription, setInscription] = useState(evenement?.inscription_url ?? "");
  const [lienPhotos, setLienPhotos] = useState(evenement?.lien_photos ?? "");
  // Identifiant d'un événement créé pendant cette session de saisie (création + album en un clic).
  const [idCree, setIdCree] = useState<string | null>(null);
  const idAlbumCree = useRef<string | null>(null);
  const [couverture, setCouverture] = useState<string | null>(evenement?.couverture_id ?? null);
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  const idExistant = evenement?.id ?? idCree;

  const valeurs = () => ({
    titre,
    description,
    debute_le: date,
    lieu,
    inscription_url: inscription,
    lien_photos: lienPhotos,
  });

  const champsApi = () => ({
    titre: titre.trim(),
    description: nullSiVide(description),
    debute_le: localVersIso(date),
    lieu: nullSiVide(lieu),
    couverture_id: couverture,
    inscription_url: nullSiVide(inscription),
    lien_photos: nullSiVide(lienPhotos),
  });

  const enregistrer = () => {
    const verdict = valider(schemaEvenement, valeurs());
    lancer(
      verdict.ok ? {} : verdict.erreurs,
      () => (idExistant ? modifierEvenement(idExistant, champsApi()) : creerEvenement(champsApi())),
      () => {
        onOpenChange(false);
        router.refresh();
      },
    );
  };

  /** Création : enregistre l'événement puis son album, et ouvre l'album. */
  const enregistrerEtCreerAlbum = () => {
    const verdict = valider(schemaEvenement, valeurs());
    idAlbumCree.current = null;
    lancer(
      verdict.ok ? {} : verdict.erreurs,
      async () => {
        const champs = champsApi();
        const dateAlbum = dateAlbumDepuis(date);
        if (idExistant) {
          // Reprise après un album échoué : l'événement existe déjà, on le met à jour.
          const maj = await modifierEvenement(idExistant, champs);
          if (!maj.ok) return maj;
          const album = await creerAlbumPourEvenement(idExistant, champs.titre, dateAlbum);
          idAlbumCree.current = album.id ?? null;
          return album;
        }
        const r = await creerEvenementEtAlbum(champs, dateAlbum);
        if (r.evenementId) setIdCree(r.evenementId);
        idAlbumCree.current = r.albumId ?? null;
        return r;
      },
      () => {
        const id = idAlbumCree.current;
        onOpenChange(false);
        if (id) router.push(`/admin/galerie/${encodeURIComponent(id)}`);
        else router.refresh();
      },
    );
  };

  return (
    <TiroirFormulaire
      open={open}
      onOpenChange={onOpenChange}
      titre={evenement ? "Modifier l'événement" : "Nouvel événement"}
      description={
        evenement ? undefined : "L'événement est créé en brouillon : publiez-le quand il est prêt."
      }
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      <ChampFormulaire libelle="Titre" requis erreur={erreursChamps["titre"]}>
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={titre}
            maxLength={200}
            disabled={enCours}
            onChange={(e) => setTitre(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire libelle="Description" erreur={erreursChamps["description"]}>
        {(p) => (
          <textarea
            {...p}
            rows={5}
            className={classeChamp}
            value={description}
            maxLength={5000}
            disabled={enCours}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire libelle="Date" erreur={erreursChamps["debute_le"]}>
        {(p) => (
          <input
            {...p}
            type="datetime-local"
            className={classeChamp}
            value={date}
            disabled={enCours}
            onChange={(e) => setDate(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire libelle="Lieu" erreur={erreursChamps["lieu"]}>
        {(p) => (
          <ChampSuggere
            {...p}
            value={lieu}
            onChange={setLieu}
            suggestions={suggestionsLieu}
            maxLength={200}
            disabled={enCours}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Lien d'inscription"
        aide="Adresse complète commençant par https://. Optionnel."
        erreur={erreursChamps["inscription_url"]}
      >
        {(p) => (
          <input
            {...p}
            type="url"
            inputMode="url"
            className={classeChamp}
            value={inscription}
            maxLength={2000}
            disabled={enCours}
            onChange={(e) => setInscription(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <fieldset className="grid gap-4 rounded-lg border border-line p-4">
        <legend className="px-1 text-[14px] font-semibold text-ink">Photos de l'événement</legend>
        <ChampFormulaire
          libelle="Lien Google Drive des photos"
          aide="Adresse complète commençant par https://. Optionnel : proposé aux visiteurs sur la page de l'événement."
          erreur={erreursChamps["lien_photos"]}
        >
          {(p) => (
            <input
              {...p}
              type="url"
              inputMode="url"
              className={classeChamp}
              value={lienPhotos}
              maxLength={2000}
              disabled={enCours}
              onChange={(e) => setLienPhotos(e.target.value)}
            />
          )}
        </ChampFormulaire>
        {evenement ? (
          <GestionAlbums evenement={evenement} albumsLibres={albumsLibres} />
        ) : (
          <div>
            <button
              type="button"
              disabled={enCours}
              onClick={enregistrerEtCreerAlbum}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden="true" />
              {idCree ? "Créer l'album de cet événement" : "Enregistrer et créer l'album"}
            </button>
            <p className="mt-1.5 text-[12px] text-muted-ink">
              {idCree
                ? "L'événement est déjà enregistré : seul l'album reste à créer."
                : "L'événement est enregistré (en brouillon), puis son album est créé et ouvert pour ajouter les photos. Pour lier un album existant, enregistrez d'abord l'événement puis rouvrez-le."}
            </p>
          </div>
        )}
      </fieldset>
      <ChampCouverture
        medias={medias}
        valeur={couverture}
        onChange={setCouverture}
        disabled={enCours}
      />
    </TiroirFormulaire>
  );
}
