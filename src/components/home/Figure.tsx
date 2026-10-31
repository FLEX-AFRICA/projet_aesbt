"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HomeTheme } from "./themes";

/**
 * Cadre image convivial, prêt pour les photos de l'AESBT.
 *
 * Avec une image : léger parallaxe au scroll + révélation par masque.
 * Sans image : un fond coloré (aux teintes du thème) et non un vide blanc —
 * pour que l'aperçu reste vivant en attendant la photo définitive.
 */
export function Figure({
  src,
  alt,
  ratio = "aspect-[4/3]",
  className,
  theme,
  caption,
  parallax = true,
}: {
  src?: string;
  alt: string;
  ratio?: string;
  className?: string;
  theme: HomeTheme;
  caption?: string;
  parallax?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], parallax && src ? [24, -24] : [0, 0]);

  return (
    <motion.figure
      ref={ref}
      className={cn("relative m-0 overflow-hidden rounded-2xl", ratio, className)}
      initial={{ clipPath: "inset(8% 8% 8% 8% round 16px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 16px)", opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
    >
      {src ? (
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ y, scale: 1.1 }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full items-center justify-center p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.gold} 100%)`,
          }}
        >
          <span className="font-display text-base font-medium" style={{ color: theme.onAccent }}>
            {alt}
          </span>
        </div>
      )}
      {caption ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-[13px] font-medium text-white">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}
