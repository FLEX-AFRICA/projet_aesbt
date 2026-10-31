import {
  Briefcase,
  FileText,
  HeartHandshake,
  Home,
  Languages,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Ce que l'association apporte, en cartes à icônes.
 *
 * Les cartes sont des aplats opaques avec une bordure fine : pas de
 * `backdrop-blur`, qui obligeait le navigateur à relire le fond sous chaque
 * carte. Le survol ne touche qu'à `border-color` et `transform`.
 */

const ITEMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileText,
    title: "Démarches administratives",
    body: "Carte de séjour, inscription, équivalences : les étapes expliquées par ceux qui les ont faites.",
  },
  {
    icon: Home,
    title: "Logement",
    body: "Orientation vers les foyers et colocations, et mise en relation avec les anciens.",
  },
  {
    icon: HeartHandshake,
    title: "Entraide",
    body: "Un réseau de solidarité en cas de coup dur — médical, financier ou simplement humain.",
  },
  {
    icon: Megaphone,
    title: "Représentation",
    body: "Un porte-voix auprès de l'ambassade, des universités et des autorités tunisiennes.",
  },
  {
    icon: Briefcase,
    title: "Stages & insertion",
    body: "Partage des offres, relecture des CV et retours d'expérience sur le marché local.",
  },
  {
    icon: Languages,
    title: "Vie quotidienne",
    body: "Les repères du pays d'accueil : transports, santé, banque, habitudes locales.",
  },
];

export function Features() {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          // Le délai est plafonné : au-delà de ~250 ms, l'escalier devient une
          // attente plutôt qu'un effet.
          <Reveal key={item.title} delay={Math.min(i * 60, 240)}>
            <article className="group h-full rounded-2xl border border-line bg-frost p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent-red/30">
              <span className="grid size-11 place-items-center rounded-xl bg-accent-red/10">
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" className="text-accent-red" />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-medium tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{item.body}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
