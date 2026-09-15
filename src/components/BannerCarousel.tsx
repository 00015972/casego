"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { StoreBanner } from "@/lib/storefront/types";

import { SafeImage } from "./SafeImage";

export interface CarouselBanner extends Omit<StoreBanner, "image"> {
  image: string | StaticImageData;
  eyebrow?: string;
  description?: string;
}

/** Banners are uploaded in the ERP under "Online do'kon → Bannerlar". */
export function BannerCarousel({ banners }: { banners: CarouselBanner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % banners.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface shadow-[0_18px_45px_rgba(22,21,15,0.08)] sm:rounded-3xl">
      <div className="relative aspect-[4/3] w-full min-h-72 sm:aspect-[12/5] sm:min-h-0">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "z-10 opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {typeof banner.image === "string" ? (
              <SafeImage
                src={banner.image}
                alt={banner.title || ""}
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover object-[68%_center] sm:object-center"
                fallback={null}
              />
            ) : (
              <Image
                src={banner.image}
                alt=""
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover object-[68%_center] sm:object-center"
              />
            )}

            {banner.title && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-transparent sm:via-white/20">
                <div className="flex h-full max-w-[72%] flex-col items-start justify-center px-6 pb-8 sm:max-w-[46%] sm:px-10 sm:pb-0 lg:px-16">
                  {banner.eyebrow && (
                    <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1152bd] sm:text-xs">
                      {banner.eyebrow}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold leading-[1.05] tracking-tight text-[#111827] sm:text-3xl lg:text-5xl">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="mt-3 max-w-md text-xs leading-relaxed text-[#4b5563] sm:text-sm lg:text-base">
                      {banner.description}
                    </p>
                  )}
                  <Link
                    href="/#all-products"
                    tabIndex={i === index ? 0 : -1}
                    className="mt-5 inline-flex rounded-full bg-[#1152bd] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0d4299] sm:px-6 sm:text-sm"
                  >
                    Xarid qilish
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              onClick={() => setIndex(i)}
              aria-label={`Banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#1152bd]" : "w-1.5 bg-[#1152bd]/35"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
