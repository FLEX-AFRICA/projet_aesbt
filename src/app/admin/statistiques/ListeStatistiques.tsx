"use client";

import { useId, useState, useTransition } from "react";

import { TableauDonnees, type Colonne } from "../_kit";
import { modifierStatistique } from "./actions";

/** Statistique telle que renvoyée par GET /admin/statistiques. */
export interface StatistiqueAdmin {
  id: string;
  cle: string;
  libelle: string;
  valeur: string | null;
  ordre: number;
}

const MAX_VALEUR = 60;
const MIN_LIBELLE = 2;
const MAX_LIBELLE = 120;

/** Champ de libellé d'une ligne (2 à 120 caractères), enregistré séparément de la valeur. */
function ChampLibelle({ statistique }: { statistique: StatistiqueAdmin }) {
  const id = useId();
  const [libelle, setLibelle] = useState(statistique.libelle);
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const propre = libelle.trim();
  const inchange = propre === statistique.libelle;
  const invalide = propre.length < MIN_LIBELLE || propre.length > MAX_LIBELLE;

  const enregistrer = () => {
    setRetour(null);
    demarrer(async () => {
      const resultat = await modifierStatistique(statistique.cle, { libelle: propre });
      setRetour(
        resultat.ok
          ? { ok: true, message: "Enregistré." }
          : { ok: false, message: resultat.message ?? "L'enregistrement a échoué." },
      );
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!enCours && !inchange && !invalide) enregistrer();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <label htmlFor={id} className="sr-only">
        Libellé de « {statistique.libelle} »
      </label>
      <input
        id={id}
        value={libelle}
        maxLength={MAX_LIBELLE}
        disabled={enCours}
        onChange={(e) => {
          setLibelle(e.target.value);
          setRetour(null);
        }}
        className="w-56 rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />
      <button
        type="submit"
        disabled={enCours || inchange || invalide}
        className="rounded-md bg-accent-blue px-3 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Enregistrer"}
      </button>
      <p
        role={retour?.ok === false ? "alert" : "status"}
        className={`text-[12px] ${retour?.ok === false ? "font-medium text-accent-red" : "text-accent-green"}`}
      >
        {retour?.message ?? ""}
      </p>
    </form>
  );
}

/** Champ de valeur d'une ligne, avec son propre bouton Enregistrer et son retour d'état. */
function ChampValeur({ statistique }: { statistique: StatistiqueAdmin }) {
  const id = useId();
  const [valeur, setValeur] = useState(statistique.valeur ?? "");
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const inchangee = valeur.trim() === (statistique.valeur ?? "");

  const enregistrer = () => {
    setRetour(null);
    demarrer(async () => {
      const resultat = await modifierStatistique(statistique.cle, {
        valeur: valeur.trim() || null,
      });
      setRetour(
        resultat.ok
          ? { ok: true, message: "Enregistré." }
          : { ok: false, message: resultat.message ?? "L'enregistrement a échoué." },
      );
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!enCours && !inchangee) enregistrer();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <label htmlFor={id} className="sr-only">
        Valeur de « {statistique.libelle} »
      </label>
      <input
        id={id}
        value={valeur}
        maxLength={MAX_VALEUR}
        disabled={enCours}
        onChange={(e) => {
          setValeur(e.target.value);
          setRetour(null);
        }}
        className="w-40 rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />
      <button
        type="submit"
        disabled={enCours || inchangee}
        className="rounded-md bg-accent-blue px-3 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Enregistrer"}
      </button>
      <p
        role={retour?.ok === false ? "alert" : "status"}
        className={`text-[12px] ${retour?.ok === false ? "font-medium text-accent-red" : "text-accent-green"}`}
      >
        {retour?.message ?? ""}
      </p>
    </form>
  );
}

export function ListeStatistiques({ statistiques }: { statistiques: StatistiqueAdmin[] }) {
  const colonnes: Colonne<StatistiqueAdmin>[] = [
    {
      cle: "libelle",
      titre: "Libellé",
      valeurTri: (s) => s.libelle,
      rendu: (s) => <ChampLibelle statistique={s} />,
    },
    { cle: "cle", titre: "Clé", rendu: (s) => <code className="text-[12px]">{s.cle}</code> },
    { cle: "valeur", titre: "Valeur", rendu: (s) => <ChampValeur statistique={s} /> },
  ];

  return (
    <div className="grid gap-4">
      <p className="max-w-[75ch] text-[13px] text-muted-ink">
        Le libellé (2 à 120 caractères) et la valeur de chaque chiffre clé se modifient séparément,
        chacun avec son bouton Enregistrer.
      </p>
      <TableauDonnees
        legende="Chiffres clés"
        lignes={statistiques}
        colonnes={colonnes}
        idLigne={(s) => s.id}
        taillePage={0}
        vide={{ titre: "Aucune statistique", description: "Aucun chiffre clé n'est défini." }}
      />
    </div>
  );
}
