"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_INSTITUTIONAL } from "@/lib/animation/easing";

/**
 * Révèle son contenu en douceur lorsqu'il entre dans le viewport.
 *
 * Réutilisable partout : titres, paragraphes, cartes, images.
 * `prefers-reduced-motion` est géré nativement par Framer Motion (il neutralise
 * les transformations non essentielles).
 */

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  as = "div",
  amount = 0.3,
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "span" | "li" | "section";
  amount?: number;
  once?: boolean;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, ...offset[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.7, ease: EASE_INSTITUTIONAL, delay },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Orchestre l'apparition échelonnée d'une liste d'enfants.
 * À combiner avec <RevealItem> pour chaque enfant.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.12,
  amount = 0.2,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  as?: "div" | "ul" | "dl" | "section";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  direction = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  as?: "div" | "li";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, ...offset[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.65, ease: EASE_INSTITUTIONAL },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
