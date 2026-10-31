"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { REGISTRATION_ROUTE } from "@/config/site";
import { AESBT_CONTACT, AESBT_PHOTOS, type HomeTheme } from "./themes";

/**
 * Hero plein cadre : une vraie photo du collectif AESBT en fond, avec le
 * message principal superposé. Un seul moment orchestré à l'ouverture.
 */
export function Hero({ theme }: { theme: HomeTheme }) {
  const reduce = useReducedMotion();
  const vibrant = theme.name === "vibrant";

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden">
      {/* Photo de fond (collectif AESBT) */}
      <motion.img
        src={AESBT_PHOTOS.staff}
        alt="Les membres de l'AESBT réunis lors d'un événement de l'association."
        className="absolute inset-0 h-full w-full object-cover object-top"
        initial={reduce ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.32, 0.72, 0, 1] }}
      />
      {/* Voile dégradé pour la lisibilité — teinté selon l'ambiance */}
      <div
        className="absolute inset-0"
        style={{
          background: vibrant
            ? `linear-gradient(180deg, ${theme.ink}66 0%, ${theme.accent}26 40%, ${theme.ink}e6 100%)`
            : `linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.78) 100%)`,
        }}
      />

      {/* Contenu */}
      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-[1180px] flex-col justify-end px-6 pb-16 pt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
          className="max-w-3xl"
        >
          <Line>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold backdrop-blur"
              style={{
                backgroundColor: `${theme.bg}22`,
                color: theme.onAccent,
                border: `1px solid ${theme.bg}33`,
              }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: theme.gold }} />
              Communauté de {AESBT_CONTACT.followers} membres · Burkina Faso 🇧🇫 × Tunisie 🇹🇳
            </span>
          </Line>

          <Line>
            <h1
              className="mt-6 font-display text-4xl font-medium leading-[1.03] tracking-tight text-balance sm:text-6xl md:text-7xl"
              style={{ color: theme.onAccent }}
            >
              Étudier loin de chez soi, ensemble.
            </h1>
          </Line>

          <Line>
            <p
              className="mt-6 max-w-[52ch] text-[15px] leading-relaxed sm:text-base"
              style={{ color: `${theme.onAccent}d9` }}
            >
              L'Association des Étudiants et Stagiaires Burkinabè en Tunisie accueille, représente
              et accompagne sa communauté — des démarches d'arrivée à la vie étudiante au quotidien.
            </p>
          </Line>

          <Line>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={REGISTRATION_ROUTE}
                className="rounded-full px-6 py-3.5 text-[14px] font-semibold"
                style={{ backgroundColor: theme.accent, color: theme.onAccent }}
              >
                Rejoindre l'association
              </Link>
              <Link
                href="/association"
                className="rounded-full px-6 py-3.5 text-[14px] font-semibold backdrop-blur"
                style={{
                  backgroundColor: `${theme.bg}1f`,
                  color: theme.onAccent,
                  border: `1px solid ${theme.bg}40`,
                }}
              >
                Découvrir l'AESBT
              </Link>
            </div>
          </Line>
        </motion.div>
      </div>

      {/* Indice de défilement */}
      {!reduce ? (
        <motion.div
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{ color: `${theme.onAccent}aa` }}
          >
            Défiler
          </span>
        </motion.div>
      ) : null}
    </section>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
