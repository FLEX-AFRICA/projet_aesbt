import type { Metadata } from "next";

import { LabPage } from "@/components/hero-lab/LabPage";

export const metadata: Metadata = {
  title: { absolute: "AESBT — Immersif (infos aux coins)" },
};

export default function Version2Page() {
  return <LabPage route="/version-2" layout="coins" />;
}
