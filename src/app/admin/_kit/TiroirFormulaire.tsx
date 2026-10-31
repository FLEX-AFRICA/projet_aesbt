"use client";

import { useId, type FormEvent, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Panneau latéral de création ou de modification d'un enregistrement.
 * Le formulaire est contrôlé par l'appelant : `onSubmit` reçoit la soumission
 * et `enCours` verrouille les boutons et la fermeture pendant l'envoi.
 */
export function TiroirFormulaire({
  open,
  onOpenChange,
  titre,
  description,
  onSubmit,
  enCours = false,
  erreur,
  libelleEnregistrer = "Enregistrer",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titre: string;
  description?: string | undefined;
  onSubmit: () => void | Promise<void>;
  enCours?: boolean;
  /** Erreur générale du formulaire (échec serveur), annoncée aux lecteurs d'écran. */
  erreur?: string | null | undefined;
  libelleEnregistrer?: string;
  children: ReactNode;
}) {
  const idErreur = useId();

  const soumettre = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!enCours) void onSubmit();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => (enCours ? undefined : onOpenChange(v))}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-line bg-background p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-line bg-surface/40 px-6 py-5 pr-12 text-left">
          <SheetTitle className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
            {titre}
          </SheetTitle>
          <SheetDescription className="text-[14px] text-muted-ink">
            {description ?? "Renseignez les champs puis enregistrez."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={soumettre}
          aria-busy={enCours}
          {...(erreur ? { "aria-describedby": idErreur } : {})}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="grid flex-1 content-start gap-6 overflow-y-auto px-6 py-6">
            {children}
          </div>

          <div className="border-t border-line bg-surface/60 px-6 py-4">
            {erreur ? (
              <p id={idErreur} role="alert" className="mb-3 text-[13px] text-accent-red">
                {erreur}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={enCours}
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-line px-5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours}
                className="rounded-full bg-accent-blue px-5 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {enCours ? "Enregistrement..." : libelleEnregistrer}
              </button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface ProprietesChamp {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

/**
 * Champ de formulaire avec libellé, aide et erreur de champ, correctement
 * reliés au contrôle (`htmlFor`, `aria-describedby`, `aria-invalid`).
 * Le contrôle est fourni par `children`, qui reçoit les attributs à poser.
 *
 * ```tsx
 * <ChampFormulaire libelle="Titre" erreur={erreurs.titre} requis>
 *   {(p) => <input {...p} value={titre} onChange={...} />}
 * </ChampFormulaire>
 * ```
 */
export function ChampFormulaire({
  libelle,
  aide,
  erreur,
  requis = false,
  className,
  children,
}: {
  libelle: string;
  aide?: string | undefined;
  erreur?: string | null | undefined;
  requis?: boolean;
  className?: string;
  children: (proprietes: ProprietesChamp) => ReactNode;
}) {
  const id = useId();
  const idAide = `${id}-aide`;
  const idErreur = `${id}-erreur`;
  const decrit = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(" ");

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {libelle}
        {requis ? (
          <span aria-hidden="true" className="text-accent-red">
            {" *"}
          </span>
        ) : null}
      </label>
      {children({
        id,
        ...(decrit ? { "aria-describedby": decrit } : {}),
        ...(erreur ? { "aria-invalid": true as const } : {}),
      })}
      {aide ? (
        <p id={idAide} className="text-[12px] text-muted-ink">
          {aide}
        </p>
      ) : null}
      {erreur ? (
        <p id={idErreur} role="alert" className="text-[12px] font-medium text-accent-red">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

/** Classes communes aux champs texte, pour un rendu homogène avec le reste de l'administration. */
export const classeChamp =
  "w-full rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40 aria-[invalid=true]:border-accent-red disabled:opacity-60";
