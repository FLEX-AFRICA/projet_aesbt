"use client";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";

import type { ConflitChamp } from "../actions";

/**
 * Conflit de version (409) : quelqu'un a enregistré un des champs modifiés
 * depuis le chargement. Deux issues : garder sa version (renvoi avec les
 * nouvelles versions) ou recharger (abandon des modifications locales).
 */
export function DialogueConflit({
  conflits,
  libelles,
  onGarder,
  onRecharger,
  onFermer,
}: {
  conflits: ConflitChamp[] | null;
  /** Libellé lisible par clé. */
  libelles: Record<string, string>;
  onGarder: () => void;
  onRecharger: () => void;
  onFermer: () => void;
}) {
  const connues = conflits?.every((c) => c.versionCourante >= 0) ?? false;
  return (
    <StatusDialog
      open={conflits !== null}
      onOpenChange={(ouvert) => {
        if (!ouvert) onFermer();
      }}
      variant="warning"
      title="Conflit de modification"
      description="Un autre utilisateur a enregistré ces champs depuis votre ouverture de la page."
      action={
        connues
          ? { label: "Garder ma version", onClick: onGarder }
          : { label: "Recharger la page", onClick: onRecharger }
      }
      secondaryAction={
        connues
          ? { label: "Recharger (perdre mes modifications)", onClick: onRecharger }
          : { label: "Fermer" }
      }
    >
      <ul className="list-disc space-y-1 pl-5 text-left">
        {(conflits ?? []).map((c) => (
          <li key={c.cle}>{libelles[c.cle] ?? c.cle}</li>
        ))}
      </ul>
    </StatusDialog>
  );
}
