"use client";

import { Clock, Search, UserX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { CompteRecherche } from "@/lib/api-admin-poles";
import { cn } from "@/lib/utils";

import { Avatar } from "../_gestion/Avatar";
import { Pastille } from "../_gestion/Pastille";

export interface ReponseRecherche {
  ok: boolean;
  comptes: CompteRecherche[];
  message?: string;
}

const DELAI_MS = 300;
const MIN_CARACTERES = 2;

/** Date d'inscription relative en français (« il y a 3 jours »), vide si inconnue. */
function inscritDepuis(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const secondes = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const unites: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unite, taille] of unites) {
    if (Math.abs(secondes) >= taille) return rtf.format(Math.round(secondes / taille), unite);
  }
  return "à l'instant";
}

/**
 * Recherche de comptes en direct. À l'ouverture, les comptes les plus
 * récemment inscrits sont déjà listés ; saisir au moins deux caractères les
 * remplace par les résultats (anti-rebond), effacer la saisie revient aux
 * récents. Chaque résultat est un bouton ; les comptes listés dans `exclus`
 * sont signalés « Déjà membre » et ne peuvent pas être choisis.
 */
export function RechercheComptes({
  rechercher,
  onChoisir,
  exclus,
  libelleExclu = "Déjà membre",
  desactive = false,
  placeholder = "Rechercher un nom ou un e-mail",
}: {
  /** Reçoit une requête vide pour obtenir les comptes récents. */
  rechercher: (q: string) => Promise<ReponseRecherche>;
  onChoisir: (compte: CompteRecherche) => void;
  /** Identifiants de comptes déjà membres. */
  exclus?: ReadonlySet<string> | undefined;
  libelleExclu?: string;
  desactive?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const [comptes, setComptes] = useState<CompteRecherche[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  // Numéro de la dernière requête, pour ignorer les réponses périmées.
  const derniere = useRef(0);
  const net = q.trim();
  const tropCourt = net.length === 1;
  const recents = net.length === 0;

  useEffect(() => {
    const numero = ++derniere.current;
    if (net.length === 1) return;
    // Les récents sont chargés tout de suite ; la saisie attend l'anti-rebond.
    const minuteur = setTimeout(
      () => {
        setChargement(true);
        setErreur(null);
        rechercher(net)
          .then((r) => {
            if (numero !== derniere.current) return;
            if (r.ok) setComptes(r.comptes);
            else {
              setComptes([]);
              setErreur(r.message ?? "La recherche a échoué. Réessayez.");
            }
          })
          .catch(() => {
            if (numero !== derniere.current) return;
            setComptes([]);
            setErreur("La recherche a échoué. Vérifiez votre connexion.");
          })
          .finally(() => {
            if (numero === derniere.current) setChargement(false);
          });
      },
      net.length === 0 ? 0 : DELAI_MS,
    );
    return () => clearTimeout(minuteur);
  }, [net, rechercher]);

  const afficherListe = !tropCourt && !chargement && !erreur && comptes.length > 0;

  return (
    <div className="grid gap-3">
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
        />
        <input
          id={id}
          type="search"
          value={q}
          disabled={desactive}
          autoComplete="off"
          maxLength={80}
          placeholder={placeholder}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-full border border-line bg-frost py-2 pl-9 pr-4 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40 disabled:opacity-60"
        />
      </div>

      <div aria-live="polite" className="min-h-6">
        {tropCourt ? (
          <p className="text-[13px] text-muted-ink">
            Saisissez au moins {MIN_CARACTERES} caractères pour lancer la recherche.
          </p>
        ) : chargement ? (
          <p className="text-[13px] text-muted-ink">
            {recents ? "Chargement des derniers inscrits..." : "Recherche en cours..."}
          </p>
        ) : erreur ? (
          <p role="alert" className="text-[13px] text-accent-red">
            {erreur}
          </p>
        ) : comptes.length === 0 ? (
          <p className="flex items-center gap-2 text-[13px] text-muted-ink">
            <UserX aria-hidden="true" className="size-4" />
            {recents
              ? "Aucun compte validé pour le moment."
              : "Aucun compte validé ne correspond à cette recherche."}
          </p>
        ) : recents ? (
          <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-ink">
            <Clock aria-hidden="true" className="size-3.5" />
            Derniers inscrits
          </h3>
        ) : null}
      </div>

      {afficherListe ? (
        <ul className="grid max-h-80 gap-2 overflow-y-auto">
          {comptes.map((c) => {
            const dejaMembre = exclus?.has(c.id) ?? false;
            const depuis = inscritDepuis(c.inscrit_le);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={dejaMembre || desactive}
                  onClick={() => onChoisir(c)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border border-line bg-surface/50 p-3 text-left transition-colors",
                    dejaMembre ? "opacity-60" : "hover:bg-surface",
                  )}
                >
                  <Avatar nom={c.nom || c.email} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ink">
                      {c.nom || c.email || "Compte sans nom"}
                    </span>
                    {c.email ? (
                      <span className="block truncate text-[12px] text-muted-ink">{c.email}</span>
                    ) : null}
                    {c.filiere ? (
                      <span className="block truncate text-[12px] text-ink-soft">{c.filiere}</span>
                    ) : null}
                    {depuis ? (
                      <span className="block truncate text-[12px] text-muted-ink">
                        Inscrit {depuis}
                      </span>
                    ) : null}
                  </span>
                  {dejaMembre ? (
                    <Pastille ton="gris">{libelleExclu}</Pastille>
                  ) : recents ? (
                    <Pastille ton="accent">Récent</Pastille>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
