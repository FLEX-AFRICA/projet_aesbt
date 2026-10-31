import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ draftMode: vi.fn() }));
vi.mock("@/lib/api", () => ({ obtenirContenus: vi.fn() }));
vi.mock("@/lib/api-admin", () => ({
  appelApi: vi.fn(),
  peutEditerContenus: vi.fn(),
  sessionCourante: vi.fn(),
}));

import { DEFAUTS } from "@/contenus/defauts";

import { fusionnerBrouillon, fusionnerContenus, medias, pagesALire } from "./contenus";

const TITRE = "association.hero.titre";

describe("fusionnerContenus", () => {
  it("renvoie les défauts sans données publiées", () => {
    expect(fusionnerContenus("association", null)).toEqual(DEFAUTS["association"]);
    expect(fusionnerContenus("page-inconnue", null)).toEqual({});
  });

  it("surcharge par les valeurs publiées et ignore clés inconnues et undefined", () => {
    const res = fusionnerContenus("association", {
      [TITRE]: "Nouveau",
      "association.inconnue": "x",
      "association.hero.etiquette": undefined,
    });
    expect(res[TITRE]).toBe("Nouveau");
    expect(res["association.inconnue"]).toBeUndefined();
    expect(res["association.hero.etiquette"]).toBe(
      DEFAUTS["association"]?.["association.hero.etiquette"],
    );
  });

  it("garde un null publié (retrait volontaire d'une image)", () => {
    expect(fusionnerContenus("association", { [TITRE]: null })[TITRE]).toBeNull();
  });

  it("ne modifie pas les défauts", () => {
    const avant = DEFAUTS["association"]?.[TITRE];
    fusionnerContenus("association", { [TITRE]: "Autre" });
    expect(DEFAUTS["association"]?.[TITRE]).toBe(avant);
  });
});

describe("fusionnerBrouillon", () => {
  const champ = (
    cle: string,
    valeur: unknown,
    source: "defaut" | "publie",
    brouillon: unknown,
  ) => ({
    cle,
    valeur,
    source,
    brouillon,
  });

  it("brouillon, sinon publié, sinon défaut", () => {
    const res = fusionnerBrouillon("association", [
      champ(TITRE, "Publié", "publie", "Brouillon"),
      champ("association.hero.etiquette", "Publiée", "publie", null),
      champ("association.hero.description", "Défaut du registre", "defaut", null),
    ]);
    expect(res[TITRE]).toBe("Brouillon");
    expect(res["association.hero.etiquette"]).toBe("Publiée");
    expect(res["association.hero.description"]).toBe(
      DEFAUTS["association"]?.["association.hero.description"],
    );
  });

  it("ignore les clés inconnues du frontend", () => {
    expect(
      fusionnerBrouillon("association", [champ("autre.cle", "x", "publie", "y")])["autre.cle"],
    ).toBeUndefined();
  });

  it("limite connue : un brouillon null est indiscernable de l'absence de brouillon", () => {
    const res = fusionnerBrouillon("association", [champ(TITRE, "Publié", "publie", null)]);
    expect(res[TITRE]).toBe("Publié");
  });
});

describe("pagesALire et medias", () => {
  it("ajoute commun aux pages qui en ont besoin", () => {
    expect(pagesALire("accueil")).toEqual(["accueil", "commun"]);
    expect(pagesALire("association")).toEqual(["association", "commun"]);
    expect(pagesALire("contact")).toEqual(["contact"]);
  });

  it("medias ne garde que les entrées bien formées", () => {
    expect(
      medias({ a: { chemin: "x/y", alt: "A" }, b: { chemin: "" }, c: null, d: { alt: "z" } }),
    ).toEqual({
      a: { chemin: "x/y", alt: "A" },
    });
    expect(medias(null)).toEqual({});
    expect(medias([1])).toEqual({});
  });
});
