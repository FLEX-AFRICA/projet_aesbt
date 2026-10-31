import { describe, expect, it } from "vitest";

import { ajouter, deplacer, elementVide, modifierSousChamp, supprimer } from "./liste";

const a = { n: "a" };
const b = { n: "b" };
const c = { n: "c" };

describe("liste", () => {
  it("crée un élément vide selon les types", () => {
    expect(
      elementVide([
        { nom: "titre", type: "texte", libelle: "T", max: null },
        { nom: "n", type: "nombre", libelle: "N", max: null },
        { nom: "img", type: "image", libelle: "I", max: null },
      ]),
    ).toEqual({ titre: "", n: 0, img: null });
  });

  it("ajoute et supprime sans modifier l'original", () => {
    const origine = [a, b];
    expect(ajouter(origine, c)).toEqual([a, b, c]);
    expect(supprimer(origine, 0)).toEqual([b]);
    expect(supprimer(origine, 9)).toEqual([a, b]);
    expect(origine).toEqual([a, b]);
  });

  it("déplace dans les bornes et ignore le hors bornes", () => {
    expect(deplacer([a, b, c], 0, 1)).toEqual([b, a, c]);
    expect(deplacer([a, b, c], 2, -1)).toEqual([a, c, b]);
    expect(deplacer([a, b], 0, -1)).toEqual([a, b]);
    expect(deplacer([a, b], 1, 1)).toEqual([a, b]);
    expect(deplacer([a, b], 5, -1)).toEqual([a, b]);
  });

  it("modifie un seul sous-champ", () => {
    const res = modifierSousChamp([a, b], 1, "n", "z");
    expect(res).toEqual([a, { n: "z" }]);
    expect(res[0]).toBe(a);
  });
});
