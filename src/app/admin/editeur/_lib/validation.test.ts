import { describe, expect, it } from "vitest";

import {
  lienValide,
  normaliserPourEnvoi,
  premiereErreur,
  validerChamp,
  validerModifications,
} from "./validation";
import type { ChampEditeur } from "./types";

const champ = (surcharge: Partial<ChampEditeur>): ChampEditeur => ({
  cle: "p.c",
  type: "texte",
  libelle: "C",
  groupe: "G",
  ordre: 0,
  max: null,
  minValeur: null,
  maxValeur: null,
  sousChamps: null,
  version: 0,
  base: null,
  ...surcharge,
});

describe("validerChamp : texte", () => {
  it("accepte un texte normal et refuse vide, trop long, HTML, contrôle", () => {
    expect(validerChamp(champ({}), "Bonjour")).toEqual({});
    expect(validerChamp(champ({}), "   ")).toEqual({ "": "Valeur vide." });
    expect(validerChamp(champ({}), null)).toEqual({ "": "Valeur vide." });
    expect(validerChamp(champ({ max: 5 }), "abcdef")).toEqual({ "": "Au plus 5 caractères." });
    expect(validerChamp(champ({}), "<b>")[""]).toMatch(/Texte brut/);
    expect(validerChamp(champ({}), "a\u0001b")[""]).toMatch(/Texte brut/);
    expect(validerChamp(champ({}), "a\nb")[""]).toMatch(/Texte brut/);
  });

  it("autorise le saut de ligne pour un texte long", () => {
    expect(validerChamp(champ({ type: "texte_long" }), "a\nb")).toEqual({});
    expect(validerChamp(champ({ type: "texte_long", max: 3 }), "abcd")[""]).toBe(
      "Au plus 3 caractères.",
    );
  });
});

describe("lienValide et validerChamp : lien", () => {
  it("accepte http(s) et chemins internes", () => {
    for (const v of ["https://aesbt.org", "http://a.b/c?d=1", "/association", "/a/b#x"]) {
      expect(lienValide(v)).toBe(true);
    }
  });

  it("refuse schémas dangereux, //hote, antislash, .., espace, vide", () => {
    for (const v of [
      "javascript:alert(1)",
      "//evil.org",
      "/a\\b",
      "/a/../b",
      "https://a b",
      "",
      "ftp://x.org",
      "mailto:a@b.c",
    ]) {
      expect(lienValide(v)).toBe(false);
    }
    expect(validerChamp(champ({ type: "lien" }), "javascript:alert(1)")[""]).toMatch(
      /Lien invalide/,
    );
    expect(validerChamp(champ({ type: "lien" }), "")[""]).toBe("Valeur vide.");
  });
});

describe("validerChamp : image et nombre", () => {
  it("image : null, chemin public ou identifiant de média", () => {
    const img = champ({ type: "image" });
    expect(validerChamp(img, null)).toEqual({});
    expect(validerChamp(img, "/images/p.webp")).toEqual({});
    expect(validerChamp(img, "abc123_-XYZ")).toEqual({});
    expect(validerChamp(img, "court")[""]).toMatch(/Image invalide/);
    expect(validerChamp(img, "/a/../b.png")[""]).toMatch(/Image invalide/);
    expect(validerChamp(img, "//h/x.png")[""]).toMatch(/Image invalide/);
    expect(validerChamp(img, 3)[""]).toBe("Image invalide.");
  });

  it("nombre : fini et borné", () => {
    const n = champ({ type: "nombre", minValeur: 1, maxValeur: 10 });
    expect(validerChamp(n, 5)).toEqual({});
    expect(validerChamp(n, 0)[""]).toBe("Au moins 1.");
    expect(validerChamp(n, 11)[""]).toBe("Au plus 10.");
    expect(validerChamp(n, Number.NaN)[""]).toBe("Nombre attendu.");
    expect(validerChamp(n, "5")[""]).toBe("Nombre attendu.");
  });
});

describe("validerChamp : liste", () => {
  const liste = champ({
    type: "liste",
    max: 2,
    sousChamps: [
      { nom: "titre", type: "texte", libelle: "T", max: 5 },
      { nom: "lien", type: "lien", libelle: "L", max: null },
    ],
  });

  it("valide chaque sous-champ avec une clé index.nom", () => {
    expect(validerChamp(liste, [{ titre: "ok", lien: "/a" }])).toEqual({});
    const erreurs = validerChamp(liste, [
      { titre: "trop long", lien: "/a" },
      { titre: "ok", lien: "x" },
    ]);
    expect(Object.keys(erreurs).sort()).toEqual(["0.titre", "1.lien"]);
  });

  it("refuse trop d'éléments ou une non-liste", () => {
    const el = { titre: "ok", lien: "/a" };
    expect(validerChamp(liste, [el, el, el])[""]).toBe("Au plus 2 éléments.");
    expect(validerChamp(liste, "x")[""]).toBe("Liste attendue.");
  });
});

describe("validerModifications, premiereErreur", () => {
  it("ne valide que les clés modifiées et renvoie les seules erreurs", () => {
    const champs = [champ({ cle: "p.a" }), champ({ cle: "p.b" })];
    expect(validerModifications(champs, { "p.a": "ok" })).toEqual({});
    expect(validerModifications(champs, { "p.a": "ok", "p.b": "" })).toEqual({
      "p.b": { "": "Valeur vide." },
    });
  });

  it("premiereErreur", () => {
    expect(premiereErreur({})).toBeNull();
    expect(premiereErreur({ "": "Oups", "0.x": "Autre" })).toBe("Oups");
  });
});

describe("normaliserPourEnvoi", () => {
  it("rogne les textes mais pas les identifiants d'image", () => {
    expect(normaliserPourEnvoi(champ({}), "  salut  ")).toBe("salut");
    expect(normaliserPourEnvoi(champ({ type: "image" }), " abc123 ")).toBe(" abc123 ");
    expect(normaliserPourEnvoi(champ({ type: "nombre" }), 4)).toBe(4);
  });

  it("normalise les éléments d'une liste selon les sous-champs déclarés", () => {
    const liste = champ({
      type: "liste",
      sousChamps: [
        { nom: "titre", type: "texte", libelle: "T", max: null },
        { nom: "n", type: "nombre", libelle: "N", max: null },
      ],
    });
    expect(
      normaliserPourEnvoi(liste, [{ titre: "  a ", n: 2, parasite: "x" }, { titre: "b" }]),
    ).toEqual([
      { titre: "a", n: 2 },
      { titre: "b", n: null },
    ]);
  });
});
