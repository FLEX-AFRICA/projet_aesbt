"use client";

import { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { chargerHistorique } from "../actions-workflow";
import type { MediaReference, VersionHistorique } from "../_lib/detail";
import type { ChampPourDiff } from "../_lib/diff";
import { DiffValeur } from "./DiffValeur";

const BOUTON =
  "inline-flex items-center justify-center rounded-md border border-line px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-40";
const BOUTON_PRINCIPAL =
  "inline-flex items-center justify-center rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:opacity-40";

function heure(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** Regroupe les versions (déjà triées du plus récent au plus ancien) par jour. */
function grouperParJour(versions: readonly VersionHistorique[]) {
  const jours = new Map<string, VersionHistorique[]>();
  for (const v of versions) {
    const jour = v.creeLe.slice(0, 10);
    const liste = jours.get(jour) ?? [];
    liste.push(v);
    jours.set(jour, liste);
  }
  return [...jours.entries()];
}

type Chargement =
  | { statut: "chargement" }
  | { statut: "ok"; versions: VersionHistorique[] }
  | { statut: "erreur"; message: string };

/**
 * Historique des publications d'une page : liste par date, détail avant/après
 * et, pour l'administrateur, restauration (qui crée un brouillon à publier).
 * L'éditeur peut consulter mais ne voit pas le bouton de restauration.
 */
export function PanneauHistorique({
  page,
  champs,
  medias,
  estAdmin,
  modificationsLocales,
  restauration,
  onFermer,
  onRestaurer,
}: {
  page: string;
  champs: readonly ChampPourDiff[];
  medias: Record<string, MediaReference>;
  estAdmin: boolean;
  /** Des modifications non enregistrées empêchent la restauration. */
  modificationsLocales: boolean;
  restauration: { enCours: boolean; erreur: string | null };
  onFermer: () => void;
  onRestaurer: (cle: string, version: number) => void;
}) {
  const [etat, setEtat] = useState<Chargement>({ statut: "chargement" });
  const [choisieId, setChoisieId] = useState<number | null>(null);
  const [confirmer, setConfirmer] = useState(false);

  useEffect(() => {
    let annule = false;
    chargerHistorique(page)
      .then((r) => {
        if (annule) return;
        if (r.statut === "ok") {
          setEtat({ statut: "ok", versions: r.versions });
          setChoisieId(r.versions[0]?.id ?? null);
        } else setEtat({ statut: "erreur", message: r.message });
      })
      .catch(() => {
        if (!annule)
          setEtat({ statut: "erreur", message: "Historique indisponible : connexion perdue." });
      });
    return () => {
      annule = true;
    };
  }, [page]);

  const meta = useMemo(() => new Map(champs.map((c) => [c.cle, c])), [champs]);
  const versions = etat.statut === "ok" ? etat.versions : [];
  const choisie = versions.find((v) => v.id === choisieId) ?? null;
  const champChoisi = choisie ? meta.get(choisie.cle) : undefined;

  return (
    <Dialog
      open
      onOpenChange={(ouvert) => {
        if (!ouvert && !restauration.enCours) onFermer();
      }}
    >
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="border-b border-line px-5 py-4 pr-12">
          <DialogTitle className="font-display text-lg font-semibold text-ink">
            Historique des publications
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-muted-ink">
            {estAdmin
              ? "Choisissez une publication pour voir ce qui a changé. La restauration crée un brouillon à publier : le site public ne change qu'après publication."
              : "Consultation seule : seul un administrateur peut restaurer une version."}
          </DialogDescription>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_1fr]">
          <nav
            aria-label="Publications"
            className="max-h-56 overflow-y-auto border-b border-line lg:max-h-none lg:border-b-0 lg:border-r"
          >
            {etat.statut === "chargement" ? (
              <p role="status" className="p-4 text-[13px] text-muted-ink">
                Chargement de l'historique...
              </p>
            ) : etat.statut === "erreur" ? (
              <p role="alert" className="p-4 text-[13px] font-medium text-accent-red">
                {etat.message}
              </p>
            ) : versions.length === 0 ? (
              <p className="p-4 text-[13px] text-muted-ink">Aucune publication pour le moment.</p>
            ) : (
              grouperParJour(versions).map(([jour, liste]) => (
                <section key={jour} aria-label={formatDate(jour)}>
                  <h3 className="sticky top-0 bg-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-ink">
                    {formatDate(jour)}
                  </h3>
                  <ul>
                    {liste.map((v) => (
                      <li key={v.id}>
                        <button
                          type="button"
                          aria-current={v.id === choisieId}
                          onClick={() => {
                            setChoisieId(v.id);
                            setConfirmer(false);
                          }}
                          className={cn(
                            "block w-full border-b border-line/60 px-4 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-blue",
                            v.id === choisieId && "bg-accent-blue/10",
                          )}
                        >
                          <span className="block text-[13px] font-medium text-ink">
                            {meta.get(v.cle)?.libelle ?? v.cle}
                          </span>
                          <span className="block text-[12px] text-muted-ink">
                            Version {v.version}, {heure(v.creeLe)},{" "}
                            {v.acteurNom ?? "compte supprimé"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </nav>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {choisie ? (
              <div className="grid gap-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">
                    {champChoisi?.libelle ?? choisie.cle}
                  </h3>
                  <p className="text-[12px] text-muted-ink">
                    Version {choisie.version} publiée le {formatDate(choisie.creeLe)} à{" "}
                    {heure(choisie.creeLe)} par {choisie.acteurNom ?? "un compte supprimé"}.
                  </p>
                </div>
                <DiffValeur
                  type={champChoisi?.type ?? "texte"}
                  avant={choisie.avant}
                  apres={choisie.apres}
                  sousChamps={champChoisi?.sousChamps ?? null}
                  medias={medias}
                />

                {estAdmin ? (
                  <div className="rounded-lg border border-line bg-surface/60 p-3">
                    {restauration.erreur ? (
                      <p role="alert" className="mb-2 text-[13px] font-medium text-accent-red">
                        {restauration.erreur}
                      </p>
                    ) : null}
                    {modificationsLocales ? (
                      <p className="text-[13px] text-muted-ink">
                        Enregistrez ou annulez vos modifications en cours avant de restaurer une
                        version.
                      </p>
                    ) : confirmer ? (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p role="alert" className="text-[13px] text-ink">
                          Restaurer la valeur « après » de cette version ? Elle devient un brouillon
                          qui remplace le brouillon actuel de ce champ. Vous devrez ensuite la
                          publier.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={BOUTON}
                            disabled={restauration.enCours}
                            onClick={() => setConfirmer(false)}
                          >
                            Retour
                          </button>
                          <button
                            type="button"
                            className={BOUTON_PRINCIPAL}
                            disabled={restauration.enCours}
                            autoFocus
                            onClick={() => onRestaurer(choisie.cle, choisie.version)}
                          >
                            {restauration.enCours ? "Restauration..." : "Confirmer"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[13px] text-muted-ink">
                          La restauration crée un brouillon à publier.
                        </p>
                        <button type="button" className={BOUTON} onClick={() => setConfirmer(true)}>
                          Restaurer cette version
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : etat.statut === "ok" ? (
              <p className="text-[14px] text-muted-ink">Sélectionnez une publication.</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
