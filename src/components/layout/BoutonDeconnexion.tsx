"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { baseApi } from "@/lib/base-api";

/**
 * Déconnexion.
 *
 * L'appel va directement à l'API, comme la connexion : c'est elle qui a
 * déposé le cookie de session, elle seule peut le faire expirer.
 * `credentials: "include"` est indispensable, sans quoi le cookie ne part pas
 * et la session resterait ouverte côté serveur.
 *
 * `refresh()` suit la redirection : sans lui, les composants serveur
 * garderaient en mémoire la session qui vient d'être fermée.
 */
export function BoutonDeconnexion({ className }: { className?: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const API = baseApi();

  const deconnecter = async () => {
    setEnCours(true);

    try {
      await fetch(`${API}/auth/sign-out`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: "{}",
      });
    } catch {
      /*
       * API injoignable : on redirige quand même. Laisser la personne sur un
       * écran authentifié parce que la requête a échoué serait le pire des
       * deux comportements.
       */
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={() => void deconnecter()}
      disabled={enCours}
      className={
        className ??
        "rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface disabled:opacity-50"
      }
    >
      {enCours ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
