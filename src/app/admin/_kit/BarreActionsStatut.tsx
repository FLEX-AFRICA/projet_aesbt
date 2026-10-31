"use client";

import { useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import { cn } from "@/lib/utils";

import type { ResultatOperation, StatutContenu } from "./types";

export type StatutCible = "brouillon" | "publie" | "archive";

const ACTIONS: Record<
  StatutCible,
  { libelle: string; titre: string; texte: string; confirmer: string }
> = {
  publie: {
    libelle: "Publier",
    titre: "Publier ce contenu ?",
    texte: "Il sera visible par tous les visiteurs du site.",
    confirmer: "Publier",
  },
  archive: {
    libelle: "Archiver",
    titre: "Archiver ce contenu ?",
    texte: "Il disparaîtra du site public mais restera consultable ici.",
    confirmer: "Archiver",
  },
  brouillon: {
    libelle: "Repasser en brouillon",
    titre: "Repasser en brouillon ?",
    texte: "Il ne sera plus visible sur le site tant qu'il n'est pas republié.",
    confirmer: "Repasser en brouillon",
  },
};

/** Actions proposées selon le statut courant. */
const PROPOSEES: Record<StatutContenu, StatutCible[]> = {
  brouillon: ["publie"],
  en_attente: ["publie", "brouillon"],
  publie: ["archive", "brouillon"],
  archive: ["publie", "brouillon"],
};

/**
 * Barre d'actions de cycle de vie d'un contenu : Publier, Archiver, Repasser
 * en brouillon, Voir sur le site. Chaque changement de statut demande une
 * confirmation et un échec est signalé dans une popup d'erreur.
 * Sans `peutPublier` (rôle éditeur), les changements de statut sont désactivés.
 */
export function BarreActionsStatut({
  statut,
  peutPublier,
  onChangerStatut,
  urlSite,
  actionsDisponibles,
  className,
}: {
  statut: StatutContenu;
  peutPublier: boolean;
  onChangerStatut: (cible: StatutCible) => Promise<ResultatOperation>;
  /** Adresse de la page publique (ou de son aperçu) ; sans elle, le lien est masqué. */
  urlSite?: string | null;
  /**
   * Restreint les actions proposées (ex. une API sans route « repasser en
   * brouillon »). Par défaut, toutes celles prévues pour le statut courant.
   */
  actionsDisponibles?: readonly StatutCible[];
  className?: string;
}) {
  const [cible, setCible] = useState<StatutCible | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const confirmee = cible ? ACTIONS[cible] : null;

  const executer = (c: StatutCible) => {
    demarrer(async () => {
      const resultat = await onChangerStatut(c);
      if (!resultat.ok) setErreur(resultat.message ?? "Le changement de statut a échoué.");
    });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {PROPOSEES[statut]
        .filter((c) => !actionsDisponibles || actionsDisponibles.includes(c))
        .map((c) => (
          <button
            key={c}
            type="button"
            disabled={!peutPublier || enCours}
            onClick={() => setCible(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 disabled:opacity-50",
              c === "publie"
                ? "bg-accent-green text-primary-foreground hover:opacity-90"
                : "border border-line text-ink hover:bg-surface",
            )}
          >
            {ACTIONS[c].libelle}
          </button>
        ))}

      {urlSite ? (
        <a
          href={urlSite}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-4 py-1.5 text-[13px] font-semibold text-accent-blue transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40"
        >
          Voir sur le site
          <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
        </a>
      ) : null}

      {!peutPublier ? (
        <p className="text-[12px] text-muted-ink">
          Seul un administrateur peut changer le statut. Vos modifications restent en brouillon.
        </p>
      ) : null}

      <StatusDialog
        open={cible !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setCible(null);
        }}
        variant="warning"
        title={confirmee?.titre ?? ""}
        description={confirmee?.texte}
        action={{
          label: confirmee?.confirmer ?? "Confirmer",
          onClick: () => {
            if (cible) executer(cible);
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
        title="Action impossible"
        description={erreur ?? undefined}
      />
    </div>
  );
}
