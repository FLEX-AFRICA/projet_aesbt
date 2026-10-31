import type { Metadata } from "next";

import { FenetreBandDeck } from "@/components/hero-lab/FenetreBandDeck";
import { FenetreBandFlip } from "@/components/hero-lab/FenetreBandFlip";
import { FenetreBandGallery } from "@/components/hero-lab/FenetreBandGallery";

/**
 * Page d'aperçu (temporaire) : les trois versions de « Fenêtre de l'étudiant »
 * à comparer en vrai, sur mobile comme sur ordinateur, avant d'en choisir une.
 * À supprimer une fois le choix fait.
 */
export const metadata: Metadata = {
  title: { absolute: "Aperçu : Fenêtre de l'étudiant" },
};

function Marqueur({ n, nom, note }: { n: string; nom: string; note: string }) {
  return (
    <div className="bg-[#1A1A1A] px-6 py-10 text-center text-[#FBF6EF]">
      <p className="font-display text-[12px] font-semibold uppercase tracking-[0.3em] text-[#C9961B]">
        Version {n}
      </p>
      <h3 className="mt-3 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-semibold tracking-tight">
        {nom}
      </h3>
      <p className="mx-auto mt-2 max-w-[48ch] text-[14px] leading-relaxed text-[#FBF6EF]/70">
        {note}
      </p>
    </div>
  );
}

export default function ApercuFenetrePage() {
  return (
    <main className="min-h-screen bg-[#FBF6EF]">
      <div className="bg-[#B4271C] px-6 py-8 text-center text-white">
        <h1 className="font-display text-[clamp(1.4rem,4vw,2rem)] font-semibold tracking-tight">
          Aperçu : trois versions à comparer
        </h1>
        <p className="mx-auto mt-2 max-w-[52ch] text-[14px] leading-relaxed text-white/80">
          Fais défiler pour voir les trois propositions pour « Fenêtre de l'étudiant », puis dis-moi
          laquelle garder.
        </p>
      </div>

      <Marqueur
        n="1"
        nom="Pile de cartes"
        note="Une pile de portraits que l'on feuillette au doigt, à la souris ou aux flèches ; l'appui ouvre le détail."
      />
      <FenetreBandDeck />

      <Marqueur
        n="2"
        nom="Galerie lightbox"
        note="Une grille de portraits ; au clic une vignette s'agrandit en plein cadre puis revient à sa place."
      />
      <FenetreBandGallery />

      <Marqueur
        n="3"
        nom="Magazine (flip-stack)"
        note="Expérience plein écran : chaque facette se replie vers le haut au défilement pour dévoiler la suivante."
      />
      <FenetreBandFlip />
    </main>
  );
}
