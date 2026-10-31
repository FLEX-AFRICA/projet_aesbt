import Link from "next/link";

/**
 * Barre de comparaison (prototypage) : bascule entre les 3 dispositions de
 * contenu du hero immersif, sans taper l'URL.
 */
const LAYOUTS = [
  { to: "/version-1", label: "Épuré centré" },
  { to: "/version-2", label: "Infos aux coins" },
  { to: "/version-3", label: "Asymétrique" },
] as const;

export function LayoutSwitcher({ current }: { current: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1A1A1A]/92 px-3 py-2.5 text-white shadow-2xl backdrop-blur-xl">
        <span className="pl-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">
          Disposition du hero
        </span>
        <div className="flex gap-1">
          {LAYOUTS.map((l) => {
            const active = l.to === current;
            return (
              <Link
                key={l.to}
                href={l.to}
                className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: "#B4271C", color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }
                }
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
