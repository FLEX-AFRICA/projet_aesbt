"use client";

import { UserPlus, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AdhesionPole, CompteRecherche } from "@/lib/api-admin-poles";
import { formatDate } from "@/lib/format";

import { Avatar } from "../_gestion/Avatar";
import { EtatVide } from "../_gestion/EtatVide";
import { Pastille } from "../_gestion/Pastille";
import { classeBoutonPrincipal } from "../_kit";
import { ajouterMembrePole, rechercherComptes, retirerMembrePole } from "./actions";
import { RechercheComptes } from "./RechercheComptes";

/** Membres d'un pôle : liste, retrait avec confirmation, ajout par recherche de comptes. */
export function MembresPole({
  poleId,
  poleNom,
  poleActif,
  membres,
}: {
  poleId: string;
  poleNom: string;
  poleActif: boolean;
  membres: AdhesionPole[];
}) {
  const router = useRouter();
  const [ajout, setAjout] = useState(false);
  const [choisi, setChoisi] = useState<CompteRecherche | null>(null);
  const [aRetirer, setARetirer] = useState<AdhesionPole | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const idsMembres = useMemo(() => new Set(membres.map((m) => m.user_id)), [membres]);

  const fermerAjout = (ouvert: boolean) => {
    if (enCours) return;
    setAjout(ouvert);
    if (!ouvert) {
      setChoisi(null);
      setErreurAjout(null);
    }
  };

  const confirmerAjout = () => {
    if (!choisi) return;
    setErreurAjout(null);
    demarrer(async () => {
      const r = await ajouterMembrePole(poleId, choisi.id);
      if (r.ok) {
        setAjout(false);
        setChoisi(null);
        router.refresh();
      } else {
        setErreurAjout(r.message ?? "L'ajout a échoué.");
      }
    });
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-ink">
          {poleActif
            ? "Les membres ajoutés ici n'ont pas besoin de faire de demande."
            : "Ce pôle est désactivé : activez-le pour y ajouter des membres."}
        </p>
        <button
          type="button"
          disabled={!poleActif}
          onClick={() => setAjout(true)}
          className={classeBoutonPrincipal}
        >
          <UserPlus aria-hidden="true" className="mr-2 size-4" />
          Ajouter un membre
        </button>
      </div>

      {membres.length === 0 ? (
        <EtatVide icone={UsersRound} titre="Aucun membre dans ce pôle">
          Ajoutez une personne avec le bouton Ajouter un membre.
        </EtatVide>
      ) : (
        <ul className="grid gap-3">
          {membres.map((m) => (
            <li
              key={m.adhesion_id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/50 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar nom={m.nom || m.email} />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-ink">
                    {m.nom || m.email || "Compte sans nom"}
                  </p>
                  {m.email ? (
                    <a
                      href={`mailto:${m.email}`}
                      className="block truncate text-[13px] text-accent-blue hover:underline"
                    >
                      {m.email}
                    </a>
                  ) : null}
                  <p className="text-[12px] text-ink-soft">
                    {m.filiere_nom ?? "Filière non renseignée"}
                    {m.traite_le
                      ? `, membre depuis le ${formatDate(m.traite_le.slice(0, 10))}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pastille ton={m.origine === "admin" ? "accent" : "gris"}>
                  {m.origine === "admin" ? "Ajouté par un administrateur" : "Sur demande"}
                </Pastille>
                <button
                  type="button"
                  disabled={enCours}
                  onClick={() => setARetirer(m)}
                  aria-label={`Retirer ${m.nom || m.email || "ce membre"}`}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={ajout} onOpenChange={fermerAjout}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 border-line bg-background p-0 sm:max-w-lg"
        >
          <SheetHeader className="border-b border-line bg-surface/40 px-6 py-5 pr-12 text-left">
            <SheetTitle className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
              Ajouter un membre
            </SheetTitle>
            <SheetDescription className="text-[14px] text-muted-ink">
              Recherchez un compte validé pour l'ajouter au pôle {poleNom}.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 content-start gap-5 overflow-y-auto px-6 py-6">
            {choisi ? (
              <div className="grid gap-4 rounded-xl border border-line bg-surface/50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar nom={choisi.nom || choisi.email} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">
                      {choisi.nom || choisi.email}
                    </p>
                    {choisi.email ? (
                      <p className="truncate text-[13px] text-muted-ink">{choisi.email}</p>
                    ) : null}
                  </div>
                </div>
                {erreurAjout ? (
                  <p role="alert" className="text-[13px] text-accent-red">
                    {erreurAjout}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={confirmerAjout}
                    className={classeBoutonPrincipal}
                  >
                    {enCours ? "Ajout..." : `Ajouter au pôle ${poleNom}`}
                  </button>
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={() => {
                      setChoisi(null);
                      setErreurAjout(null);
                    }}
                    className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink hover:bg-surface disabled:opacity-50"
                  >
                    Choisir une autre personne
                  </button>
                </div>
              </div>
            ) : (
              <RechercheComptes
                rechercher={rechercherComptes}
                onChoisir={setChoisi}
                exclus={idsMembres}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <StatusDialog
        open={aRetirer !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setARetirer(null);
        }}
        variant="warning"
        title="Retirer ce membre ?"
        description={`${aRetirer?.nom || aRetirer?.email || "Cette personne"} ne fera plus partie du pôle ${poleNom}. Son compte n'est pas supprimé.`}
        action={{
          label: "Retirer du pôle",
          onClick: () => {
            const cible = aRetirer;
            if (!cible) return;
            demarrer(async () => {
              const r = await retirerMembrePole(poleId, cible.user_id);
              if (r.ok) router.refresh();
              else setErreur(r.message ?? "Le retrait a échoué.");
            });
          },
        }}
        secondaryAction={{ label: "Annuler" }}
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title="Retrait impossible"
        description={erreur ?? undefined}
      />
    </div>
  );
}
