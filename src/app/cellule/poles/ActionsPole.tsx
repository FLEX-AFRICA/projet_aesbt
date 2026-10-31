"use client";

import { LogOut, Send, X } from "lucide-react";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Pole } from "@/lib/api-poles";

import { annulerMaDemande, demanderARejoindre, quitterLePole } from "./actions";

const BOUTON_PRIMAIRE =
  "inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";
const BOUTON_SECONDAIRE =
  "inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";

const MAX_MESSAGE = 1000;

/**
 * Actions de l'étudiant sur un pôle : demander à rejoindre (avec message),
 * annuler sa demande, quitter le pôle (avec confirmation). Un seul bouton
 * principal selon le statut.
 */
export function ActionsPole({ pole, quotaAtteint }: { pole: Pole; quotaAtteint: boolean }) {
  const [dialogue, setDialogue] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const peutDemander = pole.mon_statut === null || pole.mon_statut === "refuse";

  function envoyer() {
    setErreur(null);
    demarrer(async () => {
      const r = await demanderARejoindre(pole.id, message);
      if (r.ok) {
        setDialogue(false);
        setMessage("");
      } else {
        setErreur(r.message ?? "Envoi impossible.");
      }
    });
  }

  function annuler() {
    setErreur(null);
    demarrer(async () => {
      const r = await annulerMaDemande(pole.id);
      if (!r.ok) setErreur(r.message ?? "Opération impossible.");
    });
  }

  function quitter() {
    setErreur(null);
    demarrer(async () => {
      const r = await quitterLePole(pole.id);
      setConfirmation(false);
      if (!r.ok) setErreur(r.message ?? "Opération impossible.");
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {peutDemander ? (
          <button
            type="button"
            disabled={quotaAtteint}
            onClick={() => {
              setErreur(null);
              setDialogue(true);
            }}
            className={BOUTON_PRIMAIRE}
          >
            <Send aria-hidden="true" className="size-4" />
            Demander à rejoindre
          </button>
        ) : null}
        {pole.mon_statut === "en_attente" ? (
          <button type="button" disabled={enCours} onClick={annuler} className={BOUTON_SECONDAIRE}>
            <X aria-hidden="true" className="size-4" />
            Annuler ma demande
          </button>
        ) : null}
        {pole.mon_statut === "valide" ? (
          <button
            type="button"
            disabled={enCours}
            onClick={() => {
              setErreur(null);
              setConfirmation(true);
            }}
            className={BOUTON_SECONDAIRE}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Quitter le pôle
          </button>
        ) : null}
        {peutDemander && quotaAtteint ? (
          <span className="text-[12px] text-muted-ink">
            Quota de demandes atteint : annulez une demande en attente pour en faire une autre.
          </span>
        ) : null}
      </div>

      {erreur && !dialogue ? (
        <p role="alert" className="text-[13px] text-red-700">
          {erreur}
        </p>
      ) : null}

      <Dialog open={dialogue} onOpenChange={setDialogue}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejoindre le pôle {pole.nom}</DialogTitle>
            <DialogDescription>
              Le bureau examinera votre demande. Vous serez prévenu de sa réponse par notification.
            </DialogDescription>
          </DialogHeader>
          <label className="grid gap-2">
            <span className="text-[13px] font-medium text-ink">Message (facultatif)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={MAX_MESSAGE}
              placeholder="Pourquoi souhaitez-vous rejoindre ce pôle ?"
              className="rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
            />
            <span className="text-right text-[12px] text-muted-ink">
              {message.length}/{MAX_MESSAGE}
            </span>
          </label>
          {erreur ? (
            <p role="alert" className="text-[13px] text-red-700">
              {erreur}
            </p>
          ) : null}
          <DialogFooter className="gap-2">
            <button type="button" onClick={() => setDialogue(false)} className={BOUTON_SECONDAIRE}>
              Annuler
            </button>
            <button type="button" disabled={enCours} onClick={envoyer} className={BOUTON_PRIMAIRE}>
              {enCours ? "Envoi en cours" : "Envoyer la demande"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmation} onOpenChange={setConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le pôle {pole.nom} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous ne ferez plus partie de ce pôle et ne verrez plus la liste de ses membres. Vous
              pourrez redemander à le rejoindre plus tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rester dans le pôle</AlertDialogCancel>
            <AlertDialogAction
              disabled={enCours}
              onClick={(e) => {
                e.preventDefault();
                quitter();
              }}
            >
              Quitter le pôle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
