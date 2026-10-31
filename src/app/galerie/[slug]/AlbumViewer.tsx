"use client";

import { useState } from "react";

import { MediaFrame } from "@/components/ui-aesbt/MediaPlaceholder";
import { EmptyState } from "@/components/ui-aesbt/States";
import type { ContentImage } from "@/types/content";

/**
 * Visionneuse d'album.
 *
 * Isolée dans un composant client afin que la page reste un composant serveur
 * et puisse exporter ses métadonnées de référencement.
 */
export function AlbumViewer({ photos }: { photos: ContentImage[] }) {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const current = photos[index];

  if (total === 0) {
    return (
      <EmptyState
        title="Album vide"
        description="Les photos de cet album seront ajoutées prochainement."
      />
    );
  }

  return (
    <>
      <MediaFrame
        {...(current ? { image: current } : {})}
        ratio="aspect-[16/9]"
        label="Photo à venir"
      />
      {current?.caption ? (
        <p className="mt-3 text-[14px] leading-relaxed text-muted-ink">{current.caption}</p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + total) % total)}
          className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface"
        >
          Photo précédente
        </button>
        <span aria-live="polite" className="text-[13px] text-muted-ink">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % total)}
          className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface"
        >
          Photo suivante
        </button>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4 md:grid-cols-6">
        {photos.map((photo, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-current={i === index}
            className="rounded-lg ring-offset-2 aria-[current=true]:ring-2 aria-[current=true]:ring-accent-blue"
          >
            <MediaFrame image={photo} ratio="aspect-square" label="Photo" />
          </button>
        ))}
      </div>
    </>
  );
}
