"use client";

import { SelecteurMedia } from "../../_kit/SelecteurMedia";
import { ChampFormulaire, classeChamp } from "../../_kit/TiroirFormulaire";
import type { MediaEditeur, TypeScalaire } from "../_lib/types";

/**
 * Contrôle d'un champ scalaire (texte, texte long, lien, image, nombre),
 * utilisé seul ou comme sous-champ d'un élément de liste.
 */
export function ChampScalaire({
  type,
  libelle,
  valeur,
  max,
  erreur,
  medias,
  onChange,
}: {
  type: TypeScalaire;
  libelle: string;
  valeur: string | number | null | undefined;
  max: number | null;
  erreur: string | null;
  medias: readonly MediaEditeur[];
  onChange: (valeur: string | number | null) => void;
}) {
  if (type === "image") {
    const texte = typeof valeur === "string" ? valeur : null;
    const estChemin = texte !== null && texte.startsWith("/");
    return (
      <div className="grid gap-1.5">
        <SelecteurMedia
          libelle={libelle}
          medias={medias}
          valeur={estChemin ? null : texte}
          onChange={onChange}
          {...(estChemin ? { aide: `Image par défaut du site : ${texte}` } : {})}
          messageVide="Aucune image dans la médiathèque."
        />
        {erreur ? (
          <p role="alert" className="text-[12px] font-medium text-accent-red">
            {erreur}
          </p>
        ) : null}
      </div>
    );
  }

  const longueur = typeof valeur === "string" ? valeur.length : 0;
  const compteur =
    (type === "texte" || type === "texte_long") && max !== null
      ? `${longueur} / ${max} caractères`
      : undefined;
  const aide = type === "lien" ? "Adresse http(s) ou chemin interne commençant par /." : compteur;

  return (
    <ChampFormulaire libelle={libelle} erreur={erreur} {...(aide ? { aide } : {})}>
      {(p) => {
        if (type === "texte_long") {
          return (
            <textarea
              {...p}
              rows={5}
              className={classeChamp}
              value={typeof valeur === "string" ? valeur : ""}
              onChange={(e) => onChange(e.target.value)}
            />
          );
        }
        if (type === "nombre") {
          return (
            <input
              {...p}
              type="number"
              inputMode="decimal"
              className={classeChamp}
              value={typeof valeur === "number" ? valeur : ""}
              onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            />
          );
        }
        return (
          <input
            {...p}
            type={type === "lien" ? "url" : "text"}
            // Un chemin interne n'est pas une URL absolue : pas de validation native.
            {...(type === "lien" ? { inputMode: "url" as const } : {})}
            className={classeChamp}
            value={typeof valeur === "string" ? valeur : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      }}
    </ChampFormulaire>
  );
}
