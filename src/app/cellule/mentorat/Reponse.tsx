"use client";

import { useState, useTransition } from "react";

import { accepterDemande, refuserDemande, signaler, terminerRelation } from "../actions";

type Resultat = { ok: boolean; message?: string };

function useAction() {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  const lancer = (action: () => Promise<Resultat>) =>
    demarrer(async () => {
      setErreur(null);
      const resultat = await action();
      if (!resultat.ok) setErreur(resultat.message ?? "Opération impossible.");
    });

  return { enCours, erreur, lancer };
}

/** Réponse d'un mentor à une demande reçue (F13). */
export function ReponseDemande({ id }: { id: string }) {
  const [mode, setMode] = useState<"repos" | "accepter" | "refuser">("repos");
  const [message, setMessage] = useState("");
  const { enCours, erreur, lancer } = useAction();

  if (mode === "repos") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("accepter")}
          className="rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => setMode("refuser")}
          className="rounded-md border border-line px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Décliner
        </button>
      </div>
    );
  }

  const accepte = mode === "accepter";

  return (
    <div className="rounded-lg border border-line bg-frost p-4">
      <p className="text-[13px] font-medium text-ink">
        {accepte ? "Accepter cette demande" : "Décliner cette demande"}
      </p>
      <p className="mt-1 text-[12px] text-muted-ink">
        {accepte
          ? "Vos coordonnées deviendront visibles de cet étudiant, et les siennes de vous."
          : "Un mot d'explication est apprécié, mais facultatif."}
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={2000}
        autoFocus
        placeholder={accepte ? "Avec plaisir, contactez-moi…" : "Je manque de disponibilité…"}
        className="mt-3 w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={enCours}
          onClick={() =>
            lancer(() => (accepte ? accepterDemande(id, message) : refuserDemande(id, message)))
          }
          className={`rounded-md px-4 py-2 text-[13px] font-semibold disabled:opacity-50 ${
            accepte
              ? "bg-accent-blue text-primary-foreground hover:opacity-90"
              : "border border-red-300 text-red-700 hover:bg-red-50"
          }`}
        >
          {enCours ? "…" : "Confirmer"}
        </button>
        <button
          type="button"
          onClick={() => setMode("repos")}
          className="rounded-md border border-line px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Annuler
        </button>
      </div>

      {erreur ? (
        <p role="alert" className="mt-2 text-[13px] text-red-700">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

/** Clôture d'une relation, par l'une ou l'autre partie. */
export function CloreRelation({ id }: { id: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const { enCours, erreur, lancer } = useAction();

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface"
      >
        Mettre fin à l'accompagnement
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-line bg-frost p-4">
      <p className="text-[13px] font-medium text-ink">Mettre fin à l'accompagnement</p>
      <p className="mt-1 text-[12px] text-muted-ink">
        Les coordonnées cesseront d'être visibles des deux côtés. L'historique est conservé.
      </p>

      <textarea
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Objectif atteint, merci."
        className="mt-3 w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={enCours}
          onClick={() => lancer(() => terminerRelation(id, motif))}
          className="rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {enCours ? "…" : "Confirmer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-md border border-line px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Annuler
        </button>
      </div>

      {erreur ? (
        <p role="alert" className="mt-2 text-[13px] text-red-700">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

/** Signalement d'un comportement inapproprié. */
export function Signaler({ cibleId }: { cibleId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [description, setDescription] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const { enCours, erreur, lancer } = useAction();

  if (envoye) {
    return (
      <p className="text-[12px] text-emerald-800">
        Signalement transmis au bureau. Il sera traité en toute discrétion.
      </p>
    );
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-[12px] text-muted-ink underline-offset-2 hover:underline"
      >
        Signaler un problème
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
      <p className="text-[13px] font-medium text-red-900">Signaler un problème</p>
      <p className="mt-1 text-[12px] text-red-900/80">
        Le bureau en sera informé. La personne concernée n'est pas prévenue de votre démarche.
      </p>

      <input
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        maxLength={200}
        placeholder="En quelques mots : propos déplacés, absence de réponse…"
        className="mt-3 w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Détaillez si vous le souhaitez."
        className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={enCours || motif.trim().length < 3}
          onClick={() =>
            lancer(async () => {
              const resultat = await signaler("profil", cibleId, motif, description);
              if (resultat.ok) setEnvoye(true);
              return resultat;
            })
          }
          className="rounded-md bg-red-700 px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          {enCours ? "…" : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-md border border-line px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Annuler
        </button>
      </div>

      {erreur ? (
        <p role="alert" className="mt-2 text-[13px] text-red-700">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
