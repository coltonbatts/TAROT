import { useEffect, useRef, useState } from "react";
import { TAROT_CARD_IMAGE_FALLBACK } from "../lib/tarot";

type TarotCardImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function TarotCardImage({ src, alt, className, loading }: TarotCardImageProps) {
  const [resolved, setResolved] = useState(src);
  const usedFallback = useRef(false);

  useEffect(() => {
    setResolved(src);
    usedFallback.current = false;
  }, [src]);

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (!usedFallback.current && resolved !== TAROT_CARD_IMAGE_FALLBACK) {
          usedFallback.current = true;
          setResolved(TAROT_CARD_IMAGE_FALLBACK);
        }
      }}
    />
  );
}
