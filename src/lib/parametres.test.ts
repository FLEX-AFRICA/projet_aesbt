import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ obtenirParametres: vi.fn() }));

import { CONTACT, SOCIALS } from "@/config/site";

import { fusionnerCoordonnees } from "./parametres";

describe("fusionnerCoordonnees", () => {
  it("replie sur config/site.ts sans paramètres", () => {
    const res = fusionnerCoordonnees({});
    expect(res.email).toBe(CONTACT.email);
    expect(res.phone).toBe(CONTACT.phone);
    expect(res.address).toBe(CONTACT.address);
    expect(res.socials).toEqual(SOCIALS);
    expect(res.adhesionUrl).toBeNull();
  });

  it("utilise les valeurs renseignées, rognées", () => {
    const res = fusionnerCoordonnees({
      "contact.email": "  bureau@aesbt.org ",
      "contact.telephone": "+216 00 000 000",
      "contact.adresse": "Tunis",
      "adhesion.url": " https://forms.example/adhesion ",
    });
    expect(res).toMatchObject({
      email: "bureau@aesbt.org",
      phone: "+216 00 000 000",
      address: "Tunis",
      adhesionUrl: "https://forms.example/adhesion",
    });
  });

  it("traite vide, espaces et null comme absents", () => {
    const res = fusionnerCoordonnees({
      "contact.email": "   ",
      "contact.telephone": null,
      "adhesion.url": "",
    });
    expect(res.email).toBe(CONTACT.email);
    expect(res.phone).toBe(CONTACT.phone);
    expect(res.adhesionUrl).toBeNull();
  });

  it("remplace un réseau seulement, en gardant ordre et libellés", () => {
    const res = fusionnerCoordonnees({ "social.instagram": "https://instagram.com/aesbt" });
    expect(res.socials.map((s) => s.label)).toEqual(SOCIALS.map((s) => s.label));
    expect(res.socials.find((s) => s.label === "Instagram")?.href).toBe(
      "https://instagram.com/aesbt",
    );
    expect(res.socials.find((s) => s.label === "Facebook")?.href).toBe(
      SOCIALS.find((s) => s.label === "Facebook")?.href,
    );
  });
});
