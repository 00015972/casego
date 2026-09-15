"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * `next/image` throws during render on a src it cannot parse, which turns one
 * bad catalog row into a 500 for the whole page. Catalog image URLs are typed
 * by hand into the ERP, so malformed ones are expected rather than exceptional.
 */
export function isRenderableImageUrl(src: string | null | undefined): boolean {
  if (!src?.trim()) return false;
  try {
    const { protocol } = new URL(src);
    return protocol === "https:" || protocol === "http:";
  } catch {
    // Relative paths are made absolute server-side, so anything still relative
    // here is malformed.
    return false;
  }
}

/**
 * Renders `fallback` instead of throwing when the URL is unusable, and swaps to
 * it again if the image 404s or the optimizer rejects it (an SVG, say) at
 * runtime.
 */
export function SafeImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  // A changed src deserves a fresh attempt rather than inheriting the old
  // failure, so the retry flag is keyed to the URL.
  const [attemptedSrc, setAttemptedSrc] = useState(src);
  if (src !== attemptedSrc) {
    setAttemptedSrc(src);
    setFailed(false);
  }

  if (failed || !isRenderableImageUrl(src)) return <>{fallback}</>;

  return (
    <Image
      src={src as string}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
