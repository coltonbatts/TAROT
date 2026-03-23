import { useEffect, useRef, useState } from "react";
import { TAROT_CARD_IMAGE_FALLBACK } from "../lib/tarot";

type TarotCardImageProps = {
  src: string;
  /** If `src` fails (e.g. missing thumbnail), try this URL before the global fallback. */
  highResSrc?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function TarotCardImage({ src, highResSrc, alt, className, loading }: TarotCardImageProps) {
  const [resolved, setResolved] = useState(src);
  const triedHighRes = useRef(false);
  const usedGlobalFallback = useRef(false);

  useEffect(() => {
    setResolved(src);
    triedHighRes.current = false;
    usedGlobalFallback.current = false;
  }, [src]);

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        if (highResSrc && !triedHighRes.current && resolved !== highResSrc) {
          triedHighRes.current = true;
          setResolved(highResSrc);
          return;
        }
        if (!usedGlobalFallback.current && resolved !== TAROT_CARD_IMAGE_FALLBACK) {
          usedGlobalFallback.current = true;
          setResolved(TAROT_CARD_IMAGE_FALLBACK);
        }
      }}
    />
  );
}
