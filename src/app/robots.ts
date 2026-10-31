import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    /*
     * Les robots d'aperçu social (facebookexternalhit, Twitterbot) sont
     * nommés explicitement : ce sont eux qui génèrent les vignettes des liens
     * partagés sur les réseaux, usage principal de l'association.
     */
    rules: [
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "facebookexternalhit", allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
