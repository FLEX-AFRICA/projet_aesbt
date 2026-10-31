"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { usePrefersReducedMotion } from "@/lib/animation/useIsClient";

/**
 * Compteur qui s'anime de 0 jusqu'à la valeur cible quand il entre dans le
 * viewport (anime.js). Conserve un éventuel préfixe/suffixe (« + », « %», …).
 *
 * Si la valeur n'est pas numérique (ex. « — » tant que non communiquée), le
 * texte est affiché tel quel, sans animation — aucun chiffre n'est inventé.
 */
export function CountUp({
  value,
  className,
  duration = 1600,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  // Extraction d'un éventuel nombre dans la chaîne (« 120+ » → 120, « + »).
  const match = value.match(/^(\D*)(\d[\d\s.,]*)(\D*)$/);
  const prefix = match?.[1] ?? "";
  const digits = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || done) return;

    const target = Number(digits.replace(/[\s,]/g, ""));
    if (Number.isNaN(target)) return;

    if (reduced) {
      el.textContent = value;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        setDone(true);
        const obj = { n: 0 };
        animate(obj, {
          n: target,
          duration,
          ease: "out(3)",
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.n)}${suffix}`;
          },
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [match, digits, prefix, suffix, value, duration, reduced, done]);

  // Valeur non numérique : affichage direct.
  if (!match) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} className={className}>
      {reduced ? value : `${prefix}0${suffix}`}
    </span>
  );
}
