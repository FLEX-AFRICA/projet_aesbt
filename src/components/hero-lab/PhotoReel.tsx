"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { EASE_INSTITUTIONAL } from "@/lib/animation/easing";
import { AESBT_RING_PHOTOS, type RingPhoto } from "./PhotoRing";

/* ------------------------------------------------------------------ */
/* Géométrie du cadre                                                  */
/* ------------------------------------------------------------------ */

/**
 * Profondeur de la perspective, en pixels.
 *
 * Elle est portée par chaque vignette (`transformPerspective`) et non par la
 * scène : les vignettes ne partagent donc aucun volume 3D, et l'ordre
 * d'affichage ne dépend plus du tri de profondeur du navigateur, qui laissait
 * des bords de vignettes arrière ressortir à travers celle de devant.
 *
 * Le résultat à l'écran est le même : chaque vignette est posée au centre du
 * cadre avant d'être déplacée, le point de fuite de sa perspective propre est
 * donc déjà le centre du cadre, comme avec une perspective commune.
 */
const PERSPECTIVE = 1200;

/** Largeur d'une vignette, en `cqw` (pourcentage de la largeur du cadre). */
const CARD = 54;
/** Hauteur d'une vignette, en `cqw` : un format large, comme au cinéma. */
const CARD_H = 36;

/**
 * Courbe d'un mouvement d'appareil : départ et arrivée amortis, vitesse
 * presque constante au milieu. C'est elle qui donne les longs travellings.
 */
const DOLLY: [number, number, number, number] = [0.37, 0, 0.63, 1];

/* ------------------------------------------------------------------ */
/* Le vocabulaire du montage                                           */
/* ------------------------------------------------------------------ */

/**
 * Place d'une vignette à un instant du montage.
 *
 * `x` et `y` sont en pourcentage de la vignette (100 = sa propre largeur ou
 * hauteur) : la composition suit donc la taille du cadre, sans point de
 * rupture. `z` est en pixels, comme la perspective du conteneur.
 *
 * `z` règle aussi l'ordre de superposition, par le `z-index` qui en est déduit
 * (voir `rank`) : la vignette la plus proche passe devant, toujours, et aucune
 * figure ne laisse deux vignettes se recouvrir à la même profondeur.
 */
type Pose = {
  x: number;
  y: number;
  z: number;
  rotate: number;
  rotateY: number;
  scale: number;
  opacity: number;
};

/** Un temps du montage : une pose à atteindre, et la manière d'y aller. */
type Beat = {
  /** Acte auquel le temps appartient : deux temps d'un même acte s'enchaînent. */
  act: number;
  /** Durée du temps à l'écran, en millisecondes (mouvement compris). */
  dwell: number;
  /** Durée du mouvement d'entrée, en millisecondes. */
  move: number;
  /** Retard ajouté par vignette : c'est lui qui fait la cascade. */
  stagger: number;
  ease: [number, number, number, number];
  pose: (i: number, count: number, cycle: number) => Pose;
};

/**
 * Les actes du montage, dans l'ordre.
 *
 * Les noms ne servent qu'à la lecture du code et aux clés de la barre de
 * progression : ils ne sont pas affichés, le visiteur n'a rien à faire du nom
 * d'une animation.
 */
const ACTS = ["La pile", "Le défilé", "Les colonnes", "La mosaïque", "Le plein cadre"];

/**
 * Bruit déterministe, dans `[0, 1[`.
 *
 * La pile paraît ainsi jetée à la main, tout en restant identique à chaque
 * rendu : indispensable, le site étant rendu côté serveur.
 */
function noise(i: number, seed: number) {
  const v = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/** Fondu de bord de cadre : plein jusqu'à `from`, éteint à partir de `to`. */
function fade(distance: number, from: number, to: number) {
  if (distance <= from) return 1;
  if (distance >= to) return 0;
  return (to - distance) / (to - from);
}

/**
 * Rang d'empilement d'une vignette, déduit de la profondeur où elle se trouve.
 *
 * Il est recalculé à chaque image, et non une fois par acte : deux vignettes
 * n'échangent donc leur rang qu'à l'instant précis où leurs profondeurs se
 * croisent, là où elles ont la même taille apparente. L'échange ne se voit
 * pas, alors qu'un ordre posé d'un coup au changement d'acte faisait
 * brusquement ressortir le bord d'une vignette arrière.
 *
 * Le décalage garde la valeur positive : `z` descend très bas dans le défilé.
 */
function rank(z: number) {
  return Math.max(1, Math.round(1000 + z));
}

/**
 * Arrondit une valeur de pose au millième.
 *
 * Framer Motion compose la transformation avec moins de précision au rendu
 * serveur qu'au premier rendu client : `translateX(1.15911%)` d'un côté,
 * `translateX(1.1591122980389628%)` de l'autre. React y voyait un attribut
 * divergent, renonçait à hydrater la page et la signalait en console. Trois
 * décimales de pour-cent sont invisibles à l'oeil, et identiques des deux
 * côtés.
 */
function snap(v: number) {
  return Math.round(v * 1000) / 1000;
}

/** Ramène `v` dans `[-span/2, span/2[` : une colonne qui reboucle sans fin. */
function wrap(v: number, span: number) {
  return ((((v + span / 2) % span) + span) % span) - span / 2;
}

/* ------------------------------------------------------------------ */
/* Les poses, acte par acte                                            */
/* ------------------------------------------------------------------ */

/** « La pile » : les clichés posés les uns sur les autres, à peine de guingois. */
function stack(i: number): Pose {
  return {
    x: (noise(i, 1) - 0.5) * 18,
    y: (noise(i, 2) - 0.5) * 12 + i * 1.2,
    z: -i * 7,
    rotate: (noise(i, 3) - 0.5) * 14,
    rotateY: 0,
    scale: 1 - i * 0.014,
    opacity: 1,
  };
}

/** « L'éventail » : la pile s'ouvre en arc, comme une main de cartes. */
function fan(i: number, count: number): Pose {
  const d = i - (count - 1) / 2;
  return {
    // 9,5 % de la vignette par cran : l'éventail ouvert touche le bord du cadre
    // sans le dépasser, quelle que soit la taille de celui-ci.
    x: d * 9.5,
    y: Math.abs(d) ** 1.7 * 1.1 - 5,
    // La profondeur suit l'ordre des clichés, comme dans la pile dont
    // l'éventail sort : l'ouverture ne réordonne donc aucune vignette.
    z: -i * 6,
    rotate: d * 6,
    rotateY: 0,
    scale: 0.82 - Math.abs(d) * 0.012,
    opacity: 1,
  };
}

/** Écart entre deux vignettes de la file, en % de la largeur d'une vignette. */
const DECK_STEP = 58;
/** Recul d'une vignette par cran d'éloignement du centre, en pixels. */
const DECK_DEPTH = 300;
/** Recul supplémentaire d'une vignette déjà passée devant l'objectif. */
const DECK_PAST = 170;

/**
 * « Le défilé » : les vignettes en file, celle du centre face à l'objectif,
 * les autres de trois quarts et nettement en retrait.
 *
 * `offset` désigne la vignette amenée au centre. Il est entier d'un temps à
 * l'autre, pour qu'une vignette soit toujours exactement de face à l'arrivée :
 * posé sur une valeur fractionnaire, deux vignettes se partageaient le centre,
 * de même taille et à la même profondeur, et leurs bords se coupaient au lieu
 * de se recouvrir.
 *
 * La vignette qui vient de passer (`past`) recule et rapetisse davantage que
 * celle qui arrive. Deux vignettes ne se trouvent donc jamais au même plan,
 * même au milieu du travelling : le croisement se lit comme un passage, l'une
 * derrière l'autre, et non comme deux images qui se rentrent dedans.
 */
function deck(offset: number) {
  return (i: number): Pose => {
    const p = i - offset;
    const far = Math.abs(p);
    const past = Math.min(Math.max(0, -p), 2);
    return {
      x: p * DECK_STEP,
      y: 0,
      z: -(far * DECK_DEPTH + past * DECK_PAST),
      rotate: 0,
      rotateY: Math.max(-46, Math.min(46, p * 34)),
      scale: 1 - Math.min(far, 3) * 0.26 - past * 0.05,
      opacity: fade(far, 1.6, 2.5),
    };
  };
}

/** Colonnes du troisième acte. */
const COLUMNS = 3;

/**
 * « Les colonnes » : trois files verticales, celle du milieu descendant quand
 * les deux autres montent. Chaque file reboucle sur elle-même, le flux ne
 * s'épuise donc jamais ; une vignette qui repart en bout de file le fait au
 * moment où elle est éteinte, le saut ne se voit pas.
 */
function columns(shift: number) {
  return (i: number, count: number): Pose => {
    const col = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    const rows = Math.ceil(count / COLUMNS);
    /** La colonne du milieu va à contre-courant : le relief vient de là. */
    const dir = col === 1 ? -1 : 1;
    const slot = wrap(row - 1 + dir * shift, rows);
    return {
      // 62 % de la largeur d'une vignette par cran : à l'échelle 0,6 les
      // trois files se touchent presque sans jamais se recouvrir.
      x: (col - 1) * 62,
      // 64 % de la hauteur d'une vignette par cran : les colonnes tiennent
      // dans la hauteur même quand le cadre est large (la composition est
      // réglée sur la largeur, c'est la hauteur qui vient à manquer).
      y: slot * 64,
      // Jamais deux files au même plan : un cran par cliché suffit à fixer
      // l'ordre sans se voir dans la perspective.
      z: -i * 3,
      rotate: 0,
      rotateY: 0,
      scale: 0.6,
      // Éteinte avant d'atteindre le bord : la vignette s'efface au lieu
      // d'être coupée net par le cadre.
      opacity: fade(Math.abs(slot), 1, 1.35),
    };
  };
}

/** Colonnes de la mosaïque. */
const MOSAIC = 4;

/** « La mosaïque » : tout le jeu d'un coup, à plat, dernière ligne centrée. */
function grid(i: number, count: number): Pose {
  const col = i % MOSAIC;
  const row = Math.floor(i / MOSAIC);
  const rows = Math.ceil(count / MOSAIC);
  /** La dernière ligne est souvent incomplète : on la recentre. */
  const inRow = Math.min(MOSAIC, count - row * MOSAIC);
  return {
    x: (col - (inRow - 1) / 2) * 42,
    y: (row - (rows - 1) / 2) * 44,
    z: -i * 3,
    rotate: 0,
    rotateY: 0,
    scale: 0.38,
    opacity: 1,
  };
}

/**
 * « Le plein cadre » : une vignette vient au premier plan, les autres
 * s'écartent et s'effacent. La vedette change à chaque tour du montage, la
 * boucle ne se referme donc jamais tout à fait sur elle-même.
 *
 * Elle est agrandie juste assez pour tenir la scène, jamais jusqu'à sortir du
 * cadre : à l'échelle 1,5, avancée de 70 px, elle occupe environ 86 % de la
 * largeur du cadre et 72 % de sa hauteur, bords et coins arrondis compris.
 * C'est une image entière que l'on regarde, pas un fragment recadré.
 */
function hero(i: number, count: number, cycle: number): Pose {
  const star = (cycle * 3 + 2) % count;
  if (i === star) {
    return { x: 0, y: 0, z: 70, rotate: 0, rotateY: 0, scale: 1.5, opacity: 1 };
  }
  const a = (i / count) * Math.PI * 2;
  return {
    x: Math.cos(a) * 150,
    y: Math.sin(a) * 165,
    z: -320,
    rotate: 0,
    rotateY: 0,
    scale: 0.5,
    opacity: 0,
  };
}

/* ------------------------------------------------------------------ */
/* La conduite du montage                                              */
/* ------------------------------------------------------------------ */

/** Premier temps, aussi utilisé comme repli : le montage ouvre sur la pile. */
const OPENING: Beat = {
  act: 0,
  dwell: 900,
  move: 1800,
  stagger: 0.035,
  ease: EASE_INSTITUTIONAL,
  pose: stack,
};

/**
 * Le montage, temps par temps.
 *
 * `move` couvre presque tout le `dwell` : le mouvement d'un temps se termine
 * quand le suivant commence, l'image ne s'arrête donc jamais vraiment. Un acte
 * en deux temps se lit comme un seul geste : le premier compose la figure, le
 * second la fait glisser sur toute sa durée (`move` égal à `dwell`, courbe
 * `DOLLY`).
 */
const BEATS: Beat[] = [
  OPENING,
  { act: 0, dwell: 1900, move: 1800, stagger: 0.03, ease: EASE_INSTITUTIONAL, pose: fan },
  { act: 1, dwell: 1700, move: 1650, stagger: 0.025, ease: EASE_INSTITUTIONAL, pose: deck(2) },
  { act: 1, dwell: 3800, move: 3800, stagger: 0, ease: DOLLY, pose: deck(7) },
  { act: 2, dwell: 1800, move: 1750, stagger: 0.03, ease: EASE_INSTITUTIONAL, pose: columns(0) },
  { act: 2, dwell: 2800, move: 2800, stagger: 0, ease: DOLLY, pose: columns(1.6) },
  { act: 3, dwell: 1800, move: 1700, stagger: 0.03, ease: EASE_INSTITUTIONAL, pose: grid },
  { act: 4, dwell: 2400, move: 2000, stagger: 0.03, ease: EASE_INSTITUTIONAL, pose: hero },
];

/** Le temps courant. Le modulo garantit l'index, TypeScript l'ignore. */
function beatAt(step: number): Beat {
  return BEATS[step % BEATS.length] ?? OPENING;
}

/**
 * Montage photo animé, à la manière d'un générique vidéo.
 *
 * Les mêmes vignettes traversent cinq actes qui s'enchaînent en boucle : la
 * pile, l'éventail, le défilé de trois quarts, les colonnes à contre-courant,
 * la mosaïque, puis une image en plein cadre. Rien n'est coupé : chaque
 * changement d'acte est un mouvement, les vignettes gardent leur identité et
 * se replacent, ce qui donne la fluidité d'un montage plutôt que l'effet d'un
 * diaporama.
 *
 * Trois couches d'animation se superposent, ce qui évite les temps morts :
 *
 * - les poses, pilotées par Motion ; un seul changement d'état toutes les deux
 *   secondes environ, le reste du temps c'est le moteur d'animation qui
 *   travaille (transformations et opacité, donc le GPU) ;
 * - le lent panoramique sur chaque cliché (`reel-pan`), qui respire même quand
 *   la pose ne bouge plus ;
 * - la dérive de l'appareil sur toute la scène (`reel-drift`), en CSS.
 *
 * Le montage ne tourne que lorsqu'il est à l'écran (`useInView`) : hors champ,
 * le minuteur s'arrête et reprend sur le temps où il en était.
 *
 * `prefers-reduced-motion` remplace le tout par une mosaïque fixe.
 */
export function PhotoReel({
  photos = AESBT_RING_PHOTOS,
  chapters = true,
  className,
}: {
  /** Images affichées, propres à chaque emplacement. */
  photos?: RingPhoto[];
  /** Barre de progression du montage, en bas du cadre. */
  chapters?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const onScreen = useInView(frame, { amount: 0.15 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce || !onScreen) return undefined;
    const id = window.setTimeout(() => setStep((s) => s + 1), beatAt(step).dwell);
    return () => window.clearTimeout(id);
  }, [step, onScreen, reduce]);

  // Sans animation : la mosaïque, simplement posée.
  if (reduce) {
    return (
      <div className={`grid grid-cols-3 gap-2 ${className ?? ""}`}>
        {photos.map((photo) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            className="aspect-[3/2] w-full rounded-xl object-cover"
          />
        ))}
      </div>
    );
  }

  const beat = beatAt(step);
  const cycle = Math.floor(step / BEATS.length);
  const count = photos.length;

  return (
    <div
      ref={frame}
      className={`relative select-none overflow-hidden ${className ?? ""}`}
      role="img"
      aria-label="Montage des photos de l'association"
      // La perspective ne sert qu'au balancement de la scène juste en dessous ;
      // les vignettes ont la leur (voir `PERSPECTIVE`).
      style={{ containerType: "inline-size", perspective: `${PERSPECTIVE}px` } as CSSProperties}
    >
      {/*
        La dérive de l'appareil : un lent balancement de toute la scène.

        Pas de `preserve-3d` ici, volontairement : les vignettes sont aplaties
        dans ce plan, elles s'affichent donc dans l'ordre de leur `z-index` et
        ne peuvent plus se traverser pendant un changement d'acte.
      */}
      <div className="absolute inset-0 animate-[reel-drift_20s_ease-in-out_infinite_alternate] motion-reduce:animate-none">
        {photos.map((photo, i) => (
          <Tile
            key={photo.src}
            photo={photo}
            index={i}
            beat={beat}
            pose={beat.pose(i, count, cycle)}
          />
        ))}
      </div>

      {chapters ? <Chapters act={beat.act} /> : null}
    </div>
  );
}

/**
 * Une vignette du montage.
 *
 * Composant à part pour que chaque vignette porte sa propre profondeur : la
 * même valeur donne le recul en perspective et le rang d'empilement, qui
 * restent donc d'accord à chaque image, mouvement compris.
 */
function Tile({
  photo,
  index,
  beat,
  pose,
}: {
  photo: RingPhoto;
  index: number;
  beat: Beat;
  pose: Pose;
}) {
  const depth = useMotionValue(snap(pose.z));
  const zIndex = useTransform(depth, rank);
  const delay = beat.stagger * index;

  // La profondeur est animée à part, sur la même courbe que la pose, pour que
  // le rang d'empilement puisse la suivre.
  useEffect(() => {
    const run = animate(depth, snap(pose.z), {
      duration: beat.move / 1000,
      ease: beat.ease,
      delay,
    });
    return () => run.stop();
  }, [beat, delay, depth, pose.z]);

  return (
    <motion.figure
      className="absolute left-1/2 top-1/2 m-0 overflow-hidden rounded-[2.6cqw] bg-[#F3E9DC] shadow-[0_2.4cqw_5cqw_-1.8cqw_rgba(42,15,11,0.42)] ring-1 ring-white/50"
      style={{
        width: `${CARD}cqw`,
        height: `${CARD_H}cqw`,
        marginLeft: `${-CARD / 2}cqw`,
        marginTop: `${-CARD_H / 2}cqw`,
        transformPerspective: PERSPECTIVE,
        z: depth,
        zIndex,
      }}
      // `initial={false}` : au chargement, les vignettes sont déjà en place, le
      // montage ne se construit pas sous les yeux du visiteur.
      initial={false}
      animate={{
        x: `${snap(pose.x)}%`,
        y: `${snap(pose.y)}%`,
        rotate: snap(pose.rotate),
        rotateY: snap(pose.rotateY),
        scale: snap(pose.scale),
        opacity: snap(pose.opacity),
      }}
      transition={{ duration: beat.move / 1000, ease: beat.ease, delay }}
    >
      {/* Panoramique lent sur le cliché : le cadre bouge, l'image aussi, et
          chaque vignette a sa propre phase. */}
      <img
        src={photo.src}
        alt={photo.alt}
        loading={index < 4 ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="size-full animate-[reel-pan_13s_ease-in-out_infinite_alternate] object-cover motion-reduce:animate-none"
        style={{ animationDelay: `${-1.2 * index}s` }}
      />
      {/* Le reflet : une lumière rasante, pour que la vignette se lise comme un
          tirage et non comme une image collée. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.20),rgba(255,255,255,0)_44%,rgba(30,15,10,0.22))]"
      />
    </motion.figure>
  );
}

/**
 * Progression du montage, comme la barre d'un lecteur.
 *
 * Des repères, et rien d'autre : ils situent le montage dans sa boucle sans
 * nommer ce qui se passe à l'écran. Une pastille claire les tient lisibles,
 * quelle que soit la photo qui passe dessous.
 */
function Chapters({ act }: { act: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-[3.4cqw]"
    >
      <span className="flex items-center gap-[1.2cqw] rounded-full bg-white/70 px-[2.2cqw] py-[1.4cqw] backdrop-blur-sm">
        {ACTS.map((label, i) => (
          <span
            key={label}
            className="h-[0.6cqw] w-[4cqw] overflow-hidden rounded-full bg-[#1A1A1A]/16"
          >
            <motion.span
              className="block size-full origin-left rounded-full bg-[#B4271C]"
              initial={false}
              animate={{ scaleX: i <= act ? 1 : 0 }}
              transition={{ duration: 0.45, ease: EASE_INSTITUTIONAL }}
            />
          </span>
        ))}
      </span>
    </div>
  );
}
