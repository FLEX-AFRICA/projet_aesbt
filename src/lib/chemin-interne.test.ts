import { describe, expect, it } from "vitest";

import { cheminInterne } from "./chemin-interne";

describe("cheminInterne", () => {
  it("accepte les chemins internes, avec requête ou ancre", () => {
    for (const v of ["/", "/apercu/accueil", "/a?b=1", "/a#x", "/a?u=http://x"]) {
      expect(cheminInterne(v, "/repli")).toBe(v);
    }
  });

  it("refuse absent, relatif, URL absolue et protocole relatif", () => {
    for (const v of [
      null,
      undefined,
      "",
      "page",
      "https://evil.org",
      "//evil.org",
      "/\\evil.org",
      "/a\\b",
    ]) {
      expect(cheminInterne(v, "/repli")).toBe("/repli");
    }
  });

  it("refuse schéma dans le chemin et caractères de contrôle", () => {
    for (const v of ["/javascript:alert(1)", "/a:b", "/a\nb", "/a\u0000", "/a\u007f"]) {
      expect(cheminInterne(v, "/repli")).toBe("/repli");
    }
  });
});
