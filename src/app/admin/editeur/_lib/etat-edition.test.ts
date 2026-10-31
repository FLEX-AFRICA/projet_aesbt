import { describe, expect, it } from "vitest";

import {
  changementsApercu,
  DELAI_FUSION_MS,
  etatInitial,
  nombreModifications,
  reduire,
  valeursEgales,
} from "./etat-edition";

const base = { a: "x", b: "y" };

describe("valeursEgales", () => {
  it("compare scalaires et listes en profondeur", () => {
    expect(valeursEgales("a", "a")).toBe(true);
    expect(valeursEgales("a", "b")).toBe(false);
    expect(valeursEgales(null, null)).toBe(true);
    expect(valeursEgales([{ t: "1" }], [{ t: "1" }])).toBe(true);
    expect(valeursEgales([{ t: "1" }], [{ t: "2" }])).toBe(false);
    expect(valeursEgales([{ t: "1" }], [])).toBe(false);
    expect(valeursEgales("a", undefined)).toBe(false);
  });
});

describe("reduire", () => {
  it("retire la clé quand on remet la valeur de base", () => {
    let e = reduire(etatInitial(base), { type: "modifier", cle: "a", valeur: "z", t: 0 });
    expect(e.modifs).toEqual({ a: "z" });
    e = reduire(e, { type: "modifier", cle: "a", valeur: "x", t: 5000 });
    expect(e.modifs).toEqual({});
    expect(nombreModifications(e)).toBe(0);
  });

  it("fusionne les frappes rapprochées sur une même clé, pas les autres", () => {
    let e = reduire(etatInitial(base), { type: "modifier", cle: "a", valeur: "1", t: 0 });
    e = reduire(e, { type: "modifier", cle: "a", valeur: "12", t: DELAI_FUSION_MS - 1 });
    expect(e.passe).toHaveLength(1);
    e = reduire(e, { type: "modifier", cle: "b", valeur: "q", t: DELAI_FUSION_MS });
    expect(e.passe).toHaveLength(2);
    e = reduire(e, { type: "modifier", cle: "b", valeur: "qq", t: DELAI_FUSION_MS * 3 });
    expect(e.passe).toHaveLength(3);
  });

  it("ne crée pas de pas d'historique sans changement réel", () => {
    const e0 = etatInitial(base);
    expect(reduire(e0, { type: "modifier", cle: "a", valeur: "x", t: 0 })).toBe(e0);
  });

  it("annule puis rétablit exactement le jeu précédent", () => {
    let e = reduire(etatInitial(base), { type: "modifier", cle: "a", valeur: "1", t: 0 });
    e = reduire(e, { type: "modifier", cle: "b", valeur: "2", t: 5000 });
    const avant = e.modifs;
    e = reduire(e, { type: "annuler" });
    expect(e.modifs).toEqual({ a: "1" });
    e = reduire(e, { type: "retablir" });
    expect(e.modifs).toEqual(avant);
  });

  it("annuler ou rétablir sans historique ne change rien", () => {
    const e0 = etatInitial(base);
    expect(reduire(e0, { type: "annuler" })).toBe(e0);
    expect(reduire(e0, { type: "retablir" })).toBe(e0);
  });

  it("vide la pile rétablir après une modification", () => {
    let e = reduire(etatInitial(base), { type: "modifier", cle: "a", valeur: "1", t: 0 });
    e = reduire(e, { type: "annuler" });
    expect(e.futur).toHaveLength(1);
    e = reduire(e, { type: "modifier", cle: "a", valeur: "2", t: 9000 });
    expect(e.futur).toHaveLength(0);
  });

  it("reinitialiser remplace la base et ne garde que les écarts restants", () => {
    let e = reduire(etatInitial(base), { type: "modifier", cle: "a", valeur: "1", t: 0 });
    e = reduire(e, { type: "modifier", cle: "b", valeur: "2", t: 5000 });
    e = reduire(e, { type: "reinitialiser", base: { a: "1", b: "y" } });
    expect(e.base).toEqual({ a: "1", b: "y" });
    expect(e.modifs).toEqual({ b: "2" });
    expect(e.passe).toEqual([]);
    expect(e.futur).toEqual([]);
  });

  it("enregistre met à jour la base et garde les clés modifiées depuis l'envoi", () => {
    let e = reduire(etatInitial(base), { type: "modifier", cle: "a", valeur: "1", t: 0 });
    e = reduire(e, { type: "modifier", cle: "b", valeur: "2", t: 5000 });
    // Pendant l'envoi, b a été retapé : seule a doit disparaître.
    e = reduire(e, { type: "modifier", cle: "b", valeur: "22", t: 9000 });
    e = reduire(e, {
      type: "enregistre",
      envoyees: { a: "1", b: "2" },
      originales: { a: "1", b: "2" },
    });
    expect(e.base).toEqual({ a: "1", b: "2" });
    expect(e.modifs).toEqual({ b: "22" });
    expect(e.passe).toEqual([]);
  });
});

describe("changementsApercu", () => {
  it("renvoie la valeur de base pour une clé retirée", () => {
    expect(changementsApercu({ a: "z" }, {}, { a: "o" })).toEqual([{ cle: "a", valeur: "o" }]);
  });

  it("renvoie les clés modifiées ou ajoutées seulement", () => {
    expect(changementsApercu({ a: "1" }, { a: "1", b: "2" }, {})).toEqual([
      { cle: "b", valeur: "2" },
    ]);
    expect(changementsApercu({ a: "1" }, { a: "1" }, {})).toEqual([]);
  });
});
