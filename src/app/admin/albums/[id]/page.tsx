import { permanentRedirect } from "next/navigation";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  permanentRedirect(`/admin/galerie/${encodeURIComponent(id)}`);
}
