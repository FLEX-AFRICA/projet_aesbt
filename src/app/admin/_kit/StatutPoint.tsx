import { cn } from "@/lib/utils";

const STATUTS: Record<string, { libelle: string; point: string }> = {
  publie: { libelle: "Publié", point: "bg-accent-green" },
  brouillon: { libelle: "Brouillon", point: "bg-muted-ink/60" },
  archive: { libelle: "Archivé", point: "bg-muted-ink/60" },
  en_attente: { libelle: "En attente", point: "bg-[#C9961B]" },
  rejete: { libelle: "Rejeté", point: "bg-accent-red" },
};

/**
 * Statut sobre pour les tableaux : un point de couleur suivi du texte (la
 * couleur ne porte jamais seule le sens). `libelle` remplace le texte par
 * défaut (ex. « Publiée » au féminin).
 */
export function StatutPoint({
  statut,
  libelle,
  className,
}: {
  statut: string;
  libelle?: string | undefined;
  className?: string;
}) {
  const info = STATUTS[statut] ?? STATUTS["brouillon"]!;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-ink",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-full", info.point)} />
      {libelle ?? info.libelle}
    </span>
  );
}
