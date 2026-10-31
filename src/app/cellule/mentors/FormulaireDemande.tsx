"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState, useTransition } from "react";

import { demanderMentorat } from "../actions";

/**
 * Envoi d'une demande de mise en relation (F12).
 *
 * Le message est obligatoire et substantiel : un mentor qui reçoit « salut »
 * n'a aucune raison d'accepter, et l'exigence protège autant l'étudiant que
 * le mentor.
 */
export function FormulaireDemande({
  mentorId,
  nomMentor,
  placesRestantes,
}: {
  mentorId: string;
  nomMentor: string;
  placesRestantes: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [retour, setRetour] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  if (retour?.ton === "ok") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900"
      >
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>Demande envoyée. {nomMentor} en a été informé par e-mail.</span>
      </p>
    );
  }

  if (!ouvert) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={placesRestantes === 0}
          onClick={() => setOuvert(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send aria-hidden="true" className="size-3.5" />
          Demander un accompagnement
        </button>
        {placesRestantes === 0 ? (
          <span className="text-[12px] text-muted-ink">
            Ce mentor accompagne déjà le maximum d'étudiants qu'il s'est fixé.
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-frost p-4">
      <label className="grid gap-2">
        <span className="text-[13px] font-medium text-ink">Présentez-vous à {nomMentor}</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          autoFocus
          maxLength={2000}
          placeholder="Votre filière, votre année d'arrivée, et ce sur quoi vous souhaitez être accompagné."
          className="rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={enCours || message.trim().length < 20}
          onClick={() => {
            setRetour(null);
            demarrer(async () => {
              const resultat = await demanderMentorat(mentorId, message);
              setRetour(
                resultat.ok
                  ? { ton: "ok", texte: "" }
                  : { ton: "erreur", texte: resultat.message ?? "Envoi impossible." },
              );
            });
          }}
          className="rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {enCours ? "Envoi…" : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-md border border-line px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Annuler
        </button>
        <span className="text-[12px] text-muted-ink">
          {message.trim().length < 20 ? "20 caractères minimum" : null}
        </span>
      </div>

      {retour?.ton === "erreur" ? (
        <p role="alert" className="mt-2 text-[13px] text-red-700">
          {retour.texte}
        </p>
      ) : null}
    </div>
  );
}
