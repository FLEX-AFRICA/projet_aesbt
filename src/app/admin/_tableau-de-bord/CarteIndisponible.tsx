import { TriangleAlert } from "lucide-react";

/** Remplace une carte dont les données n'ont pas pu être chargées. */
export function CarteIndisponible({ titre }: { titre: string }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-dashed border-line bg-surface/40 p-5 text-[13px] text-muted-ink"
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-gold" />
      <p>
        <span className="font-medium text-ink">{titre}</span> : données momentanément indisponibles.
        Le reste du tableau de bord reste utilisable, rechargez la page pour réessayer.
      </p>
    </div>
  );
}
