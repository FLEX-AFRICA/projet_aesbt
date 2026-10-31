import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/PageHeader";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { recupererAlbum, recupererAlbums } from "@/data/source";
import { formatDate } from "@/lib/format";

import { AlbumViewer } from "./AlbumViewer";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await recupererAlbums()).map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await recupererAlbum(slug);

  if (!album) {
    return { title: "Album introuvable", robots: { index: false } };
  }

  return {
    title: `${album.title} — Galerie`,
    description: album.description,
    alternates: { canonical: `/galerie/${slug}` },
    openGraph: {
      type: "article",
      url: `/galerie/${slug}`,
      title: album.title,
      description: album.description,
      ...(album.cover.src ? { images: [{ url: album.cover.src }] } : {}),
    },
  };
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const album = await recupererAlbum(slug);

  if (!album) notFound();

  const total = album.photos.length;

  return (
    <SiteLayout>
      <header className="border-b border-line/70 bg-frost-deep/40">
        <div className="mx-auto max-w-[1240px] px-6 py-14 sm:py-16">
          <p className="eyebrow">Album</p>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-ink text-balance sm:text-4xl">
            {album.title}
          </h1>
          <p className="mt-4 text-[13px] uppercase tracking-[0.14em] text-muted-ink">
            {formatDate(album.date)}, {total} photo{total > 1 ? "s" : ""}
          </p>
          {album.event && (
            <p className="mt-4">
              <Link
                href={`/evenements#evenement-${album.event.slug}`}
                className="text-[13px] font-semibold text-accent-blue underline-offset-4 hover:underline"
              >
                Voir l'événement
              </Link>
            </p>
          )}
          <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-muted-ink text-pretty">
            {album.description}
          </p>
        </div>
      </header>

      <Section>
        <AlbumViewer photos={album.photos} />

        <p className="mt-12">
          <Link
            href="/galerie"
            className="text-[13px] font-semibold text-accent-blue underline-offset-4 hover:underline"
          >
            Retour à la galerie
          </Link>
        </p>
      </Section>
    </SiteLayout>
  );
}
