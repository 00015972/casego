"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { groupProductsByCategory } from "@/lib/storefront/catalog";
import type { Category, Product } from "@/lib/storefront/types";

import { CategoryChipBar } from "./CategoryChipBar";
import { CategoryFilter } from "./CategoryFilter";
import { ProductGrid } from "./ProductGrid";

function rootIdFor(categories: Category[], categoryId: number): number {
  const contains = (category: Category): boolean =>
    category.id === categoryId || category.children.some(contains);

  return categories.find(contains)?.id ?? categoryId;
}

/**
 * The unfiltered catalog is one continuous list, grouped in ERP category order.
 * Its navigation follows the section currently passing beneath the sticky bar.
 */
export function CatalogCategorySections({
  categories,
  products,
  showImages,
  showStock,
}: {
  categories: Category[];
  products: Product[];
  showImages: boolean;
  showStock: boolean;
}) {
  const groups = useMemo(
    () => groupProductsByCategory(categories, products),
    [categories, products],
  );
  const [activeId, setActiveId] = useState<number | null>(
    groups[0]?.category.id ?? null,
  );
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const updateActiveCategory = () => {
      frame.current = null;
      const marker = window.innerWidth >= 640 ? 145 : 205;
      let nextId = groups[0]?.category.id ?? null;

      for (const group of groups) {
        const section = document.getElementById(`category-${group.category.id}`);
        if (!section || section.getBoundingClientRect().top > marker) break;
        nextId = group.category.id;
      }

      setActiveId((current) => current === nextId ? current : nextId);
    };

    const scheduleUpdate = () => {
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(updateActiveCategory);
      }
    };

    updateActiveCategory();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [groups]);

  const scrollToCategory = useCallback((categoryId: number) => {
    const rootId = rootIdFor(categories, categoryId);
    const section = document.getElementById(`category-${rootId}`);
    if (!section) return;

    setActiveId(rootId);
    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#category-${rootId}`);
  }, [categories]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <CategoryChipBar
        categories={categories}
        activeId={activeId}
        onCategorySelect={scrollToCategory}
      />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <CategoryFilter
            categories={categories}
            activeId={activeId}
            total={products.length}
            onCategorySelect={scrollToCategory}
          />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight">
              Barcha mahsulotlar
            </h1>
            <span className="shrink-0 text-sm text-faint">
              {products.length} ta
            </span>
          </div>

          <div className="mt-8 space-y-14">
            {groups.map(({ category, products: categoryProducts }) => (
              <section
                key={category.id}
                id={`category-${category.id}`}
                data-category-section={category.id}
                className="scroll-mt-52 sm:scroll-mt-36"
              >
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {category.name}
                  </h2>
                  <span className="shrink-0 text-xs text-faint">
                    {categoryProducts.length} ta
                  </span>
                </div>
                <ProductGrid
                  products={categoryProducts}
                  showImages={showImages}
                  showStock={showStock}
                />
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
