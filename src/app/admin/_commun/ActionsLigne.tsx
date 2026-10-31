"use client";

import { useState, useTransition, type ReactNode } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";

import type { ResultatOperation } from "../_kit";

const classeBouton =
  "rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50";

export interface SuppressionLigne {
  titre: string;
  /** Texte de confirmation : précisez ce qui est supprimé et ce qui est conservé. */
  description: string;
  action: () => Promise<ResultatOperation>;
}

/**
 * Actions d'une ligne de tableau : Modifier, actions propres à l'écran
 * (`children`) et Supprimer avec confirmation. Un échec est affiché dans une
 * popup, jamais ignoré.
 */
export function ActionsLigne({
  nom,
  onModifier,
  suppression,
  children,
}: {
  /** Nom de l'élément, pour des libellés accessibles distincts par ligne. */
  nom: string;
  onModifier: () => void;
  suppression: SuppressionLigne;
  children?: ReactNode;
}) {
  const [confirmer, setConfirmer] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onModifier}
        aria-label={`Modifier ${nom}`}
        className={classeBouton}
      >
        Modifier
      </button>
      {children}
      <button
        type="button"
        disabled={enCours}
        onClick={() => setConfirmer(true)}
        aria-label={`Supprimer ${nom}`}
        className="rounded-md border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        Supprimer
      </button>

      <StatusDialog
        open={confirmer}
        onOpenChange={setConfirmer}
        variant="warning"
        title={suppression.titre}
        description={suppression.description}
        action={{
          label: "Supprimer définitivement",
          onClick: () =>
            demarrer(async () => {
              const resultat = await suppression.action();
              if (!resultat.ok) setErreur(resultat.message ?? "La suppression a échoué.");
            }),
        }}
        secondaryAction={{ label: "Annuler" }}
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title="Suppression impossible"
        description={erreur ?? undefined}
      />
    </div>
  );
}
