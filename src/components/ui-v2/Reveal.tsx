"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Apparition au scroll, volontairement minimaliste.
 *
 * Performance — c'est tout l'objet de ce composant :
 *  - un `IntersectionObserver` par élément, qui se débranche dès le premier
 *    passage : plus aucun travail JS ensuite, et rien à chaque frame de scroll ;
 *  - la transition ne porte que sur `opacity` et `transform`, les deux seules
 *    propriétés que le navigateur compose sur le GPU. Aucun `filter: blur()`
 *    animé : un flou animé force un repaint de la zone à chaque frame, et
 *    c'est précisément ce qui plombait la version précédente.
 *
 * Respecte `prefers-reduced-motion` via la feuille de style (voir styles.css,
 * règle `.rv`), donc sans coût JS supplémentaire.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si l'élément est déjà visible au chargement, on l'affiche sans observer.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect(); // une seule fois : plus rien ne tourne après.
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rv${shown ? " rv-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
