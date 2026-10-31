import { Bell, BellOff, ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { lireNotifications, type PageNotifications as Donnees } from "@/lib/api-poles";
import { cn } from "@/lib/utils";

import { BoutonToutLire, LigneNotification } from "./ListeNotifications";

const TAILLE = 15;

function chiffre(valeur: string | undefined): number {
  const n = Number.parseInt(valeur ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/**
 * Page complète des notifications, commune aux espaces cellule et administration.
 * `base` est le chemin de la page (sans paramètres), utilisé pour les liens de filtre et de pagination.
 */
export async function PageNotifications({
  base,
  searchParams,
}: {
  base: string;
  searchParams: { page?: string; non_lues?: string };
}) {
  const page = chiffre(searchParams.page);
  const seulementNonLues = searchParams.non_lues === "1";

  let donnees: Donnees | null = null;
  try {
    donnees = await lireNotifications(page, TAILLE, seulementNonLues);
  } catch {
    donnees = null;
  }

  const lien = (p: number, nonLues: boolean) => {
    const q = new URLSearchParams();
    if (p > 1) q.set("page", String(p));
    if (nonLues) q.set("non_lues", "1");
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };

  const classeFiltre = (actif: boolean) =>
    cn(
      "rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-inset",
      actif
        ? "bg-accent-blue text-primary-foreground ring-accent-blue"
        : "bg-surface text-ink ring-line hover:bg-frost-deep/50",
    );

  const pages = donnees ? Math.max(1, Math.ceil(donnees.total / donnees.taille)) : 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue"
          >
            <Bell className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
              Notifications
            </h1>
            <p className="mt-1.5 max-w-[70ch] text-[15px] leading-relaxed text-muted-ink">
              Les changements qui vous concernent : pôles, bureau, droits et inscription.
            </p>
          </div>
        </div>
        {donnees ? <BoutonToutLire desactive={donnees.non_lues === 0} /> : null}
      </header>

      <nav aria-label="Filtrer les notifications" className="flex flex-wrap items-center gap-2">
        <Link
          href={lien(1, false)}
          aria-current={!seulementNonLues ? "page" : undefined}
          className={classeFiltre(!seulementNonLues)}
        >
          Toutes
        </Link>
        <Link
          href={lien(1, true)}
          aria-current={seulementNonLues ? "page" : undefined}
          className={classeFiltre(seulementNonLues)}
        >
          Non lues{donnees ? ` (${donnees.non_lues})` : ""}
        </Link>
      </nav>

      {!donnees ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-300/60 bg-red-50 p-5 text-[14px] text-red-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>Impossible de charger vos notifications pour le moment. Réessayez dans un instant.</p>
        </div>
      ) : donnees.notifications.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-10 text-center">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-frost-deep/70 text-muted-ink"
          >
            <BellOff className="size-5" />
          </span>
          <p className="mt-3 font-display text-[16px] text-ink">
            {seulementNonLues ? "Aucune notification non lue" : "Aucune notification"}
          </p>
          <p className="mt-1 max-w-[55ch] text-[14px] leading-relaxed text-muted-ink">
            {seulementNonLues
              ? "Vous êtes à jour."
              : "Vous serez prévenu ici lorsque quelque chose vous concerne."}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-2.5">
            {donnees.notifications.map((n) => (
              <LigneNotification key={n.id} notification={n} />
            ))}
          </ul>

          {pages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
              {page > 1 ? (
                <Link
                  href={lien(page - 1, seulementNonLues)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-ink hover:bg-surface"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                  Précédentes
                </Link>
              ) : (
                <span />
              )}
              <p className="text-[13px] text-muted-ink">
                Page {page} sur {pages}
              </p>
              {page < pages ? (
                <Link
                  href={lien(page + 1, seulementNonLues)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-ink hover:bg-surface"
                >
                  Suivantes
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
