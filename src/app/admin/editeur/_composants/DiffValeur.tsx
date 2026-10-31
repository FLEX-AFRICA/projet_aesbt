"use client";

import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { MediaReference } from "../_lib/detail";
import { diffListe, diffMots, type EntreeListe } from "../_lib/diff";
import type { ElementListe } from "../_lib/liste";
import type { SousChamp, TypeChampEditeur, ValeurContenu } from "../_lib/types";

const MEDIA = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");

/** Texte avec mise en évidence des mots ajoutés (côté « après ») ou retirés (« avant »). */
function TexteDiff({
  avant,
  apres,
  cote,
}: {
  avant: string;
  apres: string;
  cote: "avant" | "apres";
}) {
  const segments = diffMots(avant, apres);
  return (
    <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-ink">
      {segments.map((s, i) => {
        if (s.type === "egal") return <span key={i}>{s.texte}</span>;
        if (s.type === "suppr" && cote === "avant") {
          return (
            <del key={i} className="rounded-sm bg-accent-red/15 text-accent-red">
              {s.texte}
            </del>
          );
        }
        if (s.type === "ajout" && cote === "apres") {
          return (
            <ins key={i} className="rounded-sm bg-accent-green/20 text-ink no-underline">
              {s.texte}
            </ins>
          );
        }
        return null;
      })}
    </p>
  );
}

function Vide() {
  return <span className="text-[13px] italic text-muted-ink">(vide)</span>;
}

/** Vignette d'une image : chemin public, URL ou identifiant résolu par la table `medias`. */
function Vignette({
  valeur,
  medias,
}: {
  valeur: string | number | null | undefined;
  medias: Record<string, MediaReference>;
}) {
  if (typeof valeur !== "string" || valeur === "") return <Vide />;
  let src: string | null = null;
  let alt = "";
  if ((valeur.startsWith("/") && !valeur.startsWith("//")) || /^https?:\/\//i.test(valeur)) {
    src = valeur;
  } else {
    const ref = medias[valeur];
    if (ref && MEDIA) src = `${MEDIA}/${ref.chemin}-thumb.webp`;
    alt = ref?.alt ?? "";
  }
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-frost text-muted-ink">
        {src ? (
          <img src={src} alt={alt} className="size-full object-cover" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-6" />
        )}
      </div>
      {src === null ? (
        <span className="text-[12px] text-muted-ink">Image introuvable ({valeur})</span>
      ) : alt ? (
        <span className="text-[12px] text-muted-ink">{alt}</span>
      ) : null}
    </div>
  );
}

function Colonnes({ avant, apres }: { avant: ReactNode; apres: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 rounded-lg border border-accent-red/30 bg-accent-red/[0.04] p-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-red">
          Avant
        </p>
        {avant}
      </div>
      <div className="min-w-0 rounded-lg border border-accent-green/40 bg-accent-green/[0.05] p-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-green">
          Après
        </p>
        {apres}
      </div>
    </div>
  );
}

function texteDe(v: ValeurContenu | undefined): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

function resumeElement(el: ElementListe, sousChamps: readonly SousChamp[] | null): string {
  const noms = sousChamps?.map((s) => s.nom) ?? Object.keys(el);
  const morceaux = noms.map((n) => el[n]).filter((v) => v !== null && v !== undefined && v !== "");
  return morceaux.length > 0 ? morceaux.map(String).join(" | ") : "(élément vide)";
}

const ETIQUETTES: Record<EntreeListe["statut"], { texte: string; classe: string }> = {
  inchange: { texte: "Inchangé", classe: "bg-frost text-muted-ink" },
  ajoute: { texte: "Ajouté", classe: "bg-accent-green/15 text-accent-green" },
  supprime: { texte: "Supprimé", classe: "bg-accent-red/15 text-accent-red" },
  modifie: { texte: "Modifié", classe: "bg-[#C9961B]/15 text-[#8a6500]" },
};

function LigneListe({
  entree,
  sousChamps,
  medias,
}: {
  entree: EntreeListe;
  sousChamps: readonly SousChamp[] | null;
  medias: Record<string, MediaReference>;
}) {
  const etiquette = ETIQUETTES[entree.statut];
  const noms =
    sousChamps ??
    Object.keys(entree.element).map((nom) => ({
      nom,
      type: "texte" as const,
      libelle: nom,
      max: null,
    }));
  return (
    <li className="rounded-lg border border-line bg-surface/60 p-3">
      <span
        className={cn(
          "mb-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
          etiquette.classe,
        )}
      >
        {etiquette.texte}
      </span>
      {entree.statut === "modifie" && entree.ancien ? (
        <div className="grid gap-3">
          {noms
            .filter((s) => entree.champs?.includes(s.nom))
            .map((s) => (
              <div key={s.nom}>
                <p className="mb-1 text-[12px] font-medium text-muted-ink">{s.libelle}</p>
                {s.type === "image" ? (
                  <Colonnes
                    avant={<Vignette valeur={entree.ancien?.[s.nom]} medias={medias} />}
                    apres={<Vignette valeur={entree.element[s.nom]} medias={medias} />}
                  />
                ) : (
                  <Colonnes
                    avant={
                      entree.ancien?.[s.nom] ? (
                        <TexteDiff
                          avant={texteDe(entree.ancien[s.nom])}
                          apres={texteDe(entree.element[s.nom])}
                          cote="avant"
                        />
                      ) : (
                        <Vide />
                      )
                    }
                    apres={
                      entree.element[s.nom] ? (
                        <TexteDiff
                          avant={texteDe(entree.ancien?.[s.nom])}
                          apres={texteDe(entree.element[s.nom])}
                          cote="apres"
                        />
                      ) : (
                        <Vide />
                      )
                    }
                  />
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {noms.map((s) =>
            s.type === "image" ? (
              <div key={s.nom}>
                <p className="mb-1 text-[12px] font-medium text-muted-ink">{s.libelle}</p>
                <Vignette valeur={entree.element[s.nom]} medias={medias} />
              </div>
            ) : null,
          )}
          <p
            className={cn(
              "break-words text-[14px] text-ink",
              entree.statut === "supprime" && "text-accent-red line-through",
            )}
          >
            {resumeElement(entree.element, sousChamps?.filter((s) => s.type !== "image") ?? null)}
          </p>
        </div>
      )}
    </li>
  );
}

function ListeDiff({
  avant,
  apres,
  sousChamps,
  medias,
}: {
  avant: ValeurContenu;
  apres: ValeurContenu;
  sousChamps: readonly SousChamp[] | null;
  medias: Record<string, MediaReference>;
}) {
  const a = Array.isArray(avant) ? avant : [];
  const b = Array.isArray(apres) ? apres : [];
  const d = diffListe(a, b);
  const resume = [
    d.ajoutes > 0 ? `${d.ajoutes} ajouté${d.ajoutes > 1 ? "s" : ""}` : null,
    d.supprimes > 0 ? `${d.supprimes} supprimé${d.supprimes > 1 ? "s" : ""}` : null,
    d.modifies > 0 ? `${d.modifies} modifié${d.modifies > 1 ? "s" : ""}` : null,
    d.ordreChange ? "ordre changé" : null,
  ].filter((x): x is string => x !== null);

  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium text-ink">
        {resume.length > 0 ? resume.join(", ") : "Aucune différence dans la liste."}
      </p>
      <ul className="grid gap-2">
        {d.entrees.map((entree, i) => (
          <LigneListe key={i} entree={entree} sousChamps={sousChamps} medias={medias} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Rendu « avant / après » d'une valeur selon le type du champ : texte et
 * lien (différences au mot), image (vignettes), nombre, liste (éléments
 * ajoutés, supprimés, modifiés, ordre).
 */
export function DiffValeur({
  type,
  avant,
  apres,
  sousChamps,
  medias,
}: {
  type: TypeChampEditeur;
  avant: ValeurContenu;
  apres: ValeurContenu;
  sousChamps: readonly SousChamp[] | null;
  medias: Record<string, MediaReference>;
}) {
  if (type === "liste") {
    return <ListeDiff avant={avant} apres={apres} sousChamps={sousChamps} medias={medias} />;
  }
  if (type === "image") {
    const v = (x: ValeurContenu) => (Array.isArray(x) ? null : x);
    return (
      <Colonnes
        avant={<Vignette valeur={v(avant)} medias={medias} />}
        apres={<Vignette valeur={v(apres)} medias={medias} />}
      />
    );
  }
  if (type === "nombre") {
    return (
      <Colonnes
        avant={<p className="text-[14px] text-ink">{texteDe(avant) || <Vide />}</p>}
        apres={<p className="text-[14px] text-ink">{texteDe(apres) || <Vide />}</p>}
      />
    );
  }
  const a = texteDe(avant);
  const b = texteDe(apres);
  return (
    <Colonnes
      avant={a ? <TexteDiff avant={a} apres={b} cote="avant" /> : <Vide />}
      apres={b ? <TexteDiff avant={a} apres={b} cote="apres" /> : <Vide />}
    />
  );
}
