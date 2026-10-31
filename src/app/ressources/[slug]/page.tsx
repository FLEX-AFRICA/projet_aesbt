import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { recupererRessource, recupererRessources } from "@/data/source";
import { formatDate } from "@/lib/format";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await recupererRessources()).map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await recupererRessource(slug);

  if (!resource) {
    return { title: "Ressource introuvable", robots: { index: false } };
  }

  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `/ressources/${slug}` },
    openGraph: {
      type: "article",
      url: `/ressources/${slug}`,
      title: resource.title,
      description: resource.description,
    },
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = await recupererRessource(slug);

  if (!resource) notFound();

  return (
    <SiteLayout>
      <header className="border-b border-line/70 bg-frost-deep/40">
        <div className="mx-auto max-w-[820px] px-6 py-14 sm:py-16">
          <p className="eyebrow">{resource.category}</p>
          <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-ink text-balance sm:text-4xl">
            {resource.title}
          </h1>
          <p className="mt-4 text-[13px] uppercase tracking-[0.14em] text-muted-ink">
            Publié le {formatDate(resource.publishedAt)}
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-ink text-pretty">
            {resource.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[820px] px-6 py-14">
        <div className="space-y-5 text-[16px] leading-relaxed text-ink-soft">
          {resource.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {resource.document ? (
          <div className="mt-10 flex items-center justify-between rounded-xl border border-line bg-surface/60 p-5 text-sm">
            <span className="text-ink">{resource.document.label}</span>
            {resource.document.url ? (
              <a
                href={resource.document.url}
                className="font-semibold text-accent-blue hover:underline"
              >
                Télécharger
              </a>
            ) : (
              <span className="text-muted-ink">Document à venir</span>
            )}
          </div>
        ) : null}

        <p className="mt-12">
          <Link
            href="/ressources"
            className="text-[13px] font-semibold text-accent-blue underline-offset-4 hover:underline"
          >
            Retour au centre de ressources
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
