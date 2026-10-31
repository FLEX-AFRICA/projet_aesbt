import type { Metadata } from "next";

import { PhotoReel } from "@/components/hero-lab/PhotoReel";
import { PhotoRing, type RingVariant } from "@/components/hero-lab/PhotoRing";

const VARIANTS: { id: RingVariant; label: string; note: string }[] = [
  {
    id: "belt",
    label: "Belt",
    note: "Plateau incliné, vignettes à plat (Cover Ring / Bloom Belt)",
  },
  {
    id: "spiral",
    label: "Spiral",
    note: "Hélice tournant autour de l'axe vertical (Spiral Stream)",
  },
  { id: "tunnel", label: "Tunnel", note: "Vignettes venant du fond vers l'objectif (Card Tunnel)" },
];

export const metadata: Metadata = {
  title: { absolute: "Lab : carrousels 3D" },
};

/** Page de comparaison des dispositions du carrousel 3D. Non liée au site. */
export default function AnimLabPage() {
  return (
    <div className="min-h-screen bg-[#FBF6EF] px-6 py-16">
      <h1 className="mx-auto max-w-[1180px] font-display text-3xl font-semibold text-[#1A1A1A]">
        Carrousels 3D, en CSS pur
      </h1>

      {/* Le montage : la disposition change au fil du temps, les autres
          tournent en boucle sur elles-mêmes. */}
      <section className="mx-auto mt-10 max-w-[1180px]">
        <h2 className="font-display text-lg font-semibold text-[#B4271C]">Reel</h2>
        <p className="mt-1 text-[13px] text-[#6B6B6B]">
          Montage en cinq actes : pile, défilé, colonnes, mosaïque, plein cadre
        </p>
        <PhotoReel className="mt-4 aspect-square w-full max-w-[520px]" />
      </section>

      <div className="mx-auto mt-14 grid max-w-[1180px] gap-10 lg:grid-cols-3">
        {VARIANTS.map((v) => (
          <section key={v.id}>
            <h2 className="font-display text-lg font-semibold text-[#B4271C]">{v.label}</h2>
            <p className="mt-1 text-[13px] text-[#6B6B6B]">{v.note}</p>
            <PhotoRing variant={v.id} className="mt-4 aspect-square w-full" />
          </section>
        ))}
      </div>
    </div>
  );
}
