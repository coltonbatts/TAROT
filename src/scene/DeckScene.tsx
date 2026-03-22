import { useMemo, useState } from "react";
import * as THREE from "three";
import type { TarotCard } from "../lib/tarot";
import { computeSphereLayout } from "./computeSphereLayout";
import { CardMesh } from "./CardMesh";
import { CameraRig } from "./CameraRig";

const VOID = "#000000";

type DeckSceneProps = {
  cards: TarotCard[];
  textures: Record<string, THREE.Texture>;
  onSelectCard: (card: TarotCard) => void;
  reducedMotion: boolean;
};

export function DeckScene({ cards, textures, onSelectCard, reducedMotion }: DeckSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const layout = useMemo(() => computeSphereLayout(cards.length), [cards.length]);

  const vectors = useMemo(() => layout.map((slot) => new THREE.Vector3(...slot.position)), [layout]);

  return (
    <>
      <color attach="background" args={[VOID]} />
      <fog attach="fog" args={[VOID, 10, 36]} />

      <ambientLight intensity={0.32} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={0.82}
        color="#e8e4dc"
        castShadow={false}
      />
      <directionalLight position={[-8, 6, -10]} intensity={0.18} color="#9a958c" />

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
              selected={false}
              hovered={card.id === hoveredId}
              reducedMotion={reducedMotion}
              onSelect={onSelectCard}
              onPointerOver={() => setHoveredId(card.id)}
              onPointerOut={() => setHoveredId((current) => (current === card.id ? null : current))}
            />
          );
        })}
      </group>

      <CameraRig reducedMotion={reducedMotion} />
    </>
  );
}
