"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { REGISTRATION_ROUTE } from "@/config/site";
import { Figure } from "@/components/home/Figure";
import { AESBT_CONTACT, AESBT_PHOTOS, type HomeTheme } from "@/components/home/themes";
import { SectionLabel } from "./SectionLabel";
import { Editable } from "@/components/editable/Editable";
import { LienEditable } from "@/components/editable/ZoneEditable";

/**
 * Sections de contenu de la page d'accueil immersive : la mission, et le
 * contact (exporté à part, voir `ContactBand`).
 *
 * Les actualités (`NewsBand`), l'appel à l'adhésion (`CtaBand`) et la galerie
 * (`MomentsStack`) sont des blocs à part entière, montés directement par la
 * page.
 */
export function AuroraSections({ theme }: { theme: HomeTheme }) {
  const reduce = useReducedMotion();

  return (
    <>
      {/* MISSION : texte + photo réelle */}
      <Band style={{ backgroundColor: theme.bg }}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal reduce={reduce}>
            {/* Centré sur téléphone, aligné à gauche dès la tablette. */}
            <div className="text-center lg:text-left">
              <SectionLabel align="responsive">L'association</SectionLabel>
              <h2
                className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl"
                style={{ color: theme.ink }}
              >
                Un relais pour toute une communauté étudiante.
              </h2>
              <p
                className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-relaxed lg:mx-0 lg:text-[16px]"
                style={{ color: theme.inkSoft }}
              >
                Installée à Tunis, l'AESBT fédère les étudiants et stagiaires burkinabè présents en
                Tunisie. Elle facilite l'arrivée et l'intégration, défend leurs intérêts et anime
                une vie associative riche tout au long de l'année.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Pill to="/association" theme={theme} primary>
                  Notre mission
                </Pill>
                <Pill to="/evenements" theme={theme}>
                  Nos événements
                </Pill>
              </div>
            </div>
          </Reveal>
          <Reveal reduce={reduce} delay={0.1}>
            <Figure
              theme={theme}
              src={AESBT_PHOTOS.staff}
              alt="Le collectif AESBT"
              ratio="aspect-[4/3]"
              caption="Le staff de l'AESBT lors d'un événement de l'association"
            />
          </Reveal>
        </div>
      </Band>
    </>
  );
}

/** Bande de contact (coordonnées réelles), en fin de parcours. */
export function ContactBand({ theme }: { theme: HomeTheme }) {
  return (
    <>
      {/* CONTACT : vraies coordonnées, sur fond clair */}
      <Band style={{ backgroundColor: theme.bgAlt }}>
        <div className="grid gap-10 rounded-3xl border border-black/[0.06] bg-white p-8 shadow-[0_18px_48px_rgba(42,15,11,0.07)] sm:p-12 lg:grid-cols-2">
          <div>
            <h2
              className="max-w-[16ch] font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl"
              style={{ color: theme.ink }}
            >
              <Editable cle="accueil.contact.titre" />
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${AESBT_CONTACT.email}`}
                className="rounded-full px-6 py-3.5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: theme.accent, color: theme.onAccent }}
              >
                <Editable cle="accueil.contact.ecrire_libelle" />
              </a>
              <LienEditable
                cleLien="accueil.contact.rejoindre_lien"
                cleLibelle="accueil.contact.rejoindre_libelle"
                repliLien={REGISTRATION_ROUTE}
                className="rounded-full px-6 py-3.5 text-[14px] font-semibold"
                style={{ border: `1px solid ${theme.line}`, color: theme.ink }}
              />
            </div>
          </div>
          <dl className="grid content-center gap-5 text-[15px]">
            <ContactRow
              theme={theme}
              label={<Editable cle="accueil.contact.libelle_email" />}
              value={AESBT_CONTACT.email}
            />
            <ContactRow
              theme={theme}
              label={<Editable cle="accueil.contact.libelle_telephone" />}
              value={AESBT_CONTACT.phone}
            />
            <ContactRow
              theme={theme}
              label={<Editable cle="accueil.contact.libelle_whatsapp" />}
              value={<Editable cle="commun.site.whatsapp" />}
            />
          </dl>
        </div>
      </Band>
    </>
  );
}

function Band({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={style}>
      <div className="mx-auto max-w-[1180px] px-6 py-16 sm:py-24">{children}</div>
    </section>
  );
}

function Pill({
  children,
  to,
  theme,
  primary = false,
}: {
  children: ReactNode;
  to: string;
  theme: HomeTheme;
  primary?: boolean;
}) {
  return (
    <Link
      href={to}
      className="rounded-full px-5 py-3 text-[14px] font-semibold"
      style={
        primary
          ? { backgroundColor: theme.accent, color: theme.onAccent }
          : { border: `1px solid ${theme.line}`, color: theme.ink }
      }
    >
      {children}
    </Link>
  );
}

function ContactRow({
  theme,
  label,
  value,
}: {
  theme: HomeTheme;
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 border-b pb-4"
      style={{ borderColor: theme.line }}
    >
      <dt className="text-[13px]" style={{ color: theme.inkSoft }}>
        {label}
      </dt>
      <dd className="font-medium" style={{ color: theme.ink }}>
        {value}
      </dd>
    </div>
  );
}

function Reveal({
  children,
  reduce,
  delay = 0,
}: {
  children: ReactNode;
  reduce: boolean | null;
  delay?: number;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
