import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Témoignages de membres.
 *
 * IMPORTANT — ces cartes sont des EMPLACEMENTS, pas des témoignages.
 * L'association n'en a pas encore fourni ; on ne met donc aucune parole, ni
 * aucun nom, qui pourrait passer pour authentique. La mise en forme est
 * définitive : il suffira de remplacer `body`, `name` et `detail` par les vrais
 * témoignages recueillis, et de retirer le bandeau « à recueillir ».
 */

const SLOTS: { body: string; name: string; detail: string }[] = [
  {
    body: "Emplacement réservé au témoignage d'un membre sur son arrivée en Tunisie et l'accueil reçu.",
    name: "Témoignage à recueillir",
    detail: "Étudiant·e — filière à préciser",
  },
  {
    body: "Emplacement réservé au témoignage d'un membre sur l'entraide et la vie associative au quotidien.",
    name: "Témoignage à recueillir",
    detail: "Étudiant·e — filière à préciser",
  },
  {
    body: "Emplacement réservé au témoignage d'un ancien membre sur son parcours jusqu'au diplôme.",
    name: "Témoignage à recueillir",
    detail: "Ancien·ne membre — promotion à préciser",
  },
];

export function Testimonials() {
  return (
    <>
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {SLOTS.map((slot, i) => (
          <Reveal key={slot.body} delay={Math.min(i * 70, 240)}>
            <figure className="flex h-full flex-col rounded-2xl border border-line bg-frost p-6">
              <Quote
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0 text-accent-gold"
              />
              <blockquote className="mt-4 grow text-[14.5px] leading-relaxed text-ink-soft italic">
                {slot.body}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                {/* Pastille neutre : pas de fausse photo de personne. */}
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-frost-deep text-[12px] font-semibold text-muted-ink"
                >
                  ?
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    {slot.name}
                  </span>
                  <span className="block truncate text-[12.5px] text-muted-ink">{slot.detail}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-6 text-[12.5px] text-muted-ink">
          Mise en forme définitive — les témoignages réels restent à recueillir auprès des membres.
        </p>
      </Reveal>
    </>
  );
}
