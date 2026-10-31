import { describe, expect, it } from "vitest";

import type { AesbtEvent } from "@/types/content";

import { evenementsDemo, evenementsDepuisBase } from "./vue";

const base = { description: "", location: null, cover: { src: null, alt: "" } };
const evt = (id: string, startsAt: string | null): AesbtEvent => ({
  ...base,
  id,
  slug: id,
  title: id,
  startsAt,
});

describe("evenementsDepuisBase", () => {
  const maintenant = new Date("2026-06-01T00:00:00Z").getTime();

  it("sépare à venir et passés, selon la date de début", () => {
    const vues = evenementsDepuisBase(
      [evt("ancien", "2026-01-01T10:00:00Z"), evt("futur", "2026-09-01T10:00:00Z")],
      maintenant,
    );
    expect(vues.map((v) => [v.id, v.status])).toEqual([
      ["futur", "a-venir"],
      ["ancien", "passe"],
    ]);
  });

  it("trie les à venir du plus proche au plus lointain et les passés du plus récent", () => {
    const vues = evenementsDepuisBase(
      [
        evt("p1", "2025-01-01T00:00:00Z"),
        evt("f2", "2026-12-01T00:00:00Z"),
        evt("p2", "2026-03-01T00:00:00Z"),
        evt("f1", "2026-07-01T00:00:00Z"),
      ],
      maintenant,
    );
    expect(vues.map((v) => v.id)).toEqual(["f1", "f2", "p2", "p1"]);
  });

  it("n'invente ni catégorie ni image", () => {
    const [vue] = evenementsDepuisBase([evt("x", null)], maintenant);
    expect(vue?.status).toBe("a-venir");
    expect(vue?.category).toBeUndefined();
    expect(vue?.image).toBeNull();
  });
});

describe("evenementsDemo", () => {
  it("garde le premier événement à venir en tête", () => {
    expect(evenementsDemo()[0]?.status).toBe("a-venir");
  });
});
