import { Search } from "lucide-react";

/**
 * Recherche pilotée par l'URL (formulaire GET, sans JavaScript). Les autres
 * filtres actifs sont conservés grâce à `conserves`.
 */
export function Recherche({
  action,
  valeur,
  placeholder,
  conserves,
}: {
  action: string;
  valeur: string;
  placeholder: string;
  conserves: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" role="search" className="relative w-full max-w-sm">
      {Object.entries(conserves).map(([cle, v]) =>
        v ? <input key={cle} type="hidden" name={cle} value={v} /> : null,
      )}
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
      />
      <input
        type="search"
        name="q"
        defaultValue={valeur}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-line bg-frost py-2 pl-9 pr-4 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />
    </form>
  );
}
