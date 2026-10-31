"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MAIN_NAV, REGISTRATION_ROUTE } from "@/config/site";
import { useScrollProgress } from "@/lib/animation/scroll-context";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { actionButtonClass } from "@/components/ui-aesbt/ActionButton";

/**
 * En-tête institutionnel, sticky et responsive.
 * Les boutons « Inscription » et « Connexion » mènent aux pages internes
 * /inscription et /connexion, sur ordinateur comme dans le menu mobile.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const { progress } = useScrollProgress();
  // Au-delà de ~50 %, la barre immersive prend le relais : on efface l'en-tête
  // classique pour éviter la superposition.
  const handedOver = progress >= 0.5 && !open;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const registrationButton = (
    <Link
      href={REGISTRATION_ROUTE}
      onClick={() => setOpen(false)}
      className={actionButtonClass("primary", "px-5 py-2.5 text-[13px]")}
    >
      Inscription
    </Link>
  );

  return (
    <motion.header
      animate={{ y: handedOver ? -80 : 0, opacity: handedOver ? 0 : 1 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      style={{ pointerEvents: handedOver ? "none" : "auto" }}
      className="sticky top-0 z-50 border-b border-line/70 bg-frost/80 backdrop-blur-md"
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-6">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              href={item.to}
              exact={item.to === "/"}
              activeClassName="text-accent-blue"
              className="text-[13.5px] font-medium text-ink-soft transition-colors hover:text-accent-blue"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Entrée de l'espace réservé : sans ce lien, la page de connexion
              n'était atteignable qu'en tapant son adresse. */}
          <Link
            href="/connexion"
            className="hidden text-[13.5px] font-medium text-ink-soft transition-colors hover:text-accent-blue sm:block"
          >
            Connexion
          </Link>
          <div className="hidden sm:block">{registrationButton}</div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-md ring-1 ring-line md:hidden"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-px w-5 bg-ink" />
              <span className="block h-px w-5 bg-ink" />
              <span className="block h-px w-5 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="border-t border-line/70 bg-frost md:hidden">
          <nav aria-label="Navigation mobile" className="mx-auto max-w-[1240px] px-6 py-4">
            <ul className="divide-y divide-line/60">
              {MAIN_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    href={item.to}
                    onClick={() => setOpen(false)}
                    exact={item.to === "/"}
                    activeClassName="text-accent-blue"
                    className="block py-3 text-[15px] font-medium text-ink-soft"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-[15px] font-medium text-ink-soft"
                >
                  Connexion
                </Link>
              </li>
            </ul>
            <div className="pt-4 sm:hidden">{registrationButton}</div>
          </nav>
        </div>
      ) : null}
    </motion.header>
  );
}
