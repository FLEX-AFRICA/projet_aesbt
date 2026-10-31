"use client";

import { useState, useTransition } from "react";

import type { ResultatOperation } from "../_kit";

import type { ErreursChamps } from "./validation";

/**
 * Cycle d'enregistrement d'un formulaire en tiroir : validation côté client,
 * envoi d'une action serveur, erreurs de champ et erreur générale.
 */
export function useEnregistrement() {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<ErreursChamps>({});

  /**
   * `erreursValidation` vide : l'envoi est lancé, puis `apres` est appelée en cas de succès.
   * Sinon les erreurs sont affichées et rien n'est envoyé.
   */
  function lancer(
    erreursValidation: ErreursChamps,
    envoyer: () => Promise<ResultatOperation>,
    apres: () => void,
  ) {
    setErreur(null);
    setErreursChamps(erreursValidation);
    if (Object.keys(erreursValidation).length > 0) {
      setErreur("Corrigez les champs signalés avant d'enregistrer.");
      return;
    }
    demarrer(async () => {
      const resultat = await envoyer();
      if (resultat.ok) apres();
      else setErreur(resultat.message ?? "L'enregistrement a échoué.");
    });
  }

  return { enCours, erreur, erreursChamps, lancer };
}
