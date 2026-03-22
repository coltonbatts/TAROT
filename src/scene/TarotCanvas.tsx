import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { tarotCards } from "../lib/tarot";
import type { TarotCard } from "../lib/tarot";
import { DeckScene } from "./DeckScene";

const TEXTURE_URLS: Record<string, string> = Object.fromEntries(
  tarotCards.map((card) => [card.id, card.imagePath]),
);

type TarotCanvasProps = {
  cards: TarotCard[];
  onSelectCard: (card: TarotCard) => void;
  reducedMotion: boolean;
};

function DeckWithTextures(props: TarotCanvasProps) {
  const textures = useTexture(TEXTURE_URLS);
  return <DeckScene textures={textures} {...props} />;
}

export function TarotCanvas({ cards, onSelectCard, reducedMotion }: TarotCanvasProps) {
  const glConfig = useMemo(
    () => ({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance" as const,
      outputColorSpace: THREE.SRGBColorSpace,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1,
    }),
    [],
  );

  return (
    <Canvas className="h-full min-h-[280px] w-full flex-1 touch-none lg:min-h-[400px]" dpr={[1, 2]} gl={glConfig} shadows={false}>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[7.8, 3.15, 7.8]} fov={50} near={0.08} far={120} />
        <DeckWithTextures cards={cards} onSelectCard={onSelectCard} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
