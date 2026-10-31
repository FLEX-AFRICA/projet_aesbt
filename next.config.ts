import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /*
   * Développement : Next refuse par défaut les requêtes internes (HMR, assets
   * du compilateur) venant d'une autre origine que « localhost ». Sans ces
   * entrées, le site ouvert depuis l'IP du Mac sur un téléphone se charge mal
   * et ne se rafraîchit plus. Les motifs couvrent le wifi et les réseaux
   * Docker locaux, pour qu'un changement d'IP par DHCP ne casse rien.
   */
  allowedDevOrigins: ["192.168.*.*", "172.16.*.*", "100.*.*.*"],

  images: {
    /*
     * Les dérivés d'images (original, -md, -thumb) seront produits par le
     * backend avec sharp puis servis par Caddy depuis media.aesbt.org.
     * L'optimisation d'images de Vercel ferait donc double emploi et
     * consommerait le quota du palier gratuit.
     */
    unoptimized: true,
  },

  /*
   * Développement : les médias sont servis par un petit serveur local sur le
   * port 8081, mais ils sont relayés par Next plutôt que référencés en direct.
   *
   * Cela permet des URL relatives (`/medias/...`), donc joignables aussi bien
   * depuis « localhost » que depuis l'IP du Mac sur le réseau local, sans
   * inscrire d'adresse IP nulle part. En production, NEXT_PUBLIC_MEDIA_URL
   * pointe sur le domaine des médias et ce relais ne sert pas.
   */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    return [
      {
        source: "/medias/:chemin*",
        destination: "http://127.0.0.1:8081/:chemin*",
      },
    ];
  },
};

export default nextConfig;
