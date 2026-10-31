"use client";

import { useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";

/**
 * Scène 3D décorative du hero.
 *
 * Un objet organique (sphère à distorsion) qui respire et suit légèrement le
 * pointeur, aux couleurs de l'AESBT. Purement esthétique et non essentiel :
 * la page reste parfaitement lisible sans lui.
 *
 * Monté uniquement côté client (voir ClientHeroScene) : WebGL n'existe pas en
 * SSR.
 */
function Knot(props: ThreeElements["mesh"]) {
  const ref = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.y += delta * 0.15;
    // Suivi doux du pointeur (parallaxe 3D).
    mesh.rotation.x += (state.pointer.y * 0.3 - mesh.rotation.x) * 0.05;
    mesh.position.x += (state.pointer.x * 0.4 - mesh.position.x) * 0.04;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref} {...props}>
        <icosahedronGeometry args={[1.25, 12]} />
        <MeshDistortMaterial
          color="#c0392b"
          emissive="#7a1f16"
          emissiveIntensity={0.15}
          roughness={0.35}
          metalness={0.2}
          distort={0.38}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <directionalLight position={[-3, -2, -1]} intensity={0.4} color="#e6b800" />
      <Knot />
    </Canvas>
  );
}
