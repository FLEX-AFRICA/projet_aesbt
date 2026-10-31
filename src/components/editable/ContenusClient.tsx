"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAUTS, type ValeurContenu } from "@/contenus/defauts";
import type { Contenus, Medias } from "@/lib/contenus";
import { urlImage, valeurContenuValide } from "./contenu";

/**
 * Protocole postMessage entre l'éditeur (fenêtre parente) et l'aperçu (iframe
 * de même origine). Tous les messages portent `source: "aesbt-editeur"`.
 *
 * Aperçu vers éditeur :
 * - `{ type: "selection", cle }` : l'utilisateur a cliqué une zone ;
 * - `{ type: "pret", page }` : l'aperçu est monté en mode édition.
 *
 * Éditeur vers aperçu :
 * - `{ type: "valeur", cle, valeur }` : remplace la valeur d'une clé en direct.
 *
 * Sécurité : origine cible stricte (jamais "*") et, à la réception, contrôle
 * de `event.origin` ET de `event.source` (doit être la fenêtre parente).
 */
export const SOURCE_MESSAGES = "aesbt-editeur";

interface Contexte {
  contenus: Contenus;
  /** Table identifiant de média vers chemin et alt, pour résoudre les images. */
  medias: Medias;
  modeEdition: boolean;
  page: string;
  cleSelectionnee: string | null;
  selectionner: (cle: string) => void;
}

const ContenusContexte = createContext<Contexte | null>(null);

/**
 * Contexte de repli, hors de tout `ContenusProvider` : toutes les valeurs par
 * défaut locales, jamais de mode édition. Les blocs partagés (bande d'adhésion,
 * navigation, pied de page) s'affichent ainsi comme avant, sans erreur, même
 * rendus sur une page sans provider.
 */
const CONTEXTE_DEFAUT: Contexte = {
  contenus: Object.assign({}, ...Object.values(DEFAUTS)) as Contenus,
  medias: {},
  modeEdition: false,
  page: "",
  cleSelectionnee: null,
  selectionner: () => {},
};

/**
 * Provider client. Imbriqué sous un autre provider, il ne fait rien : le
 * contexte le plus extérieur (la page, éventuellement en mode édition) reste
 * seul maître. Les blocs partagés peuvent donc s'envelopper eux-mêmes dans un
 * provider `commun` sans masquer celui de la page.
 */
export function ContenusClient(props: {
  contenus: Contenus;
  medias: Medias;
  modeEdition: boolean;
  page: string;
  children: ReactNode;
}) {
  const parent = useContext(ContenusContexte);
  if (parent) return <>{props.children}</>;
  return <ContenusRacine {...props} />;
}

function ContenusRacine({
  contenus: depuisServeur,
  medias,
  modeEdition,
  page,
  children,
}: {
  contenus: Contenus;
  medias: Medias;
  modeEdition: boolean;
  page: string;
  children: ReactNode;
}) {
  // Modifications reçues en direct : fusionnées PAR-DESSUS les valeurs serveur,
  // pour qu'un rafraîchissement serveur ne les écrase pas.
  const [surcharges, setSurcharges] = useState<Contenus>({});
  const [cleSelectionnee, setCleSelectionnee] = useState<string | null>(null);

  const contenus = useMemo(
    () => ({ ...depuisServeur, ...surcharges }),
    [depuisServeur, surcharges],
  );

  const parentDistinct = useCallback((): Window | null => {
    return typeof window !== "undefined" && window.parent !== window ? window.parent : null;
  }, []);

  const selectionner = useCallback(
    (cle: string) => {
      setCleSelectionnee(cle);
      parentDistinct()?.postMessage(
        { source: SOURCE_MESSAGES, type: "selection", cle },
        window.location.origin,
      );
    },
    [parentDistinct],
  );

  useEffect(() => {
    if (!modeEdition) return;

    function surMessage(event: MessageEvent): void {
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;
      const donnees: unknown = event.data;
      if (typeof donnees !== "object" || donnees === null) return;
      const m = donnees as { source?: unknown; type?: unknown; cle?: unknown; valeur?: unknown };
      if (m.source !== SOURCE_MESSAGES) return;

      if (m.type === "valeur" && typeof m.cle === "string" && valeurContenuValide(m.valeur)) {
        const cle = m.cle;
        const valeur: ValeurContenu = m.valeur;
        // Clé inconnue de la page : ignorée (liste blanche = clés du registre).
        if (!(cle in depuisServeur)) return;
        setSurcharges((prev) => ({ ...prev, [cle]: valeur }));
      }
    }

    window.addEventListener("message", surMessage);
    parentDistinct()?.postMessage(
      { source: SOURCE_MESSAGES, type: "pret", page },
      window.location.origin,
    );
    return () => window.removeEventListener("message", surMessage);
  }, [modeEdition, page, depuisServeur, parentDistinct]);

  const valeur = useMemo<Contexte>(
    () => ({ contenus, medias, modeEdition, page, cleSelectionnee, selectionner }),
    [contenus, medias, modeEdition, page, cleSelectionnee, selectionner],
  );

  return (
    <ContenusContexte.Provider value={valeur}>
      {modeEdition ? (
        // Contour par outline : n'affecte jamais la mise en page (pas
        // d'overflow, de transform ni de position). Voir inventaire 6.7.
        <style>{`
          [data-editable-cle] { cursor: pointer; }
          [data-editable-cle]:hover { outline: 2px dashed #2563eb; outline-offset: 3px; }
          [data-editable-cle][data-editable-selectionne="true"] { outline: 2px solid #2563eb; outline-offset: 3px; }
        `}</style>
      ) : null}
      {children}
    </ContenusContexte.Provider>
  );
}

export function useContenus(): Contexte {
  // Hors provider : repli sur les défauts locaux (jamais d'exception).
  return useContext(ContenusContexte) ?? CONTEXTE_DEFAUT;
}

/** Valeur courante d'une clé (suit l'aperçu en direct). */
export function useContenu(cle: string): ValeurContenu | undefined {
  return useContenus().contenus[cle];
}

/**
 * URL affichable de l'image d'une clé : chemin public, URL http(s) ou
 * identifiant de média résolu avec la table `medias`. Null si pas d'image.
 */
export function useUrlImage(cle: string): string | null {
  const { contenus, medias } = useContenus();
  return urlImage(contenus[cle], medias);
}
