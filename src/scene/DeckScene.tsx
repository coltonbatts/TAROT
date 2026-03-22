import { useMemo, useState } from "react";
import * as THREE from "three";
import type { TarotCard } from "../lib/tarot";
import { computeSphereLayout } from "./computeSphereLayout";
import { CardMesh } from "./CardMesh";
import { CameraRig } from "./CameraRig";

type DeckSceneProps = {
  cards: TarotCard[];
  textures: Record<string, THREE.Texture>;
  selectedSlug: string | null;
  onSelectCard: (card: TarotCard) => void;
  controlsEnabled: boolean;
  reducedMotion: boolean;
};

export function DeckScene({
  cards,
  textures,
  selectedSlug,
  onSelectCard,
  controlsEnabled,
  reducedMotion,
}: DeckSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const layout = useMemo(() => computeSphereLayout(cards.length), [cards.length]);

  const vectors = useMemo(() => layout.map((slot) => new THREE.Vector3(...slot.position)), [layout]);

  const focusPoint = useMemo(() => {
    if (!selectedSlug) {
      return null;
    }
    const index = cards.findIndex((card) => card.slug === selectedSlug);
    if (index < 0) {
      return null;
    }
    return vectors[index]?.clone() ?? null;
  }, [cards, selectedSlug, vectors]);

  return (
    <>
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 10, 36]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={0.85}
        color="#f6f2eb"
        castShadow={false}
      />
      <directionalLight position={[-8, 6, -10]} intensity={0.22} color="#c8d4ff" />
      <pointLight position={[0, -8, 6]} intensity={0.18} color="#d1c4b4" />

      <group>
        {cards.map((card, index) => {
          const texture = textures[card.id];
          if (!texture) {
            return null;
          }

          return (
            <CardMesh
              key={card.id}
              card={card}
              texture={texture}
              targetPosition={vectors[index]!}
              selected={card.slug === selectedSlug}
              hovered={card.id === hoveredId}
              reducedMotion={reducedMotion}
              onSelect={onSelectCard}
              onPointerOver={() => setHoveredId(card.id)}
              onPointerOut={() => setHoveredId((current) => (current === card.id ? null : current))}
            />
          );
        })}
      </group>

      <CameraRig
        selectedSlug={selectedSlug}
        focusPoint={focusPoint}
        controlsEnabled={controlsEnabled}
        reducedMotion={reducedMotion}
      />
    </>
  );
}
