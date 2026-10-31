"use client";

import { CircleCheck, PenLine, ShieldCheck, UserMinus } from "lucide-react";
import { useId, useState, useTransition } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DROIT_PAR_DEFAUT } from "@/components/droits/catalogue";

import { Avatar } from "../../_gestion/Avatar";
import { modifierDroitsEditeur, nommerEditeur, retirerRoleEditeur } from "../actionsEditeur";

export interface DroitAffiche {
  cle: string;
  libelle: string;
  description: string;
}

type Mode = "nommer" | "modifier";
type Etape = "saisie" | "retrait" | "termine";

const BOUTON =
  "inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface";

/**
 * Nomination d'un éditeur et gestion de ses droits, dans un dialogue.
 *
 * Le composant reste monté quand le rôle change (revalidation de la page) :
 * la confirmation finale s'affiche donc dans le dialogue, et le mode est
 * figé à l'ouverture.
 */
export function GestionEditeur({
  userId,
  nom,
  email,
  estEditeur,
  droitsActuels,
  catalogue,
}: {
  userId: string;
  nom: string | null;
  email: string | null;
  estEditeur: boolean;
  droitsActuels: string[];
  catalogue: DroitAffiche[];
}) {
  const idTitre = useId();
  const [ouvert, setOuvert] = useState(false);
  const [mode, setMode] = useState<Mode>("nommer");
  const [etape, setEtape] = useState<Etape>("saisie");
  const [choix, setChoix] = useState<Set<string>>(new Set());
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [enCours, demarrer] = useTransition();

  const connus = new Set(catalogue.map((d) => d.cle));

  function ouvrir() {
    const m: Mode = estEditeur ? "modifier" : "nommer";
    setMode(m);
    setEtape("saisie");
    setErreur(null);
    setChoix(
      m === "modifier"
        ? new Set(droitsActuels.filter((d) => connus.has(d)))
        : new Set([DROIT_PAR_DEFAUT]),
    );
    setOuvert(true);
  }

  function basculer(cle: string, coche: boolean) {
    setChoix((prec) => {
      const suivant = new Set(prec);
      if (coche) suivant.add(cle);
      else suivant.delete(cle);
      return suivant;
    });
  }

  function envoyer() {
    setErreur(null);
    const droits = catalogue.map((d) => d.cle).filter((c) => choix.has(c));
    demarrer(async () => {
      const resultat =
        mode === "nommer"
          ? await nommerEditeur(userId, droits)
          : await modifierDroitsEditeur(userId, droits);
      if (!resultat.ok) {
        setErreur(resultat.message ?? "Échec de l'opération.");
        return;
      }
      setConfirmation(
        mode === "nommer"
          ? `${nom || email || "Ce compte"} est maintenant éditeur avec ${droits.length} droit${droits.length > 1 ? "s" : ""}.`
          : "Les droits de l'éditeur ont été mis à jour.",
      );
      setEtape("termine");
    });
  }

  function retirer() {
    setErreur(null);
    demarrer(async () => {
      const resultat = await retirerRoleEditeur(userId);
      if (!resultat.ok) {
        setErreur(resultat.message ?? "Échec de l'opération.");
        return;
      }
      setConfirmation(`${nom || email || "Ce compte"} n'est plus éditeur et redevient étudiant.`);
      setEtape("termine");
    });
  }

  const total = catalogue.length;
  const nombre = choix.size;

  return (
    <>
      {estEditeur ? (
        <>
          <button type="button" onClick={ouvrir} className={BOUTON}>
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Gérer les droits
          </button>
        </>
      ) : (
        <button type="button" onClick={ouvrir} className={BOUTON}>
          <PenLine aria-hidden="true" className="size-3.5" />
          Nommer éditeur
        </button>
      )}

      <Dialog open={ouvert} onOpenChange={(o) => (enCours ? undefined : setOuvert(o))}>
        <DialogContent
          aria-labelledby={idTitre}
          className="max-h-[90vh] max-w-xl gap-5 overflow-y-auto rounded-xl border-line bg-background p-0 sm:rounded-xl"
        >
          <DialogHeader className="gap-3 border-b border-line bg-surface/50 p-6 pr-12">
            <div className="flex items-center gap-3">
              <Avatar nom={nom || email} />
              <div className="min-w-0">
                <DialogTitle id={idTitre} className="truncate font-display text-[17px]">
                  {mode === "nommer" ? "Nommer un éditeur" : "Droits de l'éditeur"}
                </DialogTitle>
                <p className="mt-1 truncate text-[14px] text-ink">{nom || email}</p>
                {nom && email ? (
                  <p className="truncate text-[13px] text-muted-ink">{email}</p>
                ) : null}
              </div>
            </div>
            <DialogDescription className="text-[13.5px] leading-relaxed text-ink-soft">
              {mode === "nommer"
                ? "Un éditeur ne voit et n'utilise que les sections cochées ci-dessous. Il ne peut rien administrer d'autre."
                : "Modifiez les sections auxquelles cet éditeur a accès. Le changement est immédiat."}
            </DialogDescription>
          </DialogHeader>

          {etape === "termine" ? (
            <div className="grid gap-4 px-6 pb-6">
              <p
                role="status"
                className="flex items-start gap-2 rounded-lg bg-accent-green/10 px-4 py-3 text-[14px] text-accent-green"
              >
                <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {confirmation}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setOuvert(false)}
                  className="rounded-md bg-accent-blue px-4 py-2 text-[14px] font-semibold text-primary-foreground hover:opacity-90"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : etape === "retrait" ? (
            <div className="grid gap-4 px-6 pb-6">
              <p className="text-[14px] leading-relaxed text-ink-soft">
                Retirer le rôle d'éditeur ? Cette personne redeviendra étudiante, perdra tous ses
                droits et ne pourra plus modifier le site.
              </p>
              {erreur ? (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-900">
                  {erreur}
                </p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={enCours}
                  onClick={() => setEtape("saisie")}
                  className={BOUTON}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={enCours}
                  onClick={retirer}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-4 py-2 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  <UserMinus aria-hidden="true" className="size-4" />
                  {enCours ? "Retrait en cours" : "Confirmer le retrait"}
                </button>
              </div>
            </div>
          ) : (
            <form
              className="grid gap-4 px-6 pb-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (nombre > 0 && !enCours) envoyer();
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p aria-live="polite" className="text-[13px] font-semibold text-ink">
                  {nombre} droit{nombre > 1 ? "s" : ""} sélectionné{nombre > 1 ? "s" : ""} sur{" "}
                  {total}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChoix(new Set(catalogue.map((d) => d.cle)))}
                    disabled={nombre === total}
                    className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-accent-blue hover:underline disabled:opacity-40"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={() => setChoix(new Set())}
                    disabled={nombre === 0}
                    className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-accent-blue hover:underline disabled:opacity-40"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              <fieldset className="grid gap-2">
                <legend className="sr-only">Droits de l'éditeur</legend>
                {catalogue.map((d) => {
                  const id = `${idTitre}-${d.cle}`;
                  return (
                    <div
                      key={d.cle}
                      className="flex items-start gap-3 rounded-lg border border-line p-3 has-[[data-state=checked]]:border-accent-blue/40 has-[[data-state=checked]]:bg-accent-blue/5"
                    >
                      <Checkbox
                        id={id}
                        checked={choix.has(d.cle)}
                        onCheckedChange={(v) => basculer(d.cle, v === true)}
                        className="mt-0.5 size-[18px]"
                      />
                      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                        <span className="block text-[14px] font-semibold text-ink">
                          {d.libelle}
                        </span>
                        <span className="block text-[12.5px] leading-snug text-muted-ink">
                          {d.description}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </fieldset>

              {nombre === 0 ? (
                <p className="text-[12.5px] text-muted-ink">
                  Cochez au moins un droit pour valider.
                </p>
              ) : null}
              {erreur ? (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-900">
                  {erreur}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
                {mode === "modifier" ? (
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={() => {
                      setErreur(null);
                      setEtape("retrait");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <UserMinus aria-hidden="true" className="size-3.5" />
                    Retirer le rôle d'éditeur
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={() => setOuvert(false)}
                    className={BOUTON}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={nombre === 0 || enCours}
                    className="rounded-md bg-accent-blue px-4 py-2 text-[14px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {enCours
                      ? "Enregistrement en cours"
                      : mode === "nommer"
                        ? "Nommer éditeur"
                        : "Enregistrer les droits"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
