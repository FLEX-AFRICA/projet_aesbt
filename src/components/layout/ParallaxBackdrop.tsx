"use client";

import { useEffect, useRef } from "react";

/**
 * Arrière-plan en parallaxe : l'image garde sa taille réelle (pleine largeur,
 * hauteur auto) et un cadre `sticky` de la hauteur de l'écran la suit au
 * défilement. L'image y glisse lentement de son haut vers son bas, de sorte
 * que le fond semble couvrir toute la page.
 *
 * En portrait (mobile), une photo paysage ne peut pas remplir l'écran en
 * pleine largeur : elle est mise à 90 % de la hauteur de l'écran et glisse
 * latéralement au lieu de descendre.
 *
 * À placer dans un conteneur `relative` : le composant se positionne en
 * `absolute inset-0`. Le `sticky` (et non `fixed`) évite le bug de
 * compositing de Chromium avec les cartes en `backdrop-blur`.
 */
export function ParallaxBackdrop({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const frameEl = frame.current;
    const imgEl = img.current;
    if (!rootEl || !frameEl || !imgEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const update = () => {
      raf = 0;
      if (reduce.matches) {
        imgEl.style.transform = "";
        return;
      }
      // Avancement du défilement le long du conteneur (0 en haut de page,
      // 1 tout en bas).
      const scrollable = rootEl.offsetHeight - frameEl.offsetHeight;
      const top = rootEl.getBoundingClientRect().top;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, -top / scrollable)) : 0;
      const overflowX = imgEl.offsetWidth - frameEl.offsetWidth;
      if (overflowX > 1) {
        // Écran en portrait : l'image fait 90 % de la hauteur du cadre (bords
        // estompés par un masque) et dépasse sur les côtés. Elle glisse latéralement, en restant
        // autour de l'arbre (au centre de la photo) : de 25 % à 75 % de
        // sa course.
        const x = overflowX * (0.25 + 0.5 * progress);
        imgEl.style.transform = `translate3d(${-x}px, 0, 0)`;
        return;
      }
      // Écran en paysage : pleine largeur, l'image descend dans le cadre.
      const travel = Math.max(0, imgEl.offsetHeight - frameEl.offsetHeight);
      imgEl.style.transform = `translate3d(0, ${-travel * progress}px, 0)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduce.addEventListener("change", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(rootEl);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduce.removeEventListener("change", schedule);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-frost"
    >
      <div ref={frame} className="sticky top-0 h-svh overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={img}
          src={src}
          alt=""
          width={width}
          height={height}
          className="h-auto w-full will-change-transform portrait:mt-[5svh] portrait:h-[90%] portrait:w-auto portrait:max-w-none portrait:[mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
        />
        <div className="absolute inset-0 bg-frost/55" />
      </div>
    </div>
  );
}
