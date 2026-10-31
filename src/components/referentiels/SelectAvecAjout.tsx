"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import type { ResultatAjout } from "./actions";

export interface OptionSelect {
  valeur: string;
  libelle: string;
  /**
   * Entrée technique (« Autre filière », « Autre cursus ») : masquée de la
   * liste, sauf si c'est la valeur actuellement choisie, afin de ne pas
   * perdre une donnée existante.
   */
  technique?: boolean;
}

const VALEUR_AJOUT = "__ajout__";

const classeBase =
  "w-full rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40 aria-[invalid=true]:border-accent-red disabled:opacity-60";

/** Minuscules sans accents ni espaces superflus, pour détecter un doublon. */
function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

interface Props {
  /** Identifiant du contrôle, relié à un <label htmlFor> posé par l'appelant. */
  id?: string | undefined;
  value: string;
  onChange: (valeur: string) => void;
  options: readonly OptionSelect[];
  /** Libellé de l'option vide (« Aucune », « Non renseignée »...). */
  libelleVide: string;
  /** Libellé du champ de saisie révélé, par exemple « Nom de la filière à ajouter ». */
  libelleSaisie: string;
  /** Crée la valeur côté serveur (server action) et renvoie son identifiant. */
  creer: (nom: string) => Promise<ResultatAjout>;
  /**
   * Étendue de la liste (ex. identifiant de la filière pour des matières) :
   * les valeurs ajoutées ici ne sont proposées que dans la même étendue.
   */
  portee?: string | undefined;
  /** Message affiché à la place de l'option d'ajout quand elle n'est pas possible. */
  ajoutImpossible?: string | undefined;
  maxLength?: number | undefined;
  disabled?: boolean | undefined;
  "aria-invalid"?: boolean | "true" | "false" | undefined;
  "aria-describedby"?: string | undefined;
  className?: string | undefined;
}

/**
 * Liste déroulante avec option finale « Autre (ajouter...) » : choisir cette
 * option révèle immédiatement un champ de saisie. À la validation, la valeur
 * est créée côté serveur, ajoutée à la liste et sélectionnée, sans quitter le
 * formulaire. Une valeur déjà présente (casse et accents ignorés) est
 * sélectionnée au lieu d'être recréée.
 */
export function SelectAvecAjout({
  id,
  value,
  onChange,
  options,
  libelleVide,
  libelleSaisie,
  creer,
  portee = "",
  ajoutImpossible,
  maxLength = 120,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  className,
}: Props) {
  const idGenere = useId();
  const idChamp = `${idGenere}-saisie`;
  const idErreur = `${idGenere}-erreur`;
  const [ajoutees, setAjoutees] = useState<(OptionSelect & { portee: string })[]>([]);
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const saisie = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLSelectElement>(null);

  // Le champ révélé reçoit le focus immédiatement.
  useEffect(() => {
    if (saisieOuverte) saisie.current?.focus();
  }, [saisieOuverte]);

  const toutes = [
    ...options,
    ...ajoutees.filter((a) => a.portee === portee && !options.some((o) => o.valeur === a.valeur)),
  ];
  const visibles = toutes.filter((o) => !o.technique || o.valeur === value);
  // Une valeur inconnue de la liste (profil ancien) reste affichable.
  const valeurAffichee = saisieOuverte ? VALEUR_AJOUT : value;

  const fermer = () => {
    setSaisieOuverte(false);
    setNom("");
    setErreur(null);
  };

  const annuler = () => {
    fermer();
    liste.current?.focus();
  };

  const choisir = (valeur: string, libelle: string, option?: OptionSelect) => {
    if (option === undefined) {
      setAjoutees((a) => [...a, { valeur, libelle, portee }]);
    }
    onChange(valeur);
    fermer();
    liste.current?.focus();
  };

  const valider = () => {
    const net = nom.trim().replace(/\s+/g, " ");
    if (net.length < 2) {
      setErreur("Saisissez au moins 2 caractères.");
      saisie.current?.focus();
      return;
    }
    if (net.length > maxLength) {
      setErreur(`Au plus ${maxLength} caractères.`);
      saisie.current?.focus();
      return;
    }

    // Doublon : on sélectionne l'existante, y compris une entrée technique masquée.
    const cle = normaliser(net);
    const existante = toutes.find((o) => !o.technique && normaliser(o.libelle) === cle);
    if (existante) {
      choisir(existante.valeur, existante.libelle, existante);
      return;
    }

    setErreur(null);
    demarrer(async () => {
      const r = await creer(net);
      if (!r.ok || !r.id) {
        setErreur(r.message ?? "Ajout impossible. Réessayez.");
        saisie.current?.focus();
        return;
      }
      const deja = toutes.find((o) => o.valeur === r.id);
      choisir(r.id, r.libelle ?? net, deja);
    });
  };

  const surTouche = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Ne soumet pas le formulaire parent : Entrée valide l'ajout.
      e.preventDefault();
      if (!enCours) valider();
    } else if (e.key === "Escape") {
      // Ne referme pas le tiroir parent : seule la saisie est annulée.
      e.preventDefault();
      e.stopPropagation();
      if (!enCours) annuler();
    }
  };

  return (
    <div className="grid gap-2">
      <select
        ref={liste}
        id={id}
        value={valeurAffichee}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        className={cn(classeBase, className)}
        onChange={(e) => {
          if (e.target.value === VALEUR_AJOUT) {
            setSaisieOuverte(true);
            return;
          }
          fermer();
          onChange(e.target.value);
        }}
      >
        <option value="">{libelleVide}</option>
        {visibles.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.libelle}
          </option>
        ))}
        {ajoutImpossible ? null : <option value={VALEUR_AJOUT}>Autre (ajouter...)</option>}
      </select>

      {ajoutImpossible ? <p className="text-[12px] text-muted-ink">{ajoutImpossible}</p> : null}

      {saisieOuverte ? (
        <div className="grid gap-2 rounded-md border border-line bg-surface p-3">
          <label htmlFor={idChamp} className="text-[12px] font-medium text-ink">
            {libelleSaisie}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={saisie}
              id={idChamp}
              type="text"
              value={nom}
              maxLength={maxLength}
              disabled={enCours}
              autoComplete="off"
              aria-invalid={erreur ? true : undefined}
              aria-describedby={erreur ? idErreur : undefined}
              className={cn(classeBase, "min-w-0 flex-1")}
              onChange={(e) => {
                setNom(e.target.value);
                if (erreur) setErreur(null);
              }}
              onKeyDown={surTouche}
            />
            <button
              type="button"
              disabled={enCours}
              onClick={valider}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 disabled:opacity-50"
            >
              {enCours ? (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <Plus aria-hidden="true" className="size-3.5" />
              )}
              {enCours ? "Ajout..." : "Ajouter"}
            </button>
            <button
              type="button"
              disabled={enCours}
              onClick={annuler}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-3.5" />
              Annuler
            </button>
          </div>
          <p
            id={idErreur}
            role="alert"
            className="text-[12px] font-medium text-accent-red empty:hidden"
          >
            {erreur}
          </p>
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {enCours ? "Ajout en cours" : ""}
      </p>
    </div>
  );
}
