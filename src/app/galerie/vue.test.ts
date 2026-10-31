import { describe, expect, it } from "vitest";

import type { Album } from "@/types/content";

import { galerieDepuisBase } from "./vue";

const album = (photos: Album["photos"]): Album => ({
  id: "a1",
  slug: "a1",
  title: "Album",
  date: "2026-01-01",
  description: "",
  cover: { src: null, alt: "" },
  photos,
  status: "publie",
});

describe("galerieDepuisBase : légendes", () => {
  it("transmet la légende quand elle existe", () => {
    const { photos } = galerieDepuisBase([
      album([{ src: "/p.webp", alt: "x", caption: "Remise des prix" }]),
    ]);
    expect(photos[0]?.caption).toBe("Remise des prix");
  });

  it("n'ajoute aucune légende quand elle est absente ou vide", () => {
    const { photos } = galerieDepuisBase([
      album([
        { src: "/p.webp", alt: "x" },
        { src: "/q.webp", alt: "y", caption: "" },
      ]),
    ]);
    expect(photos[0]).not.toHaveProperty("caption");
    expect(photos[1]).not.toHaveProperty("caption");
  });
});
