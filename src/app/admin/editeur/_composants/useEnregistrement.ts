"use client";

import { useCallback, useRef, useState, type Dispatch } from "react";

import { enregistrerBrouillon, type ConflitChamp } from "../actions";
import type { ActionEdition } from "../_lib/etat-edition";
import { normaliserPourEnvoi } from "../_lib/validation";
import type { ChampEditeur, Valeurs } from "../_lib/types";

export interface RetourEnregistrement {
  variant: "error" | "info";
  titre: string;
  description: string;
}

/**
 * Enregistrement du brouillon : versions par clé, conflits, erreurs serveur.
 *
 * Sur succès : met à jour les versions locales et la base de l'état d'édition
 * (ce qui efface l'indicateur « non enregistré »). Sur 409 : expose `conflits`
 * (le dialogue propose de garder sa version ou de recharger). Sur 400/422 :
 * `erreursServeur` par clé. Sur erreur réseau : `retour`.
 */
export function useEnregistrement({
  page,
  champs,
  modifs,
  dispatch,
}: {
  page: string;
  champs: readonly ChampEditeur[];
  modifs: Valeurs;
  dispatch: Dispatch<ActionEdition>;
}) {
  const [versions, setVersions] = useState<Record<string, number>>(() =>
    Object.fromEntries(champs.map((c) => [c.cle, c.version])),
  );
  const [enCours, setEnCours] = useState(false);
  const [conflits, setConflits] = useState<ConflitChamp[] | null>(null);
  const [erreursServeur, setErreursServeur] = useState<Record<string, string>>({});
  const [retour, setRetour] = useState<RetourEnregistrement | null>(null);
  const [enregistreA, setEnregistreA] = useState<string | null>(null);
  /** Posé avant un rechargement volontaire pour éviter l'alerte beforeunload. */
  const quitterSansAlerte = useRef(false);

  const envoyer = useCallback(
    async (versionsEnvoi: Record<string, number>): Promise<boolean> => {
      const originales: Valeurs = { ...modifs };
      const envoyees: Valeurs = {};
      for (const champ of champs) {
        const v = modifs[champ.cle];
        if (champ.cle in modifs && v !== undefined)
          envoyees[champ.cle] = normaliserPourEnvoi(champ, v);
      }
      const versionsCles: Record<string, number> = {};
      for (const cle of Object.keys(envoyees)) versionsCles[cle] = versionsEnvoi[cle] ?? 0;

      setEnCours(true);
      setRetour(null);
      let resultat;
      try {
        resultat = await enregistrerBrouillon(page, envoyees, versionsCles);
      } catch {
        resultat = {
          statut: "erreur" as const,
          message: "Enregistrement impossible : connexion perdue. Réessayez.",
        };
      }
      setEnCours(false);

      switch (resultat.statut) {
        case "ok":
          setVersions((prev) => ({ ...prev, ...versionsEnvoi, ...resultat.versions }));
          setErreursServeur({});
          dispatch({ type: "enregistre", envoyees, originales });
          setEnregistreA(
            new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          );
          return true;
        case "conflit":
          setConflits(resultat.conflits);
          break;
        case "invalide":
          setErreursServeur(resultat.erreurs);
          setRetour({ variant: "error", titre: "Valeurs refusées", description: resultat.message });
          break;
        case "erreur":
          setRetour({
            variant: "error",
            titre: "Échec de l'enregistrement",
            description: resultat.message,
          });
          break;
      }
      return false;
    },
    [champs, dispatch, modifs, page],
  );

  /** Enregistre avec les versions connues. Renvoie vrai si le brouillon est enregistré. */
  const enregistrer = useCallback(() => envoyer(versions), [envoyer, versions]);

  /** Remplace les versions connues (après rechargement de l'état serveur). */
  const remplacerVersions = useCallback((nouvelles: Record<string, number>) => {
    setVersions(nouvelles);
    setErreursServeur({});
  }, []);

  /** « Garder ma version » : renvoie avec les versions courantes du serveur. */
  const garderMaVersion = useCallback(() => {
    const nouvelles = { ...versions };
    for (const c of conflits ?? [])
      if (c.versionCourante >= 0) nouvelles[c.cle] = c.versionCourante;
    setConflits(null);
    void envoyer(nouvelles);
  }, [conflits, envoyer, versions]);

  /** « Recharger » : abandonne les modifications locales et relit le serveur. */
  const recharger = useCallback(() => {
    quitterSansAlerte.current = true;
    window.location.reload();
  }, []);

  const effacerErreurServeur = useCallback((cle: string) => {
    setErreursServeur((prev) => {
      if (!(cle in prev)) return prev;
      const { [cle]: _retiree, ...reste } = prev;
      return reste;
    });
  }, []);

  return {
    enCours,
    conflits,
    fermerConflit: () => setConflits(null),
    erreursServeur,
    effacerErreurServeur,
    retour,
    fermerRetour: () => setRetour(null),
    setRetour,
    enregistreA,
    quitterSansAlerte,
    enregistrer,
    garderMaVersion,
    recharger,
    remplacerVersions,
  };
}
