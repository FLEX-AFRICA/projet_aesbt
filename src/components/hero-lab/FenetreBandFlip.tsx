import { CaseStudyFlipStack, type CaseStudyFlipItem } from "@/components/ui/case-study-flip-stack";
import { PORTRAITS } from "./fenetre-facettes";

/**
 * Variante 3 : le magazine (flip-stack).
 *
 * Expérience plein écran pilotée au défilement : chaque portrait est une page
 * qui se replie vers le haut pour dévoiler la suivante, comme on tourne les
 * pages d'un magazine. Narratif et immersif, elle occupe toute la section.
 */
const BG = ["#B4271C", "#FBF6EF", "#607196", "#1A1A1A", "#5A4A42"];
const FG = ["#FBF6EF", "#1A1A1A", "#FBF6EF", "#FBF6EF", "#FBF6EF"];

const ITEMS: CaseStudyFlipItem[] = PORTRAITS.map((p, i) => {
  const [filiere, edition] = p.program.split(" · ");
  return {
    eyebrow: p.highlight,
    title: p.name,
    description: p.story,
    tags: [
      { label: "Filière", value: filiere ?? p.program },
      { label: "Édition", value: edition ?? "À venir" },
    ],
    image: p.image,
    imageAlt: p.name,
    background: BG[i % BG.length] ?? "#B4271C",
    foreground: FG[i % FG.length] ?? "#FBF6EF",
  };
});

export function FenetreBandFlip() {
  return <CaseStudyFlipStack items={ITEMS} />;
}
