"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import { cn } from "@/lib/utils";

import { changementsApercu, etatInitial, nombreModifications, reduire } from "../_lib/etat-edition";
import { valeurApercu } from "../_lib/apercu";
import { envoyerValeur, lireMessageApercu } from "../_lib/messages";
import type { DetailServeur, Soumission } from "../_lib/detail";
import type { ChampEditeur, MediaEditeur, ValeurContenu, Valeurs } from "../_lib/types";
import { validerModifications, type ErreursChamp } from "../_lib/validation";
import { ApercuIframe } from "./ApercuIframe";
import { BandeauSoumission } from "./BandeauSoumission";
import { BarreEditeur, type ModeApercu } from "./BarreEditeur";
import { DialogueConflit } from "./DialogueConflit";
import { DialogueSoumission } from "./DialogueSoumission";
import { EcranDiff } from "./EcranDiff";
import { PanneauHistorique } from "./PanneauHistorique";
import { PanneauEdition } from "./PanneauEdition";
import { useEnregistrement } from "./useEnregistrement";
import { useWorkflow } from "./useWorkflow";

/**
 * Éditeur visuel d'une page : barre, aperçu (iframe) et panneau d'édition.
 *
 * Architecture : un réducteur pur (`etat-edition.ts`) porte les modifications
 * et l'historique. Un effet compare les modifications avant/après et envoie
 * les différences à l'iframe par postMessage (aucune écriture serveur). À la
 * réception de `pret`, tout le jeu de modifications est renvoyé.
 */
export function EditeurVisuel({
  page,
  titre,
  champs,
  medias,
  estAdmin,
  detail,
  soumission,
}: {
  page: string;
  titre: string;
  champs: ChampEditeur[];
  medias: MediaEditeur[];
  /** Administrateur : peut publier, rejeter et restaurer. L'éditeur soumet. */
  estAdmin: boolean;
  /** Détail serveur au chargement (publié, défaut, brouillon, médias). */
  detail: DetailServeur;
  /** Soumission en attente de validation au chargement, ou null. */
  soumission: Soumission | null;
}) {
  const router = useRouter();
  const base = useMemo<Valeurs>(
    () => Object.fromEntries(champs.map((c) => [c.cle, c.base])),
    [champs],
  );
  const [etat, dispatch] = useReducer(reduire, base, etatInitial);
  const [mode, setMode] = useState<ModeApercu>("ordinateur");
  const [cleSelectionnee, setCleSelectionnee] = useState<string | null>(null);
  const [panneauOuvert, setPanneauOuvert] = useState(false);
  const [cleApercu, setCleApercu] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const enr = useEnregistrement({ page, champs, modifs: etat.modifs, dispatch });
  const nbModifs = nombreModifications(etat);
  const champsParCle = useMemo(() => new Map(champs.map((c) => [c.cle, c])), [champs]);
  const libelles = useMemo(
    () => Object.fromEntries(champs.map((c) => [c.cle, c.libelle])),
    [champs],
  );

  // Erreurs affichées : validation locale des champs modifiés + refus serveur.
  const erreursClient = useMemo(
    () => validerModifications(champs, etat.modifs),
    [champs, etat.modifs],
  );
  const erreurs = useMemo(() => {
    const fusion: Record<string, ErreursChamp> = { ...erreursClient };
    for (const [cle, message] of Object.entries(enr.erreursServeur)) {
      if (cle === "") continue;
      fusion[cle] = { ...(fusion[cle] ?? {}), "": fusion[cle]?.[""] ?? message };
    }
    return fusion;
  }, [erreursClient, enr.erreursServeur]);
  const nbErreurs = Object.keys(erreursClient).length;

  const valeurs = useMemo<Valeurs>(
    () => ({ ...etat.base, ...etat.modifs }),
    [etat.base, etat.modifs],
  );
  const modifiees = useMemo(() => new Set(Object.keys(etat.modifs)), [etat.modifs]);

  // --- Aperçu en direct ------------------------------------------------
  const envoyees = useRef<{ modifs: Valeurs; base: Valeurs }>({ modifs: {}, base });

  const pousser = useCallback(
    (liste: { cle: string; valeur: ValeurContenu }[]) => {
      const fenetre = iframeRef.current?.contentWindow;
      for (const { cle, valeur } of liste) {
        const champ = champsParCle.get(cle);
        if (champ) envoyerValeur(fenetre, cle, valeurApercu(champ, valeur, medias));
      }
    },
    [champsParCle, medias],
  );

  useEffect(() => {
    // `base` peut changer (après enregistrement) : on compare aux valeurs
    // effectives (base + modifs) pour ne rien renvoyer d'inutile.
    const avant = { ...envoyees.current.base, ...envoyees.current.modifs };
    const apres = { ...etat.base, ...etat.modifs };
    const diff = changementsApercu(avant, apres, etat.base);
    envoyees.current = { modifs: etat.modifs, base: etat.base };
    if (diff.length > 0) pousser(diff);
  }, [etat.base, etat.modifs, pousser]);

  useEffect(() => {
    function surMessage(event: MessageEvent): void {
      const m = lireMessageApercu(event, iframeRef.current?.contentWindow);
      if (!m) return;
      if (m.type === "selection" && champsParCle.has(m.cle)) {
        setCleSelectionnee(m.cle);
        setPanneauOuvert(true);
      } else if (m.type === "pret" && m.page === page) {
        // Iframe (re)chargée : elle repart des valeurs serveur, on rejoue tout.
        pousser(Object.entries(etat.modifs).map(([cle, valeur]) => ({ cle, valeur })));
      }
    }
    window.addEventListener("message", surMessage);
    return () => window.removeEventListener("message", surMessage);
  }, [champsParCle, etat.modifs, page, pousser]);

  // --- Clavier, fermeture ---------------------------------------------
  useEffect(() => {
    function surTouche(e: KeyboardEvent): void {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      dispatch({ type: e.shiftKey ? "retablir" : "annuler" });
    }
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, []);

  useEffect(() => {
    if (nbModifs === 0) return;
    function avertir(e: BeforeUnloadEvent): void {
      if (enr.quitterSansAlerte.current) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [nbModifs, enr.quitterSansAlerte]);

  const quitter = useCallback(() => {
    if (
      nbModifs > 0 &&
      !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")
    ) {
      return;
    }
    enr.quitterSansAlerte.current = true;
    router.push("/admin/editeur");
  }, [enr.quitterSansAlerte, nbModifs, router]);

  const surChangement = useCallback(
    (cle: string, valeur: ValeurContenu) => {
      enr.effacerErreurServeur(cle);
      dispatch({ type: "modifier", cle, valeur, t: Date.now() });
    },
    // `enr` change à chaque rendu : seule la fonction stable compte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enr.effacerErreurServeur],
  );

  /**
   * Enregistre les modifications locales avant une action du workflow.
   * Renvoie vrai si tout est enregistré (ou s'il n'y avait rien à enregistrer).
   */
  const enregistrerAvant = async (): Promise<boolean> => {
    if (nbModifs === 0) return true;
    if (nbErreurs > 0) {
      signalerErreursClient();
      return false;
    }
    return enr.enregistrer();
  };

  const wf = useWorkflow({
    page,
    detailInitial: detail,
    soumissionInitiale: soumission,
    nbModifs,
    enregistrerAvant,
    dispatch,
    remplacerVersions: enr.remplacerVersions,
    rechargerApercu: () => setCleApercu((n) => n + 1),
  });

  function signalerErreursClient(): void {
    const premiere = Object.keys(erreursClient)[0];
    if (premiere) setCleSelectionnee(premiere);
    setPanneauOuvert(true);
    enr.setRetour({
      variant: "error",
      titre: "Champs à corriger",
      description: `${nbErreurs} champ${nbErreurs > 1 ? "s" : ""} contien${nbErreurs > 1 ? "nent" : "t"} une erreur. Corrigez-les avant d'enregistrer.`,
    });
  }

  const tenterEnregistrer = () => {
    if (nbErreurs > 0) {
      signalerErreursClient();
      return;
    }
    void enr.enregistrer();
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <BarreEditeur
        titre={titre}
        mode={mode}
        onMode={setMode}
        nbModifications={nbModifs}
        enregistreA={enr.enregistreA}
        peutAnnuler={etat.passe.length > 0}
        peutRetablir={etat.futur.length > 0}
        onAnnuler={() => dispatch({ type: "annuler" })}
        onRetablir={() => dispatch({ type: "retablir" })}
        onEnregistrer={tenterEnregistrer}
        enCours={enr.enCours}
        peutEnregistrer={nbModifs > 0}
        onQuitter={quitter}
        panneauOuvert={panneauOuvert}
        onBasculerPanneau={() => setPanneauOuvert((o) => !o)}
        estAdmin={estAdmin}
        nbBrouillons={wf.nbBrouillons}
        occupe={wf.occupe}
        onPublier={() => void wf.ouvrirEcran("publier", true)}
        onRejeter={() => void wf.ouvrirEcran("rejeter", false)}
        onSoumettre={wf.ouvrirSoumission}
        onHistorique={wf.ouvrirHistorique}
      />
      {wf.soumission ? (
        <BandeauSoumission
          soumission={wf.soumission}
          estAdmin={estAdmin}
          occupe={wf.occupe || enr.enCours}
          onRelire={() => void wf.ouvrirEcran("publier", true)}
          onPublier={() => void wf.ouvrirEcran("publier", true)}
          onRejeter={() => void wf.ouvrirEcran("rejeter", false)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ApercuIframe
          ref={iframeRef}
          page={page}
          mode={mode}
          cleChargement={cleApercu}
          titre={titre}
        />
        <aside
          id="panneau-edition"
          aria-label="Panneau d'édition"
          className={cn(
            "min-h-0 overflow-y-auto border-line bg-background max-lg:h-[50dvh] max-lg:border-t lg:w-[380px] lg:shrink-0 lg:border-l",
            !panneauOuvert && "max-lg:hidden",
          )}
        >
          <PanneauEdition
            champs={champs}
            valeurs={valeurs}
            modifiees={modifiees}
            cleSelectionnee={cleSelectionnee}
            erreurs={erreurs}
            medias={medias}
            onChange={surChangement}
          />
        </aside>
      </div>

      <DialogueConflit
        conflits={enr.conflits}
        libelles={libelles}
        onGarder={enr.garderMaVersion}
        onRecharger={enr.recharger}
        onFermer={enr.fermerConflit}
      />
      {wf.ecran ? (
        <EcranDiff
          key={wf.ecran.cle}
          intention={wf.ecran.intention}
          changements={wf.changements}
          medias={wf.detail.medias}
          soumission={wf.soumission}
          enCours={wf.occupe}
          erreur={wf.erreurEcran}
          onFermer={wf.fermerEcran}
          onPublier={(cles) => void wf.publier(cles)}
          onRejeter={(cles) => void wf.rejeter(cles)}
        />
      ) : null}
      {wf.soumissionOuverte ? (
        <DialogueSoumission
          enCours={wf.occupe}
          enregistrementPrealable={nbModifs > 0}
          erreur={wf.erreurSoumission}
          onFermer={wf.fermerSoumission}
          onSoumettre={(note) => void wf.soumettre(note)}
        />
      ) : null}
      {wf.historiqueOuvert ? (
        <PanneauHistorique
          page={page}
          champs={wf.detail.champs}
          medias={wf.detail.medias}
          estAdmin={estAdmin}
          modificationsLocales={nbModifs > 0}
          restauration={wf.restauration}
          onFermer={wf.fermerHistorique}
          onRestaurer={(cle, version) => void wf.restaurer(cle, version)}
        />
      ) : null}
      <StatusDialog
        open={wf.retour !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) wf.fermerRetour();
        }}
        variant={wf.retour?.variant ?? "info"}
        title={wf.retour?.titre ?? ""}
        description={wf.retour?.description}
      />
      <StatusDialog
        open={enr.retour !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) enr.fermerRetour();
        }}
        variant={enr.retour?.variant ?? "error"}
        title={enr.retour?.titre ?? ""}
        description={enr.retour?.description}
      />
    </div>
  );
}
