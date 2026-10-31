"use client";

import { Archive, ExternalLink, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";

import type { ResultatOperation, StatutCible, StatutContenu } from "../_kit";

const CONFIRMATIONS: Record<
  StatutCible,
  { libelle: string; titre: string; texte: string; icone: typeof Eye }
> = {
  publie: {
    libelle: "Publier",
    titre: "Publier ce contenu ?",
    texte: "Il sera visible par les visiteurs du site.",
    icone: Eye,
  },
  archive: {
    libelle: "Archiver",
    titre: "Archiver ce contenu ?",
    texte: "Il disparaîtra du site public mais restera consultable ici.",
    icone: Archive,
  },
  brouillon: {
    libelle: "Repasser en brouillon",
    titre: "Repasser en brouillon ?",
    texte: "Il ne sera plus visible sur le site tant qu'il n'est pas republié.",
    icone: EyeOff,
  },
};

/** Changements de statut proposés selon le statut courant. */
const PROPOSEES: Record<StatutContenu, StatutCible[]> = {
  brouillon: ["publie"],
  en_attente: ["publie", "brouillon"],
  publie: ["archive", "brouillon"],
  archive: ["publie", "brouillon"],
};

export interface ChangementStatut {
  statut: StatutContenu;
  peutPublier: boolean;
  onChanger: (cible: StatutCible) => Promise<ResultatOperation>;
  /** Restreint les cibles (ex. une API sans route « repasser en brouillon »). */
  actionsDisponibles?: readonly StatutCible[];
}

/**
 * Menu d'actions d'une ligne de tableau : un seul bouton « ... » qui regroupe
 * Modifier, Voir sur le site, les changements de statut, d'éventuelles actions
 * propres à l'écran (`extras`) et Supprimer (rouge, avec confirmation).
 * Un échec s'affiche dans une popup, jamais ignoré.
 */
export function MenuActionsLigne({
  nom,
  onModifier,
  urlSite,
  statut,
  extras,
  suppression,
}: {
  /** Nom de l'élément, pour des libellés accessibles distincts par ligne. */
  nom: string;
  onModifier: () => void;
  urlSite?: string | null;
  statut?: ChangementStatut;
  /** Éléments `DropdownMenuItem` supplémentaires, placés avant Supprimer. */
  extras?: ReactNode;
  suppression?: {
    titre: string;
    /** Précisez ce qui est supprimé et ce qui est conservé. */
    description: string;
    action: () => Promise<ResultatOperation>;
  };
}) {
  const [cible, setCible] = useState<StatutCible | null>(null);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);
  const [erreur, setErreur] = useState<{ titre: string; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const cibles = statut
    ? PROPOSEES[statut.statut].filter(
        (c) => !statut.actionsDisponibles || statut.actionsDisponibles.includes(c),
      )
    : [];
  const confirmation = cible ? CONFIRMATIONS[cible] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={enCours}
            aria-label={`Actions pour ${nom}`}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-ink transition-colors hover:bg-frost-deep/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 data-[state=open]:bg-frost-deep/50 data-[state=open]:text-ink disabled:opacity-50"
          >
            <MoreHorizontal aria-hidden="true" className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-[12px] font-medium text-muted-ink">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem onSelect={onModifier}>
            <Pencil aria-hidden="true" className="size-4" />
            Modifier
          </DropdownMenuItem>
          {urlSite ? (
            <DropdownMenuItem asChild>
              <a href={urlSite} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" className="size-4" />
                Voir sur le site
                <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
              </a>
            </DropdownMenuItem>
          ) : null}
          {statut
            ? cibles.map((c) => {
                const Icone = CONFIRMATIONS[c].icone;
                return (
                  <DropdownMenuItem
                    key={c}
                    disabled={!statut.peutPublier}
                    onSelect={() => setCible(c)}
                  >
                    <Icone aria-hidden="true" className="size-4" />
                    {CONFIRMATIONS[c].libelle}
                    {!statut.peutPublier ? (
                      <span className="ml-auto text-[11px] text-muted-ink">Admin</span>
                    ) : null}
                  </DropdownMenuItem>
                );
              })
            : null}
          {extras}
          {suppression ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setConfirmerSuppression(true)}
                className="text-accent-red focus:bg-accent-red/10 focus:text-accent-red"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusDialog
        open={cible !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setCible(null);
        }}
        variant="warning"
        title={confirmation?.titre ?? ""}
        description={confirmation?.texte}
        action={{
          label: confirmation?.libelle ?? "Confirmer",
          onClick: () => {
            if (!cible || !statut) return;
            demarrer(async () => {
              const resultat = await statut.onChanger(cible);
              if (!resultat.ok) {
                setErreur({
                  titre: "Action impossible",
                  message: resultat.message ?? "Le changement de statut a échoué.",
                });
              }
            });
          },
        }}
        secondaryAction={{ label: "Annuler" }}
      />
      {suppression ? (
        <StatusDialog
          open={confirmerSuppression}
          onOpenChange={setConfirmerSuppression}
          variant="warning"
          title={suppression.titre}
          description={suppression.description}
          action={{
            label: "Supprimer définitivement",
            onClick: () =>
              demarrer(async () => {
                const resultat = await suppression.action();
                if (!resultat.ok) {
                  setErreur({
                    titre: "Suppression impossible",
                    message: resultat.message ?? "La suppression a échoué.",
                  });
                }
              }),
          }}
          secondaryAction={{ label: "Annuler" }}
        />
      ) : null}
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title={erreur?.titre ?? ""}
        description={erreur?.message}
      />
    </>
  );
}
