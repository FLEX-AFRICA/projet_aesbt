import type { CSSProperties, ReactNode } from "react";

export type RingPhoto = { src: string; alt: string };

/**
 * Photos de la vie de l'association (`public/picture-*.jpg`).
 *
 * C'est le jeu par défaut du carrousel. Pour en afficher d'autres à un endroit
 * donné, passer la prop `photos` plutôt que de modifier ce tableau : chaque
 * section garde ainsi ses propres images.
 */
export const AESBT_RING_PHOTOS: RingPhoto[] = Array.from({ length: 11 }, (_, i) => ({
  src: `/picture-${i + 1}.jpg`,
  alt: "",
}));

export type RingVariant = "wheel" | "belt" | "spiral" | "tunnel";

/* ------------------------------------------------------------------ */
/* Réglages par disposition                                            */
/* ------------------------------------------------------------------ */

/** Rayon de la roue, en pourcentage de la largeur du conteneur. */
const WHEEL_RADIUS = 33;
/** Serrage des vignettes : 1 = bord à bord, en dessous = un jour les sépare. */
const WHEEL_FILL = 0.84;

/** Inclinaison du plateau : 0 = vu de face, 90 = vu à la verticale du dessus. */
const BELT_TILT = 58;
const BELT_RADIUS = 34;
const BELT_FILL = 0.82;

/** Rayon du cylindre que remonte le flux, en pourcentage de la largeur. */
const SPIRAL_RADIUS = 23;
/** Hauteur parcourue par une vignette, en pourcentage de la largeur. */
const SPIRAL_RISE = 78;
/** Tours décrits par l'hélice visible. */
const SPIRAL_TURNS = 1.45;
/** Azimut balayé par une vignette pendant sa montée : la courbure de sa trajectoire. */
const SPIRAL_SWEEP = 100;
/** Largeur d'une vignette de l'hélice, en pourcentage de la largeur. */
const SPIRAL_SIZE = 30;
/** Proportion hauteur / largeur des vignettes de l'hélice. */
const SPIRAL_ASPECT = 0.68;
/** Inclinaison de l'hélice : un léger plongé, pour voir la colonne monter. */
const SPIRAL_TILT = 8;
/**
 * Durée de la montée d'une vignette, en secondes.
 *
 * À tenir égale à celle de l'animation `helix-stream` posée sur les vignettes :
 * c'est elle qui règle le décalage de phase de l'une à l'autre.
 */
const SPIRAL_PERIOD = 26;
/** Taille d'une vignette du tunnel, en pourcentage de la largeur. */
const TUNNEL_SIZE = 21;

/**
 * Taille d'une vignette, en `cqw` (pourcentage de la largeur du carrousel).
 *
 * Sans `size`, les dispositions circulaires calculent la taille qui rend les
 * vignettes jointives sur le cercle ; la donner force une autre taille, plus
 * grande (les vignettes se chevauchent, en écailles) ou plus petite (un jour
 * les sépare).
 */
function tileSize({
  size,
  radius,
  count,
  fill,
}: {
  size: number | undefined;
  radius: number;
  count: number;
  fill: number;
}) {
  if (size !== undefined) return size;
  /** Corde du secteur : largeur qui rend les vignettes jointives. */
  return 2 * radius * Math.sin(Math.PI / count) * fill;
}

/**
 * Carrousels 3D de photos, en CSS pur.
 *
 * Quatre dispositions :
 *
 * - `wheel` : le cercle est redressé, face à l'objectif, et tourne dans son
 *   propre plan comme une roue. Chaque vignette est contre-tournée d'autant,
 *   elle reste donc droite au lieu de se retrouver la tête en bas en haut du
 *   tour.
 * - `belt` (famille « Cover Ring » / « Bloom Belt ») : les vignettes sont
 *   posées à plat dans le plan d'un plateau incliné, qui tourne sur lui-même.
 *   Comme elles restent dans ce plan, elles ne passent jamais sur la tranche :
 *   on les voit tout au long du tour, simplement raccourcies par la
 *   perspective.
 * - `spiral` (« Spiral Stream ») : un flux continu de vignettes remonte une
 *   hélice qui tourne sur son axe, chacune se fondant en haut au moment où la
 *   suivante paraît en bas.
 * - `tunnel` (« Card Tunnel ») : les vignettes viennent du fond vers
 *   l'objectif, en file décalée, et rebouclent.
 *
 * Tout passe par des transformations 3D animées en CSS, donc par le GPU :
 * aucun JavaScript exécuté par image, aucune dépendance. Les dimensions sont
 * en unités de conteneur (`cqw`), la composition s'adapte donc à la place
 * disponible sans point de rupture.
 *
 * `photos` choisit les images, `size` leur taille et `radius` le rayon du
 * cercle : chaque section peut donc afficher son propre jeu, à sa propre
 * échelle, sans toucher au composant.
 *
 * `center` dépose un contenu immobile au centre du carrousel (un logo, par
 * exemple) : il reste face au visiteur, quelle que soit l'inclinaison du
 * plateau.
 *
 * `prefers-reduced-motion` fige l'animation sur une position lisible.
 *
 * Pour un enchaînement de dispositions, à la manière d'un montage vidéo, voir
 * `PhotoReel` : il change d'acte au fil du temps, là où les dispositions
 * ci-dessus tournent en boucle sur elles-mêmes.
 */
export function PhotoRing({
  variant = "wheel",
  photos = AESBT_RING_PHOTOS,
  size,
  radius,
  center,
  className,
}: {
  variant?: RingVariant;
  /** Images affichées, propres à chaque emplacement. */
  photos?: RingPhoto[];
  /** Côté d'une vignette, en `cqw` (pourcentage de la largeur du carrousel). */
  size?: number;
  /** Rayon du cercle, en `cqw`. Sans effet sur `tunnel`. */
  radius?: number;
  center?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative select-none overflow-hidden ${className ?? ""}`}
      role="img"
      aria-label="Carrousel des photos de l'association"
      style={
        {
          containerType: "inline-size",
          perspective: variant === "tunnel" ? "900px" : "1100px",
        } as CSSProperties
      }
    >
      {variant === "wheel" ? <Wheel photos={photos} size={size} radius={radius} /> : null}
      {variant === "belt" ? <Belt photos={photos} size={size} radius={radius} /> : null}
      {variant === "spiral" ? <Spiral photos={photos} size={size} radius={radius} /> : null}
      {variant === "tunnel" ? <Tunnel photos={photos} size={size} radius={radius} /> : null}

      {center ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
          {center}
        </div>
      ) : null}
    </div>
  );
}

type LayoutProps = {
  photos: RingPhoto[];
  size: number | undefined;
  radius: number | undefined;
};

/* ------------------------------------------------------------------ */
/* « Wheel » : cercle redressé, tournant dans son plan                 */
/* ------------------------------------------------------------------ */

function Wheel({ photos, size, radius }: LayoutProps) {
  const count = photos.length;
  const step = 360 / count;
  const r = radius ?? WHEEL_RADIUS;
  const card = tileSize({ size, radius: r, count, fill: WHEEL_FILL });

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative size-0 animate-[wheel-spin_30s_linear_infinite] motion-reduce:animate-none">
        {photos.map((photo, i) => {
          const angle = i * step;
          return (
            <figure
              key={photo.src}
              className="absolute m-0"
              style={{
                transform: `rotateZ(${angle}deg) translateX(${r}cqw)`,
                width: `${card}cqw`,
                height: `${card}cqw`,
                marginLeft: `${-card / 2}cqw`,
                marginTop: `${-card / 2}cqw`,
              }}
            >
              {/* Deux contre-rotations : la fixe annule la place occupée sur
                  le cercle, l'animée annule la rotation de la roue. La
                  vignette reste donc droite tout au long du tour. */}
              <div className="size-full" style={{ transform: `rotateZ(${-angle}deg)` }}>
                <div className="size-full animate-[wheel-face_30s_linear_infinite] motion-reduce:animate-none">
                  <Img photo={photo} index={i} />
                </div>
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* « Belt » : plateau incliné, vignettes à plat dans son plan          */
/* ------------------------------------------------------------------ */

function Belt({ photos, size, radius }: LayoutProps) {
  const count = photos.length;
  const step = 360 / count;
  const r = radius ?? BELT_RADIUS;
  const card = tileSize({ size, radius: r, count, fill: BELT_FILL });

  return (
    <div
      className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]"
      style={{ transform: `rotateX(${BELT_TILT}deg)` }}
    >
      <div className="relative size-0 animate-[ring-spin_32s_linear_infinite] [transform-style:preserve-3d] motion-reduce:animate-none">
        {photos.map((photo, i) => (
          <Tile
            key={photo.src}
            photo={photo}
            index={i}
            size={card}
            // Rotation dans le plan du plateau, puis décalage vers le bord :
            // la vignette reste à plat, elle ne bascule jamais sur la tranche.
            transform={`rotateZ(${i * step}deg) translateX(${r}cqw)`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* « Spiral » : un flux de vignettes qui remonte une hélice            */
/* ------------------------------------------------------------------ */

/**
 * Deux animations se composent : le plateau tourne sur son axe
 * (`helix-spin`), et chaque vignette remonte en balayant son propre arc
 * (`helix-stream`), du bas vers le haut, en se fondant à chaque extrémité.
 *
 * Les phases sont décalées d'une vignette à l'autre, d'un tour complet divisé
 * par leur nombre : les hauteurs et les azimuts restent donc répartis
 * régulièrement, le flux se reboucle sans couture, et le saut de la vignette
 * qui repart en bas se produit alors qu'elle est éteinte.
 */
function Spiral({ photos, size, radius }: LayoutProps) {
  const count = photos.length;
  const r = radius ?? SPIRAL_RADIUS;
  const width = size ?? SPIRAL_SIZE;
  const height = width * SPIRAL_ASPECT;
  /** Pas d'azimut entre deux vignettes : la montée en balaie déjà `SPIRAL_SWEEP`. */
  const step = (360 * SPIRAL_TURNS - SPIRAL_SWEEP) / count;

  return (
    <div className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
      {/* L'inclinaison occupe son propre calque : l'animation de l'enfant
          écrit `transform`, elle écraserait un `rotateX` posé au même endroit.
          C'est ce qui mettait l'hélice à plat jusqu'ici. */}
      <div
        className="[transform-style:preserve-3d]"
        style={{ transform: `rotateX(${SPIRAL_TILT}deg)` }}
      >
        <div className="relative size-0 animate-[helix-spin_34s_linear_infinite] [transform-style:preserve-3d] motion-reduce:animate-none">
          {photos.map((photo, i) => {
            /** Avancement de la vignette dans sa montée, au premier instant. */
            const phase = i / count;
            return (
              <figure
                key={photo.src}
                className="absolute m-0 animate-[helix-stream_26s_linear_infinite] [transform-style:preserve-3d] motion-reduce:animate-none"
                style={{
                  width: `${width}cqw`,
                  height: `${height}cqw`,
                  marginLeft: `${-width / 2}cqw`,
                  marginTop: `${-height / 2}cqw`,
                  // La trajectoire, lue par les keyframes `helix-stream`.
                  ["--a" as string]: `${i * step}deg`,
                  ["--r" as string]: `${r}cqw`,
                  ["--rise" as string]: `${SPIRAL_RISE}cqw`,
                  ["--sweep" as string]: `${SPIRAL_SWEEP}deg`,
                  // Décalage négatif : les vignettes se répartissent d'emblée
                  // sur toute la montée, le flux est en place au chargement.
                  animationDelay: `${-SPIRAL_PERIOD * phase}s`,
                  // Pose de repli, quand l'animation est coupée
                  // (`prefers-reduced-motion`) : l'hélice reste lisible.
                  transform: `rotateY(${i * step + SPIRAL_SWEEP * phase}deg) translateZ(${r}cqw) translateY(${(0.5 - phase) * SPIRAL_RISE}cqw)`,
                }}
              >
                <SpiralCard photo={photo} index={i} />
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Une vignette de l'hélice, et son dos.
 *
 * La vignette est tangente au cylindre : elle tourne avec le flux, se présente
 * de trois quarts, puis de dos. C'est ce qui donne le volume, mais le
 * navigateur montrerait alors le cliché retourné. Chaque vignette porte donc
 * sa propre face arrière, presque éteinte, et `backface-visibility` décide
 * laquelle des deux s'affiche. Le dos reprend le même fichier en image de
 * fond, déjà en cache : on y devine la photo sans la lire, plutôt qu'un aplat
 * noir.
 *
 * Rien n'est assombri par `filter` : il aplatit le contexte 3D de l'élément,
 * ce qui faisait réapparaître les faces arrière et brouillait l'ordre des
 * plans.
 */
function SpiralCard({ photo, index }: { photo: RingPhoto; index: number }) {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden rounded-[2.6cqw] shadow-[0_2.6cqw_5cqw_-2cqw_rgba(42,15,11,0.45)] [backface-visibility:hidden]">
        <img
          src={photo.src}
          alt={photo.alt}
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="size-full object-cover"
        />
        {/* Une lumière rasante, à la place du galbe d'autrefois : il découpait
            chaque photo en lamelles posées sur un cylindre, soit vingt calques
            composés par vignette, chacun peignant un fond dix fois trop large.
            Deux cent vingt calques pour une courbure invisible à cette taille :
            c'était là l'origine des saccades. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(104deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_46%,rgba(32,16,12,0.26))]"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[2.6cqw] bg-cover bg-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,20,15,0.86), rgba(34,20,15,0.86)), url(${photo.src})`,
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* « Tunnel » : les vignettes viennent du fond vers l'objectif         */
/* ------------------------------------------------------------------ */

function Tunnel({ photos, size }: LayoutProps) {
  const count = photos.length;
  const duration = 9;
  const card = size ?? TUNNEL_SIZE;

  return (
    <div className="absolute inset-0 [transform-style:preserve-3d]">
      {photos.map((photo, i) => {
        // Décalages latéraux réguliers, pour que la file ne soit pas une
        // simple pile centrée.
        const x = (i % 4) - 1.5;
        const y = (Math.floor(i / 4) % 3) - 1;
        return (
          <figure
            key={photo.src}
            className="absolute left-1/2 top-1/2 m-0 animate-[tunnel-fly_9s_linear_infinite] [transform-style:preserve-3d] motion-reduce:animate-none"
            style={{
              width: `${card}cqw`,
              height: `${card}cqw`,
              // Couloir propre à chaque vignette : repris dans les keyframes,
              // il est donc conservé sur toute la course.
              ["--tx" as string]: `${x * 11}cqw`,
              ["--ty" as string]: `${y * 10}cqw`,
              // Décalage négatif : la file est déjà en place au chargement,
              // elle ne se constitue pas sous les yeux du visiteur.
              animationDelay: `${(-duration / count) * i}s`,
            }}
          >
            <Img photo={photo} index={i} />
          </figure>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Tile({
  photo,
  index,
  size,
  transform,
}: {
  photo: RingPhoto;
  index: number;
  size: number;
  transform: string;
}) {
  return (
    <figure
      className="absolute m-0"
      style={{
        transform,
        width: `${size}cqw`,
        height: `${size}cqw`,
        marginLeft: `${-size / 2}cqw`,
        marginTop: `${-size / 2}cqw`,
      }}
    >
      <Img photo={photo} index={index} />
    </figure>
  );
}

function Img({ photo, index }: { photo: RingPhoto; index: number }) {
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      loading={index < 4 ? "eager" : "lazy"}
      draggable={false}
      className="size-full rounded-[12px] object-cover shadow-[0_10px_26px_rgba(42,15,11,0.22)]"
    />
  );
}
