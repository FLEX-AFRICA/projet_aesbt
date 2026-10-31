"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Notification } from "@/lib/api-poles";
import { cn } from "@/lib/utils";

import { compteurNonLues, dernieresNotifications, marquerLue, toutMarquerLu } from "./actions";
import { dateRelative, EVENEMENT_NOTIFS, IconeNotification, lienInterne } from "./presentation";

const INTERVALLE_MS = 60_000;

/**
 * Cloche de notifications : badge de non lues, panneau des dernières notifications.
 * Le compteur est rafraîchi toutes les minutes et au retour sur l'onglet.
 * Une panne réseau ne casse jamais la page : on garde la dernière valeur connue.
 */
export function CloucheNotifications({
  hrefToutes,
  align = "start",
  className,
}: {
  hrefToutes: string;
  align?: "start" | "end";
  className?: string;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [nonLues, setNonLues] = useState(0);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rafraichirCompteur = useCallback(async () => {
    try {
      const n = await compteurNonLues();
      if (n !== null) setNonLues(n);
    } catch {
      // Réseau indisponible : on conserve la valeur affichée.
    }
  }, []);

  const charger = useCallback(async () => {
    try {
      const page = await dernieresNotifications();
      if (page) {
        setItems(page.notifications);
        setNonLues(page.non_lues);
        setErreur(false);
      } else {
        setErreur(true);
      }
    } catch {
      setErreur(true);
    }
  }, []);

  useEffect(() => {
    void rafraichirCompteur();
    const minuterie = window.setInterval(() => {
      if (document.visibilityState === "visible") void rafraichirCompteur();
    }, INTERVALLE_MS);
    const auRetour = () => {
      if (document.visibilityState === "visible") void rafraichirCompteur();
    };
    const surMaj = () => void rafraichirCompteur();
    document.addEventListener("visibilitychange", auRetour);
    window.addEventListener(EVENEMENT_NOTIFS, surMaj);
    return () => {
      window.clearInterval(minuterie);
      document.removeEventListener("visibilitychange", auRetour);
      window.removeEventListener(EVENEMENT_NOTIFS, surMaj);
    };
  }, [rafraichirCompteur]);

  useEffect(() => {
    if (ouvert) {
      setMessage(null);
      void charger();
    }
  }, [ouvert, charger]);

  async function ouvrir(n: Notification) {
    const cible = lienInterne(n.lien);
    if (!n.lue) {
      try {
        await marquerLue(n.id);
      } catch {
        // Sans incidence sur la navigation.
      }
      void rafraichirCompteur();
    }
    setOuvert(false);
    if (cible) router.push(cible);
  }

  async function toutLire() {
    setMessage(null);
    try {
      const r = await toutMarquerLu();
      if (!r.ok) {
        setMessage(r.message ?? "Opération impossible.");
        return;
      }
    } catch {
      setMessage("Opération impossible. Réessayez.");
      return;
    }
    setItems((liste) => liste && liste.map((n) => ({ ...n, lue: true })));
    setNonLues(0);
  }

  const libelle =
    nonLues > 0
      ? `Notifications, ${nonLues} non lue${nonLues > 1 ? "s" : ""}`
      : "Notifications, aucune non lue";

  return (
    <Popover open={ouvert} onOpenChange={setOuvert}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={libelle}
          className={cn(
            "relative rounded-md border border-line p-2 text-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/40",
            className,
          )}
        >
          <Bell aria-hidden="true" className="size-5" />
          {nonLues > 0 ? (
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 flex min-w-[1.15rem] items-center justify-center rounded-full bg-accent-red px-1 text-[10.5px] font-bold leading-[1.15rem] text-white"
            >
              {nonLues > 99 ? "99+" : nonLues}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        aria-label="Dernières notifications"
        className="w-[min(24rem,calc(100vw-1.5rem))] p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <p className="font-display text-[15px] text-ink">Notifications</p>
          <button
            type="button"
            onClick={toutLire}
            disabled={nonLues === 0}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] font-semibold text-accent-blue hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck aria-hidden="true" className="size-3.5" />
            Tout marquer comme lu
          </button>
        </div>

        {message ? (
          <p role="alert" className="px-4 py-2 text-[12.5px] text-red-700">
            {message}
          </p>
        ) : null}

        <div className="max-h-[22rem] overflow-y-auto">
          {items === null && !erreur ? (
            <p role="status" className="px-4 py-6 text-center text-[13px] text-muted-ink">
              Chargement...
            </p>
          ) : erreur && items === null ? (
            <p role="alert" className="px-4 py-6 text-center text-[13px] text-muted-ink">
              Impossible de charger les notifications pour le moment.
            </p>
          ) : items && items.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted-ink">
              Aucune notification pour le moment.
            </p>
          ) : (
            <ul>
              {(items ?? []).map((n) => (
                <li key={n.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => void ouvrir(n)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue"
                    >
                      <IconeNotification type={n.type} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[13.5px] leading-snug text-ink",
                          n.lue ? "font-normal" : "font-bold",
                        )}
                      >
                        {n.titre}
                        {!n.lue ? <span className="sr-only"> (Non lue)</span> : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-muted-ink">
                        {n.message}
                      </span>
                      <span
                        suppressHydrationWarning
                        className="mt-1 block text-[11.5px] text-muted-ink"
                      >
                        {dateRelative(n.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-4 py-2.5">
          <Link
            href={hrefToutes}
            onClick={() => setOuvert(false)}
            className="text-[13px] font-semibold text-accent-blue hover:underline"
          >
            Voir toutes les notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
