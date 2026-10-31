"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Notification } from "@/lib/api-poles";
import { cn } from "@/lib/utils";

import { marquerLue, supprimerNotif, toutMarquerLu } from "./actions";
import { dateRelative, EVENEMENT_NOTIFS, IconeNotification, lienInterne } from "./presentation";

function prevenirCloche() {
  window.dispatchEvent(new Event(EVENEMENT_NOTIFS));
}

/** Bouton « Tout marquer comme lu » de la page complète. */
export function BoutonToutLire({ desactive }: { desactive: boolean }) {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={desactive || enCours}
        onClick={() =>
          demarrer(async () => {
            setErreur(null);
            const r = await toutMarquerLu().catch(() => ({
              ok: false,
              message: "Opération impossible. Réessayez.",
            }));
            if (!r.ok) setErreur(r.message ?? "Opération impossible.");
            prevenirCloche();
          })
        }
        className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tout marquer comme lu
      </button>
      {erreur ? (
        <span role="alert" className="text-[12px] text-red-700">
          {erreur}
        </span>
      ) : null}
    </div>
  );
}

/** Une notification de la page complète : ouvrir (marque lue et suit le lien) ou supprimer. */
export function LigneNotification({ notification: n }: { notification: Notification }) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const cible = lienInterne(n.lien);

  function ouvrir() {
    demarrer(async () => {
      setErreur(null);
      if (!n.lue) {
        const r = await marquerLue(n.id).catch(() => ({ ok: false, message: undefined }));
        prevenirCloche();
        if (!r.ok && !cible) {
          setErreur("Opération impossible. Réessayez.");
          return;
        }
      }
      if (cible) router.push(cible);
    });
  }

  function supprimer() {
    demarrer(async () => {
      setErreur(null);
      const r = await supprimerNotif(n.id).catch(() => ({
        ok: false,
        message: "Suppression impossible. Réessayez.",
      }));
      if (!r.ok) setErreur(r.message ?? "Suppression impossible.");
      prevenirCloche();
    });
  }

  const corps = (
    <>
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue"
      >
        <IconeNotification type={n.type} className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[14.5px] leading-snug text-ink",
            n.lue ? "font-normal" : "font-bold",
          )}
        >
          {n.titre}
          {!n.lue ? <span className="sr-only"> (Non lue)</span> : null}
        </span>
        <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted-ink">
          {n.message}
        </span>
        <span suppressHydrationWarning className="mt-1 block text-[12px] text-muted-ink">
          {dateRelative(n.created_at)}
          {!n.lue ? ", non lue" : ""}
        </span>
      </span>
    </>
  );

  return (
    <li className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3 sm:p-4">
      {cible || !n.lue ? (
        <button
          type="button"
          onClick={ouvrir}
          disabled={enCours}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:opacity-60"
        >
          {corps}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3">{corps}</div>
      )}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={supprimer}
          disabled={enCours}
          aria-label={`Supprimer la notification : ${n.titre}`}
          className="rounded-md p-2 text-muted-ink hover:bg-frost-deep/60 hover:text-ink disabled:opacity-50"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
        {erreur ? (
          <span role="alert" className="max-w-40 text-right text-[12px] text-red-700">
            {erreur}
          </span>
        ) : null}
      </div>
    </li>
  );
}
