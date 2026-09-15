"use client";

import Link from "next/link";

import type { Category } from "@/lib/storefront/types";

import { SafeImage } from "./SafeImage";
import { BoxIcon } from "./icons";

/** Preserves an active search when switching category, and vice versa. */
function hrefFor(categoryId: number | null, query?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category", String(categoryId));
  if (query) params.set("q", query);
  const suffix = params.toString();
  return suffix ? `/catalog?${suffix}` : "/catalog";
}

export function CategoryFilter({
  categories,
  activeId,
  query,
  total,
  onCategorySelect,
}: {
  categories: Category[];
  activeId: number | null;
  query?: string;
  total: number;
  onCategorySelect?: (categoryId: number) => void;
}) {
  const rowClass = (active: boolean) =>
    `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${
      active ? "bg-surface font-medium text-foreground" : "text-muted hover:text-foreground"
    }`;

  const categoryArtwork = (category: Category, size = "h-9 w-9") => (
    <span className={`relative ${size} shrink-0 overflow-hidden rounded-lg bg-surface`}>
      <SafeImage
        src={category.image}
        alt=""
        sizes="36px"
        className="object-cover"
        fallback={
          <span className="flex h-full w-full items-center justify-center text-faint">
            <BoxIcon size={16} />
          </span>
        }
      />
    </span>
  );

  const scrollLinkProps = (categoryId: number) => onCategorySelect ? {
    href: `#category-${categoryId}`,
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onCategorySelect(categoryId);
    },
  } : {
    href: hrefFor(categoryId, query),
  };

  return (
    <nav aria-label="Kategoriyalar" className="lg:sticky lg:top-36">
      <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
        Kategoriyalar
      </div>

      <Link href={hrefFor(null, query)} className={rowClass(activeId === null)}>
        <span>Hammasi</span>
        <span className="text-xs text-faint">{total}</span>
      </Link>

      {categories.map((category) => (
        <div key={category.id}>
          <Link
            {...scrollLinkProps(category.id)}
            className={rowClass(activeId === category.id)}
            aria-current={activeId === category.id ? "true" : undefined}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              {categoryArtwork(category)}
              <span className="line-clamp-2">{category.name}</span>
            </span>
            <span className="shrink-0 text-xs text-faint">{category.count}</span>
          </Link>

          {category.children.length > 0 && (
            <div className="ml-3 border-l border-border pl-2">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  {...scrollLinkProps(child.id)}
                  className={rowClass(activeId === child.id)}
                  aria-current={activeId === child.id ? "true" : undefined}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {categoryArtwork(child, "h-7 w-7")}
                    <span className="line-clamp-2">{child.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-faint">{child.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
