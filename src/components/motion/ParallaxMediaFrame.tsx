"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { EASE_INSTITUTIONAL } from "@/lib/animation/easing";
import type { ContentImage } from "@/types/content";

/**
 * Cadre média « vivant » destiné aux photos de l'AESBT.
 *
 * - Parallaxe : l'image glisse légèrement au fil du scroll.
 * - Reveal : le cadre se dévoile via un masque à l'entrée dans le viewport.
 * - Tilt 3D : au survol (souris), le cadre s'incline doucement en profondeur.
 *
 * Tant qu'aucune image n'est fournie, affiche un emplacement neutre et
 * identifié — aucune illustration n'est inventée. Les vraies photos pourront
 * être branchées plus tard sans toucher à ce composant.
 */
export function ParallaxMediaFrame({
  image,
  ratio = "aspect-[16/10]",
  className,
  label = "Photo à venir",
  parallax = 40,
  tilt = true,
}: {
  image?: ContentImage;
  ratio?: string;
  className?: string;
  label?: string;
  /** Amplitude du glissement parallaxe en pixels. */
  parallax?: number;
  tilt?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe pilotée par la position du cadre dans le viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);

  // Tilt 3D au survol, en physique (react-spring).
  const [spring, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { mass: 1, tension: 220, friction: 20 },
  }));

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tilt || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    api.start({ rotateX: -py * 6, rotateY: px * 8, scale: 1.015 });
  };

  const handlePointerLeave = () => {
    if (!tilt) return;
    api.start({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-xl", ratio, className)}
      style={{ perspective: 1000 }}
      initial={{ clipPath: "inset(12% 12% 12% 12% round 14px)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 14px)", opacity: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, ease: EASE_INSTITUTIONAL }}
    >
      <animated.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: spring.scale.to(
            (s) =>
              `perspective(1000px) rotateX(${spring.rotateX.get()}deg) rotateY(${spring.rotateY.get()}deg) scale(${s})`,
          ),
          transformStyle: "preserve-3d",
        }}
        className="h-full w-full"
      >
        {image?.src ? (
          <motion.img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            style={{ y, scale: 1.12 }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={image?.alt ?? label}
            className="grid h-full w-full place-items-center bg-frost-deep/70 outline-1 -outline-offset-1 outline-ink/5"
          >
            <span className="px-4 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-muted-ink">
              {label}
            </span>
          </div>
        )}
        {/* Liseré lumineux subtil, cohérent avec la charte */}
        <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-ink/5" />
      </animated.div>
    </motion.div>
  );
}
