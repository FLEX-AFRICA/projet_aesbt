import type { Metadata } from "next";

import { LabPage } from "@/components/hero-lab/LabPage";

export const metadata: Metadata = {
  title: { absolute: "AESBT — Immersif (épuré centré)" },
};

export default function Version1Page() {
  return <LabPage route="/version-1" layout="epure" />;
}
