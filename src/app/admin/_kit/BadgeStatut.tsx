import { cn } from "@/lib/utils";

import type { StatutContenu } from "./types";

const STYLES: Record<StatutContenu, { libelle: string; classes: string }> = {
  brouillon: {
    libelle: "Brouillon",
    classes: "bg-frost-deep/60 text-ink-soft ring-line",
  },
  en_attente: {
    libelle: "En attente de validation",
    classes: "bg-[#C9961B]/10 text-[#7a5a0a] ring-[#C9961B]/30",
  },
  publie: {
    libelle: "Publié",
    classes: "bg-accent-green/10 text-accent-green ring-accent-green/30",
  },
  archive: {
    libelle: "Archivé",
    classes: "bg-accent-red/10 text-accent-red ring-accent-red/30",
  },
};

/**
 * Badge de statut d'un contenu. Le texte porte le sens : la couleur seule
 * ne suffit pas (daltonisme).
 */
export function BadgeStatut({ statut, className }: { statut: StatutContenu; className?: string }) {
  const { libelle, classes } = STYLES[statut];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold leading-none ring-1 ring-inset",
        classes,
        className,
      )}
    >
      {libelle}
    </span>
  );
}
