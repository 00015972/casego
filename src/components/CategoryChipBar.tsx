"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { Category } from "@/lib/storefront/types";

import { SafeImage } from "./SafeImage";
import { BoxIcon } from "./icons";

function hrefFor(categoryId: number | null, query?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category", String(categoryId));
  if (query) params.set("q", query);
  const suffix = params.toString();
  return suffix ? `/catalog?${suffix}` : "/catalog";
}

/** A thumb-friendly category rail that pins itself beneath the site header. */
export function CategoryChipBar({
  categories,
  activeId,
  query,
  onCategorySelect,
}: {
  categories: Category[];
  activeId: number | null;
  query?: string;
  onCategorySelect?: (categoryId: number) => void;
}) {
  const chipRefs = useRef(new Map<number, HTMLAnchorElement>());

  useEffect(() => {
    if (activeId === null) return;
    chipRefs.current.get(activeId)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  return (
    <nav aria-label="Tezkor kategoriyalar" className="sticky top-[7.5rem] z-30 -mx-4 border-y border-border bg-background/92 px-4 py-3 backdrop-blur sm:top-16">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto">
        <Link href={hrefFor(null, query)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${activeId === null ? "border-foreground bg-foreground text-background" : "border-border bg-surface-raised text-muted"}`}>
          Hammasi
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            ref={(node) => {
              if (node) chipRefs.current.set(category.id, node);
              else chipRefs.current.delete(category.id);
            }}
            href={onCategorySelect ? `#category-${category.id}` : hrefFor(category.id, query)}
            onClick={onCategorySelect ? (event) => {
              event.preventDefault();
              onCategorySelect(category.id);
            } : undefined}
            aria-current={activeId === category.id ? "true" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-xs font-medium transition ${activeId === category.id ? "border-foreground bg-foreground text-background shadow-sm" : "border-border bg-surface-raised text-muted hover:border-foreground"}`}
          >
            <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface">
              <SafeImage
                src={category.image}
                alt=""
                sizes="28px"
                className="object-cover"
                fallback={
                  <span className="flex h-full w-full items-center justify-center text-faint">
                    <BoxIcon size={14} />
                  </span>
                }
              />
            </span>
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
