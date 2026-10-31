import { describe, expect, it } from "vitest";

import {
  deduireSousChamps,
  groupeDepuisCle,
  grouperChamps,
  libelleDepuisCle,
  lireChamps,
} from "./champs";

describe("libellés et groupes déduits des clés", () => {
  it("libelleDepuisCle", () => {
    expect(libelleDepuisCle("association.hero.titre")).toBe("Hero titre");
    expect(libelleDepuisCle("association.missions")).toBe("Missions");
    expect(libelleDepuisCle("seul")).toBe("Seul");
  });

  it("groupeDepuisCle", () => {
    expect(groupeDepuisCle("association.hero.titre")).toBe("Hero");
    expect(groupeDepuisCle("association.missions")).toBe("Général");
  });
});

describe("deduireSousChamps", () => {
  it("déduit nombre, lien, image, texte long et texte", () => {
    const res = deduireSousChamps([
      { titre: "t", n: 3, lien: "/a", photo: null, resume: "x".repeat(100), note: "a\nb" },
    ]);
    expect(Object.fromEntries(res.map((s) => [s.nom, s.type]))).toEqual({
      titre: "texte",
      n: "nombre",
      lien: "lien",
      photo: "image",
      resume: "texte_long",
      note: "texte_long",
    });
  });
});

describe("lireChamps", () => {
  it("renvoie null si la forme générale est invalide", () => {
    expect(lireChamps(null)).toBeNull();
    expect(lireChamps({})).toBeNull();
    expect(lireChamps({ champs: "x" })).toBeNull();
  });

  it("normalise un champ minimal et retombe sur texte pour un type inconnu", () => {
    const [champ] =
      lireChamps({ champs: [{ cle: "accueil.hero.titre", type: "bizarre", valeur: "V" }] }) ?? [];
    expect(champ).toMatchObject({
      cle: "accueil.hero.titre",
      type: "texte",
      libelle: "Hero titre",
      groupe: "Hero",
      max: null,
      version: 0,
      base: "V",
    });
  });

  it("préfère le brouillon, ignore les entrées sans clé", () => {
    const champs =
      lireChamps({
        champs: [
          { cle: "p.a", type: "texte", valeur: "publié", brouillon: "brouillon" },
          { type: "texte" },
          { cle: "", type: "texte" },
          "pas un objet",
        ],
      }) ?? [];
    expect(champs).toHaveLength(1);
    expect(champs[0]?.base).toBe("brouillon");
  });

  it("trie par ordre puis garde l'ordre de réception à défaut", () => {
    const champs =
      lireChamps({
        champs: [
          { cle: "p.c", type: "texte", ordre: 5 },
          { cle: "p.a", type: "texte", ordre: 1 },
          { cle: "p.b", type: "texte", ordre: 3 },
        ],
      }) ?? [];
    expect(champs.map((c) => c.cle)).toEqual(["p.a", "p.b", "p.c"]);
  });

  it("lit les sous-champs déclarés ou les déduit des valeurs", () => {
    const [declare, deduit] =
      lireChamps({
        champs: [
          {
            cle: "p.l1",
            type: "liste",
            champs: [{ nom: "titre", type: "texte", max: 50 }, { nom: "" }],
            valeur: [],
          },
          { cle: "p.l2", type: "liste", valeur: [{ titre: "x", n: 2 }] },
        ],
      }) ?? [];
    expect(declare?.sousChamps).toEqual([
      { nom: "titre", type: "texte", libelle: "Titre", max: 50 },
    ]);
    expect(deduit?.sousChamps?.map((s) => s.type)).toEqual(["texte", "nombre"]);
  });

  it("garde les bornes numériques", () => {
    const [champ] =
      lireChamps({
        champs: [{ cle: "p.n", type: "nombre", min_valeur: 1, max_valeur: 9, valeur: 3 }],
      }) ?? [];
    expect(champ).toMatchObject({ minValeur: 1, maxValeur: 9, base: 3 });
  });
});

describe("grouperChamps", () => {
  it("regroupe en gardant l'ordre de première apparition", () => {
    const champs =
      lireChamps({
        champs: [
          { cle: "p.x.a", type: "texte" },
          { cle: "p.y.b", type: "texte" },
          { cle: "p.x.c", type: "texte" },
        ],
      }) ?? [];
    const groupes = grouperChamps(champs);
    expect(groupes.map((g) => g.groupe)).toEqual(["X", "Y"]);
    expect(groupes[0]?.champs.map((c) => c.cle)).toEqual(["p.x.a", "p.x.c"]);
  });
});
