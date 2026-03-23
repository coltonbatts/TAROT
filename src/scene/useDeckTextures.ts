import { useEffect, useState } from "react";
import * as THREE from "three";
import { TAROT_CARD_IMAGE_FALLBACK, tarotCards } from "../lib/tarot";

function loadTexture(
  loader: THREE.TextureLoader,
  url: string,
  fallbackUrl: string,
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const apply = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    };
    loader.load(url, apply, undefined, () => {
      loader.load(fallbackUrl, apply, undefined, reject);
    });
  });
}

/**
 * Loads face textures for the full deck; missing images use `TAROT_CARD_IMAGE_FALLBACK`
 * so a single 404 does not break the spatial view.
 */
export function useDeckTextures(): Record<string, THREE.Texture> | null {
  const [textures, setTextures] = useState<Record<string, THREE.Texture> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();

    Promise.all(
      tarotCards.map((card) =>
        loadTexture(loader, card.imagePath, TAROT_CARD_IMAGE_FALLBACK).then((tex) => [
          card.id,
          tex,
        ] as const),
      ),
    ).then((pairs) => {
      if (cancelled) {
        pairs.forEach(([, t]) => t.dispose());
        return;
      }
      setTextures((prev) => {
        if (prev) Object.values(prev).forEach((t) => t.dispose());
        return Object.fromEntries(pairs);
      });
    });

    return () => {
      cancelled = true;
      setTextures((prev) => {
        if (prev) Object.values(prev).forEach((t) => t.dispose());
        return null;
      });
    };
  }, []);

  return textures;
}
