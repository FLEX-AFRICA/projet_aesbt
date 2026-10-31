"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { baseApi } from "@/lib/base-api";

/**
 * Activation de la double authentification.
 *
 * Trois étapes, imposées par Better Auth :
 *   1. confirmer son mot de passe, ce qui renvoie l'URI à enregistrer dans
 *      l'application d'authentification, et les codes de secours ;
 *   2. saisir un premier code, qui prouve que l'enregistrement a réussi ;
 *   3. l'activation devient effective.
 *
 * Les codes de secours ne sont affichés **qu'une seule fois** : sans eux,
 * la perte du téléphone verrouille le compte définitivement.
 */
type Etape = "mot-de-passe" | "verification" | "termine";

export function ActivationDeuxFacteurs() {
  const router = useRouter();
  const API = baseApi();
  const [etape, setEtape] = useState<Etape>("mot-de-passe");
  const [uri, setUri] = useState<string | null>(null);
  const [codesSecours, setCodesSecours] = useState<string[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  /** Le secret lisible, à saisir à la main si la caméra ne lit pas le code. */
  const secret = uri ? new URL(uri).searchParams.get("secret") : null;

  const demarrer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const motDePasse = String(new FormData(e.currentTarget).get("password") ?? "");

    setEnCours(true);
    setErreur(null);

    try {
      const reponse = await fetch(`${API}/auth/two-factor/enable`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: motDePasse }),
      });

      if (!reponse.ok) {
        setErreur("Mot de passe incorrect.");
        return;
      }

      const corps = (await reponse.json()) as {
        totpURI?: string;
        backupCodes?: string[];
      };

      setUri(corps.totpURI ?? null);
      setCodesSecours(corps.backupCodes ?? []);
      setEtape("verification");
    } catch {
      setErreur("Service injoignable. Réessayez plus tard.");
    } finally {
      setEnCours(false);
    }
  };

  const verifier = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (!reponse.ok) {
        setErreur("Code incorrect. Vérifiez l'heure de votre téléphone, puis réessayez.");
        return;
      }

      setEtape("termine");
    } catch {
      setErreur("Service injoignable. Réessayez plus tard.");
    } finally {
      setEnCours(false);
    }
  };

  if (etape === "termine") {
    return (
      <div className="mt-8 max-w-[560px] rounded-xl border border-emerald-300 bg-emerald-50 p-6">
        <h2 className="font-display text-lg text-emerald-900">Double authentification activée</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-emerald-900">
          Votre compte est protégé. À chaque connexion, un code vous sera demandé après votre mot de
          passe.
        </p>
        <button
          type="button"
          onClick={() => {
            router.replace("/admin");
            router.refresh();
          }}
          className="mt-5 rounded-md bg-accent-blue px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Accéder à l'administration
        </button>
      </div>
    );
  }

  if (etape === "verification") {
    return (
      <div className="mt-8 max-w-[640px] space-y-6">
        <section className="rounded-xl border border-line bg-surface/60 p-6">
          <h2 className="font-display text-lg text-ink">1. Enregistrez le compte</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">
            Dans votre application d'authentification, ajoutez un compte et saisissez cette clé.
          </p>

          {secret ? (
            <p className="mt-4 select-all break-all rounded-md border border-line bg-frost px-4 py-3 text-center font-mono text-[15px] tracking-[0.12em] text-ink">
              {secret}
            </p>
          ) : null}
        </section>

        {codesSecours.length > 0 ? (
          <section className="rounded-xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="font-display text-lg text-amber-900">2. Notez vos codes de secours</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-amber-900">
              <strong>Ils ne seront plus jamais affichés.</strong> Sans eux, la perte de votre
              téléphone verrouille définitivement votre compte. Notez-les sur papier et rangez-les
              ailleurs que sur le téléphone.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-[13px] text-amber-900">
              {codesSecours.map((code) => (
                <li key={code} className="select-all rounded bg-white/70 px-3 py-1.5 text-center">
                  {code}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <form onSubmit={verifier} className="rounded-xl border border-line bg-surface/60 p-6">
          <h2 className="font-display text-lg text-ink">3. Confirmez</h2>
          <p className="mt-2 text-[14px] text-muted-ink">
            Saisissez le code à six chiffres affiché par votre application.
          </p>

          <input
            required
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            className="mt-4 w-full max-w-[220px] rounded-md border border-line bg-frost px-3 py-2 text-center font-mono text-[18px] tracking-[0.3em] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
          />

          <div className="mt-5">
            <button
              type="submit"
              disabled={enCours}
              className="rounded-md bg-accent-blue px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {enCours ? "Vérification…" : "Activer"}
            </button>
          </div>

          {erreur ? (
            <p role="alert" className="mt-3 text-[13px] text-red-700">
              {erreur}
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <form
      onSubmit={demarrer}
      className="mt-8 max-w-[420px] rounded-xl border border-line bg-surface/60 p-6"
    >
      <h2 className="font-display text-lg text-ink">Confirmez votre mot de passe</h2>
      <p className="mt-2 text-[14px] text-muted-ink">
        Par sécurité, votre mot de passe est redemandé avant d'activer la double authentification.
      </p>

      <label className="mt-4 grid gap-2">
        <span className="text-[13px] font-medium text-ink">Mot de passe</span>
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          className="rounded-md border border-line bg-frost px-3 py-2 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
        />
      </label>

      <button
        type="submit"
        disabled={enCours}
        className="mt-5 rounded-md bg-accent-blue px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enCours ? "…" : "Continuer"}
      </button>

      {erreur ? (
        <p role="alert" className="mt-3 text-[13px] text-red-700">
          {erreur}
        </p>
      ) : null}
    </form>
  );
}
