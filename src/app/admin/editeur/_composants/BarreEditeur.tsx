"use client";

import { History, Monitor, PanelBottom, Redo2, Smartphone, Tablet, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type ModeApercu = "ordinateur" | "tablette" | "mobile";

const BOUTON_VALIDATION =
  "inline-flex items-center justify-center rounded-md bg-ink px-4 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-40";

export const LARGEURS_APERCU: Record<ModeApercu, string> = {
  ordinateur: "100%",
  tablette: "820px",
  mobile: "390px",
};

const MODES: { mode: ModeApercu; libelle: string; Icone: typeof Monitor }[] = [
  { mode: "ordinateur", libelle: "Ordinateur", Icone: Monitor },
  { mode: "tablette", libelle: "Tablette", Icone: Tablet },
  { mode: "mobile", libelle: "Mobile", Icone: Smartphone },
];

const BOUTON =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-40";

/** Barre supérieure de l'éditeur visuel. */
export function BarreEditeur({
  titre,
  mode,
  onMode,
  nbModifications,
  enregistreA,
  peutAnnuler,
  peutRetablir,
  onAnnuler,
  onRetablir,
  onEnregistrer,
  enCours,
  peutEnregistrer,
  onQuitter,
  panneauOuvert,
  onBasculerPanneau,
  estAdmin,
  nbBrouillons,
  occupe,
  onPublier,
  onRejeter,
  onSoumettre,
  onHistorique,
}: {
  titre: string;
  mode: ModeApercu;
  onMode: (m: ModeApercu) => void;
  nbModifications: number;
  /** Heure du dernier enregistrement réussi, ou null. */
  enregistreA: string | null;
  peutAnnuler: boolean;
  peutRetablir: boolean;
  onAnnuler: () => void;
  onRetablir: () => void;
  onEnregistrer: () => void;
  enCours: boolean;
  peutEnregistrer: boolean;
  onQuitter: () => void;
  panneauOuvert: boolean;
  onBasculerPanneau: () => void;
  /** Administrateur : Publier et Rejeter ; éditeur : Soumettre pour validation. */
  estAdmin: boolean;
  /** Nombre de champs ayant un brouillon enregistré sur le serveur. */
  nbBrouillons: number;
  /** Une opération du workflow (publication, rejet, soumission) est en cours. */
  occupe: boolean;
  onPublier: () => void;
  onRejeter: () => void;
  onSoumettre: () => void;
  onHistorique: () => void;
}) {
  const rienAPublier = nbModifications === 0 && nbBrouillons === 0;
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface px-3 py-2">
      <div className="min-w-0">
        <h1 className="truncate font-display text-[15px] font-semibold text-ink">{titre}</h1>
        <p role="status" aria-live="polite" className="text-[12px] text-muted-ink">
          {nbModifications > 0 ? (
            <span className="font-medium text-[#9a6b00]">
              Modifications non enregistrées ({nbModifications})
            </span>
          ) : enregistreA ? (
            `Brouillon enregistré à ${enregistreA}`
          ) : (
            "Aucune modification"
          )}
        </p>
      </div>

      <div role="radiogroup" aria-label="Taille de l'aperçu" className="flex gap-1">
        {MODES.map(({ mode: m, libelle, Icone }) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            aria-label={libelle}
            title={libelle}
            onClick={() => onMode(m)}
            className={cn(
              "grid size-9 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
              mode === m
                ? "border-accent-blue bg-accent-blue text-primary-foreground"
                : "border-line text-ink hover:bg-frost",
            )}
          >
            <Icone aria-hidden="true" className="size-4" />
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          className={BOUTON}
          disabled={!peutAnnuler}
          onClick={onAnnuler}
          aria-keyshortcuts="Control+Z Meta+Z"
        >
          <Undo2 aria-hidden="true" className="size-4" />
          Annuler
        </button>
        <button
          type="button"
          className={BOUTON}
          disabled={!peutRetablir}
          onClick={onRetablir}
          aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z"
        >
          <Redo2 aria-hidden="true" className="size-4" />
          Rétablir
        </button>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={cn(BOUTON, "lg:hidden")}
          aria-expanded={panneauOuvert}
          aria-controls="panneau-edition"
          onClick={onBasculerPanneau}
        >
          <PanelBottom aria-hidden="true" className="size-4" />
          {panneauOuvert ? "Masquer les champs" : "Modifier les champs"}
        </button>
        <button
          type="button"
          disabled={!peutEnregistrer || enCours || occupe}
          onClick={onEnregistrer}
          className="rounded-md bg-accent-blue px-4 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {enCours ? "Enregistrement..." : "Enregistrer le brouillon"}
        </button>
        {estAdmin ? (
          <>
            <button
              type="button"
              className={BOUTON_VALIDATION}
              disabled={rienAPublier || enCours || occupe}
              onClick={onPublier}
            >
              Publier
            </button>
            <button
              type="button"
              className={BOUTON}
              disabled={nbBrouillons === 0 || enCours || occupe}
              onClick={onRejeter}
            >
              Rejeter le brouillon
            </button>
          </>
        ) : (
          <button
            type="button"
            className={BOUTON_VALIDATION}
            disabled={rienAPublier || enCours || occupe}
            onClick={onSoumettre}
          >
            Soumettre pour validation
          </button>
        )}
        <button type="button" className={BOUTON} onClick={onHistorique}>
          <History aria-hidden="true" className="size-4" />
          Historique
        </button>
        <button type="button" className={BOUTON} onClick={onQuitter}>
          Quitter
        </button>
      </div>
    </header>
  );
}
