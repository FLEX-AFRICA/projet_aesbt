import { describe, expect, it } from "vitest";

import { detailLisible, libelleAction, libelleCible } from "./libelles";

describe("libelleAction", () => {
  it("traduit les actions de contenu et de données", () => {
    expect(libelleAction("contenu.publier")).toBe("Publication de modifications de page");
    expect(libelleAction("album.supprimer")).toBe("Suppression d'un album");
    expect(libelleAction("evenement.depublier")).toBe("Dépublication d'un événement");
    expect(libelleAction("document.modifier")).toBe("Modification d'un document institutionnel");
  });

  it("ne plante pas sur une action inconnue", () => {
    expect(libelleAction("nouveau.truc")).toBe("nouveau.truc");
    expect(libelleAction("")).toBe("");
  });
});

describe("libelleCible", () => {
  it("combine type et identifiant", () => {
    expect(libelleCible("contenu_page", "accueil")).toBe("Page : accueil");
    expect(libelleCible("type_futur", "x")).toBe("type_futur : x");
    expect(libelleCible("album", null)).toBe("Album");
    expect(libelleCible(null, "x")).toBe("x");
    expect(libelleCible(null, null)).toBeNull();
  });
});

describe("detailLisible", () => {
  it("met en forme les détails des contenus", () => {
    expect(detailLisible(JSON.stringify({ cles: ["a.b", "a.c"] }))).toBe("Champs : a.b, a.c");
    expect(detailLisible(JSON.stringify({ cle: "a.b", depuis_version: 3 }))).toBe(
      "Champ : a.b, Depuis la version : 3",
    );
    expect(detailLisible(JSON.stringify({ role: "editeur" }))).toBe("Rôle : Éditeur");
  });

  it("ne plante pas sur des détails non JSON ou de forme inattendue", () => {
    expect(detailLisible(null)).toBeNull();
    expect(detailLisible("pas du json")).toBe("pas du json");
    expect(detailLisible("[1,2]")).toBe("[1,2]");
    expect(detailLisible("null")).toBe("null");
    expect(detailLisible(JSON.stringify({ x: null, y: { z: 1 }, ok: true }))).toBe(
      'x : aucun, y : {"z":1}, ok : oui',
    );
  });
});
