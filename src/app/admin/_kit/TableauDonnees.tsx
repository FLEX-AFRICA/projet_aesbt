"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui-aesbt/States";
import { cn } from "@/lib/utils";

/** Description déclarative d'une colonne. */
export interface Colonne<T> {
  /** Identifiant stable de la colonne. */
  cle: string;
  titre: string;
  /** Rendu de la cellule ; par défaut, `valeurTri` convertie en texte. */
  rendu?: (ligne: T) => ReactNode;
  /** Valeur de comparaison. Sa présence rend la colonne triable. */
  valeurTri?: (ligne: T) => string | number | null;
  /** Classes de la cellule et de l'en-tête (largeur, alignement). */
  classe?: string;
}

interface Vide {
  titre: string;
  description?: string;
  action?: ReactNode;
}

const COLLATEUR = new Intl.Collator("fr", { sensitivity: "base", numeric: true });

function comparer(a: string | number | null, b: string | number | null): number {
  if (a === b) return 0;
  // Les valeurs absentes sont toujours reléguées en fin de liste croissante.
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return COLLATEUR.compare(String(a), String(b));
}

/**
 * Tableau générique : colonnes déclaratives, tri simple, recherche texte,
 * pagination côté client, états vide, chargement et erreur.
 * Défile horizontalement sur petit écran.
 */
export function TableauDonnees<T>({
  legende,
  lignes,
  colonnes,
  idLigne,
  rechercheTexte,
  libelleRecherche = "Rechercher",
  taillePage = 10,
  chargement = false,
  erreur,
  vide = { titre: "Aucun élément" },
  className,
}: {
  /** Titre accessible du tableau (lu par les lecteurs d'écran). */
  legende: string;
  lignes: readonly T[];
  colonnes: readonly Colonne<T>[];
  idLigne: (ligne: T) => string;
  /** Texte interrogé par la recherche ; sans lui, la barre de recherche est masquée. */
  rechercheTexte?: (ligne: T) => string;
  libelleRecherche?: string;
  /** Lignes par page ; 0 désactive la pagination. */
  taillePage?: number;
  chargement?: boolean;
  erreur?: string | null;
  vide?: Vide;
  className?: string;
}) {
  const idRecherche = useId();
  const [requete, setRequete] = useState("");
  const [tri, setTri] = useState<{ cle: string; sens: "asc" | "desc" } | null>(null);
  const [pageDemandee, setPageDemandee] = useState(0);

  const visibles = useMemo(() => {
    let resultat = [...lignes];
    const q = requete.trim().toLocaleLowerCase("fr");
    if (q && rechercheTexte) {
      resultat = resultat.filter((l) => rechercheTexte(l).toLocaleLowerCase("fr").includes(q));
    }
    const colonneTri = tri ? colonnes.find((c) => c.cle === tri.cle) : undefined;
    if (tri && colonneTri?.valeurTri) {
      const valeur = colonneTri.valeurTri;
      const sens = tri.sens === "asc" ? 1 : -1;
      resultat.sort((a, b) => sens * comparer(valeur(a), valeur(b)));
    }
    return resultat;
  }, [lignes, requete, tri, colonnes, rechercheTexte]);

  const nbPages = taillePage > 0 ? Math.max(1, Math.ceil(visibles.length / taillePage)) : 1;
  const page = Math.min(pageDemandee, nbPages - 1);
  const affichees =
    taillePage > 0 ? visibles.slice(page * taillePage, (page + 1) * taillePage) : visibles;

  if (chargement) return <LoadingState count={3} {...(className ? { className } : {})} />;
  if (erreur) return <ErrorState message={erreur} />;
  if (lignes.length === 0) {
    return (
      <EmptyState
        title={vide.titre}
        {...(vide.description ? { description: vide.description } : {})}
        {...(vide.action ? { action: vide.action } : {})}
        {...(className ? { className } : {})}
      />
    );
  }

  const basculerTri = (cle: string) => {
    setPageDemandee(0);
    setTri((actuel) => {
      if (actuel?.cle !== cle) return { cle, sens: "asc" };
      return actuel.sens === "asc" ? { cle, sens: "desc" } : null;
    });
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {rechercheTexte ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={idRecherche} className="sr-only">
            {libelleRecherche}
          </label>
          <div className="relative w-full max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
            />
            <input
              id={idRecherche}
              type="search"
              value={requete}
              onChange={(e) => {
                setRequete(e.target.value);
                setPageDemandee(0);
              }}
              placeholder={`${libelleRecherche}...`}
              className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-[14px] text-ink shadow-xs outline-none transition-shadow placeholder:text-muted-ink focus:ring-2 focus:ring-accent-blue/40"
            />
          </div>
          <p role="status" className="text-[12px] text-muted-ink">
            {visibles.length} résultat{visibles.length > 1 ? "s" : ""}
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-frost-deep/30 p-1">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <Table>
            <caption className="sr-only">{legende}</caption>
            <TableHeader>
              <TableRow className="border-line bg-frost-deep/30 hover:bg-frost-deep/30">
                {colonnes.map((col) => {
                  const triable = Boolean(col.valeurTri);
                  const actif = tri?.cle === col.cle ? tri.sens : null;
                  const Icone =
                    actif === "asc" ? ChevronUp : actif === "desc" ? ChevronDown : ChevronsUpDown;
                  return (
                    <TableHead
                      key={col.cle}
                      scope="col"
                      {...(triable
                        ? {
                            "aria-sort":
                              actif === "asc"
                                ? "ascending"
                                : actif === "desc"
                                  ? "descending"
                                  : "none",
                          }
                        : {})}
                      className={cn(
                        "h-11 whitespace-nowrap px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-ink first:pl-5 last:pr-5",
                        col.classe,
                      )}
                    >
                      {triable ? (
                        <button
                          type="button"
                          onClick={() => basculerTri(col.cle)}
                          className="group inline-flex items-center gap-1.5 rounded-sm uppercase tracking-[0.08em] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40"
                        >
                          {col.titre}
                          <Icone
                            aria-hidden="true"
                            className={cn(
                              "size-3.5",
                              actif ? "text-ink" : "opacity-40 group-hover:opacity-100",
                            )}
                          />
                        </button>
                      ) : (
                        col.titre
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {affichees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colonnes.length} className="py-10 text-center text-muted-ink">
                    Aucun résultat pour cette recherche.
                  </TableCell>
                </TableRow>
              ) : (
                affichees.map((ligne) => (
                  <TableRow
                    key={idLigne(ligne)}
                    className="border-line/60 transition-colors hover:bg-frost-deep/25"
                  >
                    {colonnes.map((col) => (
                      <TableCell
                        key={col.cle}
                        className={cn(
                          "px-4 py-4 align-middle text-[14px] text-ink first:pl-5 last:pr-5",
                          col.classe,
                        )}
                      >
                        {col.rendu ? col.rendu(ligne) : (col.valeurTri?.(ligne) ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {taillePage > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-[13px] text-muted-ink">
            <p role="status">
              Affichage de{" "}
              <strong className="font-semibold text-ink tabular-nums">
                {visibles.length === 0 ? 0 : page * taillePage + 1} à{" "}
                {Math.min((page + 1) * taillePage, visibles.length)}
              </strong>{" "}
              sur <strong className="font-semibold text-ink tabular-nums">{visibles.length}</strong>
            </p>
            {nbPages > 1 ? (
              <nav aria-label="Pagination du tableau" className="flex items-center gap-2">
                <span className="tabular-nums">
                  Page {page + 1} sur {nbPages}
                </span>
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPageDemandee(page - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface py-1.5 pl-2 pr-3 font-medium text-ink shadow-xs transition-colors hover:bg-frost-deep/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= nbPages - 1}
                  onClick={() => setPageDemandee(page + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface py-1.5 pl-3 pr-2 font-medium text-ink shadow-xs transition-colors hover:bg-frost-deep/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </nav>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
