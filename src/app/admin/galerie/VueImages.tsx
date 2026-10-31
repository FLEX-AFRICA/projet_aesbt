import type { ImageBibliotheque } from "@/lib/api-admin-galerie";

import { CarteImage } from "./CarteImage";
import { Televersement } from "./Televersement";

/** Onglet « Toutes les images » : téléversement et grille des fichiers de la bibliothèque. */
export function VueImages({ images }: { images: ImageBibliotheque[] }) {
  return (
    <div className="grid gap-8">
      <p className="max-w-[75ch] text-[14px] leading-relaxed text-muted-ink">
        Les images sont converties en WebP et déclinées en trois tailles. Une image utilisée dans un
        contenu ne peut pas être supprimée : retirez-la d'abord des contenus concernés.
      </p>
      <Televersement />
      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface/50 p-8 text-center text-[15px] text-muted-ink">
          Aucune image pour le moment.
        </p>
      ) : (
        <ul
          aria-label="Images de la bibliothèque"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {images.map((image) => (
            <CarteImage key={image.id} image={image} />
          ))}
        </ul>
      )}
    </div>
  );
}
