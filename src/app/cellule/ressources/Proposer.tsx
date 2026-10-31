"use client";

import { Plus, Send } from "lucide-react";
import { useId, useState, useTransition } from "react";

import { ChampSuggere } from "@/app/admin/_kit/ChampSuggere";
import { ajouterFiliere, ajouterNiveau } from "@/components/referentiels/actions";
import { SelectAvecAjout } from "@/components/referentiels/SelectAvecAjout";

import { proposerRessource } from "../actions";

/**
 * Proposition d'une ressource par un membre.
 *
 * Rien n'est publié directement : l'équipe vérifie, puis la ressource est
 * visible des seuls membres connectés (rubrique Communauté). Le formulaire le
 * dit, afin que personne ne croie publier sur le site public.
 */
export function Proposer({
  filieres,
  niveaux,
  categories,
}: {
  filieres: { id: string; nom: string; slug?: string }[];
  niveaux: { id: string; libelle: string }[];
  /** Catégories déjà utilisées en base, proposées à la saisie (saisie libre permise). */
  categories: string[];
}) {
  const idFiliere = useId();
  const idNiveau = useId();
  const [ouvert, setOuvert] = useState(false);
  const [v, setV] = useState({
    titre: "",
    description: "",
    url: "",
    filiere_id: "",
    niveau_id: "",
    categorie: "",
  });
  const [retour, setRetour] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const champ =
    "rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40";

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus aria-hidden="true" className="size-4" />
        Proposer une ressource
      </button>
    );
  }

  return (
    <form
      className="w-full rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setRetour(null);
        demarrer(async () => {
          const resultat = await proposerRessource({
            titre: v.titre.trim(),
            description: v.description.trim(),
            url: v.url.trim(),
            filiere_id: v.filiere_id || null,
            niveau_id: v.niveau_id || null,
            categorie: v.categorie.trim() || null,
          });

          if (resultat.ok) {
            setRetour({ ton: "ok", texte: "Proposition transmise à l'équipe pour vérification." });
            setV({
              titre: "",
              description: "",
              url: "",
              filiere_id: "",
              niveau_id: "",
              categorie: "",
            });
          } else {
            setRetour({ ton: "erreur", texte: resultat.message ?? "Envoi impossible." });
          }
        });
      }}
    >
      <h2 className="font-display text-[16px] text-ink">Proposer une ressource</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-ink">
        Elle sera vérifiée par l'équipe. Si elle est acceptée, elle apparaîtra dans la rubrique
        Communauté, réservée aux membres connectés, et jamais sur le site public. Vous serez prévenu
        de la décision.
      </p>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Titre</span>
          <input
            required
            minLength={5}
            maxLength={200}
            value={v.titre}
            onChange={(e) => setV({ ...v, titre: e.target.value })}
            className={champ}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Lien</span>
          <input
            required
            type="url"
            value={v.url}
            onChange={(e) => setV({ ...v, url: e.target.value })}
            placeholder="https://…"
            className={champ}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">À quoi ça sert</span>
          <textarea
            required
            minLength={20}
            maxLength={1000}
            rows={3}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
            placeholder="En quelques phrases : à qui s'adresse cette ressource, et ce qu'elle apporte."
            className={champ}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid content-start gap-2">
            <label htmlFor={idFiliere} className="text-[13px] font-medium text-ink">
              Filière
            </label>
            <SelectAvecAjout
              id={idFiliere}
              value={v.filiere_id}
              onChange={(filiere_id) => setV({ ...v, filiere_id })}
              options={filieres.map((f) => ({
                valeur: f.id,
                libelle: f.nom,
                technique: f.slug === "autre",
              }))}
              libelleVide="Toutes"
              libelleSaisie="Nom de la filière à ajouter"
              creer={ajouterFiliere}
              disabled={enCours}
            />
          </div>

          <div className="grid content-start gap-2">
            <label htmlFor={idNiveau} className="text-[13px] font-medium text-ink">
              Niveau
            </label>
            <SelectAvecAjout
              id={idNiveau}
              value={v.niveau_id}
              onChange={(niveau_id) => setV({ ...v, niveau_id })}
              options={niveaux.map((n) => ({
                valeur: n.id,
                libelle: n.libelle,
                technique: n.id === "AUTRE",
              }))}
              libelleVide="Tous"
              libelleSaisie="Niveau à ajouter"
              creer={ajouterNiveau}
              maxLength={40}
              disabled={enCours}
            />
          </div>

          <label className="grid gap-2">
            <span className="text-[13px] font-medium text-ink">Catégorie</span>
            <ChampSuggere
              value={v.categorie}
              onChange={(categorie) => setV({ ...v, categorie })}
              suggestions={categories}
              maxLength={80}
              placeholder="Ex. Anatomie"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={enCours}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send aria-hidden="true" className="size-3.5" />
          {enCours ? "Envoi…" : "Proposer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-md border border-line px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-surface"
        >
          Fermer
        </button>

        {retour ? (
          <p
            role="alert"
            className={`text-[13px] ${retour.ton === "ok" ? "text-emerald-700" : "text-red-700"}`}
          >
            {retour.texte}
          </p>
        ) : null}
      </div>
    </form>
  );
}
