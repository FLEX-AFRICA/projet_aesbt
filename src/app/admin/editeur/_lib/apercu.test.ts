import { describe, expect, it } from "vitest";

import { urlApercuMedia, valeurApercu } from "./apercu";
import type { ChampEditeur, MediaEditeur } from "./types";

const medias: MediaEditeur[] = [
  { id: "abc123", alt: "", vignette: "https://m/x-sm.webp", apercu: "https://m/x-md.webp" },
  { id: "def456", alt: "", vignette: "https://m/y-sm.webp", apercu: null },
  { id: "ghi789", alt: "", vignette: null, apercu: null },
];

const champ = (surcharge: Partial<ChampEditeur>): ChampEditeur => ({
  cle: "p.c",
  type: "image",
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

describe("urlApercuMedia", () => {
  it("résout un identifiant vers le dérivé moyen, sinon la vignette", () => {
    expect(urlApercuMedia("abc123", medias)).toBe("https://m/x-md.webp");
    expect(urlApercuMedia("def456", medias)).toBe("https://m/y-sm.webp");
  });

  it("laisse passer chemins publics et URL http(s)", () => {
    expect(urlApercuMedia("/images/p.webp", medias)).toBe("/images/p.webp");
    expect(urlApercuMedia("https://exemple.org/a.png", medias)).toBe("https://exemple.org/a.png");
  });

  it("renvoie null pour inconnu, non résolvable, non texte ou //hote", () => {
    expect(urlApercuMedia("zzz999", medias)).toBeNull();
    expect(urlApercuMedia("ghi789", medias)).toBeNull();
    expect(urlApercuMedia(null, medias)).toBeNull();
    expect(urlApercuMedia(undefined, medias)).toBeNull();
    expect(urlApercuMedia(12, medias)).toBeNull();
    expect(urlApercuMedia("//evil.example/x", medias)).toBeNull();
  });
});

describe("valeurApercu", () => {
  it("convertit une image simple", () => {
    expect(valeurApercu(champ({}), "abc123", medias)).toBe("https://m/x-md.webp");
  });

  it("convertit les sous-champs image d'une liste sans toucher aux autres", () => {
    const liste = champ({
      type: "liste",
      sousChamps: [
        { nom: "titre", type: "texte", libelle: "T", max: null },
        { nom: "photo", type: "image", libelle: "P", max: null },
      ],
    });
    const valeur = [{ titre: "x", photo: "abc123" }];
    expect(valeurApercu(liste, valeur, medias)).toEqual([
      { titre: "x", photo: "https://m/x-md.webp" },
    ]);
    // L'original n'est pas modifié.
    expect(valeur[0]?.photo).toBe("abc123");
  });

  it("renvoie la valeur telle quelle pour une liste sans image ou un texte", () => {
    const liste = champ({
      type: "liste",
      sousChamps: [{ nom: "titre", type: "texte", libelle: "T", max: null }],
    });
    const valeur = [{ titre: "x" }];
    expect(valeurApercu(liste, valeur, medias)).toBe(valeur);
    expect(valeurApercu(champ({ type: "texte" }), "bonjour", medias)).toBe("bonjour");
  });
});
