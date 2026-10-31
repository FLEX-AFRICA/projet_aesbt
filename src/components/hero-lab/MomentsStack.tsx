"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import DynamicText from "@/components/kokonutui/dynamic-text";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Le mot qui se recompose dans le titre de section. */
const MORPH_WORDS = ["ensemble", "accueillis", "solidaires", "unis"];

type Moment = {
  src: string;
  alt: string;
  title: string;
  body: string;
};

const MOMENTS: Moment[] = [
  {
    src: "/aesbt/staff-groupe.jpg",
    alt: "Le collectif AESBT réuni lors d'un événement",
    title: "Le collectif",
    body: "Celles et ceux qui font vivre l'association au quotidien, à Tunis.",
  },
  {
    src: "/aesbt/jeppc-2026.jpg",
    alt: "Journées d'Engagement Patriotique et de Participation Citoyenne",
    title: "JEPPC 2026",
    body: "Les Journées d'Engagement Patriotique, à l'Ambassade du Burkina Faso.",
  },
  {
    src: "/aesbt/weekend-integration.jpg",
    alt: "Weekend d'intégration de l'AESBT",
    title: "L'intégration",
    body: "Le weekend qui accueille les nouveaux arrivants et lance l'année.",
  },
  {
    src: "/aesbt/faces/face3.jpg",
    alt: "Membres de l'association",
    title: "Nos membres",
    body: "Des étudiants et stagiaires venus de tout le Burkina Faso.",
  },
  {
    src: "/aesbt/faces/face6.jpg",
    alt: "La communauté AESBT",
    title: "Une famille",
    body: "Deux pays, une communauté qui ne laisse personne de côté.",
  },
];

/** Part du parcours pendant laquelle la pile reste immobile, avant le défilé. */
const LEAD = 0.08;
/** Inclinaisons de la pile, de la carte du dessus vers celles du dessous. */
const TILTS = [-3.5, 2.6, -2, 3];

/**
 * Section « Ici, on est ».
 *
 * La section entière se fixe dans la fenêtre (un seul conteneur collant), et
 * c'est le défilement vertical qui pilote le défilé horizontal des images :
 * elles partent empilées, puis glissent une à une vers la gauche. Le texte
 * occupe sa propre colonne, réservée : les images ne peuvent pas le recouvrir.
 * La section se libère d'elle-même une fois la dernière image atteinte.
 *
 * Tout est animé en `transform` et `opacity` uniquement (aucune propriété qui
 * déclenche un recalcul de mise en page), et `prefers-reduced-motion` bascule
 * sur une grille statique, sans épinglage.
 */
export function MomentsStack() {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const total = MOMENTS.length;
  /** Une transition par passage d'une image à la suivante. */
  const step = (1 - LEAD) / Math.max(1, total - 1);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // Ressort : le défilé poursuit brièvement sa course après la molette, ce qui
  // donne l'impression que ce sont les images qui bougent, pas la page.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
    restDelta: 0.0005,
  });

  useMotionValueEvent(smooth, "change", (value) => {
    const index = Math.min(total - 1, Math.max(0, Math.round((value - LEAD) / step)));
    setActive((current) => (current === index ? current : index));
  });

  // Sans animation : une grille simple, pas d'épinglage ni de défilé.
  if (reduce) {
    return (
      <section className="bg-[#FBF6EF]">
        <div className="mx-auto max-w-[1180px] px-6 py-20">
          <div className="text-center lg:text-left">
            <SectionTitle reduce />
          </div>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2">
            {MOMENTS.map((m) => (
              <li key={m.src}>
                <img
                  src={m.src}
                  alt={m.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
                <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight text-[#1A1A1A]">
                  {m.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#6B6B6B] lg:text-[15px]">
                  {m.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FBF6EF]">
      {/* Le conteneur haut fournit la distance de défilement : c'est lui qui
          détermine combien de temps la section reste fixée. */}
      <div ref={container} style={{ height: `${100 + (total - 1) * 90}vh` }} className="relative">
        {/* La fenêtre épinglée : une seule, pour toute la section. */}
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-6 px-6 sm:gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
            {/* Titre. Sur mobile il ouvre la section, au-dessus des images,
                et s'y centre comme les intitulés des autres sections. */}
            <div className="order-1 text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left">
              <SectionTitle />
            </div>

            {/* Légende du moment courant. Sur mobile elle passe sous les
                images (ordre 3), sur grand écran elle reste dans la colonne
                de gauche, sous le titre. */}
            <div className="relative z-10 order-3 lg:col-start-1 lg:row-start-2 lg:self-start">
              {/* Hauteur réservée : le texte change sans décaler la mise en page. */}
              <div className="relative h-[118px] sm:h-[112px]">
                {MOMENTS.map((m, i) => (
                  <motion.div
                    key={m.src}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : 14 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    aria-hidden={active === i ? undefined : true}
                  >
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#C9961B]">
                      {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-[clamp(1.3rem,2.2vw,2rem)] font-semibold leading-snug tracking-tight text-[#1A1A1A]">
                      {m.title}
                    </h3>
                    <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-[#6B6B6B] lg:text-[15px]">
                      {m.body}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Progression du défilé */}
              <div className="mt-6 flex gap-1.5" aria-hidden="true">
                {MOMENTS.map((m, i) => (
                  <span
                    key={m.src}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/10"
                  >
                    <motion.span
                      className="block h-full origin-left rounded-full bg-[#B4271C]"
                      initial={false}
                      animate={{ scaleX: i <= active ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Scène : la pile d'images, qui défile vers la gauche.
                `overflow-hidden` est indispensable : sans lui, une image qui
                sort par la gauche traverse la colonne de texte. Ici elle
                disparaît au bord de sa propre colonne. */}
            <div className="relative order-2 h-[clamp(230px,36vh,320px)] w-full overflow-hidden sm:h-[clamp(260px,40vh,380px)] lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[clamp(320px,52vh,520px)] lg:self-center">
              {MOMENTS.map((m, i) => (
                <MomentCard
                  key={m.src}
                  moment={m}
                  index={i}
                  total={total}
                  step={step}
                  progress={smooth}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ reduce = false }: { reduce?: boolean }) {
  return (
    <h2 className="font-display text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-tight text-[#1A1A1A]">
      <span>Ici, on est</span>{" "}
      {reduce ? (
        <span className="text-[#B4271C]">ensemble.</span>
      ) : (
        <DynamicText
          mode="morph"
          words={MORPH_WORDS}
          interval={2200}
          className="inline-block align-baseline text-[#B4271C]"
        />
      )}
    </h2>
  );
}

/**
 * Une image de la pile.
 *
 * Avant son tour, elle attend en profondeur (réduite, décalée, inclinée).
 * Pendant son tour, elle glisse vers la gauche et sort du cadre. La dernière
 * ne sort pas : elle clôt la séquence, sinon la scène finirait vide.
 */
function MomentCard({
  moment,
  index,
  total,
  step,
  progress,
}: {
  moment: Moment;
  index: number;
  total: number;
  step: number;
  progress: MotionValue<number>;
}) {
  const isLast = index === total - 1;
  const start = LEAD + index * step;
  const end = start + step;
  const tilt = TILTS[index % TILTS.length] ?? 0;

  // Arrivée : la carte remonte la pile au fur et à mesure que les précédentes
  // s'en vont. Les bornes négatives sont volontaires, Motion les borne seul.
  const approach = [start - 3 * step, start - 2 * step, start - step, start];

  const scale = useTransform(progress, [...approach, end], [0.86, 0.9, 0.95, 1, 1]);
  const y = useTransform(progress, [...approach, end], [30, 20, 10, 0, 0]);
  const rotate = useTransform(
    progress,
    [...approach, end],
    [tilt * 1.6, tilt * 1.3, tilt, 0, isLast ? 0 : -7],
  );
  // La scène étant découpée, la carte sort entièrement du cadre : pas de
  // fondu, donc pas de surimpression des deux images pendant la transition.
  const x = useTransform(progress, [start, end], isLast ? ["0%", "0%"] : ["0%", "-118%"]);
  // Les cartes restent opaques : c'est le découpage de la scène qui les
  // masque, ce qui évite l'effet de double exposition.
  const opacity = useTransform(progress, [start, end], [1, 1]);

  return (
    <motion.figure
      // Léger retrait : la scène étant découpée, cela laisse respirer
      // l'inclinaison et l'ombre portée sans qu'elles soient tranchées net.
      className="absolute inset-x-[3%] inset-y-[8%] m-0 overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_18px_48px_rgba(42,15,11,0.16)] will-change-transform"
      style={{ x, y, scale, rotate, opacity, zIndex: total - index }}
    >
      <img
        src={moment.src}
        alt={moment.alt}
        loading={index < 2 ? "eager" : "lazy"}
        draggable={false}
        className="size-full rounded-[16px] object-cover"
      />
    </motion.figure>
  );
}
