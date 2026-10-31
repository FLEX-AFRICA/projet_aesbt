import { Suspense, lazy } from "react";
import { useIsClient, usePrefersReducedMotion } from "@/lib/animation/useIsClient";
import { cn } from "@/lib/utils";

/**
 * Enveloppe client-only de la scène 3D du hero.
 *
 * - Ne rend rien en SSR (WebGL indisponible) ni si `prefers-reduced-motion`.
 * - Chargement différé : le bundle Three.js n'est récupéré qu'au besoin.
 * - Dégradé esthétique affiché pendant le chargement, pour éviter tout « trou ».
 */
const HeroScene = lazy(() => import("./HeroScene"));

export function ClientHeroScene({ className }: { className?: string }) {
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();

  const fallback = (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_70%_30%,theme(colors.accent-gold/15),transparent_70%),radial-gradient(50%_50%_at_30%_70%,theme(colors.accent-red/12),transparent_70%)]",
        className,
      )}
    />
  );

  if (!isClient || reduced) return fallback;

  return (
    <div aria-hidden="true" className={cn("absolute inset-0 -z-10", className)}>
      <Suspense fallback={fallback}>
        <HeroScene />
      </Suspense>
    </div>
  );
}
