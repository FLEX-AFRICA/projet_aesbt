"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/** Sens de glissement du motif au défilement de la page. */
export type BackdropScroll = "vertical" | "horizontal" | "none";

/**
 * Réglages du fond (hors zone du header, qui garde son comportement par
 * défaut : vertical, sans zoom), communs à toutes les pages qui utilisent ce design
 * (actualités, événements, galerie, ressources, association). Chaque page
 * déclare un objet de ce type et le passe à `PatternBackdrop`.
 */
export type BackdropOptions = {
  /** Fichier de `public/` : motif carré, répété sans couture. */
  src: string;
  /** Côté d'une tuile en px sur ordinateur (230 par défaut). */
  tileSize?: number;
  /**
   * Zoom du motif sur mobile (< 640 px), en multiplicateur de `tileSize` :
   * 1 = identique, 0.6 = motif plus fin, 1.5 = motif plus gros.
   */
  mobileZoom?: number;
  /** Sens de défilement sur ordinateur ("vertical" par défaut). */
  scroll?: BackdropScroll;
  /** Sens de défilement sur mobile ; reprend `scroll` s'il est omis. */
  mobileScroll?: BackdropScroll;
  /**
   * Distance parcourue par le motif entre le haut et le bas de la page, en
   * nombre de tuiles (1.4 par défaut). Plus c'est grand, plus ça glisse vite.
   */
  speed?: number;
};

const MOBILE_QUERY = "(max-width: 639px)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

/**
 * Motif tuilé qui glisse lentement au défilement (parallax), à placer dans un
 * conteneur `relative` qui remonte sous la navbar : il se positionne en
 * `absolute inset-0`.
 *
 * Deux zones, avec le même motif :
 * - la zone du header (la bande de la hauteur du `pt-28 sm:pt-32` de
 *   SiteLayout, visible derrière la navbar) garde toujours le comportement
 *   par défaut : défilement vertical, sans zoom ;
 * - tout ce qui est en dessous (les sections) suit les options : zoom mobile
 *   et sens de défilement (voir `BackdropOptions`).
 *
 * Sans animation si l'utilisateur la réduit.
 */
export function PatternBackdrop({
  src,
  tileSize = 230,
  mobileZoom = 1,
  scroll = "vertical",
  mobileScroll,
  speed = 1.4,
}: BackdropOptions) {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <PatternLayer
        className="inset-x-0 top-0 h-28 sm:h-32"
        src={src}
        size={tileSize}
        direction={reduce ? "none" : "vertical"}
        distance={tileSize * speed}
        progress={scrollYProgress}
      />
      <PatternLayer
        className="inset-x-0 bottom-0 top-28 sm:top-32"
        src={src}
        size={Math.round(tileSize * (isMobile ? mobileZoom : 1))}
        direction={reduce ? "none" : isMobile ? (mobileScroll ?? scroll) : scroll}
        distance={Math.round(tileSize * (isMobile ? mobileZoom : 1)) * speed}
        progress={scrollYProgress}
      />
    </div>
  );
}

function PatternLayer({
  className,
  src,
  size,
  direction,
  distance,
  progress,
}: {
  className: string;
  src: string;
  size: number;
  direction: BackdropScroll;
  distance: number;
  progress: MotionValue<number>;
}) {
  const positionY = useTransform(
    progress,
    [0, 1],
    ["0px", direction === "vertical" ? `${distance}px` : "0px"],
  );
  const positionX = useTransform(
    progress,
    [0, 1],
    ["0px", direction === "horizontal" ? `${distance}px` : "0px"],
  );

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundRepeat: "repeat",
        backgroundSize: `${size}px ${size}px`,
        backgroundPositionX: positionX,
        backgroundPositionY: positionY,
      }}
    />
  );
}
