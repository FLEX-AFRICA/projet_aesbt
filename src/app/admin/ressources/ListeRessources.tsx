"use client";

import { ChevronDown, ChevronUp, FileText, Globe, Link2, Lock, Users } from "lucide-react";
import { useState, useTransition } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";

import { StatutPoint, TableauDonnees, type Colonne, type MediaChoisissable } from "../_kit";
import { MenuActionsLigne } from "../_commun/MenuActionsLigne";
import { statutAffichable } from "../_commun/statut";
import { BarreOutils } from "../_commun/BarreOutils";
import { changerStatutRessource, deplacerRessource, supprimerRessource } from "./actions";
import { estCommunautaire, estFichier, estPrivee } from "./etat";
import { TiroirRessource } from "./TiroirRessource";

/**
 * Ressource telle que renvoyée par GET /admin/ressources (sans identifiants de classement ni corps).
 * Les champs `type`, `visibilite`, `origine` et ceux du fichier sont absents d'une API plus ancienne :
 * une ressource sans eux est traitée comme un lien public d'origine admin.
 */
export interface RessourceAdmin {
  id: string;
  slug: string;
  titre: string;
  description: string;
  url: string;
  type?: "lien" | "document";
  visibilite?: "public" | "prive";
  origine?: "admin" | "communaute";
  /** Lecture seule : l'ordre se change avec les flèches, jamais par saisie. */
  ordre?: number;
  document_id?: string | null;
  document_url?: string | null;
  document_nom?: string | null;
  statut: string;
  categorie: string | null;
  vues: number;
  lien_valide: number | boolean | null;
  publie_le: string | null;
  created_at: string;
  rejet_motif: string | null;
  propose_par_nom: string | null;
}

const LIBELLES_STATUT: Record<string, string> = {
  publie: "Publiée",
  archive: "Archivée",
  propose: "En attente",
  rejete: "Rejetée",
};

function etatLien(r: RessourceAdmin): string | null {
  if (estFichier(r) || r.lien_valide === null) return null;
  return r.lien_valide ? null : "Lien injoignable";
}

export function ListeRessources({
  ressources,
  medias,
  suggestionsCategorie,
  peutPublier,
}: {
  ressources: RessourceAdmin[];
  medias: MediaChoisissable[];
  /** Catégories déjà utilisées, proposées dans le formulaire. */
  suggestionsCategorie: string[];
  /** Publier, archiver et rejeter sont réservés aux administrateurs. */
  peutPublier: boolean;
}) {
  const [edition, setEdition] = useState<RessourceAdmin | "nouveau" | null>(null);
  const [erreurDeplacement, setErreurDeplacement] = useState<string | null>(null);
  const [idEnCours, setIdEnCours] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  // Seules les ressources d'origine admin se classent, dans l'ordre renvoyé par l'API.
  const classables = ressources.filter((r) => !estCommunautaire(r));

  const deplacer = (id: string, direction: "haut" | "bas") => {
    setIdEnCours(id);
    demarrer(async () => {
      const resultat = await deplacerRessource(id, direction);
      setIdEnCours(null);
      if (!resultat.ok) setErreurDeplacement(resultat.message ?? "Le déplacement a échoué.");
    });
  };

  const colonnes: Colonne<RessourceAdmin>[] = [
    {
      cle: "position",
      titre: "Ordre",
      classe: "w-14",
      rendu: (r) => {
        if (estCommunautaire(r)) return null;
        const index = classables.findIndex((x) => x.id === r.id);
        const bouton =
          "inline-flex size-6 items-center justify-center rounded-md text-muted-ink transition-colors hover:bg-frost-deep/60 hover:text-ink disabled:pointer-events-none disabled:opacity-30";
        return (
          <div className="flex flex-col items-center">
            <button
              type="button"
              aria-label={`Monter ${r.titre}`}
              disabled={enCours || index <= 0}
              onClick={() => deplacer(r.id, "haut")}
              className={bouton}
            >
              <ChevronUp aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Descendre ${r.titre}`}
              disabled={enCours || index < 0 || index === classables.length - 1}
              onClick={() => deplacer(r.id, "bas")}
              className={bouton}
            >
              <ChevronDown aria-hidden="true" className="size-4" />
            </button>
          </div>
        );
      },
    },
    {
      cle: "titre",
      titre: "Ressource",
      valeurTri: (r) => r.titre,
      rendu: (r) => {
        const details = [r.categorie, etatLien(r)].filter(Boolean);
        return (
          <div className="flex min-w-[16rem] max-w-xl items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-frost-deep/50 text-muted-ink">
              {estFichier(r) ? (
                <FileText aria-hidden="true" className="size-4.5" />
              ) : (
                <Link2 aria-hidden="true" className="size-4.5" />
              )}
            </span>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => setEdition(r)}
                className="block max-w-full truncate text-left font-semibold text-ink hover:text-accent-blue focus-visible:outline-none focus-visible:underline"
              >
                {r.titre}
              </button>
              <p className="truncate text-[12px] text-muted-ink">
                {estFichier(r) ? "Fichier" : "Lien"}
                {details.length ? `, ${details.join(", ")}` : ""}
              </p>
              {r.propose_par_nom ? (
                <p className="truncate text-[12px] text-muted-ink">
                  Proposée par {r.propose_par_nom}
                </p>
              ) : null}
              {r.statut === "rejete" && r.rejet_motif ? (
                <p className="mt-0.5 text-[12px] text-accent-red">Motif : {r.rejet_motif}</p>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      cle: "visibilite",
      titre: "Visibilité",
      valeurTri: (r) => (estPrivee(r) ? "Privé" : "Public"),
      rendu: (r) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-soft">
          {estPrivee(r) ? (
            <Lock aria-hidden="true" className="size-4 text-[#C9961B]" />
          ) : (
            <Globe aria-hidden="true" className="size-4 text-accent-green" />
          )}
          {estPrivee(r) ? "Membres" : "Public"}
          {estCommunautaire(r) ? (
            <Users
              aria-label="Partagée par la communauté"
              role="img"
              className="size-3.5 text-muted-ink"
            />
          ) : null}
        </span>
      ),
    },
    {
      cle: "statut",
      titre: "Statut",
      valeurTri: (r) => r.statut,
      rendu: (r) => (
        <StatutPoint
          statut={r.statut === "propose" ? "en_attente" : r.statut}
          libelle={LIBELLES_STATUT[r.statut]}
        />
      ),
    },
    {
      cle: "vues",
      titre: "Vues",
      classe: "text-right tabular-nums",
      valeurTri: (r) => r.vues,
    },
    {
      cle: "actions",
      titre: "",
      classe: "w-14 text-right",
      rendu: (r) => (
        <MenuActionsLigne
          nom={r.titre}
          onModifier={() => setEdition(r)}
          urlSite={r.statut === "publie" ? `/ressources/${r.slug}` : null}
          {...(r.statut === "rejete"
            ? {}
            : {
                statut: {
                  statut: statutAffichable(r.statut === "propose" ? "en_attente" : r.statut),
                  peutPublier,
                  actionsDisponibles: ["publie", "archive"] as const,
                  onChanger: (cible) => changerStatutRessource(r.id, cible),
                },
              })}
          suppression={{
            titre: "Supprimer cette ressource ?",
            description:
              r.statut === "publie"
                ? `« ${r.titre} » est publiée : l'API refuse de supprimer une ressource publiée. Archivez-la d'abord.`
                : `La ressource « ${r.titre} » sera supprimée définitivement. Les liens déjà partagés cesseront de fonctionner.`,
            action: () => supprimerRessource(r.id),
          }}
        />
      ),
    },
  ];

  return (
    <>
      <BarreOutils libelle="Ajouter un document" onClick={() => setEdition("nouveau")} />
      <TableauDonnees
        legende="Ressources"
        lignes={ressources}
        colonnes={colonnes}
        idLigne={(r) => r.id}
        rechercheTexte={(r) => `${r.titre} ${r.description} ${r.categorie ?? ""}`}
        vide={{
          titre: "Aucune ressource",
          description: "Aucune ressource ne correspond à ce filtre.",
        }}
      />
      <TiroirRessource
        key={edition === null ? "ferme" : edition === "nouveau" ? "nouveau" : edition.id}
        ressource={edition === "nouveau" ? null : edition}
        open={edition !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setEdition(null);
        }}
        medias={medias}
        suggestionsCategorie={suggestionsCategorie}
      />
      <StatusDialog
        open={erreurDeplacement !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreurDeplacement(null);
        }}
        variant="error"
        title="Déplacement impossible"
        description={erreurDeplacement ?? undefined}
      />
    </>
  );
}
