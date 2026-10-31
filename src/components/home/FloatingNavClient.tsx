"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MAIN_NAV, REGISTRATION_ROUTE } from "@/config/site";
import { Editable } from "@/components/editable/Editable";
import { NavLink } from "@/components/layout/NavLink";
import type { HomeTheme } from "./themes";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Barre de navigation flottante en forme d'îlot arrondi (« pill »).
 *
 * Détachée des bords, elle flotte au-dessus du contenu. Au scroll, elle se
 * resserre légèrement et gagne en opacité. Sur téléphone, le menu descend sous
 * le pill en carte translucide claire, raccord avec le style crème de l'accueil
 * (plutôt qu'un plein écran sombre).
 *
 * Composant client : ses textes (`commun.nav.*`, `commun.logo`) viennent du
 * contexte des contenus, fourni par le parent serveur `FloatingNav` (ou par la
 * page). Sans provider, ils retombent sur les défauts locaux. Les liens du menu
 * (`MAIN_NAV`) restent en code.
 */
export function FloatingNavClient({ theme }: { theme: HomeTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4">
      <motion.nav
        aria-label="Navigation principale"
        className="pointer-events-auto mt-4 flex items-center gap-2 rounded-full px-2 py-2 shadow-lg backdrop-blur-xl"
        animate={{
          width: "auto",
          backgroundColor: theme.navBg,
          boxShadow: scrolled ? "0 12px 40px rgba(0,0,0,0.18)" : "0 6px 24px rgba(0,0,0,0.10)",
        }}
        transition={{ duration: 0.3 }}
        style={{ color: theme.navInk, ["--nav-accent" as string]: theme.accent }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3"
          aria-label="AESBT, accueil"
        >
          <Editable
            cle="commun.logo"
            type="image"
            as="img"
            repli="/logo_aesbt.jpg"
            className="size-9 rounded-full object-cover ring-1 ring-white/20"
          />
          <span className="font-display text-base font-semibold tracking-tight">AESBT</span>
        </Link>

        <span className="hidden items-center gap-1 lg:flex">
          {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
            <NavLink
              key={item.to}
              href={item.to}
              activeStyle={{ backgroundColor: theme.accent, color: theme.onAccent }}
              className="relative rounded-full px-3.5 py-2 text-[13.5px] font-medium opacity-90 transition-opacity after:absolute after:inset-x-3.5 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--nav-accent)] after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:opacity-100 hover:after:scale-x-100 aria-[current=page]:after:hidden"
            >
              {item.label}
            </NavLink>
          ))}
        </span>

        <Link
          href={REGISTRATION_ROUTE}
          className="ml-1 hidden rounded-full px-4 py-2 text-[13.5px] font-semibold sm:inline-block"
          style={{ backgroundColor: theme.accent, color: theme.onAccent }}
        >
          <Editable cle="commun.nav.cta_libelle" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="ml-1 grid size-10 place-items-center rounded-full lg:hidden"
          style={{ backgroundColor: `${theme.navInk}1a` }}
        >
          {/* Les deux barres pivotent en croix quand le menu est ouvert. */}
          <span className="relative block h-[12px] w-5">
            <motion.span
              className="absolute left-0 block h-[2px] w-5 rounded-full"
              style={{ backgroundColor: theme.navInk }}
              animate={open ? { top: 5, rotate: 45 } : { top: 0, rotate: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            <motion.span
              className="absolute left-0 block h-[2px] w-5 rounded-full"
              style={{ backgroundColor: theme.navInk }}
              animate={open ? { top: 5, rotate: -45 } : { top: 10, rotate: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </span>
        </button>
      </motion.nav>

      <AnimatePresence>
        {open ? (
          <>
            {/* Voile léger : ferme au tap, laisse deviner la page derrière. */}
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="pointer-events-auto fixed inset-0 z-[55] cursor-default bg-black/20 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            {/* Carte « glass » claire, descend sous le pill. */}
            <motion.div
              className="pointer-events-auto relative z-[60] mt-2 w-[min(92vw,400px)] origin-top overflow-hidden rounded-[26px] border border-black/[0.06] shadow-[0_20px_60px_rgba(42,15,11,0.16)] backdrop-blur-xl lg:hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {/* Halo chaud très doux, écho du hero. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#E8A61E]/16 blur-[70px]"
              />
              <nav className="relative flex flex-col gap-0.5 p-3">
                {MAIN_NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.4, ease: EASE }}
                  >
                    <NavLink
                      href={item.to}
                      onClick={() => setOpen(false)}
                      activeStyle={{ backgroundColor: theme.accent, color: theme.onAccent }}
                      className="block rounded-full px-5 py-3 font-display text-xl font-medium transition-colors"
                      style={{ color: theme.ink }}
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}

                <motion.div
                  className="mt-2 px-2 pb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * MAIN_NAV.length, duration: 0.4, ease: EASE }}
                >
                  <Link
                    href={REGISTRATION_ROUTE}
                    onClick={() => setOpen(false)}
                    className="block rounded-full px-6 py-3.5 text-center text-[15px] font-semibold shadow-[0_10px_24px_rgba(180,39,28,0.22)]"
                    style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                  >
                    <Editable cle="commun.nav.cta_libelle_mobile" />
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
