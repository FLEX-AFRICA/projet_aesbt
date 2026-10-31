"use client";

import type { AttributsZone } from "@/components/editable/ZoneEditable";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import {
  animate,
  backOut,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Mesurer avant la peinture, sinon la vignette paraît une image à la taille
 * par défaut. `useLayoutEffect` n'existe pas au rendu serveur, d'où le repli.
 */
const useMeasure = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Plateau supposé avant la première mesure. Jamais peint, mais il fixe le
 * rapport du `viewBox` initial : un format large évite que les pistes soient
 * calculées dans un cadre invraisemblable le temps d'une image.
 */
const PLATEAU_INITIAL = { w: 1200, h: 700 } as const;

/**
 * Attributs de sélection de l'éditeur visuel, posés tels quels sur les
 * éléments concernés (vides hors mode édition). Voir `useAttributsZone`.
 */
export type ZonesEdition = {
  before?: AttributsZone;
  after?: AttributsZone;
  media?: AttributsZone;
};

export type RevealMedia =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; alt: string; poster?: string };

/** La disposition dans laquelle une pièce est dessinée. */
export type PieceLayout = "sides" | "stack";

/**
 * Une pièce reliée au média par une piste de circuit.
 *
 * Quand `node` est une fonction, elle reçoit la disposition en cours : la même
 * pièce se dessine en bloc de part et d'autre du média sur grand écran, et en
 * ligne sur téléphone, où elle n'a plus la place de s'empiler.
 */
export type CircuitNode = { id: string; node: ReactNode | ((layout: PieceLayout) => ReactNode) };

/** Dessine une pièce dans la disposition demandée. */
function piece(item: CircuitNode, layout: PieceLayout): ReactNode {
  return typeof item.node === "function" ? item.node(layout) : item.node;
}

/* ------------------------------------------------------------------ */
/* La conduite du plan, en progression de défilement (0 → 1)           */
/* ------------------------------------------------------------------ */

/** La phrase a fini de s'écarter et de s'effacer. */
const TEXT_OUT = 0.22;
/** Sans circuit : le média enfle jusque-là, et prend tout le cadre. */
const GROW_ALONE = 0.72;
/** Avec circuit : il s'arrête plus tôt, et plus petit. La suite lui répond. */
const GROW_HUB = 0.3;
/** Apparition de la trame de points. */
const GRID_IN: [number, number] = [0.24, 0.42];
/** Première piste. */
const TRACE_START = 0.34;
/** Décalage d'une piste à la suivante. */
const TRACE_STEP = 0.055;
/** Durée de tracé d'une piste. */
const TRACE_SPAN = 0.13;
/** Apparition de la légende, une fois tout en place. */
const CAPTION_IN: [number, number] = [0.8, 0.92];
/**
 * Sous cette largeur de plateau, les pièces passent en colonne sous le média.
 *
 * La valeur est celle de la rupture `md` de Tailwind : l'appelant peut donc
 * accorder sa typographie à la disposition avec un simple `md:`.
 */
const STACK_UNDER = 768;

/** Durée de l'ouverture jouée d'elle-même sur téléphone, en secondes. */
const INTRO_SECONDS = 1.25;

type Card = { x: number; y: number; w: number; h?: number; dx: number };
type Trace = { d: string; len: number };
type Board = { w: number; h: number };

type Geometry = {
  mode: "none" | "sides" | "stack";
  hub: { w: number; h: number; cx: number; cy: number };
  cards: Card[];
  traces: Trace[];
};

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Une piste de circuit : des segments à angle droit, et leur longueur.
 *
 * La longueur sert au motif de l'impulsion qui la parcourt : elle doit être
 * connue sans interroger le DOM.
 */
function orthoPath(points: { x: number; y: number }[]): Trace {
  const first = points[0];
  if (!first) return { d: "", len: 0 };
  let d = `M ${round(first.x)} ${round(first.y)}`;
  let len = 0;
  let at = first;
  for (let i = 1; i < points.length; i += 1) {
    const next = points[i];
    if (!next) continue;
    if (Math.abs(next.x - at.x) > 0.5) {
      d += ` H ${round(next.x)}`;
      len += Math.abs(next.x - at.x);
    }
    if (Math.abs(next.y - at.y) > 0.5) {
      d += ` V ${round(next.y)}`;
      len += Math.abs(next.y - at.y);
    }
    at = next;
  }
  return { d, len };
}

/** Répartit `k` pièces sur la hauteur du plateau, en proportions. */
function spread(k: number) {
  if (k <= 1) return [0.5];
  return Array.from({ length: k }, (_, j) => 0.17 + (j * 0.66) / (k - 1));
}

/**
 * Place le média, les pièces et les pistes sur le plateau.
 *
 * Deux dispositions : `sides` répartit les pièces de part et d'autre du média,
 * comme les composants autour d'une puce ; `stack` les range sous lui en une
 * colonne de lignes, alimentées par un bus qui descend la marge gauche, quand
 * la largeur ne suffit plus pour les mettre de côté.
 */
function layout(board: Board, aspect: number, hubFraction: number, count: number): Geometry {
  const mode = count === 0 ? "none" : board.w < STACK_UNDER ? "stack" : "sides";

  if (mode === "none") {
    let w = Math.min(board.w * hubFraction, 1180);
    let h = w / aspect;
    const maxH = board.h * 0.74;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    return { mode, hub: { w, h, cx: board.w / 2, cy: board.h / 2 }, cards: [], traces: [] };
  }

  if (mode === "sides") {
    const pad = 14;
    let w = Math.min(board.w * hubFraction, 560);
    let h = w / aspect;
    const maxH = board.h * 0.58;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    const cx = board.w / 2;
    const cy = board.h / 2;

    const left = Math.ceil(count / 2);
    const leftYs = spread(left);
    const rightYs = spread(count - left);

    // La pièce prend tout ce que le média laisse sur son flanc, moins la place
    // qu'il faut à sa piste pour se voir : elle grandit donc avec le plateau au
    // lieu de sauter d'un palier à l'autre.
    const gutter = (board.w - w) / 2;
    const cardW = Math.max(150, Math.min(252, gutter - pad - 72));
    // Toutes les pièces ont la même hauteur, calée sur l'écart entre deux
    // rangées : un intitulé sur une ligne et un intitulé sur deux occupent le
    // même cadre, et les colonnes restent régulières.
    const cardH = Math.min(left > 1 ? (board.h * 0.66) / (left - 1) - 20 : maxH, 176);

    const cards: Card[] = [];
    const traces: Trace[] = [];
    for (let i = 0; i < count; i += 1) {
      const onLeft = i < left;
      const row = onLeft ? i : i - left;
      const ys = onLeft ? leftYs : rightYs;
      const y = board.h * (ys[row] ?? 0.5);
      const x = onLeft ? pad + cardW / 2 : board.w - pad - cardW / 2;
      cards.push({ x, y, w: cardW, h: cardH, dx: onLeft ? 26 : -26 });

      // La piste part du bord du média et file vers la pièce : elle se trace
      // de l'intérieur vers l'extérieur, la pièce paraît au bout.
      const from = { x: onLeft ? cx - w / 2 - 10 : cx + w / 2 + 10, y: cy };
      const to = { x: onLeft ? x + cardW / 2 + 8 : x - cardW / 2 - 8, y };
      // Le coude se place tout près du média plutôt qu'à mi-chemin : les
      // trois pistes d'un même flanc s'en détachent donc aussitôt sorties de
      // l'image, bien visibles, au lieu de voyager groupées jusqu'au milieu
      // du couloir avant de bifurquer vers leur pièce.
      const riser = Math.min(32, Math.abs(to.x - from.x) * 0.3);
      const bendX = onLeft ? from.x - riser : from.x + riser;
      traces.push(orthoPath([from, { x: bendX, y: from.y }, { x: bendX, y: to.y }, to]));
    }
    return { mode, hub: { w, h, cx, cy }, cards, traces };
  }

  // En colonne : le média en haut, puis les pièces en lignes pleine largeur,
  // accrochées à un bus qui descend le long de la marge gauche. Le plateau est
  // celui d'un téléphone, la hauteur se compte donc au pixel : le média prend
  // moins du tiers, la légende tient dans l'écart, et les lignes se partagent
  // ce qui reste sans jamais passer sous le pli.
  const pad = 16;
  const gap = 8;
  /** La colonne du bus, et le bord des lignes qu'il alimente. */
  const busX = pad + 2;
  const cardLeft = pad + 26;
  const cardW = board.w - pad - cardLeft;

  let h = board.h * 0.28;
  let w = h * aspect;
  const maxW = Math.min(board.w - pad * 2, 520);
  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }
  const cx = board.w / 2;
  const cy = board.h * 0.035 + h / 2 + 24;

  // L'écart sous le média accueille la légende ; les lignes commencent après.
  const gridTop = cy + h / 2 + 52;
  const rowH = Math.min((board.h - gridTop - pad) / Math.max(1, count), 84);
  // La ligne ne s'étire pas au-delà de son contenu : sur un grand téléphone,
  // le surplus devient de l'air entre les lignes plutôt que des pavés vides.
  const cardH = Math.max(42, Math.min(rowH - gap, 64));

  const cards: Card[] = [];
  const traces: Trace[] = [];
  for (let i = 0; i < count; i += 1) {
    const y = gridTop + i * rowH + rowH / 2;
    cards.push({ x: cardLeft + cardW / 2, y, w: cardW, h: cardH, dx: -14 });

    // La première piste sort du flanc du média, rejoint le bus et descend
    // jusqu'à sa ligne ; chacune des suivantes prolonge le bus d'un cran.
    // Aucune ne repasse donc sur une autre, et l'impulsion descend la colonne
    // de ligne en ligne au lieu de s'empiler sur un tronc commun.
    const from =
      i === 0
        ? [
            { x: cx - w / 2 - 8, y: cy },
            { x: busX, y: cy },
          ]
        : [{ x: busX, y: y - rowH }];
    traces.push(orthoPath([...from, { x: busX, y }, { x: cardLeft - 8, y }]));
  }
  return { mode, hub: { w, h, cx, cy }, cards, traces };
}

/**
 * Un plan joué au défilement : une vignette incrustée dans une ligne de titre
 * enfle, la phrase s'écarte, puis un circuit relie le média à ses pièces.
 *
 * Le défilement ne déclenche pas une animation, il la joue : la position du
 * pouce est lue (`useScroll`) puis lissée par un ressort (`useSpring`), et
 * toutes les valeurs en dérivent. Remonter rembobine donc le plan.
 *
 * Deux temps, dans un seul défilement :
 *
 * 1. la vignette, de la taille d'une capitale, enfle jusqu'à `hub` pendant que
 *    les deux moitiés de la phrase sont écartées par elle, puis s'effacent ;
 * 2. les pistes se tracent depuis les bords du média, à angle droit, et chaque
 *    pièce paraît au bout de la sienne avec un léger dépassement. Une
 *    impulsion parcourt ensuite chaque piste, en boucle.
 *
 * Sur téléphone, où les pièces passent en colonne, le plan se joue autrement :
 *
 * - la phrase s'écarte de haut en bas plutôt que de gauche à droite, et la
 *   vignette a donc toute la largeur pour grandir. La phrase, elle, n'a plus à
 *   tenir sur une ligne avec la vignette : l'appelant peut l'écrire bien plus
 *   grande (voir `STACK_UNDER` et la rupture `md`) ;
 * - le titre s'ouvre au milieu de l'écran et remonte à la place du média ;
 * - l'ouverture se joue d'elle-même dès que le plateau est à l'écran, sans
 *   attendre que la section soit amenée pile en haut ; le défilement ne reprend
 *   la main que pour le circuit, sur une piste deux fois plus courte.
 *
 * Sans `nodes`, le second temps n'existe pas : le média enfle alors jusqu'à
 * remplir le cadre, et le composant se réduit au premier plan.
 *
 * La vignette grandit par sa largeur, non par son échelle : cela coûte un peu
 * plus cher, mais l'image reste nette à l'arrivée au lieu d'être une vignette
 * agrandie. L'image se dézoome en même temps que son cadre s'ouvre, comme un
 * objectif qui recule.
 *
 * Le dessin du circuit s'inspire de `circuit-board` (Componentry) : trame de
 * points, pistes à angle droit, impulsion en tirets sur un halo. La différence
 * est qu'ici rien ne se joue sur une horloge : tout est asservi au défilement,
 * et le moyeu est un média dont la taille change.
 *
 * `prefers-reduced-motion` remplace le plan par un titre, une image et la
 * liste des pièces, sans épinglage ni défilement détourné.
 */
export function ScrollZoomReveal({
  before,
  after,
  media,
  aspect = 1.5,
  caption,
  as = "h2",
  className,
  textClassName,
  track = 240,
  hub = 0.94,
  nodes,
  accent = "#1A1A1A",
  zones,
}: {
  /** Le morceau de phrase posé avant la vignette. */
  before: string;
  /** Celui qui la suit. */
  after: string;
  media: RevealMedia;
  /** Largeur / hauteur de la vignette. */
  aspect?: number;
  /** Légende, révélée quand tout est en place. */
  caption?: ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  /** Typographie de la ligne : taille, graisse, couleur. */
  textClassName?: string;
  /** Longueur de la piste de défilement, en `vh`. */
  track?: number;
  /** Part de la largeur du plateau que le média occupe à l'arrivée. */
  hub?: number;
  /** Les pièces reliées au média. Sans elles, pas de circuit. */
  nodes?: CircuitNode[];
  /** Couleur des pistes et des impulsions. */
  accent?: string;
  /** Sélection dans l'éditeur visuel (aucun effet hors mode édition). */
  zones?: ZonesEdition;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLElement>(null);
  const glow = useId().replace(/:/g, "");

  const count = nodes?.length ?? 0;

  /**
   * Taille du plateau : tout le reste s'en déduit, le `viewBox` des pistes
   * compris.
   *
   * La valeur de départ doit être identique au rendu serveur et au premier
   * rendu client. Lire `window.innerWidth` ici donnait au navigateur un
   * `viewBox` différent de celui reçu du serveur : React signalait une
   * hydratation divergente et renonçait à rattacher l'arbre.
   *
   * Cette taille n'est jamais montrée : la mesure ci-dessous se fait dans un
   * effet de mise en page, donc avant la peinture.
   */
  const [board, setBoard] = useState<Board>(PLATEAU_INITIAL);
  /** Taille de la vignette dans la ligne, soit la hauteur d'une capitale. */
  const [chip, setChip] = useState({ w: 96, radius: 6 });

  useMeasure(() => {
    const el = boardRef.current;
    if (!el) return undefined;
    const box = el.getBoundingClientRect();
    setBoard({ w: box.width, h: box.height });
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBoard({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMeasure(() => {
    const measure = () => {
      const line = lineRef.current;
      const font = line ? parseFloat(window.getComputedStyle(line).fontSize) : 24;
      setChip({ w: font * 0.84 * aspect, radius: Math.max(4, font * 0.1) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [aspect]);

  const geo = useMemo(() => layout(board, aspect, hub, count), [board, aspect, hub, count]);

  /**
   * Sur téléphone, le plan garde la même mise en scène mais se joue plus court
   * et se dessine plus simplement : le pouce parcourt moins d'écrans, et le
   * halo gaussien des impulsions, cher à composer, est abandonné.
   */
  const compact = geo.mode === "stack";
  const growEnd = count > 0 ? GROW_HUB : GROW_ALONE;
  // Sur téléphone, l'ouverture ne coûte plus de défilement : la piste n'a donc
  // à porter que le circuit, et le pouce parcourt deux fois moins d'écrans.
  const trackVh = compact ? Math.round(track * 0.5) : track;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  /**
   * L'ouverture, jouée d'elle-même sur téléphone.
   *
   * Le plan ne démarrait qu'une fois la section amenée pile en haut de l'écran,
   * ce qui obligeait à chercher le bon endroit avant de voir quoi que ce soit.
   * Dès que le plateau est à l'écran, l'ouverture se joue donc seule, et le
   * défilement ne reprend la main que pour le circuit.
   */
  const intro = useMotionValue(0);
  const onScreen = useInView(boardRef, { amount: 0.6, once: true });

  useEffect(() => {
    if (!compact || reduce || !onScreen) return undefined;
    const run = animate(intro, growEnd, {
      duration: INTRO_SECONDS,
      ease: [0.32, 0.72, 0, 1],
      delay: 0.2,
    });
    return () => run.stop();
  }, [compact, reduce, onScreen, intro, growEnd]);

  /**
   * La conduite du plan.
   *
   * De côté, c'est le défilement, et lui seul. En colonne, l'ouverture est
   * portée par `intro` tant que le pouce n'a pas bougé ; au premier geste, le
   * défilement reprend à la fin de l'ouverture et joue le circuit.
   */
  const raw = useTransform([intro, scrollYProgress], ([a, b]: number[]) => {
    const auto = a ?? 0;
    const scrolled = b ?? 0;
    if (!compact) return scrolled;
    return Math.max(auto, scrolled > 0 ? growEnd + scrolled * (1 - growEnd) : 0);
  });

  // Le ressort absorbe les à-coups de la molette : le plan garde son inertie.
  const progress = useSpring(raw, { stiffness: 140, damping: 32, mass: 0.45 });
  const width = useTransform(progress, [0, growEnd], [chip.w, geo.hub.w]);
  const height = useTransform(width, (w) => w / aspect);
  const radius = useTransform(progress, [0, growEnd], [chip.radius, 22]);
  const leftX = useTransform(progress, [0, TEXT_OUT], ["0%", "-120%"]);
  const rightX = useTransform(progress, [0, TEXT_OUT], ["0%", "120%"]);
  // En colonne, la phrase s'écarte de haut en bas : c'est le sens dans lequel
  // l'écran a de la place, et la vignette garde toute la largeur pour grandir.
  const leftY = useTransform(progress, [0, TEXT_OUT], ["0%", "-130%"]);
  const rightY = useTransform(progress, [0, TEXT_OUT], ["0%", "130%"]);
  /**
   * La hauteur de la ligne de titre.
   *
   * En colonne, le titre s'ouvre au milieu de l'écran, là où l'œil le cherche,
   * puis remonte à la place du média pendant qu'il grandit. Il est en place
   * avant que la première piste ne se trace (`TRACE_START` est après
   * `growEnd`), les pistes touchent donc toujours le bord du média.
   */
  const titleTop = useTransform(progress, [0, growEnd], [board.h / 2, geo.hub.cy]);
  const textOpacity = useTransform(progress, [0, TEXT_OUT * 0.75], [1, 0]);
  const innerScale = useTransform(progress, [0, growEnd], [1.2, 1]);
  const gridOpacity = useTransform(progress, GRID_IN, [0, 1]);
  const captionOpacity = useTransform(progress, CAPTION_IN, [0, 1]);

  // Les réglages stricts du projet résolvent les props d'une balise dynamique
  // en `never` : on la type explicitement.
  const Tag = as as unknown as ComponentType<
    HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }
  >;

  if (reduce) {
    return (
      <div className={className}>
        <Tag className={textClassName}>{`${before} ${after}`}</Tag>
        <figure className="mx-auto mt-8 max-w-[1180px]">
          <Media media={media} aspect={aspect} className="w-full rounded-[22px]" />
          {caption ? (
            <figcaption className="mt-3 text-center text-[13px] text-[#6B6B6B]">
              {caption}
            </figcaption>
          ) : null}
        </figure>
        {nodes && nodes.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nodes.map((n) => (
              <div key={n.id}>{piece(n, "sides")}</div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={`relative ${className ?? ""}`}
      style={{ height: `${trackVh}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={boardRef} className="relative mx-auto size-full max-w-[1240px]">
          {/* La trame de points du circuit imprimé. */}
          {count > 0 ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: gridOpacity,
                backgroundImage: `radial-gradient(circle, ${accent}22 1px, transparent 1px)`,
                backgroundSize: compact ? "18px 18px" : "22px 22px",
                maskImage: "radial-gradient(70% 70% at 50% 50%, #000 40%, transparent 100%)",
              }}
            />
          ) : null}

          {/* Les pistes. */}
          {count > 0 ? (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
              viewBox={`0 0 ${Math.max(1, board.w)} ${Math.max(1, board.h)}`}
              fill="none"
            >
              <defs>
                <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.4" result="blurred" />
                  <feMerge>
                    <feMergeNode in="blurred" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {geo.traces.map((t, i) => (
                <CircuitTrace
                  key={geo.mode + String(i)}
                  progress={progress}
                  span={[TRACE_START + i * TRACE_STEP, TRACE_START + i * TRACE_STEP + TRACE_SPAN]}
                  trace={t}
                  accent={accent}
                  glow={compact ? undefined : glow}
                  order={i}
                />
              ))}
            </svg>
          ) : null}

          {/* La ligne de titre, centrée sur le média. */}
          <motion.div
            className="absolute inset-x-0 flex -translate-y-1/2 items-center justify-center px-4"
            style={{ top: compact ? titleTop : geo.hub.cy }}
          >
            <Tag
              ref={lineRef}
              className={`flex w-full items-center ${
                compact
                  ? "relative flex-col text-center"
                  : "justify-center gap-[0.24em] whitespace-nowrap"
              } ${textClassName ?? ""}`}
            >
              {/* De côté, les deux moitiés de la phrase pèsent le même poids
                  dans la ligne : sans cela, la plus longue pousse la vignette
                  hors du centre du plateau et les pistes de droite ne touchent
                  plus son bord. `min-w-0` est indispensable à ce partage : sans
                  lui, une moitié plus longue que sa part refuse de descendre
                  sous la largeur de son texte (même invisible, une fois
                  effacé) et prend l'espace de l'autre, qui rétrécit d'autant,
                  décalant la vignette. Avec `whitespace-nowrap`, ce plancher
                  est celui de la phrase entière, pas juste du mot le plus
                  long : l'effet est donc net dès que la vignette grandit.

                  En colonne, elles sortent du flux et se posent au-dessus et
                  en dessous de la vignette : celle-ci reste donc seule à
                  occuper la ligne, et son centre tombe exactement sur le point
                  d'où partent les pistes, même quand la phrase s'est effacée. */}
              <motion.span
                className={
                  compact
                    ? "absolute inset-x-0 bottom-full mb-[0.12em] block"
                    : "block min-w-0 flex-1 basis-0 text-right"
                }
                style={
                  compact ? { y: leftY, opacity: textOpacity } : { x: leftX, opacity: textOpacity }
                }
                {...zones?.before}
              >
                {before}
              </motion.span>

              <motion.span
                className="relative inline-block shrink-0 overflow-hidden bg-[#E8DFD4] align-middle shadow-[0_24px_60px_-28px_rgba(42,15,11,0.45)]"
                style={{ width, height, borderRadius: radius }}
                {...zones?.media}
              >
                <motion.span className="block size-full" style={{ scale: innerScale }}>
                  <Media media={media} aspect={aspect} className="size-full" />
                </motion.span>
              </motion.span>

              <motion.span
                className={
                  compact
                    ? "absolute inset-x-0 top-full mt-[0.12em] block"
                    : "block min-w-0 flex-1 basis-0 text-left"
                }
                style={
                  compact
                    ? { y: rightY, opacity: textOpacity }
                    : { x: rightX, opacity: textOpacity }
                }
                {...zones?.after}
              >
                {after}
              </motion.span>
            </Tag>
          </motion.div>

          {/* Les pièces, au bout de leur piste. */}
          {nodes?.map((item, i) => {
            const card = geo.cards[i];
            if (!card) return null;
            return (
              <div
                key={item.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: card.x, top: card.y, width: card.w, height: card.h }}
              >
                <CircuitPiece
                  progress={progress}
                  span={[
                    TRACE_START + i * TRACE_STEP + TRACE_SPAN * 0.72,
                    TRACE_START + i * TRACE_STEP + TRACE_SPAN + 0.07,
                  ]}
                  dx={card.dx}
                >
                  {piece(item, geo.mode === "stack" ? "stack" : "sides")}
                </CircuitPiece>
              </div>
            );
          })}

          {caption ? (
            <motion.div
              className={`absolute left-1/2 -translate-x-1/2 px-6 text-center text-[#5A4A42] ${
                compact ? "text-[12.5px] leading-snug" : "text-[13px]"
              }`}
              style={{
                opacity: captionOpacity,
                top: geo.hub.cy + geo.hub.h / 2 + (compact ? 10 : 18),
                // En colonne, la légende se tient à l'écart du bus de gauche.
                maxWidth: compact ? board.w - 72 : Math.max(240, geo.hub.w),
              }}
            >
              {caption}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Une piste : le trait se tire du moyeu vers la pièce, puis une impulsion le
 * parcourt en boucle, et une pastille de contact marque son extrémité.
 */
function CircuitTrace({
  progress,
  span,
  trace,
  accent,
  glow,
  order,
}: {
  progress: MotionValue<number>;
  span: [number, number];
  trace: Trace;
  accent: string;
  /** Sans halo (téléphone), l'impulsion se contente du trait. */
  glow?: string | undefined;
  order: number;
}) {
  const pathLength = useTransform(progress, span, [0, 1]);
  const live = useTransform(progress, [span[1] - 0.01, span[1] + 0.05], [0, 1]);
  const dash = Math.max(16, trace.len * 0.12);

  return (
    <g>
      <motion.path
        d={trace.d}
        stroke={accent}
        strokeOpacity={0.3}
        strokeWidth={1.6}
        strokeLinecap="square"
        style={{ pathLength }}
      />
      <motion.path
        d={trace.d}
        stroke={accent}
        strokeWidth={glow ? 2.4 : 2}
        strokeLinecap="round"
        filter={glow ? `url(#${glow})` : undefined}
        strokeDasharray={`${dash} ${trace.len}`}
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -(trace.len + dash) }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: order * 0.35 }}
        style={{ opacity: live }}
      />
    </g>
  );
}

/** Une pièce, qui paraît au bout de sa piste avec un léger dépassement. */
function CircuitPiece({
  progress,
  span,
  dx,
  children,
}: {
  progress: MotionValue<number>;
  span: [number, number];
  /** Course d'arrivée : la pièce sort de la piste vers l'extérieur. */
  dx: number;
  children: ReactNode;
}) {
  const t = useTransform(progress, span, [0, 1], { ease: backOut });
  const opacity = useTransform(t, [0, 0.4], [0, 1]);
  const x = useTransform(t, [0, 1], [dx, 0]);
  const scale = useTransform(t, [0, 1], [0.9, 1]);

  return (
    <motion.div className="size-full" style={{ opacity, x, scale }}>
      {children}
    </motion.div>
  );
}

/** L'image, ou la vidéo : même cadrage, même recouvrement. */
function Media({
  media,
  aspect,
  className,
}: {
  media: RevealMedia;
  aspect: number;
  className?: string;
}) {
  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        poster={media.poster}
        aria-label={media.alt}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`object-cover ${className ?? ""}`}
        style={{ aspectRatio: aspect }}
      />
    );
  }
  return (
    <img
      src={media.src}
      alt={media.alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`object-cover ${className ?? ""}`}
      style={{ aspectRatio: aspect }}
    />
  );
}
