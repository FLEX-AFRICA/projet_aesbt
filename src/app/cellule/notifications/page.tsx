import type { Metadata } from "next";

import { PageNotifications } from "@/components/notifications/PageNotifications";

export const metadata: Metadata = { title: "Notifications" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; non_lues?: string }>;
}) {
  return <PageNotifications base="/cellule/notifications" searchParams={await searchParams} />;
}
