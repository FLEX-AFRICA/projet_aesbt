import Link from "next/link";

import { cn } from "@/lib/utils";

export interface OngletFiltre {
  libelle: string;
  href: string;
  actif: boolean;
  /** Effectif affiché à côté du libellé, si connu. */
  compte?: number | undefined;
  /** Met l'effectif en avant (ex. éléments à traiter). */
  urgent?: boolean | undefined;
}

/** Rangée d'onglets-liens (filtres pilotés par l'URL) avec compteurs. */
export function OngletsFiltre({ onglets, libelle }: { onglets: OngletFiltre[]; libelle: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label={libelle}>
      {onglets.map((o) => (
        <Link
          key={o.href}
          href={o.href}
          aria-current={o.actif ? "page" : undefined}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface aria-[current=page]:border-accent-blue aria-[current=page]:bg-accent-blue aria-[current=page]:text-primary-foreground"
        >
          {o.libelle}
          {o.compte === undefined ? null : (
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                o.actif
                  ? "bg-primary-foreground/20"
                  : o.urgent && o.compte > 0
                    ? "bg-[#C9961B]/15 text-[#8a6610]"
                    : "bg-frost-deep text-muted-ink",
              )}
            >
              {o.compte}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
