import CardStack, { type DeckCard } from "@/components/kokonutui/card-stack";
import { PORTRAITS } from "./fenetre-facettes";
import { FenetreShell } from "./FenetreShell";

/**
 * Variante 1 : la pile de cartes.
 *
 * Les portraits forment un jeu que l'on feuillette au doigt, à la souris ou
 * aux flèches. Un appui ouvre le détail (récit, repères). La photo de
 * l'étudiant tient lieu d'illustration, bord à bord sur la carte.
 */
const CARDS: DeckCard[] = PORTRAITS.map((p) => ({
  id: p.id,
  title: p.name,
  subtitle: p.highlight,
  art: (
    <img
      src={p.image}
      alt={p.name}
      className="absolute inset-0 size-full object-cover"
      draggable={false}
    />
  ),
  description: p.story,
  specs: [
    { label: "Filière", value: p.program.split(" · ")[0] ?? p.program },
    { label: "Édition", value: p.program.split(" · ")[1] ?? "À venir" },
    { label: "Rubrique", value: "Fenêtre" },
  ],
}));

export function FenetreBandDeck() {
  return (
    <FenetreShell caption="Feuilletez la pile du doigt, à la souris ou aux flèches.">
      <CardStack cards={CARDS} accent="#B4271C" actionLabel="Proposer ce profil" />
    </FenetreShell>
  );
}
