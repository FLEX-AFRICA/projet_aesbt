"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ChampFormulaire,
  ChampSuggere,
  classeChamp,
  SelecteurMedia,
  TiroirFormulaire,
  type MediaChoisissable,
} from "../_kit";
import { useEnregistrement } from "../_commun/useEnregistrement";
import { nullSiVide, valider } from "../_commun/validation";
import {
  creerRessource,
  modifierRessource,
  type ChampsModificationRessource,
  type TypeRessource,
  type VisibiliteRessource,
} from "./actions";
import { estCommunautaire, estFichier, estPrivee } from "./etat";
import { type RessourceAdmin } from "./ListeRessources";
import { schemaRessource } from "./validation";

/** Choix exclusif présenté en boutons radio, avec une aide sous chaque option. */
function ChoixExclusif<V extends string>({
  nom,
  valeur,
  onChange,
  options,
  disabled,
}: {
  nom: string;
  valeur: V;
  onChange: (v: V) => void;
  options: readonly { valeur: V; libelle: string; aide: string }[];
  disabled: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <label
          key={o.valeur}
          className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-surface/60 p-3 has-[:checked]:border-accent-blue has-[:checked]:ring-1 has-[:checked]:ring-accent-blue has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70"
        >
          <input
            type="radio"
            name={nom}
            value={o.valeur}
            checked={valeur === o.valeur}
            disabled={disabled}
            onChange={() => onChange(o.valeur)}
            className="mt-1 size-4"
          />
          <span className="grid gap-0.5">
            <span className="text-[14px] font-medium text-ink">{o.libelle}</span>
            <span className="text-[12px] text-muted-ink">{o.aide}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * Création (ressource nulle) ou modification d'une ressource.
 *
 * Une nouvelle ressource est toujours un fichier de la galerie, enregistré
 * en brouillon (un administrateur la publie ensuite depuis le tableau). Les
 * anciennes ressources de type lien restent modifiables. Seuls les champs
 * réellement changés sont envoyés en modification.
 */
export function TiroirRessource({
  ressource,
  open,
  onOpenChange,
  medias,
  suggestionsCategorie,
}: {
  ressource: RessourceAdmin | null;
  open: boolean;
  onOpenChange: (ouvert: boolean) => void;
  /** Médias de la galerie proposés pour une ressource de type fichier. */
  medias: MediaChoisissable[];
  /** Catégories déjà en base, proposées pendant la saisie (la saisie libre reste permise). */
  suggestionsCategorie: string[];
}) {
  const router = useRouter();

  const [titre, setTitre] = useState(ressource?.titre ?? "");
  const [description, setDescription] = useState(ressource?.description ?? "");
  const communautaire = ressource ? estCommunautaire(ressource) : false;
  const typeInitial: TypeRessource = ressource && !estFichier(ressource) ? "lien" : "document";
  const visibiliteInitiale: VisibiliteRessource =
    ressource && estPrivee(ressource) ? "prive" : "public";
  // Le type ne se choisit plus : une nouvelle ressource est un fichier.
  const type = typeInitial;
  const [visibilite, setVisibilite] = useState<VisibiliteRessource>(visibiliteInitiale);
  const [fichier, setFichier] = useState<string | null>(ressource?.document_id ?? null);
  const [url, setUrl] = useState(ressource && !estFichier(ressource) ? ressource.url : "");
  const [categorie, setCategorie] = useState(ressource?.categorie ?? "");
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  const enregistrer = () => {
    const verdict = valider(schemaRessource(type, fichier !== null), {
      titre,
      description,
      url,
      corps: "",
      categorie,
    });
    lancer(
      verdict.ok ? {} : verdict.erreurs,
      () => {
        if (!ressource) {
          return creerRessource({
            titre: titre.trim(),
            description: description.trim(),
            type,
            // Une ressource communautaire reste privée : le serveur refuse le contraire.
            visibilite: communautaire ? "prive" : visibilite,
            ...(type === "lien" ? { url: url.trim() } : fichier ? { document_id: fichier } : {}),
            corps: null,
            categorie: nullSiVide(categorie),
            filiere_id: null,
            publier: false,
          });
        }
        const changes: ChampsModificationRessource = {
          ...(titre.trim() !== ressource.titre ? { titre: titre.trim() } : {}),
          ...(description.trim() !== ressource.description
            ? { description: description.trim() }
            : {}),
          ...(type !== typeInitial ? { type } : {}),
          ...(!communautaire && visibilite !== visibiliteInitiale ? { visibilite } : {}),
          ...(type === "lien" && (type !== typeInitial || url.trim() !== ressource.url)
            ? { url: url.trim() }
            : {}),
          ...(type === "document" && fichier && fichier !== ressource.document_id
            ? { document_id: fichier }
            : {}),
          ...(nullSiVide(categorie) !== ressource.categorie
            ? { categorie: nullSiVide(categorie) }
            : {}),
        };
        if (Object.keys(changes).length === 0) {
          return Promise.resolve({ ok: false, message: "Aucune modification à enregistrer." });
        }
        return modifierRessource(ressource.id, changes);
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
      titre={ressource ? "Modifier la ressource" : "Nouvelle ressource"}
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
      <ChampFormulaire
        libelle="Description"
        requis
        aide="Entre 20 et 1000 caractères."
        erreur={erreursChamps["description"]}
      >
        {(p) => (
          <textarea
            {...p}
            rows={4}
            className={classeChamp}
            value={description}
            maxLength={1000}
            disabled={enCours}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </ChampFormulaire>
      {type === "lien" ? (
        <ChampFormulaire
          libelle="Lien"
          requis
          aide="Adresse complète commençant par https://."
          erreur={erreursChamps["url"]}
        >
          {(p) => (
            <input
              {...p}
              type="url"
              inputMode="url"
              className={classeChamp}
              value={url}
              maxLength={2000}
              disabled={enCours}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}
        </ChampFormulaire>
      ) : (
        <div className="grid gap-1.5">
          <SelecteurMedia
            libelle="Fichier"
            medias={medias}
            valeur={fichier}
            onChange={setFichier}
            disabled={enCours}
            aide="Fichier choisi dans la galerie. Pour en ajouter un nouveau, passez par la page Galerie."
            messageVide="La galerie est vide ou indisponible. Ajoutez des fichiers depuis la page Galerie."
          />
          {erreursChamps["fichier"] ? (
            <p role="alert" className="text-[12px] font-medium text-accent-red">
              {erreursChamps["fichier"]}
            </p>
          ) : null}
        </div>
      )}
      <fieldset className="grid gap-2" disabled={enCours || communautaire}>
        <legend className="mb-1 text-[13px] font-medium text-ink">Visibilité</legend>
        <ChoixExclusif
          nom="visibilite"
          valeur={communautaire ? "prive" : visibilite}
          onChange={setVisibilite}
          disabled={enCours || communautaire}
          options={[
            {
              valeur: "public",
              libelle: "Public",
              aide: "Visible par tous les visiteurs du site.",
            },
            {
              valeur: "prive",
              libelle: "Privé",
              aide: "Réservé aux membres connectés.",
            },
          ]}
        />
        {communautaire ? (
          <p className="text-[12px] text-muted-ink">
            Cette ressource est partagée par la communauté : elle reste privée et ne peut pas être
            rendue publique.
          </p>
        ) : null}
      </fieldset>
      <ChampFormulaire libelle="Catégorie" erreur={erreursChamps["categorie"]}>
        {(p) => (
          <ChampSuggere
            {...p}
            value={categorie}
            onChange={setCategorie}
            suggestions={suggestionsCategorie}
            maxLength={80}
            disabled={enCours}
          />
        )}
      </ChampFormulaire>
    </TiroirFormulaire>
  );
}
