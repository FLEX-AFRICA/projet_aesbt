import type { MetadataRoute } from "next";

import { recupererActualites, recupererAlbums, recupererRessources } from "@/data/source";
import { absoluteUrl } from "@/lib/seo";

/** Plan du site, construit depuis la source de contenus en vigueur. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [actualites, albums, ressources] = await Promise.all([
    recupererActualites(),
    recupererAlbums(),
    recupererRessources(),
  ]);

  const staticRoutes = [
    "/",
    "/association",
    "/actualites",
    "/galerie",
    "/ressources",
    "/evenements",
    "/contact",
    "/inscription",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));

  const newsRoutes = actualites.map((article) => ({
    url: absoluteUrl(`/actualites/${article.slug}`),
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const albumRoutes = albums.map((album) => ({
    url: absoluteUrl(`/galerie/${album.slug}`),
    lastModified: new Date(album.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const resourceRoutes = ressources.map((resource) => ({
    url: absoluteUrl(`/ressources/${resource.slug}`),
    lastModified: new Date(resource.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...newsRoutes, ...albumRoutes, ...resourceRoutes];
}
