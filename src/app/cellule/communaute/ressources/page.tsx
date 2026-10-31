import { ExternalLink, FileText, Link2, Search, Share2, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  cibleRessource,
  lireRessourcesMembre,
  type OrigineRessource,
  type PageRessourcesMembre,
} from "@/lib/api-ressources-membre";
import { formatDate } from "@/lib/format";

import { chargerSuggestionsMembre } from "../../_suggestions";
import { Badge, classeCarte, EnTetePage, EtatVide } from "../../_ui";

export const metadata: Metadata = { title: "Ressources partagées" };

const TAILLE = 12;

interface Recherche {
  q?: string;
  origine?: string;
  categorie?: string;
  page?: string;
}

function origineValide(v: string | undefined): OrigineRessource | undefined {
  return v === "admin" || v === "communaute" ? v : undefined;
}

/** Adresse de la page avec les filtres courants, pour la pagination. */
function lien(r: { q: string; origine?: string; categorie: string }, page: number): string {
  const p = new URLSearchParams();
  if (r.q) p.set("q", r.q);
  if (r.origine) p.set("origine", r.origine);
  if (r.categorie) p.set("categorie", r.categorie);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return `/cellule/communaute/ressources${s ? `?${s}` : ""}`;
}

export default async function RessourcesPartageesPage({
  searchParams,
}: {
  searchParams: Promise<Recherche>;
}) {
  const brut = await searchParams;
  const q = (brut.q ?? "").trim().slice(0, 100);
  const origine = origineValide(brut.origine);
  const categorie = (brut.categorie ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(brut.page ?? "1", 10) || 1);

  let donnees: PageRessourcesMembre | null = null;
  try {
    donnees = await lireRessourcesMembre({
      page,
      taille: TAILLE,
      ...(q ? { q } : {}),
      ...(origine ? { origine } : {}),
      ...(categorie ? { categorie } : {}),
    });
  } catch {
    donnees = null;
  }
  const { categorie: categories } = await chargerSuggestionsMembre(["categorie"]);
  const optionsCategories =
    categorie && !categories.includes(categorie) ? [categorie, ...categories] : categories;

  const entete = (
    <EnTetePage
      icone={Share2}
      titre="Ressources partagées"
      texte="Les documents et liens mis en commun par les membres, après vérification par l'équipe, et ceux de l'association. Ils ne sont visibles que par les membres connectés."
    />
  );

  if (!donnees) {
    return (
      <div className="space-y-6">
        {entete}
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-300/60 bg-red-50 p-5 text-[14px] text-red-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>Impossible de charger les ressources pour le moment. Réessayez dans un instant.</p>
        </div>
      </div>
    );
  }

  const nbPages = Math.max(1, Math.ceil(donnees.total / TAILLE));
  const filtre = { q, ...(origine ? { origine } : {}), categorie };
  const filtresActifs = Boolean(q || origine || categorie);
  const champ =
    "rounded-md border border-line bg-frost px-3 py-2 text-[14px] text-ink outline-none focus:ring-2 focus:ring-accent-blue/40";

  return (
    <div className="space-y-6">
      {entete}

      <form method="get" role="search" className={`${classeCarte} grid gap-4 p-4 sm:grid-cols-4`}>
        <label className="grid gap-1.5 sm:col-span-2">
          <span className="text-[13px] font-medium text-ink">Recherche</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Titre ou description"
            className={champ}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-ink">Origine</span>
          <select name="origine" defaultValue={origine ?? ""} className={champ}>
            <option value="">Toutes</option>
            <option value="communaute">Partagées par la communauté</option>
            <option value="admin">Documents de l'association</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-ink">Catégorie</span>
          <select name="categorie" defaultValue={categorie} className={champ}>
            <option value="">Toutes</option>
            {optionsCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-4">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search aria-hidden="true" className="size-3.5" />
            Filtrer
          </button>
          {filtresActifs ? (
            <Link
              href="/cellule/communaute/ressources"
              className="text-[13px] font-semibold text-accent-blue hover:underline"
            >
              Réinitialiser
            </Link>
          ) : null}
          <span className="text-[13px] text-muted-ink" aria-live="polite">
            {donnees.total} ressource{donnees.total > 1 ? "s" : ""}
          </span>
        </div>
      </form>

      {donnees.ressources.length === 0 ? (
        <EtatVide
          icone={Share2}
          titre={filtresActifs ? "Aucune ressource ne correspond" : "Rien n'a encore été partagé"}
          texte={
            filtresActifs
              ? "Essayez d'élargir la recherche ou de retirer un filtre."
              : "Les propositions des membres acceptées par l'équipe apparaîtront ici."
          }
          action={
            <Link
              href="/cellule/ressources"
              className="text-[13px] font-semibold text-accent-blue hover:underline"
            >
              Proposer une ressource
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {donnees.ressources.map((r) => {
            const cible = cibleRessource(r);
            const estFichier = r.type === "fichier";
            const Icone = estFichier ? FileText : Link2;
            return (
              <li key={r.id} className={`${classeCarte} flex flex-col p-4 sm:p-5`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge ton="info" icone={Icone}>
                    {estFichier ? "Fichier" : "Lien"}
                  </Badge>
                  {r.categorie ? <Badge ton="neutre">{r.categorie}</Badge> : null}
                  {r.filiere_nom ? <Badge ton="neutre">{r.filiere_nom}</Badge> : null}
                </div>
                <h3 className="mt-3 font-display text-[16px] leading-snug text-ink">{r.titre}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-ink">{r.description}</p>
                <p className="mt-3 text-[12px] text-muted-ink">
                  {r.origine === "communaute"
                    ? `Partagé par ${r.propose_par_nom ?? "un membre"}`
                    : "Document de l'association"}
                  {r.publie_le ? `, le ${formatDate(r.publie_le.slice(0, 10))}` : ""}
                </p>
                {cible ? (
                  <a
                    href={cible}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-semibold text-accent-blue hover:underline"
                  >
                    Ouvrir
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {nbPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link
              href={lien(filtre, page - 1)}
              className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface"
            >
              Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[13px] text-muted-ink">
            Page {page} sur {nbPages}
          </span>
          {page < nbPages ? (
            <Link
              href={lien(filtre, page + 1)}
              className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface"
            >
              Suivant
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
