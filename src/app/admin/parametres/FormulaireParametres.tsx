"use client";

import { CircleAlert, CircleCheck, Contact, Globe, Save, type LucideIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { enregistrerParametres } from "../actions";

/**
 * Coordonnées et réseaux sociaux de l'association.
 *
 * Ces valeurs étaient codées en dur et à `null` dans le site, avec une
 * consigne explicite de ne rien inventer. Elles se renseignent désormais ici,
 * sans redéploiement.
 */
const CHAMPS = [
  { cle: "contact.email", libelle: "Adresse e-mail", type: "email", exemple: "contact@aesbt.org" },
  { cle: "contact.telephone", libelle: "Téléphone", type: "tel", exemple: "+216 …" },
  { cle: "contact.adresse", libelle: "Localisation", type: "text", exemple: "Tunis, Tunisie" },
  { cle: "social.facebook", libelle: "Facebook", type: "url", exemple: "https://facebook.com/…" },
  {
    cle: "social.instagram",
    libelle: "Instagram",
    type: "url",
    exemple: "https://instagram.com/…",
  },
  { cle: "social.linkedin", libelle: "LinkedIn", type: "url", exemple: "https://linkedin.com/…" },
  { cle: "social.tiktok", libelle: "TikTok", type: "url", exemple: "https://tiktok.com/@…" },
  { cle: "adhesion.url", libelle: "Lien d'adhésion", type: "url", exemple: "https://…" },
] as const;

/** Regroupement visuel des champs ; l'ordre de `CHAMPS` est conservé dans chaque groupe. */
const GROUPES: { titre: string; aide: string; icone: LucideIcon; prefixe: string }[] = [
  {
    titre: "Coordonnées",
    aide: "Affichées sur la page Contact et dans le pied de page.",
    icone: Contact,
    prefixe: "contact.",
  },
  {
    titre: "Réseaux sociaux",
    aide: "Liens complets, commençant par https://.",
    icone: Globe,
    prefixe: "social.",
  },
  {
    titre: "Adhésion",
    aide: "Destination du bouton d'adhésion du site.",
    icone: Globe,
    prefixe: "adhesion.",
  },
];

export function FormulaireParametres({
  valeursInitiales,
}: {
  valeursInitiales: Record<string, string | null>;
}) {
  const [valeurs, setValeurs] = useState<Record<string, string>>(() =>
    Object.fromEntries(CHAMPS.map((champ) => [champ.cle, valeursInitiales[champ.cle] ?? ""])),
  );
  const [etat, setEtat] = useState<"repos" | "enregistre" | "erreur">("repos");
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <form
      className="mt-8 max-w-[640px] space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setEtat("repos");
        demarrer(async () => {
          // Un champ vidé doit effacer la valeur, pas la laisser telle quelle.
          const charge = Object.fromEntries(
            Object.entries(valeurs).map(([cle, valeur]) => [cle, valeur.trim() || null]),
          );
          const resultat = await enregistrerParametres(charge);
          setEtat(resultat.ok ? "enregistre" : "erreur");
          setMessage(resultat.message ?? null);
        });
      }}
    >
      {GROUPES.map(({ titre, aide, icone: Icone, prefixe }) => (
        <fieldset
          key={prefixe}
          className="grid gap-4 rounded-xl border border-line bg-surface/40 p-5"
        >
          <legend className="sr-only">{titre}</legend>
          <div>
            <h2 className="flex items-center gap-2 font-display text-[16px] text-ink">
              <Icone aria-hidden="true" className="size-4 text-muted-ink" />
              {titre}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-ink">{aide}</p>
          </div>
          {CHAMPS.filter((champ) => champ.cle.startsWith(prefixe)).map((champ) => (
            <label key={champ.cle} className="grid gap-2">
              <span className="text-[13px] font-medium text-ink">{champ.libelle}</span>
              <input
                type={champ.type}
                value={valeurs[champ.cle] ?? ""}
                placeholder={champ.exemple}
                onChange={(e) => setValeurs((v) => ({ ...v, [champ.cle]: e.target.value }))}
                className="rounded-md border border-line bg-frost px-3 py-2 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40"
              />
            </label>
          ))}
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={enCours}
          className="inline-flex items-center gap-2 rounded-md bg-accent-blue px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Save aria-hidden="true" className="size-4" />
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        <p aria-live="polite" className="text-[13px]">
          {etat === "enregistre" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <CircleCheck aria-hidden="true" className="size-4" />
              Enregistré. Le site est à jour.
            </span>
          ) : etat === "erreur" ? (
            <span className="inline-flex items-center gap-1.5 text-red-700">
              <CircleAlert aria-hidden="true" className="size-4" />
              {message ?? "Échec de l'enregistrement."}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
