import { cn } from "@/lib/utils";

/** Deux initiales au plus, à partir d'un nom ou, à défaut, d'une adresse e-mail. */
export function initiales(nom: string | null | undefined): string {
  const base = (nom ?? "").split("@")[0] ?? "";
  const mots = base.split(/[\s._-]+/).filter(Boolean);
  const lettres = mots.length > 1 ? [mots[0], mots[mots.length - 1]] : [mots[0]];
  const texte = lettres
    .map((m) => m?.[0] ?? "")
    .join("")
    .toUpperCase();
  return texte || "?";
}

/** Pastille ronde d'initiales, décorative (le nom est toujours écrit à côté). */
export function Avatar({ nom, className }: { nom: string | null | undefined; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-frost-deep text-[13px] font-semibold text-ink-soft ring-1 ring-inset ring-line",
        className,
      )}
    >
      {initiales(nom)}
    </span>
  );
}
