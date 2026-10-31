import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { MediaFrame } from "@/components/ui-aesbt/MediaPlaceholder";
import { recupererActualite, recupererActualites } from "@/data/source";
import { DEMO_AESBT_NEWS } from "@/data/news-demo";
import { formatDate } from "@/lib/format";
import type { NewsArticle } from "@/types/content";

const RED = "#B4271C";
const GOLD = "#C9961B";
const INK = "#1A1A1A";
const SOFT = "#6B6B6B";
const PAPER = "#F3E9DC";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const real = await recupererActualites();
  const slugs = new Set([...DEMO_AESBT_NEWS, ...real].map((a) => a.slug));
  return [...slugs].map((slug) => ({ slug }));
}

/** Article recherché d'abord dans le jeu codé en dur, puis dans le fil réel. */
async function trouverArticle(slug: string): Promise<NewsArticle | undefined> {
  return DEMO_AESBT_NEWS.find((a) => a.slug === slug) ?? (await recupererActualite(slug));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await trouverArticle(slug);

  if (!article) {
    return { title: "Actualité introuvable", robots: { index: false } };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/actualites/${slug}` },
    openGraph: {
      type: "article",
      url: `/actualites/${slug}`,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      ...(article.cover.src ? { images: [{ url: article.cover.src }] } : {}),
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [article, real] = await Promise.all([trouverArticle(slug), recupererActualites()]);

  if (!article) notFound();

  const allNews = [...DEMO_AESBT_NEWS, ...real];
  const related = allNews.filter((a) => a.slug !== slug).slice(0, 5);

  return (
    <SiteLayout>
      <article>
        <header className="border-b border-line/70 bg-frost-deep/40">
          <div className="mx-auto max-w-[820px] px-6 py-14 sm:py-16">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-ink">
              <span>{article.category}</span>
              <span className="h-1 w-1 rounded-full bg-line" />
              <time dateTime={article.date}>{formatDate(article.date)}</time>
            </div>
            <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-ink text-balance sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-ink text-pretty">
              {article.excerpt}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <div className="grid gap-14 lg:grid-cols-[1fr_340px]">
            {/* Le corps de l'actualité */}
            <div className="max-w-[820px]">
              <MediaFrame
                image={article.cover}
                ratio="aspect-[16/9]"
                label="Photo de l'actualité à venir"
              />

              <div className="mt-10 space-y-5 text-[16px] leading-relaxed text-ink-soft">
                {article.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {article.gallery && article.gallery.length > 0 ? (
                <section className="mt-12">
                  <h2 className="font-display text-xl tracking-tight text-ink">
                    Galerie de l'actualité
                  </h2>
                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {article.gallery.map((photo, i) => (
                      <MediaFrame key={i} image={photo} ratio="aspect-square" />
                    ))}
                  </div>
                </section>
              ) : null}

              {article.attachments && article.attachments.length > 0 ? (
                <section className="mt-12">
                  <h2 className="font-display text-xl tracking-tight text-ink">Documents</h2>
                  <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface/60">
                    {article.attachments.map((file, i) => (
                      <li key={i} className="flex items-center justify-between p-4 text-sm">
                        <span className="text-ink">{file.label}</span>
                        {file.url ? (
                          <a
                            href={file.url}
                            className="font-semibold text-accent-blue hover:underline"
                          >
                            Télécharger
                          </a>
                        ) : (
                          <span className="text-muted-ink">Document à venir</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {article.socialUrl ? (
                <p className="mt-10 text-sm">
                  <a
                    href={article.socialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-accent-blue hover:underline"
                  >
                    Voir la publication sur les réseaux sociaux
                  </a>
                </p>
              ) : null}

              <p className="mt-12">
                <Link
                  href="/actualites"
                  className="text-[13px] font-semibold text-accent-blue underline-offset-4 hover:underline"
                >
                  Retour aux actualités
                </Link>
              </p>
            </div>

            {/* Le fil, en colonne : même implémentation que « À l'affiche » sur
                l'accueil (vignette, rubrique sur le filet oblique, titre), posée
                en vis-à-vis de l'article plutôt qu'à côté d'une vedette. */}
            <NewsFeedAside articles={related} />
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}

/** La colonne « fil d'actualité », reprise de la bande d'accueil (`NewsBand`). */
function NewsFeedAside({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <p
        className="text-[11px] font-semibold uppercase leading-none tracking-[0.2em]"
        style={{ color: RED }}
      >
        Fil d'actualité
      </p>
      <h2
        className="mt-3 font-display text-[1.3rem] font-semibold leading-tight tracking-tight"
        style={{ color: INK }}
      >
        À lire aussi
      </h2>

      <div className="mt-6 flex flex-col">
        {articles.map((item) => (
          <Link
            key={item.id}
            href={`/actualites/${item.slug}`}
            className="group flex items-start gap-4 border-t border-black/[0.09] py-5 first:border-t-0 first:pt-0"
          >
            <figure
              className="m-0 w-[104px] shrink-0 overflow-hidden rounded-[14px]"
              style={{ backgroundColor: PAPER }}
            >
              {item.cover.src ? (
                <img
                  src={item.cover.src}
                  alt={item.cover.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-institutional group-hover:scale-[1.05]"
                />
              ) : (
                <div className="aspect-[4/3] w-full" />
              )}
            </figure>
            <div className="min-w-0">
              <p
                className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.16em]"
                style={{ color: RED }}
              >
                {item.category}
                <span aria-hidden="true" className="mx-1.5 font-normal" style={{ color: GOLD }}>
                  /
                </span>
                <span style={{ color: SOFT }}>{formatDate(item.date)}</span>
              </p>
              <h3
                className="mt-1.5 font-display text-[14.5px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-[#B4271C]"
                style={{ color: INK }}
              >
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/actualites"
        className="mt-2 inline-flex items-center gap-1.5 border-t border-black/[0.09] pt-5 text-[13px] font-semibold underline decoration-[#C9961B] decoration-2 underline-offset-4 transition-colors hover:text-[#B4271C]"
        style={{ color: INK }}
      >
        Toutes les actualités
      </Link>
    </aside>
  );
}
