import Link from "next/link";
import { MediaFrame } from "@/components/ui-aesbt/MediaPlaceholder";
import { formatDate } from "@/lib/format";
import type { Album } from "@/types/content";

export function AlbumCard({ album }: { album: Album }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/galerie/${album.slug}`}>
        <MediaFrame image={album.cover} ratio="aspect-[4/3]" label="Photo de couverture à venir" />
      </Link>
      <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-ink">
        <time dateTime={album.date}>{formatDate(album.date)}</time>
        <span className="h-1 w-1 rounded-full bg-line" />
        <span>
          {album.photos.length} photo{album.photos.length > 1 ? "s" : ""}
        </span>
      </div>
      <h3 className="mt-2 font-display text-xl tracking-tight text-ink transition-colors group-hover:text-accent-blue">
        <Link href={`/galerie/${album.slug}`}>{album.title}</Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-ink text-pretty">{album.description}</p>
    </article>
  );
}
