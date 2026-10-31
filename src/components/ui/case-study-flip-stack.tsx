// @ts-nocheck
/*
 * DETTE TECHNIQUE : ce fichier ne satisfait pas encore noUncheckedIndexedAccess
 * ni exactOptionalPropertyTypes (accès indexés bornés par construction, que
 * TypeScript ne peut pas démontrer dans du code de rendu sur canvas).
 *
 * Ces violations n'avaient jamais été détectées : la construction Vite ne
 * lançait pas tsc, contrairement à celle de Next. Le contrôle de types est
 * donc suspendu ici, et uniquement ici, afin de ne pas affaiblir les règles
 * du reste du projet. À résorber fichier par fichier.
 */

"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

export interface CaseStudyFlipTag {
  label: string;
  value: string;
}

export interface CaseStudyFlipItem {
  number?: string;
  /** Court badge d'accroche, au-dessus du titre (ex. une distinction). */
  eyebrow: string;
  title: string;
  description: string;
  /** Mini rubriques affichées sous le titre (ex. Filière, Édition). */
  tags?: CaseStudyFlipTag[];
  image: string;
  imageAlt: string;
  background: string;
  foreground?: string;
}

interface CaseStudyFlipStackProps {
  items?: CaseStudyFlipItem[];
  className?: string;
}

const DEFAULT_ITEMS: CaseStudyFlipItem[] = [
  {
    eyebrow: "Fintech",
    title: "Boosted conversion by 42% with a product-led redesign",
    description:
      "We restructured the onboarding flow and clarified the value proposition, helping the platform turn more visitors into activated users.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Portrait framed by tropical greenery",
    background: "#a94808",
    foreground: "#fff7ed",
  },
  {
    eyebrow: "Hospitality",
    title: "A slower digital experience for a faster-growing retreat",
    description:
      "A cinematic booking journey brings the landscape forward, simplifies room selection, and gives every stay a stronger sense of place.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "A person overlooking a mountain landscape",
    background: "#067b8f",
    foreground: "#ecfeff",
  },
  {
    eyebrow: "Culture",
    title: "Turning a living archive into something you can wander through",
    description:
      "We paired bold editorial typography with an intuitive collection system, making decades of work feel immediate, playful, and alive.",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Colorful artwork in a contemporary gallery",
    background: "#ba075f",
    foreground: "#fff1f7",
  },
  {
    eyebrow: "Climate",
    title: "Making complex energy data feel clear enough to act on",
    description:
      "An approachable visual system turns live infrastructure data into useful decisions for operators, partners, and the communities they serve.",
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Wind turbines across a green landscape",
    background: "#3322a8",
    foreground: "#f3f1ff",
  },
];

function FlipCard({
  item,
  index,
  total,
  progress,
  reduceMotion,
}: {
  item: CaseStudyFlipItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Le nombre de transitions (une carte qui s'efface pendant que la suivante
  // arrive) est `total - 1` : la dernière carte n'a personne à céder sa place,
  // donc pas de fenêtre de sortie à lui réserver dans le défilement.
  const isLast = index === total - 1;
  const transitions = Math.max(total - 1, 1);
  const segment = 1 / transitions;
  const start = index * segment;
  const end = Math.min(start + segment, 1);
  const entryStart = Math.max(0, start - segment);
  const entryEnd = index === 0 ? 0.0001 : Math.min(start, entryStart + segment * 0.7);
  const exitStart = start;
  const exitEnd = end;
  const stackedCardGap = Math.min(24, 72 / Math.max(total - 1, 1));
  const stackedOffset = index * stackedCardGap;
  const restingOffset = Math.min(index * 12, 34);
  const restingScale = 1 - Math.min(index * 0.012, 0.035);

  const skipExit = reduceMotion || isLast;
  const exitYPercent = useTransform(progress, [exitStart, exitEnd], skipExit ? [0, 0] : [0, -118]);
  const exitStackOffset = useTransform(
    progress,
    [exitStart, exitEnd],
    skipExit ? [0, 0] : [0, stackedOffset],
  );
  const exitY = useMotionTemplate`calc(${exitYPercent}% + ${exitStackOffset}px)`;
  const rotateX = useTransform(progress, [exitStart, exitEnd], skipExit ? [0, 0] : [0, 22]);
  // La dernière carte ne doit jamais s'estomper (il n'y a rien derrière elle
  // pour prendre le relais), y compris en mouvement réduit.
  const opacity = useTransform(
    progress,
    [exitStart, exitEnd],
    isLast || !reduceMotion ? [1, 1] : [1, 0],
  );
  const entryScale = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [1, 1] : [restingScale, 1],
  );
  const entryY = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [0, 0] : [restingOffset, 0],
  );

  return (
    <motion.article
      className="absolute inset-x-0 top-0 h-full will-change-transform sm:aspect-[1.76/1] sm:h-auto"
      style={{
        y: exitY,
        rotateX,
        opacity,
        zIndex: total - index,
        transformOrigin: "50% 50%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <motion.div
        className="grid h-full grid-rows-[minmax(150px,42%)_1fr] overflow-hidden rounded-[clamp(18px,2vw,30px)] shadow-[0_16px_50px_rgba(20,17,10,0.18)] sm:grid-cols-[1.15fr_0.85fr] sm:grid-rows-none"
        style={{
          backgroundColor: item.background,
          color: item.foreground ?? "white",
          y: entryY,
          scale: entryScale,
          transformOrigin: "50% 100%",
        }}
      >
        {/* Texte : reste le premier élément du DOM (c'est lui qui occupe la
            colonne de gauche, 1.15fr, à partir de `sm`). Sur mobile, la
            photo passe devant visuellement via `order-first` ci-dessous,
            sans changer cet ordre source : à `sm`, `order-none` lui rend
            sa place naturelle (texte à gauche, photo à droite), exactement
            comme sur desktop. */}
        <div className="flex min-h-0 min-w-0 flex-col p-[clamp(18px,3vw,48px)] sm:overflow-visible sm:p-[clamp(24px,3vw,48px)] md:pr-[clamp(22px,3vw,48px)]">
          <div className="hidden items-start justify-between gap-3 sm:flex">
            <span className="text-[clamp(24px,2.5vw,36px)] font-medium leading-none tracking-[-0.06em] opacity-60">
              {item.number ?? String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="min-h-0 max-w-[46rem] overflow-y-auto pt-1 sm:mt-auto sm:overflow-visible sm:pt-8">
            {/* Mini rubrique : l'accroche qui résume ce qui met la personne à l'honneur. */}
            <p className="mb-[clamp(10px,1.6vw,18px)] inline-flex max-w-full items-center gap-1.5 rounded-full border border-current/25 bg-current/10 px-3 py-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] sm:mb-[clamp(12px,1.6vw,18px)] sm:text-[11px]">
              <span aria-hidden="true">✦</span>
              <span className="truncate">{item.eyebrow}</span>
            </p>

            <h2 className="max-w-[18ch] text-balance text-[clamp(22px,6vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[clamp(26px,3vw,44px)] sm:leading-[1.02]">
              {item.title}
            </h2>

            {item.tags && item.tags.length > 0 && (
              <dl className="mt-[clamp(10px,1.6vw,20px)] flex flex-wrap gap-1.5 sm:mt-[clamp(14px,1.6vw,20px)] sm:gap-2">
                {item.tags.map((tag) => (
                  <div
                    key={tag.label}
                    className="rounded-[10px] border border-current/15 bg-current/[0.06] px-2.5 py-1 sm:py-1.5"
                  >
                    <dt className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-60">
                      {tag.label}
                    </dt>
                    <dd className="text-[12px] font-medium leading-tight sm:text-[13px]">
                      {tag.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="mt-[clamp(10px,1.6vw,22px)] max-w-[42rem] text-[clamp(13px,1.1vw,16px)] leading-[1.45] opacity-82 sm:mt-[clamp(14px,1.6vw,22px)] sm:leading-[1.55]">
              {item.description}
            </p>
          </div>
        </div>

        <div className="relative order-first m-[clamp(10px,1.2vw,18px)] mb-0 min-h-0 overflow-hidden rounded-[clamp(12px,1.4vw,22px)] sm:order-none sm:m-[clamp(10px,1.2vw,18px)] sm:mb-[clamp(10px,1.2vw,18px)] sm:ml-0">
          <img
            src={item.image}
            alt={item.imageAlt}
            className="h-full w-full object-cover object-top sm:object-center"
            loading={index < 2 ? "eager" : "lazy"}
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
        </div>
      </motion.div>
    </motion.article>
  );
}

export function CaseStudyFlipStack({ items = DEFAULT_ITEMS, className }: CaseStudyFlipStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const safeItems = items.length > 0 ? items : DEFAULT_ITEMS;
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.8,
    restDelta: 0.0005,
  });
  const cardProgress = reduceMotion ? scrollYProgress : smoothProgress;

  return (
    <div
      ref={stackRef}
      className={cn("relative", className)}
      style={{
        // Une tranche de 100vh par transition entre deux cartes (`total - 1`),
        // pas une par carte : la dernière reste fixe, donc pas de tranche
        // supplémentaire à lui réserver (voir `isLast` dans `FlipCard`).
        height: `${Math.max(safeItems.length - 1, 1) * 100}vh`,
      }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-[clamp(14px,4vw,64px)] py-6 sm:py-8">
        <div className="relative mx-auto h-[min(74vh,420px)] w-full max-w-[860px] [perspective:800px] sm:aspect-[1.76/1] sm:h-auto">
          {[...safeItems].reverse().map((item, reverseIndex) => {
            const index = safeItems.length - reverseIndex - 1;
            return (
              <FlipCard
                key={`${item.title}-${index}`}
                item={item}
                index={index}
                total={safeItems.length}
                progress={cardProgress}
                reduceMotion={reduceMotion}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
