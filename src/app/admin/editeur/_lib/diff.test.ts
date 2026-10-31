import { describe, expect, it } from "vitest";

import {
  calculerChangements,
  diffListe,
  diffMots,
  type ChampPourDiff,
  type SegmentMot,
} from "./diff";

const reconstruire = (segments: SegmentMot[], types: SegmentMot["type"][]) =>
  segments
    .filter((s) => types.includes(s.type))
    .map((s) => s.texte)
    .join("");

describe("diffMots", () => {
  it("renvoie un seul segment egal pour des textes identiques", () => {
    expect(diffMots("bonjour", "bonjour")).toEqual([{ type: "egal", texte: "bonjour" }]);
    expect(diffMots("", "")).toEqual([]);
  });

  it("repère un mot ajouté", () => {
    expect(diffMots("bonjour le monde", "bonjour tout le monde")).toEqual([
      { type: "egal", texte: "bonjour " },
      { type: "ajout", texte: "tout " },
      { type: "egal", texte: "le monde" },
    ]);
  });

  it("gère un avant vide et un apres vide", () => {
    expect(diffMots("", "nouveau")).toEqual([{ type: "ajout", texte: "nouveau" }]);
    expect(diffMots("ancien", "")).toEqual([{ type: "suppr", texte: "ancien" }]);
  });

  it("respecte l'invariant de reconstruction", () => {
    const cas: [string, string][] = [
      ["a b c d", "a x c y z"],
      ["un  deux\ntrois", "deux trois quatre"],
      ["tout change", "rien pareil"],
    ];
    for (const [avant, apres] of cas) {
      const segments = diffMots(avant, apres);
      expect(reconstruire(segments, ["egal", "suppr"])).toBe(avant);
      expect(reconstruire(segments, ["egal", "ajout"])).toBe(apres);
    }
  });

  it("se replie sur un remplacement complet pour de très longs textes", () => {
    const avant = Array.from({ length: 800 }, (_, i) => `a${i}`).join(" ");
    const apres = Array.from({ length: 800 }, (_, i) => `b${i}`).join(" ");
    expect(diffMots(avant, apres)).toEqual([
      { type: "suppr", texte: avant },
      { type: "ajout", texte: apres },
    ]);
  });
});

describe("diffListe", () => {
  const a = { titre: "A" };
  const b = { titre: "B" };
  const c = { titre: "C" };

  it("détecte ajout et suppression", () => {
    const ajout = diffListe([], [a]);
    expect(ajout.entrees).toEqual([{ statut: "ajoute", element: a }]);
    expect(ajout.ajoutes).toBe(1);
    const retrait = diffListe([a], []);
    expect(retrait.entrees).toEqual([{ statut: "supprime", element: a }]);
    expect(retrait.supprimes).toBe(1);
  });

  it("détecte un changement d'ordre", () => {
    const d = diffListe([a, b], [b, a]);
    expect(d.entrees.map((e) => e.statut)).toEqual(["inchange", "inchange"]);
    expect(d.ordreChange).toBe(true);
    expect(d.identique).toBe(false);
  });

  it("détecte une modification et liste les sous-champs différents", () => {
    const b2 = { titre: "B2" };
    const d = diffListe([a, b], [a, b2]);
    expect(d.entrees[1]).toEqual({ statut: "modifie", element: b2, ancien: b, champs: ["titre"] });
    expect(d.modifies).toBe(1);
  });

  it("détecte la suppression d'un élément du milieu", () => {
    const d = diffListe([a, b, c], [a, c]);
    expect(d.supprimes).toBe(1);
    expect(d.entrees.find((e) => e.statut === "supprime")?.element).toEqual(b);
    expect(d.ordreChange).toBe(false);
  });

  it("déclare identiques deux listes égales", () => {
    const d = diffListe([a, b], [{ ...a }, { ...b }]);
    expect(d.identique).toBe(true);
    expect(d.entrees.every((e) => e.statut === "inchange")).toBe(true);
  });
});

describe("calculerChangements", () => {
  const base: ChampPourDiff = {
    cle: "p.t",
    type: "texte",
    libelle: "T",
    groupe: "G",
    sousChamps: null,
    valeur: "publié",
    defaut: "défaut",
    source: "publie",
    brouillon: undefined,
  };

  it("ignore les champs sans brouillon", () => {
    expect(calculerChangements([base])).toEqual([]);
  });

  it("compare au publié, ou au défaut si rien n'est publié", () => {
    const [publie] = calculerChangements([{ ...base, brouillon: "nouveau" }]);
    expect(publie).toMatchObject({ avant: "publié", apres: "nouveau", identique: false });
    const [defaut] = calculerChangements([{ ...base, source: "defaut", brouillon: "nouveau" }]);
    expect(defaut).toMatchObject({ avant: "défaut", apres: "nouveau" });
  });

  it("marque identique un brouillon égal à l'avant et garde l'ordre reçu", () => {
    const res = calculerChangements([
      { ...base, cle: "p.z", brouillon: "publié" },
      { ...base, cle: "p.a", brouillon: "autre" },
    ]);
    expect(res.map((r) => r.cle)).toEqual(["p.z", "p.a"]);
    expect(res[0]?.identique).toBe(true);
    expect(res[1]?.identique).toBe(false);
  });
});
