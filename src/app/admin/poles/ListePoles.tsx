"use client";

import {
  CircleCheck,
  Clock,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CartePole } from "@/components/poles/CartePole";
import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PoleResume } from "@/lib/api-admin-poles";

import { Pastille } from "../_gestion/Pastille";
import { BarreOutils } from "../_commun/BarreOutils";
import { modifierPole, supprimerPole } from "./actions";
import { TiroirPole } from "./TiroirPole";

/** Vue d'ensemble des pôles en cartes cliquables, avec création, édition, activation et suppression. */
export function ListePoles({ poles }: { poles: PoleResume[] }) {
  const router = useRouter();
  const [edition, setEdition] = useState<PoleResume | "nouveau" | null>(null);
  const [aSupprimer, setASupprimer] = useState<PoleResume | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const basculer = (p: PoleResume) =>
    demarrer(async () => {
      const r = await modifierPole(p.id, { actif: !p.actif });
      if (r.ok) router.refresh();
      else setErreur(r.message ?? "Le changement a échoué.");
    });

  const supprimer = (p: PoleResume) =>
    demarrer(async () => {
      const r = await supprimerPole(p.id);
      if (r.ok) router.refresh();
      else setErreurSuppression(r.message ?? "La suppression a échoué.");
    });

  const ordreSuivant = poles.reduce((max, p) => Math.max(max, p.ordre + 1), 0);

  return (
    <>
      <BarreOutils libelle="Nouveau pôle" onClick={() => setEdition("nouveau")} />

      {poles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface/40 px-6 py-10 text-center text-[14px] text-muted-ink">
          Aucun pôle pour le moment. Créez le premier avec le bouton Nouveau pôle.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {poles.map((p) => (
            <li key={p.id}>
              <CartePole
                nom={p.nom}
                description={p.description}
                icone={p.icone}
                href={`/admin/poles/${p.id}`}
                signal={p.nb_en_attente > 0}
                discret={!p.actif}
                indication="Gérer les membres"
                pastilles={
                  <>
                    {p.actif ? (
                      <Pastille icone={CircleCheck} ton="vert">
                        Actif
                      </Pastille>
                    ) : (
                      <Pastille icone={EyeOff} ton="gris">
                        Inactif
                      </Pastille>
                    )}
                    <Pastille icone={Users} ton="accent">
                      {p.nb_membres} membre{p.nb_membres > 1 ? "s" : ""}
                    </Pastille>
                    {p.nb_en_attente > 0 ? (
                      <Pastille icone={Clock} ton="ambre">
                        {p.nb_en_attente} demande{p.nb_en_attente > 1 ? "s" : ""} en attente
                      </Pastille>
                    ) : null}
                  </>
                }
                menu={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={enCours}
                        aria-label={`Actions pour ${p.nom}`}
                        className="grid size-8 place-items-center rounded-lg text-[#6B6B6B] transition-colors hover:bg-[#2E7D4F]/10 hover:text-[#2E7D4F] focus-visible:outline-2 focus-visible:outline-[#2E7D4F] disabled:opacity-50"
                      >
                        <MoreHorizontal aria-hidden="true" className="size-4.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setEdition(p)}>
                        <Pencil aria-hidden="true" className="size-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => basculer(p)}>
                        {p.actif ? (
                          <EyeOff aria-hidden="true" className="size-4" />
                        ) : (
                          <Eye aria-hidden="true" className="size-4" />
                        )}
                        {p.actif ? "Désactiver" : "Activer"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setASupprimer(p)}
                        className="text-red-700 focus:bg-red-50 focus:text-red-700"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            </li>
          ))}
        </ul>
      )}

      <TiroirPole
        key={edition === null ? "ferme" : edition === "nouveau" ? "nouveau" : edition.id}
        pole={edition === "nouveau" ? null : edition}
        open={edition !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setEdition(null);
        }}
        ordreSuivant={ordreSuivant}
      />
      <StatusDialog
        open={aSupprimer !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setASupprimer(null);
        }}
        variant="warning"
        title="Supprimer ce pôle ?"
        description={
          aSupprimer
            ? `Le pôle ${aSupprimer.nom} sera supprimé définitivement. S'il a des membres ou des demandes, la suppression sera refusée : désactivez-le alors.`
            : undefined
        }
        action={{
          label: "Supprimer définitivement",
          onClick: () => {
            if (aSupprimer) supprimer(aSupprimer);
          },
        }}
        secondaryAction={{ label: "Annuler" }}
      />
      <StatusDialog
        open={erreurSuppression !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreurSuppression(null);
        }}
        variant="error"
        title="Suppression impossible"
        description={erreurSuppression ?? undefined}
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title="Modification impossible"
        description={erreur ?? undefined}
      />
    </>
  );
}
