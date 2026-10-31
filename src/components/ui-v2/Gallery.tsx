import { AESBT_PHOTOS } from "@/components/home/themes";
import { Reveal } from "./Reveal";

/**
 * Affiches et photos de l'association.
 *
 * Le zoom au survol porte sur `transform` seul (et non sur la largeur ou la
 * taille de fond), donc il est composé sans relayout. Les images sont en
 * `loading="lazy"` : la section est bas de page, rien ne sert à la charger tôt.
 */

const TILES: { src?: string; alt: string; caption: string }[] = [
  {
    src: AESBT_PHOTOS.jeppc,
    alt: "Affiche des Journées Nationales d'Engagement Patriotique et de Participation Citoyenne",
    caption: "JEPPC 2026 · Ambassade du Burkina Faso à Tunis",
  },
  {
    src: AESBT_PHOTOS.weekend,
    alt: "Affiche du weekend d'intégration de l'AESBT",
    caption: "Weekend d'intégration",
  },
  {
    src: AESBT_PHOTOS.staff,
    alt: "Le staff de l'AESBT réuni lors d'un événement",
    caption: "Le staff de l'association",
  },
  { alt: "Emplacement pour une photo à venir", caption: "Photo à venir" },
];

export function Gallery() {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TILES.map((tile, i) => (
        <Reveal key={tile.caption} delay={Math.min(i * 60, 240)}>
          <figure className="group relative m-0 aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-frost-deep">
            {tile.src ? (
              <img
                src={tile.src}
                alt={tile.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                role="img"
                aria-label={tile.alt}
                className="grid size-full place-items-center px-4 text-center text-[13px] text-muted-ink"
              >
                Photo à venir
              </div>
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 text-[12.5px] font-medium leading-snug text-frost">
              {tile.caption}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
