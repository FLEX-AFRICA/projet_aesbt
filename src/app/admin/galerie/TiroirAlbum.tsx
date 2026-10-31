"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AlbumGalerie, EvenementOption } from "@/lib/api-admin-galerie";

import { ChampFormulaire, classeChamp, TiroirFormulaire, type MediaChoisissable } from "../_kit";
import { ChampCouverture } from "../_commun/ChampCouverture";
import { useEnregistrement } from "../_commun/useEnregistrement";
import { nullSiVide, valider } from "../_commun/validation";
import { creerAlbum, modifierAlbum } from "./actions";
import { ChampEvenement } from "./ChampEvenement";
import { schemaAlbum } from "./validation";

/**
 * Création (album nul) ou modification d'un album. Rendu avec une `key`
 * propre à l'album édité : l'état du formulaire repart de zéro à chaque ouverture.
 * Après une création, on ouvre directement l'album pour y ajouter des photos.
 */
export function TiroirAlbum({
  album,
  open,
  onOpenChange,
  medias,
  evenements,
}: {
  album: AlbumGalerie | null;
  open: boolean;
  onOpenChange: (ouvert: boolean) => void;
  medias: MediaChoisissable[];
  evenements: EvenementOption[];
}) {
  const router = useRouter();
  const [titre, setTitre] = useState(album?.titre ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [date, setDate] = useState(album?.date ?? "");
  const [couverture, setCouverture] = useState<string | null>(album?.couverture_id ?? null);
  const [evenementId, setEvenementId] = useState<string | null>(album?.evenement_id ?? null);
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  const enregistrer = () => {
    const verdict = valider(schemaAlbum, { titre, description, date });
    lancer(
      verdict.ok ? {} : verdict.erreurs,
      async () => {
        const champs = {
          titre: titre.trim(),
          description: nullSiVide(description),
          date,
          couverture_id: couverture,
          evenement_id: evenementId,
        };
        if (album) return modifierAlbum(album.id, champs);
        const resultat = await creerAlbum(champs);
        if (resultat.ok && resultat.id) router.push(`/admin/galerie/${resultat.id}`);
        return resultat;
      },
      () => {
        onOpenChange(false);
        router.refresh();
      },
    );
  };

  return (
    <TiroirFormulaire
      open={open}
      onOpenChange={onOpenChange}
      titre={album ? "Modifier l'album" : "Nouvel album"}
      description={
        album
          ? undefined
          : "L'album est créé en brouillon : ajoutez-y des photos, puis publiez-le quand il est prêt."
      }
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      <ChampFormulaire libelle="Nom de l'album" requis erreur={erreursChamps["titre"]}>
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
      <ChampFormulaire libelle="Date" requis erreur={erreursChamps["date"]}>
        {(p) => (
          <input
            {...p}
            type="date"
            className={classeChamp}
            value={date}
            disabled={enCours}
            onChange={(e) => setDate(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire libelle="Description" erreur={erreursChamps["description"]}>
        {(p) => (
          <textarea
            {...p}
            rows={4}
            className={classeChamp}
            value={description}
            maxLength={2000}
            disabled={enCours}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampEvenement
        evenements={evenements}
        valeur={evenementId}
        onChange={setEvenementId}
        disabled={enCours}
      />
      <ChampCouverture
        medias={medias}
        valeur={couverture}
        onChange={setCouverture}
        disabled={enCours}
      />
    </TiroirFormulaire>
  );
}
