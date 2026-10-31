"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { IconePole, PoleResume } from "@/lib/api-admin-poles";

import { ChampFormulaire, classeChamp, TiroirFormulaire } from "../_kit";
import { useEnregistrement } from "../_commun/useEnregistrement";
import { nullSiVide, valider } from "../_commun/validation";
import { creerPole, lireIconesPoles, modifierPole } from "./actions";
import { ICONES_PAR_DEFAUT, SelecteurIcone } from "./SelecteurIcone";
import { schemaPole } from "./validation";

/** Création (pôle nul) ou modification d'un pôle. */
export function TiroirPole({
  pole,
  open,
  onOpenChange,
  ordreSuivant,
}: {
  pole: PoleResume | null;
  open: boolean;
  onOpenChange: (ouvert: boolean) => void;
  ordreSuivant: number;
}) {
  const router = useRouter();
  const [nom, setNom] = useState(pole?.nom ?? "");
  const [description, setDescription] = useState(pole?.description ?? "");
  const [ordre, setOrdre] = useState(String(pole?.ordre ?? ordreSuivant));
  const [icone, setIcone] = useState(pole?.icone ?? "sciences");
  const [icones, setIcones] = useState<readonly IconePole[]>(ICONES_PAR_DEFAUT);
  const [actif, setActif] = useState(pole ? pole.actif : true);
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  // Liste officielle des icônes : en cas d'échec, la liste par défaut reste valable.
  useEffect(() => {
    let annule = false;
    lireIconesPoles().then((liste) => {
      if (!annule && liste.length > 0) setIcones(liste);
    });
    return () => {
      annule = true;
    };
  }, []);

  const enregistrer = () => {
    const verdict = valider(schemaPole, { nom, ordre });
    lancer(
      verdict.ok ? {} : verdict.erreurs,
      () => {
        const champs = {
          nom: nom.trim(),
          description: nullSiVide(description),
          icone,
          ordre: ordre.trim() === "" ? ordreSuivant : Number(ordre),
          actif,
        };
        return pole ? modifierPole(pole.id, champs) : creerPole(champs);
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
      titre={pole ? "Modifier le pôle" : "Nouveau pôle"}
      description="Un pôle regroupe des membres autour d'un domaine d'activité de la Cellule Scientifique."
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      <ChampFormulaire libelle="Nom" requis erreur={erreursChamps["nom"]}>
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={nom}
            maxLength={120}
            disabled={enCours}
            onChange={(e) => setNom(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <SelecteurIcone valeur={icone} onChange={setIcone} icones={icones} desactive={enCours} />
      <ChampFormulaire
        libelle="Filières"
        aide="Les filières que réunit le pôle, affichées sous son nom (par exemple : Génie civil, Architecture)."
      >
        {(p) => (
          <textarea
            {...p}
            rows={4}
            className={classeChamp}
            value={description}
            disabled={enCours}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Ordre d'affichage"
        aide="Les petits nombres apparaissent en premier."
        erreur={erreursChamps["ordre"]}
      >
        {(p) => (
          <input
            {...p}
            type="number"
            min={0}
            max={999}
            className={classeChamp}
            value={ordre}
            disabled={enCours}
            onChange={(e) => setOrdre(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <label className="flex items-start gap-2 text-[14px] text-ink">
        <input
          type="checkbox"
          checked={actif}
          disabled={enCours}
          onChange={(e) => setActif(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--color-accent-blue)]"
        />
        <span>
          Pôle actif
          <span className="block text-[12px] text-muted-ink">
            Un pôle désactivé n'accepte plus de demandes ni d'ajouts, mais conserve ses membres.
          </span>
        </span>
      </label>
    </TiroirFormulaire>
  );
}
