"use client";

import { createContext, useContext } from "react";

/** Progression globale du scroll, partagée par le ScrollProvider. */
export type ScrollState = {
  /** Progression totale de la page, de 0 (haut) à 1 (bas). */
  progress: number;
  /** Position de scroll en pixels. */
  scrollY: number;
};

export const ScrollContext = createContext<ScrollState>({ progress: 0, scrollY: 0 });

/** Accès à la progression globale du scroll. */
export function useScrollProgress() {
  return useContext(ScrollContext);
}
