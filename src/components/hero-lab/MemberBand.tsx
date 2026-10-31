"use client";
import type { ComponentType } from "react";
import CircularCarouselBrut from "@/components/CircularCarousel";

/** CircularCarousel.jsx n'a pas de types stricts : on le détype ici, comme Folder. */
const CircularCarousel = CircularCarouselBrut as unknown as ComponentType<Record<string, unknown>>;

const MEMBERS = [
  { src: "/aesbt/faces/face1.jpg", alt: "Membre de l'AESBT", title: "Fatou", subtitle: "Étudiante" },
  { src: "/aesbt/faces/face2.jpg", alt: "Membre de l'AESBT", title: "Ibrahim", subtitle: "Stagiaire" },
  { src: "/aesbt/faces/face3.jpg", alt: "Membre de l'AESBT", title: "Awa", subtitle: "Étudiante" },
  { src: "/aesbt/faces/face4.jpg", alt: "Membre de l'AESBT", title: "Boureima", subtitle: "Étudiant" },
  { src: "/aesbt/faces/face5.jpg", alt: "Membre de l'AESBT", title: "Salimata", subtitle: "Stagiaire" },
  { src: "/aesbt/faces/face6.jpg", alt: "Membre de l'AESBT", title: "Yacouba", subtitle: "Étudiant" },
  { src: "/aesbt/faces/face7.jpg", alt: "Membre de l'AESBT", title: "Aminata", subtitle: "Étudiante" },
  { src: "/aesbt/faces/face8.jpg", alt: "Membre de l'AESBT", title: "Sana", subtitle: "Stagiaire" },
];

/**
 * Visages de la communauté, en carrousel 3D (`CircularCarousel`), sur le
 * crème et or pâle qui court déjà derrière `CtaBand`.
 */
export function MemberBand() {
  return (
    <section className="relative isolate bg-[#FBF6EF] py-10 sm:py-16">
      <div className="mx-auto h-[420px] w-full max-w-[1180px] sm:h-[520px]">
        <CircularCarousel
          items={MEMBERS}
          preset="cylinder"
          intro="rise"
          cardWidth={220}
          aspectRatio={1}
          speed={14}
          captions={false}
          gap={25}
          tilt={-5}
          curve={1}
          perspective={2500}
          autoplay="drift"
          interval={3}
          direction="left"
          momentum={0.6}
          snap
          pauseOnHover
          focusOnClick
          draggable
          parallax={0.3}
          stretch={0.5}
          fadeColor="#FBF6EF"
          depthFade={0.55}
          innerShade={0.6}
          cornerRadius={12}
        />
      </div>
    </section>
  );
}
