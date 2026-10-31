import type { Metadata } from "next";

import { LabPage } from "@/components/hero-lab/LabPage";

export const metadata: Metadata = {
  title: { absolute: "AESBT — Immersif (asymétrique)" },
};

export default function Version3Page() {
  return <LabPage route="/version-3" layout="asymetrique" />;
}
