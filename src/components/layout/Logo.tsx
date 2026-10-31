import Link from "next/link";
import logoAsset from "@/assets/aesbt-logo.png.asset.json";

/**
 * Logotype AESBT (logo officiel fourni par l'association).
 */
export function Logo({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const color = tone === "light" ? "text-frost" : "text-ink";
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="AESBT — Accueil">
      <img
        src={logoAsset.url}
        alt="Logo AESBT"
        className="size-10 shrink-0 rounded-md object-contain"
        width={40}
        height={40}
      />
      <span className="flex items-baseline gap-2">
        <span className={`font-display text-2xl font-semibold tracking-tight ${color}`}>AESBT</span>
        <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-ink lg:inline">
          Tunisie
        </span>
      </span>
    </Link>
  );
}
