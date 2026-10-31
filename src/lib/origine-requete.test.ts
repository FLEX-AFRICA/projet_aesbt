import { describe, expect, it } from "vitest";

import { origineAutorisee } from "./origine-requete";

describe("origineAutorisee", () => {
  it("accepte same-origin, same-site et none", () => {
    for (const v of ["same-origin", "same-site", "none"]) expect(origineAutorisee(v)).toBe(true);
  });

  it("accepte l'absence d'en-tête (anciens navigateurs)", () => {
    expect(origineAutorisee(null)).toBe(true);
    expect(origineAutorisee(undefined)).toBe(true);
    expect(origineAutorisee("")).toBe(true);
  });

  it("refuse cross-site, quelle que soit la casse ou les espaces", () => {
    expect(origineAutorisee("cross-site")).toBe(false);
    expect(origineAutorisee(" Cross-Site ")).toBe(false);
  });
});
