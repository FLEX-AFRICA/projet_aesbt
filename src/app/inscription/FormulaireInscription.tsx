"use client";

import { Check, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";

import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { ChampVerre } from "@/components/auth/ChampVerre";
import {
  CLASSE_BOUTON,
  CLASSE_ENTREE,
  CLASSE_ERREUR,
  CLASSE_TITRE,
} from "@/components/auth/styles";
import { baseApi } from "@/lib/base-api";

const LONGUEUR_MIN = 12;

/** Niveau de 0 à 4 : longueur, casse, chiffres, symboles. Indicatif seulement. */
function forceMotDePasse(mdp: string): number {
  if (mdp.length === 0) return 0;
  let points = 0;
  if (mdp.length >= LONGUEUR_MIN) points += 1;
  if (mdp.length >= 16) points += 1;
  if (/[a-z]/.test(mdp) && /[A-Z]/.test(mdp)) points += 1;
  if (/\d/.test(mdp) && /[^A-Za-z0-9]/.test(mdp)) points += 1;
  return mdp.length < LONGUEUR_MIN ? Math.min(points, 1) : points;
}

const LIBELLES_FORCE = ["", "Faible", "Moyen", "Bon", "Solide"] as const;
const COULEURS_FORCE = [
  "bg-line",
  "bg-accent-red",
  "bg-accent-gold",
  "bg-accent-green",
  "bg-accent-green",
] as const;

/** Traduit une réponse d'erreur de Better Auth en message français précis. */
function messageErreur(statut: number, code: string | undefined): string {
  if (statut === 429) return "Trop de tentatives. Réessayez dans un quart d'heure.";

  switch (code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.";
    case "PASSWORD_TOO_SHORT":
      return `Mot de passe trop court : ${LONGUEUR_MIN} caractères minimum.`;
    case "PASSWORD_TOO_LONG":
      return "Mot de passe trop long : 256 caractères maximum.";
    case "INVALID_EMAIL":
      return "Cette adresse e-mail n'est pas valide.";
    case "INVALID_PASSWORD":
      return "Ce mot de passe est trop faible. Choisissez-en un plus long et plus varié.";
    default:
      return statut === 422
        ? "Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse."
        : "L'inscription a échoué. Vérifiez les champs et réessayez.";
  }
}

/**
 * Inscription.
 *
 * Comme la connexion, l'appel va directement à l'API (cookie et origines
 * gérés côté API) avec `credentials: "include"`. La vérification d'adresse est
 * obligatoire : aucune session n'est ouverte ici, la personne doit d'abord
 * confirmer son e-mail, puis le bureau valide le compte.
 */
export function FormulaireInscription({ lienConnexion }: { lienConnexion: ReactNode }) {
  const API = baseApi();
  const idRegle = useId();
  const idErreur = useId();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [accepte, setAccepte] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [adresseEnvoyee, setAdresseEnvoyee] = useState<string | null>(null);

  const force = forceMotDePasse(motDePasse);
  const longueurOk = motDePasse.length >= LONGUEUR_MIN;
  const confirmationDiffere = confirmation.length > 0 && confirmation !== motDePasse;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    const nom = String(donnees.get("name") ?? "").trim();
    const email = String(donnees.get("email") ?? "").trim();

    setErreur(null);

    if (!longueurOk) {
      setErreur(`Mot de passe trop court : ${LONGUEUR_MIN} caractères minimum.`);
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!accepte) {
      setErreur("Vous devez accepter les conditions pour vous inscrire.");
      return;
    }
    if (!API) {
      setErreur("L'API n'est pas configurée sur cet environnement.");
      return;
    }

    setEnCours(true);

    try {
      const reponse = await fetch(`${API}/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: nom, email, password: motDePasse }),
      });

      if (reponse.ok) {
        setAdresseEnvoyee(email);
        return;
      }

      const corps = (await reponse.json().catch(() => ({}))) as { code?: string };
      setErreur(messageErreur(reponse.status, corps.code));
    } catch {
      setErreur("Service injoignable. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnCours(false);
    }
  };

  if (adresseEnvoyee) {
    return (
      <div role="status" className="text-center sm:text-left">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent-green/15 text-accent-green sm:mx-0">
          <MailCheck aria-hidden className="size-6" />
        </span>
        <h1 className={`mt-6 ${CLASSE_TITRE}`}>Vérifiez votre boîte mail</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-ink">
          Un lien de confirmation vient d'être envoyé à{" "}
          <strong className="break-all font-semibold text-ink">{adresseEnvoyee}</strong>. Cliquez
          dessus pour confirmer votre adresse. Le bureau validera ensuite votre compte, et vous
          pourrez vous connecter.
        </p>
        <p className="mt-2 text-[13px] text-muted-ink">
          Rien reçu ? Regardez dans les courriers indésirables.
        </p>
        <Link href="/connexion" className={`mt-8 ${CLASSE_BOUTON}`}>
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className={`animate-element animate-delay-100 ${CLASSE_TITRE}`}>Inscription</h1>
      <p className="animate-element animate-delay-200 mt-3 text-[15px] leading-relaxed text-muted-ink">
        Créez votre compte membre. Votre adhésion est ensuite validée par le bureau.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        aria-busy={enCours}
        className="animate-element animate-delay-300 mt-8 grid gap-5"
      >
        <ChampVerre htmlFor="inscription-nom" label="Nom complet">
          <input
            id="inscription-nom"
            required
            name="name"
            autoComplete="name"
            className={CLASSE_ENTREE}
          />
        </ChampVerre>

        <ChampVerre htmlFor="inscription-email" label="Adresse e-mail">
          <input
            id="inscription-email"
            required
            type="email"
            name="email"
            autoComplete="email"
            className={CLASSE_ENTREE}
          />
        </ChampVerre>

        <div className="grid gap-2">
          <ChampMotDePasse
            label="Mot de passe"
            name="password"
            autoComplete="new-password"
            minLength={LONGUEUR_MIN}
            valeur={motDePasse}
            onChange={setMotDePasse}
            decritPar={idRegle}
          />
          <div id={idRegle} className="grid gap-1.5">
            <div className="flex gap-1" aria-hidden>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={`h-1 flex-1 rounded-full ${force >= n ? COULEURS_FORCE[force] : "bg-line"}`}
                />
              ))}
            </div>
            <p className="flex items-center justify-between gap-3 text-[12px] text-muted-ink">
              <span className="flex items-center gap-1.5">
                {longueurOk ? <Check aria-hidden className="size-3.5 text-accent-green" /> : null}
                {LONGUEUR_MIN} caractères minimum
              </span>
              <span aria-live="polite" className="font-medium text-ink">
                {force > 0 ? `Force : ${LIBELLES_FORCE[force]}` : ""}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <ChampMotDePasse
            label="Confirmer le mot de passe"
            name="confirmation"
            autoComplete="new-password"
            valeur={confirmation}
            onChange={setConfirmation}
          />
          {confirmationDiffere ? (
            <p role="alert" className="text-[12px] text-red-800">
              Les deux mots de passe ne correspondent pas.
            </p>
          ) : null}
        </div>

        <label className="flex items-start gap-3 text-[13px] leading-relaxed text-muted-ink">
          <input
            type="checkbox"
            required
            checked={accepte}
            onChange={(e) => setAccepte(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          />
          <span>
            J'accepte que mon inscription soit soumise à validation par le bureau de l'AESBT et que
            mes informations soient utilisées pour la gestion de mon adhésion.
          </span>
        </label>

        <button type="submit" disabled={enCours} className={`mt-1 ${CLASSE_BOUTON}`}>
          {enCours ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
              Création du compte…
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        <div id={idErreur} aria-live="assertive">
          {erreur ? (
            <p role="alert" className={CLASSE_ERREUR}>
              {erreur}
            </p>
          ) : null}
        </div>
      </form>

      {lienConnexion}
    </>
  );
}
