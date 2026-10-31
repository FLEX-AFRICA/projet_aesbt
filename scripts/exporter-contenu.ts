/**
 * Export du contenu figé vers le backend.
 *
 * Produit un fichier JSON consommé par `npm run importer` du dépôt
 * `aesbt-api`. À lancer une fois, au moment de la bascule :
 *
 *   npx tsx scripts/exporter-contenu.ts
 *   cd ../aesbt-api && npm run importer -- ../aesbt-connect-flexhub/export-contenu.json
 *
 * Les données de démonstration de `src/data/` sont exportées telles quelles ;
 * c'est l'import qui les écarte, afin que ce script reste un simple miroir.
 */
import { writeFile } from "node:fs/promises";

import { DEMO_ALBUMS } from "../src/data/albums";
import { BUREAU_MEMBERS, INSTITUTIONAL_DOCUMENTS, STATISTICS } from "../src/data/association";
import { DEMO_NEWS } from "../src/data/news";
import { DEMO_RESOURCES } from "../src/data/resources";

const sortie = {
  exporte_le: new Date().toISOString(),

  actualites: DEMO_NEWS.map((a) => ({
    slug: a.slug,
    titre: a.title,
    date: a.date,
    categorie: a.category,
    chapeau: a.excerpt,
    corps: a.body,
    source_url: a.socialUrl ?? null,
    statut: a.status,
  })),

  albums: DEMO_ALBUMS.map((a) => ({
    slug: a.slug,
    titre: a.title,
    date: a.date,
    description: a.description,
  })),

  ressources: DEMO_RESOURCES.map((r) => ({
    slug: r.slug,
    titre: r.title,
    description: r.description,
    categorie: r.category,
    corps: r.body,
    url: r.document?.url ?? null,
    publie_le: r.publishedAt,
  })),

  membres: BUREAU_MEMBERS.map((m, index) => ({
    role: m.role,
    nom: m.name,
    ordre: index,
  })),

  statistiques: STATISTICS.map((s) => ({
    cle: s.id,
    libelle: s.label,
    valeur: s.value,
  })),

  documents: INSTITUTIONAL_DOCUMENTS.map((d) => ({
    titre: d.title,
    description: d.description,
  })),
};

await writeFile("export-contenu.json", `${JSON.stringify(sortie, null, 2)}\n`);

console.log("export-contenu.json écrit :");
console.log(`  actualites    ${sortie.actualites.length}`);
console.log(`  albums        ${sortie.albums.length}`);
console.log(`  ressources    ${sortie.ressources.length}`);
console.log(`  membres       ${sortie.membres.length}`);
console.log(`  statistiques  ${sortie.statistiques.length}`);
console.log(`  documents     ${sortie.documents.length}`);
