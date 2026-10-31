import type { Metadata } from "next";

import { SiteLayout } from "@/components/layout/SiteLayout";

import { recupererAlbum, recupererAlbums } from "@/data/source";
import { apiConfiguree } from "@/lib/api";

import { GalleryLanding } from "./GalleryLanding";
import { galerieDemo, galerieDepuisBase } from "./vue";

const TITLE = "Galerie photo";
const DESCRIPTION =
  "Albums photo des activités, rencontres et moments de la communauté étudiante burkinabè en Tunisie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/galerie" },
  openGraph: {
    type: "website",
    url: "/galerie",
    title: `${TITLE} — AESBT`,
    description: DESCRIPTION,
  },
};

export default async function GalleryPage() {
  // Sans API : mosaïque de démonstration. Avec API : uniquement les albums
  // publiés en base (page statique, régénérée toutes les 5 minutes). La liste
  // des albums ne contient pas les photos : on lit chaque album pour les
  // obtenir (appels mis en cache par Next).
  let donnees = galerieDemo();
  if (apiConfiguree()) {
    const albums = await recupererAlbums();
    const complets = await Promise.all(albums.map((album) => recupererAlbum(album.slug)));
    donnees = galerieDepuisBase(complets.filter((album) => album !== undefined));
  }

  return (
    <SiteLayout>
      <GalleryLanding events={donnees.events} photos={donnees.photos} />
    </SiteLayout>
  );
}
