"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  creerPublication,
  modifierPublication,
  programmerPublication,
  type ChampsPublication,
} from "../actions";
import { ChampSuggere } from "../_kit";

const TYPES = [
  { valeur: "actualite", libelle: "Actualité" },
  { valeur: "annonce", libelle: "Annonce" },
  { valeur: "excellence", libelle: "Excellence" },
  { valeur: "actualite_scientifique", libelle: "Actualité scientifique" },
  { valeur: "page", libelle: "Page" },
];

export interface ValeursInitiales {
  id?: string;
  type: string;
  titre: string;
  chapeau: string;
  corps: string;
  categorie: string;
  couverture_id: string;
  source_url: string;
  statut?: string;
  planifie_le?: string | null;
}

/**
 * Rédaction d'un contenu.
 *
 * Le corps est en Markdown : c'est le format le plus simple à reprendre dans
 * dix ans, et le seul qui reste lisible si l'interface disparaît. Un éditeur
 * visuel enfermerait le contenu dans une structure propriétaire.
 */
export function EditeurPublication({
  initiales,
  medias,
  suggestionsCategorie,
}: {
  initiales: ValeursInitiales;
  medias: { id: string; alt: string; vignette: string | null }[];
  /** Catégories déjà utilisées, proposées pendant la saisie (la saisie libre reste permise). */
  suggestionsCategorie: string[];
}) {
  const router = useRouter();
  const [v, setV] = useState<ValeursInitiales>(initiales);
  const [message, setMessage] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  const [quand, setQuand] = useState("");

  const estNouveau = !v.id;

  const champs = (publier: boolean): ChampsPublication => ({
    type: v.type,
    titre: v.titre.trim(),
    chapeau: v.chapeau.trim() || null,
    corps: v.corps.trim() || null,
    categorie: v.categorie.trim() || null,
    couverture_id: v.couverture_id || null,
    universite_id: null,
    source_url: v.source_url.trim() || null,
    publier,
    planifie_le: null,
  });

  const enregistrer = (publier: boolean) =>
    demarrer(async () => {
      setMessage(null);

      if (v.titre.trim().length < 3) {
        setMessage({ ton: "erreur", texte: "Le titre doit faire au moins 3 caractères." });
        return;
      }

      if (estNouveau) {
        const resultat = await creerPublication(champs(publier));
        if (resultat.ok && resultat.id) {
          router.replace(`/admin/publications/${resultat.id}`);
          router.refresh();
        } else {
          setMessage({ ton: "erreur", texte: resultat.message ?? "Création impossible." });
        }
        return;
      }

      const { type: _type, publier: _publier, planifie_le: _p, ...modifiables } = champs(false);
      void _type;
      void _publier;
      void _p;

      const resultat = await modifierPublication(v.id!, modifiables);
      setMessage(
        resultat.ok
          ? { ton: "ok", texte: "Enregistré." }
          : { ton: "erreur", texte: resultat.message ?? "Enregistrement impossible." },
      );
      if (resultat.ok) router.refresh();
    });

  const programmer = () =>
    demarrer(async () => {
      setMessage(null);
      if (!v.id || !quand) return;

      const resultat = await programmerPublication(v.id, new Date(quand).toISOString());
      setMessage(
        resultat.ok
          ? { ton: "ok", texte: "Publication programmée." }
          : { ton: "erreur", texte: resultat.message ?? "Programmation impossible." },
      );
      if (resultat.ok) router.refresh();
    });

  const champ =
    "rounded-md border border-line bg-frost px-3 py-2 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40";

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        {estNouveau ? (
          <label className="grid gap-2">
            <span className="text-[13px] font-medium text-ink">Type</span>
            <select
              value={v.type}
              onChange={(e) => setV({ ...v, type: e.target.value })}
              className={champ}
            >
              {TYPES.map((t) => (
                <option key={t.valeur} value={t.valeur}>
                  {t.libelle}
                </option>
              ))}
            </select>
            <span className="text-[12px] text-muted-ink">
              Le type ne pourra plus être changé ensuite : il détermine l'adresse de la page.
            </span>
          </label>
        ) : null}

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Titre</span>
          <input
            value={v.titre}
            onChange={(e) => setV({ ...v, titre: e.target.value })}
            className={champ}
            maxLength={200}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Chapeau</span>
          <textarea
            value={v.chapeau}
            onChange={(e) => setV({ ...v, chapeau: e.target.value })}
            rows={2}
            maxLength={500}
            className={champ}
          />
          <span className="text-[12px] text-muted-ink">
            Une ou deux phrases. C'est ce qui s'affiche dans les listes et dans l'aperçu lorsqu'un
            lien est partagé sur les réseaux sociaux.
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Contenu</span>
          <textarea
            value={v.corps}
            onChange={(e) => setV({ ...v, corps: e.target.value })}
            rows={18}
            className={`${champ} font-mono text-[14px] leading-relaxed`}
          />
          <span className="text-[12px] text-muted-ink">
            Markdown accepté : <code>## Titre</code>, <code>**gras**</code>,{" "}
            <code>[lien](https://…)</code>. Une ligne vide sépare deux paragraphes.
          </span>
        </label>
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-line bg-surface/60 p-5">
          <h2 className="text-[13px] font-semibold text-ink">Publication</h2>

          {!estNouveau ? (
            <p className="mt-2 text-[13px] text-muted-ink">
              Statut : <span className="font-medium text-ink">{v.statut}</span>
              {v.planifie_le ? `, programmé le ${v.planifie_le.slice(0, 10)}` : null}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enCours}
              onClick={() => enregistrer(false)}
              className="rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface disabled:opacity-50"
            >
              {enCours ? "…" : estNouveau ? "Enregistrer en brouillon" : "Enregistrer"}
            </button>

            {estNouveau ? (
              <button
                type="button"
                disabled={enCours}
                onClick={() => enregistrer(true)}
                className="rounded-md bg-accent-blue px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Créer et publier
              </button>
            ) : null}
          </div>

          {!estNouveau && v.statut !== "publie" ? (
            <div className="mt-5 border-t border-line/70 pt-4">
              <label className="grid gap-2">
                <span className="text-[13px] font-medium text-ink">Publier plus tard</span>
                <input
                  type="datetime-local"
                  value={quand}
                  onChange={(e) => setQuand(e.target.value)}
                  className={champ}
                />
              </label>
              <button
                type="button"
                disabled={enCours || !quand}
                onClick={programmer}
                className="mt-3 rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-surface disabled:opacity-40"
              >
                Programmer
              </button>
            </div>
          ) : null}

          {message ? (
            <p
              role="alert"
              className={`mt-4 text-[13px] ${
                message.ton === "ok" ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {message.texte}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-line bg-surface/60 p-5">
          <h2 className="text-[13px] font-semibold text-ink">Image de couverture</h2>
          <p className="mt-1 text-[12px] text-muted-ink">
            S'affiche en tête de la page et dans l'aperçu des liens partagés.
          </p>

          {medias.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted-ink">
              Aucun média. Ajoutez-en depuis la médiathèque.
            </p>
          ) : (
            <div className="mt-3 grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto">
              <button
                type="button"
                onClick={() => setV({ ...v, couverture_id: "" })}
                aria-pressed={!v.couverture_id}
                className="grid aspect-square place-items-center rounded-md border border-line text-[11px] text-muted-ink aria-pressed:border-accent-blue aria-pressed:bg-accent-blue/10"
              >
                Aucune
              </button>
              {medias.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => setV({ ...v, couverture_id: media.id })}
                  aria-pressed={v.couverture_id === media.id}
                  title={media.alt}
                  className="overflow-hidden rounded-md border border-line aria-pressed:border-accent-blue aria-pressed:ring-2 aria-pressed:ring-accent-blue/30"
                >
                  {media.vignette ? (
                    <img
                      src={media.vignette}
                      alt={media.alt}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <span className="grid aspect-square place-items-center text-[10px] text-muted-ink">
                      ?
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface/60 p-5">
          <h2 className="text-[13px] font-semibold text-ink">Classement</h2>

          <div className="mt-3 grid gap-2">
            <label htmlFor="champ-categorie" className="text-[13px] font-medium text-ink">
              Catégorie
            </label>
            <ChampSuggere
              id="champ-categorie"
              value={v.categorie}
              onChange={(categorie) => setV({ ...v, categorie })}
              suggestions={suggestionsCategorie}
              className={champ}
              maxLength={80}
              placeholder="Vie associative…"
            />
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-[13px] font-medium text-ink">Lien d'origine</span>
            <input
              type="url"
              value={v.source_url}
              onChange={(e) => setV({ ...v, source_url: e.target.value })}
              className={champ}
              placeholder="https://facebook.com/…"
            />
            <span className="text-[12px] text-muted-ink">
              Publication d'origine sur les réseaux sociaux, si elle existe.
            </span>
          </label>
        </div>
      </aside>
    </div>
  );
}
