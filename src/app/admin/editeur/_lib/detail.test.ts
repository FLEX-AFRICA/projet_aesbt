import { describe, expect, it } from "vitest";

import { lireChamps } from "./champs";
import { lireDetail, lireHistorique, lireResume, lireSoumission, lireSoumissions } from "./detail";

const meta =
  lireChamps({
    champs: [
      { cle: "p.t", type: "texte", libelle: "Titre", groupe: "G" },
      { cle: "p.l", type: "liste", valeur: [{ a: "x" }] },
    ],
  }) ?? [];

describe("lireDetail", () => {
  it("renvoie null si la forme est invalide", () => {
    expect(lireDetail(null, meta)).toBeNull();
    expect(lireDetail({ champs: "x" }, meta)).toBeNull();
  });

  it("brouillon null : pas de brouillon ; source inconnue : défaut", () => {
    const detail = lireDetail(
      {
        champs: [
          { cle: "p.t", valeur: "V", defaut: "D", source: "autre", brouillon: null },
          {
            cle: "p.l",
            valeur: [{ a: "1" }],
            defaut: [],
            source: "publie",
            brouillon: [{ a: "2" }],
          },
        ],
      },
      meta,
    );
    expect(detail?.champs[0]).toMatchObject({
      valeur: "V",
      defaut: "D",
      source: "defaut",
      brouillon: undefined,
    });
    expect(detail?.champs[1]).toMatchObject({ source: "publie", brouillon: [{ a: "2" }] });
  });

  it("remplace une valeur illisible par null et ignore les clés hors registre", () => {
    const detail = lireDetail(
      {
        champs: [
          { cle: "p.t", valeur: { objet: 1 }, defaut: [[1]], brouillon: undefined },
          { cle: "inconnue", valeur: "x" },
          { valeur: "sans clé" },
        ],
      },
      meta,
    );
    expect(detail?.champs).toHaveLength(1);
    expect(detail?.champs[0]).toMatchObject({ valeur: null, defaut: null });
  });

  it("garde les médias bien formés et ignore les autres", () => {
    const detail = lireDetail(
      {
        champs: [],
        medias: { m1: { chemin: "a/b", alt: "Alt" }, m2: { chemin: "c" }, m3: { alt: "x" }, m4: 3 },
      },
      meta,
    );
    expect(detail?.medias).toEqual({
      m1: { chemin: "a/b", alt: "Alt" },
      m2: { chemin: "c", alt: "" },
    });
  });
});

describe("soumissions", () => {
  it("ignore une soumission sans date ou sans page", () => {
    expect(lireSoumission({ page: "p" })).toBeNull();
    expect(lireSoumission({ soumis_le: "2026-01-01" })).toBeNull();
    expect(lireSoumission(null)).toBeNull();
    expect(lireSoumission({ soumis_le: "2026-01-01" }, "accueil")).toMatchObject({
      page: "accueil",
    });
  });

  it("note vide ou non textuelle : null", () => {
    const base = { page: "p", soumis_le: "2026-01-01" };
    expect(lireSoumission({ ...base, note: "  " })?.note).toBeNull();
    expect(lireSoumission({ ...base, note: 4 })?.note).toBeNull();
    expect(lireSoumission({ ...base, note: "À relire", soumis_par_nom: "Awa" })).toMatchObject({
      note: "À relire",
      soumisParNom: "Awa",
    });
  });

  it("lireSoumissions filtre les entrées invalides", () => {
    expect(lireSoumissions({ soumissions: [{ page: "p", soumis_le: "x" }, {}, 3] })).toHaveLength(
      1,
    );
    expect(lireSoumissions(null)).toEqual([]);
  });
});

describe("lireResume et lireHistorique", () => {
  it("lireResume", () => {
    expect(lireResume({})).toBeNull();
    expect(
      lireResume({
        pages: [
          { page: "accueil", cles_brouillon: 2, soumission: { soumis_le: "2026-01-01" } },
          { page: "association" },
          { cles_brouillon: 1 },
        ],
      }),
    ).toEqual([
      {
        page: "accueil",
        clesBrouillon: 2,
        soumission: { page: "accueil", soumisParNom: null, soumisLe: "2026-01-01", note: null },
      },
      { page: "association", clesBrouillon: 0, soumission: null },
    ]);
  });

  it("lireHistorique ignore les lignes incomplètes", () => {
    expect(lireHistorique({})).toBeNull();
    const res = lireHistorique({
      versions: [
        {
          id: 1,
          cle: "p.t",
          version: 2,
          created_at: "2026-01-01",
          valeur_avant: "a",
          valeur_apres: "b",
          acteur_nom: "Awa",
        },
        { id: "2", cle: "p.t", version: 3, created_at: "x" },
        { id: 3, cle: "p.t", version: 1, created_at: "2026-01-02", valeur_avant: { x: {} } },
      ],
    });
    expect(res).toHaveLength(2);
    expect(res?.[0]).toMatchObject({ acteurNom: "Awa", avant: "a", apres: "b" });
    expect(res?.[1]).toMatchObject({ avant: null, apres: null, acteurNom: null });
  });
});
