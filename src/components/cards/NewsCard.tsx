import Link from "next/link";
import { MediaFrame } from "@/components/ui-aesbt/MediaPlaceholder";
import { formatDate } from "@/lib/format";
import type { NewsArticle } from "@/types/content";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/actualites/${article.slug}`} className="block">
        <MediaFrame image={article.cover} label="Photo de l'actualité à venir" />
      </Link>
      <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-ink">
        <span>{article.category}</span>
        <span className="h-1 w-1 rounded-full bg-line" />
        <time dateTime={article.date}>{formatDate(article.date)}</time>
      </div>
      <h3 className="mt-2 font-display text-xl tracking-tight text-ink transition-colors group-hover:text-accent-blue">
        <Link href={`/actualites/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-ink text-pretty">{article.excerpt}</p>
    </article>
  );
}
