import { CheckCircle2, Clock, XCircle } from "lucide-react";

import type { StatutPole } from "@/lib/api-poles";

/** Étiquette du statut de l'étudiant : le texte porte le sens, l'icône et la couleur l'accompagnent. */
export function StatutPoleEtiquette({ statut }: { statut: StatutPole | null }) {
  if (statut === "valide") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-300/60">
        <CheckCircle2 aria-hidden="true" className="size-3.5" />
        Membre
      </span>
    );
  }
  if (statut === "en_attente") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[12px] font-semibold text-amber-900 ring-1 ring-inset ring-amber-300/60">
        <Clock aria-hidden="true" className="size-3.5" />
        Demande en attente
      </span>
    );
  }
  if (statut === "refuse") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[12px] font-semibold text-red-900 ring-1 ring-inset ring-red-300/60">
        <XCircle aria-hidden="true" className="size-3.5" />
        Demande refusée
      </span>
    );
  }
  return null;
}
