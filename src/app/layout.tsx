import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";

import { SITE } from "@/config/site";
import { SITE_URL } from "@/lib/seo";
import "@/styles.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AESBT : étudiants et stagiaires burkinabè en Tunisie",
    template: "%s : AESBT",
  },
  description: SITE.description,
  authors: [{ name: SITE.shortName }],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.shortName,
    title: "AESBT : étudiants et stagiaires burkinabè en Tunisie",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
