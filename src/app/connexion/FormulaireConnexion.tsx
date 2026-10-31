"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { ChampVerre } from "@/components/auth/ChampVerre";
import { CLASSE_BOUTON, CLASSE_ENTREE, CLASSE_ERREUR } from "@/components/auth/styles";
import { baseApi } from "@/lib/base-api";
import { destinationApresConnexion } from "@/lib/destination";

/**
 * Connexion.
 *
 * L'appel va directement à l'API, et non à une route Next : c'est elle qui
 * dépose le cookie de session sur `.aesbt.org`. `credentials: "include"` est
 * indispensable pour que le navigateur accepte ce cookie émis par un
 * sous-domaine.
 */
export function FormulaireConnexion({ suite }: { suite: string | null }) {
  const router = useRouter();
  /*
   * Évalué au rendu, pas à l'import : l'adresse de l'API dépend de l'hôte de
   * la page, qui n'est connu que dans le navigateur.
   */
  const API = baseApi();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  /*
   * Deuxième étape, imposée aux comptes administrateurs : Better Auth ne
   * délivre pas de session à la connexion quand la 2FA est active, il répond
   * « twoFactorRedirect » et attend le code de l'application
   * d'authentification.
   */
  const [etapeTotp, setEtapeTotp] = useState(false);

  /*
   * La destination dépend du rôle, et le rôle n'est connu qu'une fois la
   * session ouverte : administration pour le bureau, Cellule Scientifique
   * pour les mentors et les étudiants. Envoyer tout le monde vers /admin
   * faisait atterrir les étudiants sur un « accès réservé ».
   *
   * Un compte en attente, refusé ou suspendu part aussi vers /cellule : ce
   * sont ses écrans qui expliquent la situation, et c'est plus clair qu'une
   * page de connexion qui refuse sans dire pourquoi.
   */
  const reussir = async () => {
    let role = "etudiant";

    try {
      const reponse = await fetch(`${API}/api/v1/me`, { credentials: "include" });

      if (reponse.ok) {
        const corps = (await reponse.json()) as { profil?: { role?: string } };
        role = corps.profil?.role ?? role;
      }
    } catch {
      // Repli sur l'espace membre : il est accessible à tous les rôles.
    }

    // `refresh()` force les composants serveur à relire la session.
    router.replace(destinationApresConnexion(role, suite));
    router.refresh();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);

    setEnCours(true);
    setErreur(null);

    if (!API) {
      setEnCours(false);
      setErreur("L'API n'est pas configurée sur cet environnement.");
      return;
    }

    try {
      const reponse = await fetch(`${API}/auth/sign-in/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: String(donnees.get("email") ?? ""),
          password: String(donnees.get("password") ?? ""),
        }),
      });

      if (reponse.ok) {
        const corps = (await reponse.json().catch(() => ({}))) as {
          twoFactorRedirect?: boolean;
        };

        if (corps.twoFactorRedirect) {
          setEtapeTotp(true);
          return;
        }

        await reussir();
        return;
      }

      const corps = (await reponse.json().catch(() => ({}))) as { message?: string };

      setErreur(
        reponse.status === 429
          ? "Trop de tentatives. Réessayez dans un quart d'heure."
          : reponse.status === 403
            ? "Confirmez votre adresse e-mail avant de vous connecter."
            : (corps.message ?? "Adresse ou mot de passe incorrect."),
      );
    } catch {
      setErreur("Service injoignable. Réessayez plus tard.");
    } finally {
      setEnCours(false);
    }
  };

  const onTotp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();

    setEnCours(true);
    setErreur(null);

    try {
      const reponse = await fetch(`${API}/auth/two-factor/verify-totp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (reponse.ok) {
        await reussir();
        return;
      }

      setErreur("Code incorrect ou expiré.");
    } catch {
      setErreur("Service injoignable. Réessayez plus tard.");
    } finally {
      setEnCours(false);
    }
  };

  if (etapeTotp) {
    return (
      <form
        onSubmit={onTotp}
        className="animate-element animate-delay-300 mt-8 grid gap-5"
        aria-busy={enCours}
      >
        <p className="rounded-2xl border border-line bg-ink/[0.03] p-4 text-[13px] leading-relaxed text-muted-ink">
          Saisissez le code à six chiffres affiché par votre application d'authentification.
        </p>

        <ChampVerre htmlFor="connexion-code" label="Code de vérification">
          <input
            id="connexion-code"
            required
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            autoFocus
            className={`${CLASSE_ENTREE} text-center font-mono text-[18px] tracking-[0.3em]`}
          />
        </ChampVerre>

        <button type="submit" disabled={enCours} className={CLASSE_BOUTON}>
          {enCours ? "Vérification…" : "Vérifier"}
        </button>

        {erreur ? (
          <p role="alert" className={CLASSE_ERREUR}>
            {erreur}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="animate-element animate-delay-300 mt-8 grid gap-5"
      aria-busy={enCours}
    >
      <ChampVerre htmlFor="connexion-email" label="Adresse e-mail">
        <input
          id="connexion-email"
          required
          type="email"
          name="email"
          autoComplete="email"
          className={CLASSE_ENTREE}
        />
      </ChampVerre>

      <ChampMotDePasse label="Mot de passe" name="password" autoComplete="current-password" />

      <button type="submit" disabled={enCours} className={`mt-1 ${CLASSE_BOUTON}`}>
        {enCours ? "Connexion…" : "Se connecter"}
      </button>

      {erreur ? (
        <p role="alert" className={CLASSE_ERREUR}>
          {erreur}
        </p>
      ) : null}
    </form>
  );
}
