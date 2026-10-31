import { formatDate } from "@/lib/format";
import type { AesbtEvent } from "@/types/content";

/**
 * Carte d'événement. Les données proviendront de FLEXHUB ; la structure
 * d'affichage est prête et tolère les champs non renseignés.
 */
export function EventCard({ event }: { event: AesbtEvent }) {
  return (
    <article className="rounded-xl border border-line bg-surface/60 p-6">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-ink">
        {event.startsAt ? formatDate(event.startsAt) : "Date à confirmer"}
      </div>
      <h3 className="mt-3 font-display text-xl tracking-tight text-ink">{event.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-ink text-pretty">{event.description}</p>
      <p className="mt-4 text-[13px] text-muted-ink">{event.location ?? "Lieu à confirmer"}</p>
    </article>
  );
}

/** Bloc « prochain événement » de la page d'accueil. */
export function NextEventPanel({ event }: { event: AesbtEvent | null }) {
  return (
    <div className="grid items-center gap-8 rounded-2xl border border-line bg-surface/60 p-8 md:grid-cols-12 md:p-12">
      <div className="md:col-span-8">
        <p className="eyebrow">Prochain événement</p>
        <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink text-balance sm:text-3xl">
          {event?.title ?? "Aucun événement annoncé pour le moment"}
        </h2>
        <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted-ink text-pretty">
          {event?.description ??
            "Les prochains événements de l'association seront publiés ici dès leur programmation."}
        </p>
      </div>
      <dl className="space-y-4 border-t border-line/80 pt-6 text-sm md:col-span-4 md:border-l md:border-t-0 md:pl-10 md:pt-0">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-ink">Date</dt>
          <dd className="mt-1 font-semibold text-ink">
            {event?.startsAt ? formatDate(event.startsAt) : "À confirmer"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-ink">Lieu</dt>
          <dd className="mt-1 font-semibold text-ink">{event?.location ?? "À confirmer"}</dd>
        </div>
      </dl>
    </div>
  );
}
