"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { REGISTRATION_ROUTE } from "@/config/site";
import { FloatingNavClient } from "./FloatingNavClient";
import { Hero } from "./Hero";
import { Figure } from "./Figure";
import { AESBT_CONTACT, AESBT_PHOTOS, type HomeTheme } from "./themes";

/**
 * Page d'accueil complète, paramétrée par une ambiance (vibrant | clair).
 * Met en avant de vraies photos et coordonnées de l'association.
 */
export function HomeLanding({ theme, footer }: { theme: HomeTheme; footer?: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      <FloatingNavClient theme={theme} />
      <main id="contenu">
        <Hero theme={theme} />
        <HomeSections theme={theme} />
      </main>
      {footer}
    </div>
  );
}

/**
 * Sections de la page d'accueil (sous le hero). Extraites pour être réutilisées
 * avec un hero alternatif (laboratoire de heros).
 */
export function HomeSections({ theme }: { theme: HomeTheme }) {
  const reduce = useReducedMotion();
  const onAlt = theme.name === "vibrant"; // sections rouges → texte clair

  return (
    <>
      {/* MISSION — texte + photo réelle */}
      <Band style={{ backgroundColor: theme.bg }}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal reduce={reduce}>
            <Tag theme={theme}>L'association</Tag>
            <h2
              className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: theme.ink }}
            >
              Un relais pour toute une communauté étudiante.
            </h2>
            <p
              className="mt-5 max-w-[52ch] text-[15px] leading-relaxed"
              style={{ color: theme.inkSoft }}
            >
              Installée à Tunis, l'AESBT fédère les étudiants et stagiaires burkinabè présents en
              Tunisie. Elle facilite l'arrivée et l'intégration, défend leurs intérêts et anime une
              vie associative riche tout au long de l'année.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Pill to="/association" theme={theme} primary>
                Notre mission
              </Pill>
              <Pill to="/evenements" theme={theme}>
                Nos événements
              </Pill>
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

      {/* CHIFFRES — bande colorée */}
      <Band style={{ backgroundColor: theme.name === "vibrant" ? theme.bgAlt : theme.bgAlt }}>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { value: "3200+", label: "Membres de la communauté" },
            { value: "2", label: "Pays, une même famille" },
            { value: "100%", label: "Bénévole et solidaire" },
          ].map((s, i) => (
            <Reveal reduce={reduce} delay={i * 0.08} key={s.label}>
              <div>
                <span
                  className="block font-display text-5xl font-medium tracking-tight sm:text-6xl"
                  style={{ color: onAlt ? theme.gold : theme.accent }}
                >
                  {/[0-9]/.test(s.value) ? <CountUp value={s.value} /> : s.value}
                </span>
                <span
                  className="mt-3 block text-[14px]"
                  style={{ color: onAlt ? `${theme.onAccent}cc` : theme.inkSoft }}
                >
                  {s.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Band>

      {/* ÉVÉNEMENTS — vraies affiches */}
      <Band style={{ backgroundColor: theme.bg }}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <Tag theme={theme}>À l'affiche</Tag>
            <h2
              className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl"
              style={{ color: theme.ink }}
            >
              Ce qui anime l'association.
            </h2>
          </div>
          <Link
            href="/actualites"
            className="hidden shrink-0 pb-1 text-[14px] font-semibold sm:inline"
            style={{ color: theme.accent }}
          >
            Toutes les actualités
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal reduce={reduce}>
            <Figure
              theme={theme}
              src={AESBT_PHOTOS.jeppc}
              alt="Journées Nationales d'Engagement Patriotique et de Participation Citoyenne"
              ratio="aspect-square"
              caption="JEPPC 2026 · Ambassade du Burkina Faso à Tunis"
            />
          </Reveal>
          <Reveal reduce={reduce} delay={0.1}>
            <Figure
              theme={theme}
              src={AESBT_PHOTOS.weekend}
              alt="Weekend d'intégration de l'AESBT"
              ratio="aspect-square"
              caption="Weekend d'intégration · à venir"
            />
          </Reveal>
        </div>
      </Band>

      {/* GALERIE — placeholders colorés prêts pour de vraies photos */}
      <Band
        style={{
          backgroundColor:
            theme.bgAlt === theme.bg ? theme.bg : theme.name === "clair" ? theme.bgAlt : theme.bg,
        }}
      >
        <Tag theme={theme}>En images</Tag>
        <h2
          className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl"
          style={{ color: theme.ink }}
        >
          Des visages, des moments partagés.
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Reveal reduce={reduce}>
            <Figure
              theme={theme}
              src={AESBT_PHOTOS.staff}
              alt="Rencontre AESBT"
              ratio="aspect-[3/4]"
            />
          </Reveal>
          <Reveal reduce={reduce} delay={0.06}>
            <Figure theme={theme} alt="Photo à venir" ratio="aspect-[3/4]" />
          </Reveal>
          <Reveal reduce={reduce} delay={0.12}>
            <Figure theme={theme} alt="Photo à venir" ratio="aspect-[3/4]" />
          </Reveal>
          <Reveal reduce={reduce} delay={0.18}>
            <Figure theme={theme} alt="Photo à venir" ratio="aspect-[3/4]" />
          </Reveal>
        </div>
      </Band>

      {/* CONTACT — vraies coordonnées */}
      <Band style={{ backgroundColor: theme.ink }}>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2
              className="max-w-[16ch] font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl"
              style={{ color: theme.bg }}
            >
              Une question ? L'AESBT vous répond.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${AESBT_CONTACT.email}`}
                className="rounded-full px-6 py-3.5 text-[14px] font-semibold"
                style={{ backgroundColor: theme.gold, color: theme.ink }}
              >
                Nous écrire
              </a>
              <Link
                href={REGISTRATION_ROUTE}
                className="rounded-full px-6 py-3.5 text-[14px] font-semibold"
                style={{ border: `1px solid ${theme.bg}44`, color: theme.bg }}
              >
                Rejoindre
              </Link>
            </div>
          </div>
          <dl className="grid content-center gap-5 text-[15px]">
            <ContactRow theme={theme} label="E-mail" value={AESBT_CONTACT.email} />
            <ContactRow theme={theme} label="Téléphone (Tunisie)" value={AESBT_CONTACT.phone} />
            <ContactRow theme={theme} label="WhatsApp (Burkina)" value={AESBT_CONTACT.whatsapp} />
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

function Tag({ children, theme }: { children: ReactNode; theme: HomeTheme }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold"
      style={{ backgroundColor: `${theme.accent}14`, color: theme.accent }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: theme.gold }} />
      {children}
    </span>
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

function ContactRow({ theme, label, value }: { theme: HomeTheme; label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between border-b pb-4"
      style={{ borderColor: `${theme.bg}22` }}
    >
      <dt className="text-[13px]" style={{ color: `${theme.bg}99` }}>
        {label}
      </dt>
      <dd className="font-medium" style={{ color: theme.bg }}>
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
