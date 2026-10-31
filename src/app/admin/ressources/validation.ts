import { z } from "zod";

import { estUrlHttp } from "../_commun/validation";

/** Schéma aligné sur `creation` du backend (admin-ressources.ts), appliqué aux valeurs de formulaire. */
export const schemaRessourceBase = z.object({
  titre: z
    .string()
    .trim()
    .min(5, "Le titre doit faire au moins 5 caractères.")
    .max(200, "Le titre ne peut pas dépasser 200 caractères."),
  description: z
    .string()
    .trim()
    .min(20, "La description doit faire au moins 20 caractères.")
    .max(1000, "La description ne peut pas dépasser 1000 caractères."),
  url: z.string().trim().max(2000, "Le lien est trop long."),
  corps: z.string().trim().max(5000, "Le texte ne peut pas dépasser 5000 caractères."),
  categorie: z.string().trim().max(80, "La catégorie ne peut pas dépasser 80 caractères."),
});

/**
 * Valide aussi le contenu selon le type : adresse http(s) pour un lien,
 * fichier choisi pour un document.
 */
export function schemaRessource(type: "lien" | "document", fichierChoisi: boolean) {
  return schemaRessourceBase.superRefine((v, ctx) => {
    if (type === "lien" && !estUrlHttp(v.url)) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Saisissez une adresse http ou https complète.",
      });
    }
    if (type === "document" && !fichierChoisi) {
      ctx.addIssue({ code: "custom", path: ["fichier"], message: "Choisissez un fichier." });
    }
  });
}
