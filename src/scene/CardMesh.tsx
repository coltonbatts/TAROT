import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { TarotCard } from "../lib/tarot";

type CardMeshProps = {
  card: TarotCard;
  texture: THREE.Texture;
  targetPosition: THREE.Vector3;
  selected: boolean;
  hovered: boolean;
  onSelect: (card: TarotCard) => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  reducedMotion: boolean;
};

/** Slightly larger planes = easier picking without changing art aspect. */
const WIDTH = 1.14;
const HEIGHT = WIDTH * (8 / 5);

export function CardMesh({
  card,
  texture,
  targetPosition,
  selected,
  hovered,
  onSelect,
  onPointerOver,
  onPointerOut,
  reducedMotion,
}: CardMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const smoothPos = useRef(new THREE.Vector3().copy(targetPosition));
  const { camera } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const k = reducedMotion ? 18 : 10;
    smoothPos.current.lerp(targetPosition, 1 - Math.exp(-k * dt));
    mesh.position.copy(smoothPos.current);

    const p = mesh.position;
    const outward =
      p.lengthSq() > 1e-5 ? p.clone().normalize() : new THREE.Vector3(0, 0, 1);
    mesh.lookAt(p.x + outward.x, p.y + outward.y, p.z + outward.z);

    if (selected) {
      const toCam = camera.position.clone().sub(mesh.position).normalize();
      mesh.position.addScaledVector(toCam, reducedMotion ? 0.26 : 0.24);
    }

    const aimHover = hovered || selected ? 1 : 0;
    const baseScale = 1 + aimHover * 0.045 + (selected ? 0.07 : 0);
    const pulse =
      selected && !reducedMotion ? Math.sin(performance.now() * 0.0022) * 0.014 : 0;
    mesh.scale.setScalar(baseScale + pulse);

    const targetEmissive = aimHover * 0.055 + (selected ? 0.05 : 0);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 1 - Math.exp(-12 * dt));
    const warmth = Math.min(1, mat.emissiveIntensity * 7);
    mat.emissive.setRGB(0.76 * warmth, 0.72 * warmth, 0.66 * warmth);
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(card);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onPointerOver();
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onPointerOut();
      }}
    >
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        roughness={0.42}
        metalness={0.06}
        emissive="#000000"
        emissiveIntensity={0}
      />
    </mesh>
  );
}
