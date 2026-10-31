"use client";

import { Lock, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import type { CompteRecherche } from "@/lib/api-admin-poles";

import { Avatar } from "../_gestion/Avatar";
import {
  ChampFormulaire,
  ChampSuggere,
  classeChamp,
  TiroirFormulaire,
  type MediaChoisissable,
} from "../_kit";
import { ChampCouverture } from "../_commun/ChampCouverture";
import { useEnregistrement } from "../_commun/useEnregistrement";
import { nullSiVide, valider } from "../_commun/validation";
import { Vignette } from "../_commun/Vignette";
import { RechercheComptes } from "../poles/RechercheComptes";
import {
  creerMembre,
  modifierMembre,
  rechercherComptesMembres,
  type EntiteMembre,
} from "./actions";
import type { MembreAdmin } from "./ListeMembres";
import { schemaMembre } from "./validation";

const MESSAGE_COMPTE = "Ces informations viennent du compte de la personne.";

/** Champ grisé en lecture seule, avec l'explication de son origine. */
function ChampLectureSeule({
  libelle,
  valeur,
  fort = false,
}: {
  libelle: string;
  valeur: string;
  fort?: boolean;
}) {
  return (
    <ChampFormulaire libelle={libelle} aide={MESSAGE_COMPTE}>
      {(p) => (
        <input
          {...p}
          readOnly
          disabled
          value={valeur}
          className={`${classeChamp} cursor-not-allowed bg-frost-deep/60 ${
            fort ? "font-medium" : ""
          }`}
        />
      )}
    </ChampFormulaire>
  );
}

/** Carte du compte choisi ou lié : avatar, nom et e-mail bien visible. */
function CarteCompte({
  nom,
  email,
  children,
}: {
  nom: string;
  email?: string | null | undefined;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar nom={nom || email} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-ink">{nom || email}</p>
          {email ? (
            <p className="truncate text-[14px] font-medium text-accent-blue">{email}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

const classeBoutonSecondaire =
  "rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-surface disabled:opacity-50";

/**
 * Création (membre nul) ou modification d'un membre.
 *
 * - Bureau, création : le membre est choisi parmi les comptes existants.
 * - Membre lié à un compte : seuls rôle, mandat et affichage sont modifiables.
 * - Ancien membre sans compte : tout est modifiable, rattachement possible.
 * - Cellule, création : saisie libre, discrète.
 */
export function TiroirMembre({
  membre,
  entiteParDefaut,
  open,
  onOpenChange,
  medias,
  suggestionsRole,
  idsBureau,
  ordreSuivant,
}: {
  membre: MembreAdmin | null;
  entiteParDefaut: EntiteMembre;
  open: boolean;
  onOpenChange: (ouvert: boolean) => void;
  medias: MediaChoisissable[];
  /** Rôles déjà en base, proposés pendant la saisie (la saisie libre reste permise). */
  suggestionsRole: string[];
  /** Comptes déjà membres du bureau, signalés dans la recherche. */
  idsBureau: ReadonlySet<string>;
  /** Premier rang libre à la fin d'une entité (nouveau membre, ou changement d'entité). */
  ordreSuivant: (entite: EntiteMembre) => number;
}) {
  const router = useRouter();
  const lie = Boolean(membre?.compte_lie);
  const [entite, setEntite] = useState<EntiteMembre>(membre?.entite ?? entiteParDefaut);
  const [compte, setCompte] = useState<CompteRecherche | null>(null);
  const [nom, setNom] = useState(membre?.nom ?? "");
  const [role, setRole] = useState(membre?.role ?? "");
  const [photo, setPhoto] = useState<string | null>(membre?.photo_id ?? null);
  const [debut, setDebut] = useState(membre?.mandat_debut ?? "");
  const [fin, setFin] = useState(membre?.mandat_fin ?? "");
  const [actif, setActif] = useState(membre ? Boolean(membre.actif) : true);
  const [erreurCompte, setErreurCompte] = useState<string | null>(null);
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  // Création d'un membre du bureau : un compte existant est obligatoire.
  const creationBureau = !membre && entite === "bureau";
  // Ancien membre du bureau sans compte : rattachement possible, une seule fois.
  const rattachable = Boolean(membre) && !lie && membre?.entite === "bureau";
  const sansCompte = !lie && !creationBureau;

  const enregistrer = () => {
    const verdict = valider(schemaMembre, {
      entite,
      nom: sansCompte ? nom : "",
      role,
      mandat_debut: debut,
      mandat_fin: fin,
    });
    const erreurs = verdict.ok ? {} : verdict.erreurs;
    if (creationBureau && !compte) {
      setErreurCompte("Choisissez d'abord le compte de la personne.");
      lancer(
        { ...erreurs, compte: "x" },
        async () => ({ ok: false }),
        () => undefined,
      );
      return;
    }
    setErreurCompte(null);
    lancer(
      erreurs,
      () => {
        const commun = {
          role: role.trim(),
          mandat_debut: nullSiVide(debut),
          mandat_fin: nullSiVide(fin),
          actif,
        };
        if (membre && lie) return modifierMembre(membre.id, commun);
        if (creationBureau && compte) {
          return creerMembre({
            entite: "bureau",
            user_id: compte.id,
            ...commun,
            ordre: ordreSuivant("bureau"),
          });
        }
        const champs = {
          entite,
          nom: nullSiVide(nom),
          photo_id: photo,
          ...commun,
          ...(compte ? { user_id: compte.id } : {}),
          // Nouveau membre ou changement d'entité : placé en fin de liste.
          ...(!membre || membre.entite !== entite ? { ordre: ordreSuivant(entite) } : {}),
        };
        return membre ? modifierMembre(membre.id, champs) : creerMembre(champs);
      },
      () => {
        onOpenChange(false);
        router.refresh();
      },
    );
  };

  const champRole = (
    <ChampFormulaire libelle="Rôle" requis erreur={erreursChamps["role"]}>
      {(p) => (
        <ChampSuggere
          {...p}
          value={role}
          onChange={setRole}
          suggestions={suggestionsRole}
          maxLength={120}
          disabled={enCours}
        />
      )}
    </ChampFormulaire>
  );

  const champsMandat = (
    <div className="grid gap-5 sm:grid-cols-2">
      <ChampFormulaire
        libelle="Début du mandat"
        aide="Texte libre, par exemple 2025."
        erreur={erreursChamps["mandat_debut"]}
      >
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={debut}
            maxLength={20}
            disabled={enCours}
            onChange={(e) => setDebut(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Fin du mandat"
        aide="Vide si le mandat est en cours."
        erreur={erreursChamps["mandat_fin"]}
      >
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={fin}
            maxLength={20}
            disabled={enCours}
            onChange={(e) => setFin(e.target.value)}
          />
        )}
      </ChampFormulaire>
    </div>
  );

  const caseActif = (
    <label className="flex items-center gap-2 text-[14px] text-ink">
      <input
        type="checkbox"
        checked={actif}
        disabled={enCours}
        onChange={(e) => setActif(e.target.checked)}
        className="size-4 accent-[var(--color-accent-blue)]"
      />
      Membre actif (affiché sur le site)
    </label>
  );

  const choixCompte = (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium text-ink">
        Compte de la personne
        <span aria-hidden="true" className="text-accent-red">
          {" *"}
        </span>
      </p>
      {compte ? (
        <CarteCompte nom={compte.nom ?? ""} email={compte.email}>
          <button
            type="button"
            disabled={enCours}
            onClick={() => setCompte(null)}
            className={classeBoutonSecondaire}
          >
            Changer
          </button>
        </CarteCompte>
      ) : (
        <RechercheComptes
          rechercher={rechercherComptesMembres}
          onChoisir={(c) => {
            setCompte(c);
            setErreurCompte(null);
          }}
          exclus={idsBureau}
          libelleExclu="Déjà au bureau"
          desactive={enCours}
        />
      )}
      {creationBureau ? (
        <p className="text-[12px] text-muted-ink">
          Le nom, l'e-mail et la photo sont repris du compte choisi.
        </p>
      ) : null}
      {erreurCompte ? (
        <p role="alert" className="text-[12px] font-medium text-accent-red">
          {erreurCompte}
        </p>
      ) : null}
    </div>
  );

  const titre = !membre ? "Nouveau membre" : "Modifier le membre";
  const description = lie
    ? "Seuls le rôle et le mandat se modifient ici. Le reste vient du compte."
    : creationBureau
      ? "Choisissez un compte existant, puis précisez son rôle au bureau."
      : undefined;

  return (
    <TiroirFormulaire
      open={open}
      onOpenChange={onOpenChange}
      titre={titre}
      description={description}
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      {!membre ? (
        <ChampFormulaire libelle="Entité" requis erreur={erreursChamps["entite"]}>
          {(p) => (
            <select
              {...p}
              className={classeChamp}
              value={entite}
              disabled={enCours}
              onChange={(e) => {
                setEntite(e.target.value === "cellule" ? "cellule" : "bureau");
                setCompte(null);
                setErreurCompte(null);
              }}
            >
              <option value="bureau">Bureau (membre avec un compte)</option>
              <option value="cellule">Cellule scientifique (saisie libre)</option>
            </select>
          )}
        </ChampFormulaire>
      ) : null}

      {creationBureau ? choixCompte : null}

      {membre && lie ? (
        <>
          <div className="flex items-start gap-2 rounded-lg border border-line bg-frost-deep/40 p-3 text-[13px] text-ink-soft">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{MESSAGE_COMPTE} Pour les changer, la personne doit modifier son propre compte.</p>
          </div>
          <CarteCompte nom={membre.nom ?? ""} email={membre.email} />
          <ChampLectureSeule libelle="Nom" valeur={membre.nom ?? ""} fort />
          <ChampLectureSeule
            libelle="E-mail"
            valeur={membre.email ?? "Masqué pour votre rôle"}
            fort
          />
          <ChampLectureSeule
            libelle="Entité"
            valeur={membre.entite === "bureau" ? "Bureau" : "Cellule scientifique"}
          />
          <div className="grid gap-1.5">
            <p className="text-[13px] font-medium text-ink">Photo</p>
            <div className="flex items-center gap-3">
              <Vignette chemin={membre.photo} />
              <p className="text-[12px] text-muted-ink">{MESSAGE_COMPTE}</p>
            </div>
          </div>
        </>
      ) : null}

      {sansCompte ? (
        <>
          {membre ? (
            <p className="rounded-lg border border-line bg-frost-deep/40 p-3 text-[13px] text-ink-soft">
              Ce membre n'est lié à aucun compte, ses informations restent modifiables.
            </p>
          ) : (
            <p className="text-[12px] text-muted-ink">
              Membre de la cellule sans compte : le nom est saisi librement.
            </p>
          )}
          <ChampFormulaire
            libelle="Nom"
            aide="Laissez vide pour un poste sans titulaire."
            erreur={erreursChamps["nom"]}
          >
            {(p) => (
              <input
                {...p}
                className={classeChamp}
                value={nom}
                maxLength={160}
                disabled={enCours}
                onChange={(e) => setNom(e.target.value)}
              />
            )}
          </ChampFormulaire>
        </>
      ) : null}

      {champRole}

      {sansCompte ? (
        <ChampCouverture
          libelle="Photo"
          aide="Portrait choisi dans la médiathèque. Optionnel."
          medias={medias}
          valeur={photo}
          onChange={setPhoto}
          disabled={enCours}
        />
      ) : null}

      {champsMandat}
      {caseActif}

      {rattachable ? (
        <section className="grid gap-3 rounded-xl border border-dashed border-line p-4">
          <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <UserCheck aria-hidden="true" className="size-4" />
            Rattacher à un compte
          </h3>
          <p className="text-[12px] text-muted-ink">
            Le rattachement ne peut être fait qu'une seule fois. Ensuite, le nom, l'e-mail et la
            photo viendront du compte.
          </p>
          {compte ? (
            <CarteCompte nom={compte.nom ?? ""} email={compte.email}>
              <button
                type="button"
                disabled={enCours}
                onClick={() => setCompte(null)}
                className={classeBoutonSecondaire}
              >
                Annuler le rattachement
              </button>
            </CarteCompte>
          ) : (
            <RechercheComptes
              rechercher={rechercherComptesMembres}
              onChoisir={setCompte}
              exclus={idsBureau}
              libelleExclu="Déjà au bureau"
              desactive={enCours}
            />
          )}
        </section>
      ) : null}
    </TiroirFormulaire>
  );
}
