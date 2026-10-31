"use client";

import { Building2, ChevronDown, ChevronUp, CircleCheck, EyeOff, FlaskConical } from "lucide-react";
import { useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";

import { TableauDonnees, type Colonne, type MediaChoisissable } from "../_kit";
import { Indicateur } from "../_gestion/Indicateur";
import { Pastille } from "../_gestion/Pastille";
import { MenuActionsLigne } from "../_commun/MenuActionsLigne";
import { BarreOutils } from "../_commun/BarreOutils";
import { Vignette } from "../_commun/Vignette";
import { libelleDroit } from "@/components/droits/catalogue";
import { reordonnerMembres, supprimerMembre, type EntiteMembre } from "./actions";
import { GestionEditeur, type DroitAffiche } from "./_composants/GestionEditeur";
import { TiroirMembre } from "./TiroirMembre";

/** Membre tel que renvoyé par GET /admin/membres (actif vaut 0 ou 1 côté SQLite). */
export interface MembreAdmin {
  id: string;
  entite: EntiteMembre;
  nom: string | null;
  role: string;
  ordre: number;
  mandat_debut: string | null;
  mandat_fin: string | null;
  actif: number | boolean;
  photo_id: string | null;
  photo: string | null;
  /** Compte lié (bureau). Absent d'une API plus ancienne. */
  user_id?: string | null;
  /** Null pour un éditeur, qui ne voit pas les e-mails. */
  email?: string | null;
  compte_lie?: boolean;
  /** Rôle du compte lié : etudiant, mentor, editeur ou admin. Absent d'une API plus ancienne. */
  role_compte?: string;
  /** Droits de l'éditeur (clés) ; vide hors éditeur. */
  droits?: string[];
}

const ENTITES: { valeur: EntiteMembre; titre: string; aide: string; icone: typeof Building2 }[] = [
  {
    valeur: "bureau",
    titre: "Bureau",
    aide: "Affichés sur la page Association.",
    icone: Building2,
  },
  {
    valeur: "cellule",
    titre: "Cellule scientifique",
    aide: "Affichés sur la page Cellule.",
    icone: FlaskConical,
  },
];

export function ListeMembres({
  membres,
  medias,
  filtre,
  suggestionsRole,
  catalogueDroits,
}: {
  membres: MembreAdmin[];
  /** Droits proposés lors de la nomination d'un éditeur. */
  catalogueDroits: DroitAffiche[];
  medias: MediaChoisissable[];
  filtre: EntiteMembre | null;
  /** Rôles déjà utilisés, proposés dans le formulaire. */
  suggestionsRole: string[];
}) {
  const [edition, setEdition] = useState<MembreAdmin | "nouveau" | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  /** Échange deux voisins d'une entité, puis renumérote celle-ci pour lever d'éventuels doublons d'ordre. */
  const deplacer = (groupe: MembreAdmin[], index: number, sens: -1 | 1) => {
    const cible = index + sens;
    if (cible < 0 || cible >= groupe.length) return;
    const suite = [...groupe];
    [suite[index], suite[cible]] = [suite[cible]!, suite[index]!];
    const ordres = suite
      .map((m, i) => ({ id: m.id, ordre: i, ancien: m.ordre }))
      .filter((m) => m.ordre !== m.ancien)
      .map(({ id, ordre }) => ({ id, ordre }));
    demarrer(async () => {
      const resultat = await reordonnerMembres(ordres);
      if (!resultat.ok) setErreur(resultat.message ?? "Le réordonnancement a échoué.");
    });
  };

  const colonneEditeur: Colonne<MembreAdmin> = {
    cle: "editeur",
    titre: "Éditeur",
    rendu: (m) => {
      if (!m.actif || !m.user_id) {
        return (
          <p className="max-w-[28ch] text-[12px] text-muted-ink">
            {m.actif
              ? "Rattachez d'abord ce membre à un compte pour pouvoir le nommer éditeur."
              : "Membre masqué : activez son affichage pour pouvoir le nommer éditeur."}
          </p>
        );
      }
      const role = m.role_compte;
      if (role === "admin" || role === "mentor") {
        return (
          <p className="max-w-[28ch] text-[12px] text-muted-ink">
            {role === "admin"
              ? "Ce compte est administrateur."
              : "Ce compte est mentor : il ne peut pas être nommé éditeur."}
          </p>
        );
      }
      const estEditeur = role === "editeur";
      const droits = m.droits ?? [];
      return (
        <div className="grid justify-items-start gap-2">
          {estEditeur ? (
            droits.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {droits.map((d) => (
                  <li key={d}>
                    <Pastille ton="accent">{libelleDroit(d)}</Pastille>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-muted-ink">Aucun droit attribué</p>
            )
          ) : null}
          <GestionEditeur
            userId={m.user_id}
            nom={m.nom}
            email={m.email ?? null}
            estEditeur={estEditeur}
            droitsActuels={droits}
            catalogue={catalogueDroits}
          />
        </div>
      );
    },
  };

  const boutonOrdre =
    "inline-flex size-6 items-center justify-center rounded-md text-muted-ink transition-colors hover:bg-frost-deep/60 hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  const colonnesDe = (groupe: MembreAdmin[], entite: EntiteMembre): Colonne<MembreAdmin>[] => [
    {
      cle: "nom",
      titre: "Nom",
      rendu: (m) => (
        <div className="flex min-w-[15rem] items-center gap-3">
          <Vignette chemin={m.photo} className="size-11 rounded-full" />
          {m.nom ? (
            <div className="min-w-0">
              <p className="font-semibold text-ink">{m.nom}</p>
              {m.email ? (
                <a
                  href={`mailto:${m.email}`}
                  className="block truncate text-[12px] text-accent-blue hover:underline"
                >
                  {m.email}
                </a>
              ) : m.compte_lie ? (
                <p className="text-[12px] text-muted-ink">Compte lié</p>
              ) : (
                <p className="text-[12px] text-muted-ink">Sans compte</p>
              )}
            </div>
          ) : (
            <span className="italic text-muted-ink">Poste sans titulaire</span>
          )}
        </div>
      ),
    },
    {
      cle: "role",
      titre: "Rôle",
      rendu: (m) => (
        <div>
          <p className="font-medium text-ink">{m.role}</p>
          <p className="text-[12px] text-muted-ink">
            {m.mandat_debut || m.mandat_fin
              ? `Mandat ${m.mandat_debut ?? "?"} à ${m.mandat_fin ?? "en cours"}`
              : "Mandat non précisé"}
          </p>
        </div>
      ),
    },
    ...(entite === "bureau" ? [colonneEditeur] : []),
    {
      cle: "actif",
      titre: "Affichage",
      rendu: (m) =>
        m.actif ? (
          <Indicateur icone={CircleCheck} ton="vert">
            Affiché
          </Indicateur>
        ) : (
          <Indicateur icone={EyeOff} ton="gris">
            Masqué
          </Indicateur>
        ),
    },
    {
      cle: "ordre",
      titre: "Ordre",
      classe: "w-16",
      rendu: (m) => {
        const index = groupe.findIndex((x) => x.id === m.id);
        return (
          <div className="flex flex-col items-center">
            <button
              type="button"
              aria-label={`Monter ${m.nom ?? m.role}`}
              disabled={enCours || index === 0}
              onClick={() => deplacer(groupe, index, -1)}
              className={boutonOrdre}
            >
              <ChevronUp aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Descendre ${m.nom ?? m.role}`}
              disabled={enCours || index === groupe.length - 1}
              onClick={() => deplacer(groupe, index, 1)}
              className={boutonOrdre}
            >
              <ChevronDown aria-hidden="true" className="size-4" />
            </button>
          </div>
        );
      },
    },
    {
      cle: "actions",
      titre: "",
      classe: "w-14 text-right",
      rendu: (m) => (
        <MenuActionsLigne
          nom={m.nom ?? m.role}
          onModifier={() => setEdition(m)}
          suppression={{
            titre: "Supprimer ce membre ?",
            description: `${m.nom ?? m.role} sera retiré définitivement du site. Sa photo reste dans la médiathèque.`,
            action: () => supprimerMembre(m.id),
          }}
        />
      ),
    },
  ];

  const groupes = ENTITES.filter((e) => !filtre || e.valeur === filtre);

  return (
    <>
      <BarreOutils libelle="Nouveau membre" onClick={() => setEdition("nouveau")} />
      <div className="grid gap-10">
        {groupes.map((entite) => {
          const groupe = membres
            .filter((m) => m.entite === entite.valeur)
            .sort((a, b) => a.ordre - b.ordre);
          const Icone = entite.icone;
          return (
            <section key={entite.valeur} aria-labelledby={`entite-${entite.valeur}`}>
              <div className="mb-3">
                <h2
                  id={`entite-${entite.valeur}`}
                  className="flex items-center gap-2.5 font-display text-lg tracking-tight text-ink"
                >
                  <Icone aria-hidden="true" className="size-5 text-muted-ink" />
                  {entite.titre}
                  <Pastille>{groupe.length}</Pastille>
                </h2>
                <p className="mt-1 text-[13px] text-muted-ink">
                  {entite.aide} Utilisez les flèches pour modifier l'ordre d'affichage.
                </p>
              </div>
              <TableauDonnees
                legende={entite.titre}
                lignes={groupe}
                colonnes={colonnesDe(groupe, entite.valeur)}
                idLigne={(m) => m.id}
                rechercheTexte={(m) => `${m.nom ?? ""} ${m.email ?? ""} ${m.role}`}
                taillePage={0}
                vide={{
                  titre: `Aucun membre dans ${entite.titre.toLowerCase()}`,
                  description: "Ajoutez une personne avec le bouton Nouveau membre.",
                }}
              />
            </section>
          );
        })}
      </div>
      <TiroirMembre
        key={edition === null ? "ferme" : edition === "nouveau" ? "nouveau" : edition.id}
        membre={edition === "nouveau" ? null : edition}
        entiteParDefaut={filtre ?? "bureau"}
        open={edition !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setEdition(null);
        }}
        medias={medias}
        suggestionsRole={suggestionsRole}
        idsBureau={
          new Set(membres.flatMap((m) => (m.entite === "bureau" && m.user_id ? [m.user_id] : [])))
        }
        ordreSuivant={(entite) =>
          Math.min(
            999,
            membres
              .filter((m) => m.entite === entite)
              .reduce((max, m) => Math.max(max, m.ordre + 1), 0),
          )
        }
      />
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title="Réordonnancement impossible"
        description={erreur ?? undefined}
      />
    </>
  );
}
