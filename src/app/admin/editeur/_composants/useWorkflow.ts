"use client";

import { useCallback, useMemo, useState, type Dispatch } from "react";

import {
  chargerEtat,
  publierCles,
  rejeterCles,
  restaurerVersion,
  soumettrePage,
  type EtatCharge,
} from "../actions-workflow";
import type { DetailServeur, Soumission } from "../_lib/detail";
import { calculerChangements } from "../_lib/diff";
import type { ActionEdition } from "../_lib/etat-edition";
import type { IntentionDiff } from "./EcranDiff";

export interface RetourWorkflow {
  variant: "success" | "error" | "info" | "warning";
  titre: string;
  description: string;
}

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? "s" : ""}`;
}

/**
 * Workflow de validation : diff avant/après, publication, rejet, soumission
 * pour validation, restauration. Garde l'état serveur rechargé (détail et
 * soumission) et le répercute sur l'éditeur (base, versions, aperçu).
 *
 * `enregistrerAvant` enregistre les modifications locales (avec validation et
 * gestion de conflit existantes) et renvoie vrai si tout est enregistré.
 */
export function useWorkflow({
  page,
  detailInitial,
  soumissionInitiale,
  nbModifs,
  enregistrerAvant,
  dispatch,
  remplacerVersions,
  rechargerApercu,
}: {
  page: string;
  detailInitial: DetailServeur;
  soumissionInitiale: Soumission | null;
  nbModifs: number;
  enregistrerAvant: () => Promise<boolean>;
  dispatch: Dispatch<ActionEdition>;
  remplacerVersions: (versions: Record<string, number>) => void;
  rechargerApercu: () => void;
}) {
  const [detail, setDetail] = useState(detailInitial);
  const [soumission, setSoumission] = useState(soumissionInitiale);
  const [ecran, setEcran] = useState<{ intention: IntentionDiff; cle: number } | null>(null);
  const [erreurEcran, setErreurEcran] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [retour, setRetour] = useState<RetourWorkflow | null>(null);
  const [soumissionOuverte, setSoumissionOuverte] = useState(false);
  const [erreurSoumission, setErreurSoumission] = useState<string | null>(null);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false);
  const [restauration, setRestauration] = useState<{ enCours: boolean; erreur: string | null }>({
    enCours: false,
    erreur: null,
  });

  const changements = useMemo(() => calculerChangements(detail.champs), [detail.champs]);

  /** Répercute un état serveur rechargé sur l'éditeur. */
  const appliquer = useCallback(
    (etat: EtatCharge) => {
      setDetail(etat.detail);
      setSoumission(etat.soumission);
      dispatch({
        type: "reinitialiser",
        base: Object.fromEntries(etat.champs.map((c) => [c.cle, c.base])),
      });
      remplacerVersions(Object.fromEntries(etat.champs.map((c) => [c.cle, c.version])));
    },
    [dispatch, remplacerVersions],
  );

  /** Recharge l'état serveur et l'applique. Renvoie le détail, ou null en cas d'échec. */
  const actualiser = useCallback(
    async (avecApercu: boolean): Promise<EtatCharge | null> => {
      let r;
      try {
        r = await chargerEtat(page);
      } catch {
        return null;
      }
      if (r.statut !== "ok") return null;
      appliquer(r);
      if (avecApercu) rechargerApercu();
      return r;
    },
    [appliquer, page, rechargerApercu],
  );

  /** Ouvre l'écran de diff (publier ou rejeter) après avoir enregistré si besoin. */
  const ouvrirEcran = useCallback(
    async (intention: IntentionDiff, enregistrerD: boolean) => {
      setOccupe(true);
      try {
        if (enregistrerD && nbModifs > 0 && !(await enregistrerAvant())) return;
        const etat = await actualiser(false);
        if (!etat) {
          setRetour({
            variant: "error",
            titre: "Chargement impossible",
            description: "L'état de la page n'a pas pu être relu depuis le serveur. Réessayez.",
          });
          return;
        }
        if (calculerChangements(etat.detail.champs).length === 0) {
          setRetour({
            variant: "info",
            titre: "Aucun brouillon",
            description:
              "Il n'y a aucun brouillon enregistré sur cette page : rien à publier ni à rejeter.",
          });
          return;
        }
        setErreurEcran(null);
        setEcran((prev) => ({ intention, cle: (prev?.cle ?? 0) + 1 }));
      } finally {
        setOccupe(false);
      }
    },
    [actualiser, enregistrerAvant, nbModifs],
  );

  /** Suite d'une publication ou d'un rejet : succès ou erreur affichée dans l'écran. */
  const terminerOperation = useCallback(
    async (
      r: { statut: "ok"; cles: string[] } | { statut: "erreur"; code: string; message: string },
      verbe: "publiée" | "rejetée",
    ) => {
      if (r.statut === "ok") {
        setEcran(null);
        await actualiser(true);
        const n = r.cles.length;
        setRetour(
          n === 0
            ? {
                variant: "info",
                titre: "Rien à faire",
                description: "Ces brouillons avaient déjà été traités par quelqu'un d'autre.",
              }
            : verbe === "publiée"
              ? {
                  variant: "success",
                  titre: "Publication réussie",
                  description: `${pluriel(n, "modification")} ${n > 1 ? "publiées" : "publiée"} sur le site public.`,
                }
              : {
                  variant: "success",
                  titre: "Brouillon rejeté",
                  description: `${pluriel(n, "champ")} ${n > 1 ? "sont revenus" : "est revenu"} à la version publiée.`,
                },
        );
        return;
      }
      setErreurEcran(r.message);
      // Conflit : l'état a changé, on relit pour que le diff reflète le serveur.
      if (r.code === "conflit") {
        const etat = await actualiser(false);
        if (etat) setEcran((prev) => (prev ? { ...prev, cle: prev.cle + 1 } : prev));
      }
    },
    [actualiser],
  );

  const publier = useCallback(
    async (cles: string[]) => {
      setOccupe(true);
      setErreurEcran(null);
      try {
        const r = await publierCles(page, cles);
        await terminerOperation(
          r.statut === "ok" ? { statut: "ok", cles: r.publiees } : r,
          "publiée",
        );
      } catch {
        setErreurEcran("Publication impossible : connexion perdue. Réessayez.");
      } finally {
        setOccupe(false);
      }
    },
    [page, terminerOperation],
  );

  const rejeter = useCallback(
    async (cles: string[]) => {
      setOccupe(true);
      setErreurEcran(null);
      try {
        const r = await rejeterCles(page, cles);
        await terminerOperation(
          r.statut === "ok" ? { statut: "ok", cles: r.rejetees } : r,
          "rejetée",
        );
      } catch {
        setErreurEcran("Rejet impossible : connexion perdue. Réessayez.");
      } finally {
        setOccupe(false);
      }
    },
    [page, terminerOperation],
  );

  const soumettre = useCallback(
    async (note: string) => {
      setOccupe(true);
      setErreurSoumission(null);
      try {
        if (nbModifs > 0 && !(await enregistrerAvant())) {
          // L'échec (champ invalide, conflit, réseau) est déjà affiché par l'éditeur.
          setSoumissionOuverte(false);
          return;
        }
        const r = await soumettrePage(page, note);
        if (r.statut === "ok") {
          setSoumissionOuverte(false);
          await actualiser(false);
          setRetour({
            variant: "success",
            titre: "Soumis pour validation",
            description:
              "Un administrateur va relire vos modifications. Vous pouvez continuer à les compléter : elles resteront incluses dans la soumission.",
          });
        } else {
          setErreurSoumission(r.message);
        }
      } catch {
        setErreurSoumission("Envoi impossible : connexion perdue. Réessayez.");
      } finally {
        setOccupe(false);
      }
    },
    [actualiser, enregistrerAvant, nbModifs, page],
  );

  const restaurer = useCallback(
    async (cle: string, version: number) => {
      setRestauration({ enCours: true, erreur: null });
      try {
        const r = await restaurerVersion(page, cle, version);
        if (r.statut === "ok") {
          setHistoriqueOuvert(false);
          setRestauration({ enCours: false, erreur: null });
          await actualiser(true);
          setRetour({
            variant: "success",
            titre: "Brouillon créé",
            description:
              "La restauration crée un brouillon à publier : le site public ne change pas tant que vous n'avez pas publié.",
          });
        } else {
          setRestauration({ enCours: false, erreur: r.message });
        }
      } catch {
        setRestauration({
          enCours: false,
          erreur: "Restauration impossible : connexion perdue. Réessayez.",
        });
      }
    },
    [actualiser, page],
  );

  return {
    detail,
    soumission,
    changements,
    nbBrouillons: changements.length,
    ecran,
    fermerEcran: () => setEcran(null),
    erreurEcran,
    occupe,
    retour,
    fermerRetour: () => setRetour(null),
    soumissionOuverte,
    ouvrirSoumission: () => {
      setErreurSoumission(null);
      setSoumissionOuverte(true);
    },
    fermerSoumission: () => setSoumissionOuverte(false),
    erreurSoumission,
    historiqueOuvert,
    ouvrirHistorique: () => {
      setRestauration({ enCours: false, erreur: null });
      setHistoriqueOuvert(true);
    },
    fermerHistorique: () => setHistoriqueOuvert(false),
    restauration,
    ouvrirEcran,
    publier,
    rejeter,
    soumettre,
    restaurer,
  };
}
