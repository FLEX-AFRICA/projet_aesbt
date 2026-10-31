"use client";

import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { cancelFrame, frame } from "framer-motion";
import { usePrefersReducedMotion } from "./useIsClient";
import { ScrollContext, type ScrollState } from "./scroll-context";

/**
 * Fournit le défilement fluide (Lenis) et expose la progression globale du
 * scroll (0 → 1) à toute l'application via un contexte.
 *
 * - SSR-safe : Lenis n'est instancié que dans un `useEffect` (client).
 * - Respecte `prefers-reduced-motion` : le smooth scroll est alors désactivé,
 *   mais la progression reste calculée (sans interpolation animée).
 *
 * Lenis est piloté par la boucle de rendu de Motion (`frame.setup`) plutôt que
 * par son propre `requestAnimationFrame` : sans cela, Lenis écrit la nouvelle
 * position de scroll après que `useScroll` l'a lue, et toutes les animations
 * liées au scroll accusent une frame de retard, ce qui se voit comme des
 * saccades. Voir https://motion.dev/docs/lenis
 *
 * Le hook `useScrollProgress` vit dans ./scroll-context pour garder ce fichier
 * centré sur le composant (Fast Refresh).
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [state, setState] = useState<ScrollState>({ progress: 0, scrollY: 0 });

  useEffect(() => {
    // Fallback simple si l'utilisateur réduit les animations : pas de smooth
    // scroll, mais on continue de suivre la progression pour les éléments
    // pilotés par le scroll (barre immersive, reveals).
    if (reducedMotion) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const scrollY = window.scrollY;
        setState({ scrollY, progress: max > 0 ? scrollY / max : 0 });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const lenis = new Lenis({
      // `autoRaf: false` : c'est Motion qui cadence Lenis (voir plus bas).
      autoRaf: false,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // La progression ne sert qu'à des indicateurs discrets (barre de scroll).
    // On ne déclenche un rendu React que lorsqu'elle bouge réellement, sinon
    // on re-rendrait tout l'arbre à chaque frame de défilement.
    let lastProgress = -1;
    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      const progress = limit > 0 ? scroll / limit : 0;
      if (Math.abs(progress - lastProgress) < 0.002) return;
      lastProgress = progress;
      setState({ scrollY: scroll, progress });
    });

    // `frame.setup(..., true)` tourne à chaque frame, avant que Motion ne lise
    // la position de scroll : les valeurs liées au scroll sont donc à jour.
    const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.setup(update, true);

    return () => {
      cancelFrame(update);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <ScrollContext.Provider value={state}>{children}</ScrollContext.Provider>;
}
