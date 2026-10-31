"use client";

import { useEffect, useState } from "react";

/**
 * Renvoie `true` uniquement après le montage côté client.
 *
 * Indispensable ici : le site est rendu côté serveur par Next.js. Toute
 * animation qui touche au DOM, à `window` ou à WebGL doit attendre le client
 * pour éviter les divergences d'hydratation.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}

/**
 * Indique si l'utilisateur a demandé à réduire les animations
 * (`prefers-reduced-motion`). Toutes nos animations doivent respecter ce choix.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
