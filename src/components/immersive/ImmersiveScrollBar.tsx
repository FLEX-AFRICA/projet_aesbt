"use client";

import { AnimatePresence, motion } from "framer-motion";
import logoAsset from "@/assets/aesbt-logo.png.asset.json";
import { useScrollProgress } from "@/lib/animation/scroll-context";
import type { ContentImage } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * Barre de défilement immersive.
 *
 * Après avoir dépassé ~50 % de la page, l'en-tête classique s'efface et cette
 * barre prend le relais, fixée en haut. Elle matérialise la progression de
 * lecture par :
 *  - une piste avec un marqueur glissant et le pourcentage,
 *  - une bande de vignettes (cadres image) qui se décale latéralement au fil
 *    du scroll — l'effet « métro » : on avance le long d'une ligne de visuels.
 *
 * Les vignettes acceptent de vraies images (photos de l'association) ou, par
 * défaut, des cadres neutres aux couleurs AESBT — prêts à être remplacés.
 */

type Thumb = { image?: ContentImage; tint: "red" | "green" | "gold" | "ink" };

const tintClass: Record<Thumb["tint"], string> = {
  red: "from-accent-red/80 to-accent-red/40",
  green: "from-accent-green/80 to-accent-green/40",
  gold: "from-accent-gold/90 to-accent-gold/50",
  ink: "from-ink/70 to-ink/40",
};

// Jeu de vignettes par défaut. Remplacer `image` par de vraies photos plus
// tard suffira à peupler la bande (aucune autre modification nécessaire).
const DEFAULT_THUMBS: Thumb[] = [
  { tint: "red" },
  { tint: "ink" },
  { tint: "green" },
  { tint: "gold" },
  { tint: "ink" },
  { tint: "red" },
  { tint: "green" },
  { tint: "ink" },
];

export function ImmersiveScrollBar({
  thumbs = DEFAULT_THUMBS,
  threshold = 0.5,
}: {
  thumbs?: Thumb[];
  /** Fraction de scroll (0→1) à partir de laquelle la barre apparaît. */
  threshold?: number;
}) {
  const { progress } = useScrollProgress();
  const visible = progress >= threshold;

  // Progression ramenée à l'intervalle [threshold, 1] → [0, 1].
  const local = Math.max(0, Math.min(1, (progress - threshold) / (1 - threshold)));
  const percent = Math.round(local * 100);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="immersive-bar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-x-0 top-0 z-[60] border-b border-line/60 bg-frost/85 backdrop-blur-xl"
          role="presentation"
          aria-hidden="true"
        >
          <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-5 px-6">
            {/* Identité compacte */}
            <div className="flex shrink-0 items-center gap-2.5">
              <img
                src={logoAsset.url}
                alt=""
                className="size-7 rounded-md object-contain"
                width={28}
                height={28}
              />
              <span className="font-display text-sm font-semibold tracking-tight text-ink">
                AESBT
              </span>
            </div>

            {/* Bande de vignettes « métro » : se décale avec la progression */}
            <div className="relative hidden h-9 flex-1 overflow-hidden md:block">
              <motion.div
                className="absolute inset-y-0 left-0 flex items-center gap-2"
                animate={{ x: `${-local * 38}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 22 }}
              >
                {thumbs.concat(thumbs).map((thumb, i) => (
                  <ThumbCell key={i} thumb={thumb} />
                ))}
              </motion.div>
              {/* Dégradés de bord pour fondre la bande */}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-frost to-transparent" />
              <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-frost to-transparent" />
            </div>

            {/* Piste de progression + pourcentage */}
            <div className="flex min-w-[140px] shrink-0 items-center gap-3">
              <div className="relative h-[3px] w-full flex-1 overflow-visible rounded-full bg-line">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-accent-red"
                  style={{ width: `${percent}%` }}
                />
                <motion.span
                  className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-accent-red ring-2 ring-frost"
                  style={{ left: `calc(${percent}% - 5px)` }}
                />
              </div>
              <span className="w-9 text-right font-display text-xs tabular-nums text-ink-soft">
                {percent}%
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ThumbCell({ thumb }: { thumb: Thumb }) {
  if (thumb.image?.src) {
    return (
      <img
        src={thumb.image.src}
        alt=""
        className="h-9 w-14 shrink-0 rounded-md object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span
      className={cn(
        "h-9 w-14 shrink-0 rounded-md bg-gradient-to-br outline-1 -outline-offset-1 outline-ink/5",
        tintClass[thumb.tint],
      )}
    />
  );
}
