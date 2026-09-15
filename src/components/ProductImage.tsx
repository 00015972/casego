"use client";

import { SafeImage } from "./SafeImage";
import { BoxIcon } from "./icons";

/** Product photography is optional in the ERP, and pasted URLs often rot. */
export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className="object-cover transition duration-300 group-hover:scale-[1.03]"
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-surface text-faint">
          <BoxIcon size={40} />
        </div>
      }
    />
  );
}
