import { useEffect, useState } from "react";
import * as THREE from "three";
import { TAROT_CARD_IMAGE_FALLBACK, tarotCards } from "../lib/tarot";
import { tarotCardThumbnailPath } from "../lib/tarot/thumbnailPath";

function loadTextureChain(loader: THREE.TextureLoader, urls: string[]): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const apply = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    };
    let i = 0;
    const tryNext = () => {
      const url = urls[i];
      if (url == null) {
        reject(new Error("No texture URLs"));
        return;
      }
      i += 1;
      loader.load(url, apply, undefined, tryNext);
    };
    tryNext();
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
      tarotCards.map((card) => {
        const thumb = tarotCardThumbnailPath(card.imagePath);
        const urls = thumb === card.imagePath ? [card.imagePath, TAROT_CARD_IMAGE_FALLBACK] : [thumb, card.imagePath, TAROT_CARD_IMAGE_FALLBACK];
        return loadTextureChain(loader, urls).then((tex) => [card.id, tex] as const);
      }),
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
