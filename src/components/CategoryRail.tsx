"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { scrollBehavior, scrollToSection } from "@/lib/scroll";
import type { Category } from "@/lib/storefront/types";

import { SafeImage } from "./SafeImage";
import { BoxIcon } from "./icons";

const EASE = "duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)]";

/**
 * Top-level categories in a bar that pins beneath the header and compacts once
 * pinned. Each chip scrolls to its section in the grouped list further down,
 * and the chip for the section passing beneath the bar stays highlighted.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  const navRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<number, HTMLAnchorElement>());
  const [stuck, setStuck] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(
    categories[0]?.id ?? null,
  );

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const nav = navRef.current;
      if (!nav) return;

      // Compacting changes the bar's height but never its top edge, so this
      // measurement cannot flip back and forth on its own.
      const rect = nav.getBoundingClientRect();
      setStuck(rect.top <= parseFloat(getComputedStyle(nav).top) + 1);

      let nextId = categories[0]?.id ?? null;
      for (const category of categories) {
        const section = document.getElementById(`category-${category.id}`);
        if (!section || section.getBoundingClientRect().top > rect.bottom + 40) break;
        nextId = category.id;
      }
      setActiveId(nextId);
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [categories]);

  // Scrolls only the rail itself, so it never fights the page's own scroll.
  useEffect(() => {
    const rail = railRef.current;
    const chip = activeId === null ? undefined : chipRefs.current.get(activeId);
    if (!rail || !chip) return;

    const railRect = rail.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    rail.scrollTo({
      left:
        rail.scrollLeft +
        chipRect.left -
        railRect.left -
        (railRect.width - chipRect.width) / 2,
      behavior: scrollBehavior(),
    });
  }, [activeId]);

  // Client navigation from another page (the drawer, a breadcrumb) lands at
  // the top rather than on the section in the hash, so finish the jump here.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const frame = window.requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ block: "start" }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const scrollToCategory = (categoryId: number) => {
    if (scrollToSection(`category-${categoryId}`)) setActiveId(categoryId);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Kategoriyalar"
      // The bottom margin gives back exactly the height the compact bar loses,
      // so the products below do not jump when it pins.
      className={`sticky top-16 z-30 mt-6 border-b transition-[margin,background-color,border-color,box-shadow] sm:mt-8 ${EASE} ${
        stuck
          ? "mb-5.5 border-border bg-background/95 shadow-[0_2px_12px_rgba(20,20,20,0.05)] backdrop-blur-lg sm:mb-8.5"
          : "border-transparent"
      }`}
    >
      {/* Vertical padding lives on the scroller so the active chip's shadow is not clipped. */}
      <div
        ref={railRef}
        className={`no-scrollbar mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 transition-[padding] sm:gap-2.5 ${EASE} ${
          stuck ? "py-2" : "py-2.5 sm:py-3.5"
        }`}
      >
        {categories.map((category) => {
          const active = activeId === category.id;
          return (
            <Link
              key={category.id}
              ref={(node) => {
                if (node) chipRefs.current.set(category.id, node);
                else chipRefs.current.delete(category.id);
              }}
              href={`#category-${category.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToCategory(category.id);
              }}
              aria-current={active ? "true" : undefined}
              // Auto margins centre a short row but collapse once it overflows,
              // so the first chip always stays reachable.
              className={`group flex shrink-0 items-center whitespace-nowrap rounded-[14px] border font-medium transition-all first:ml-auto last:mr-auto ${EASE} ${
                stuck
                  ? "h-10 gap-1.5 pl-1.5 pr-3.5 text-xs sm:h-10.5 sm:gap-2 sm:pr-4 sm:text-[12.5px]"
                  : "h-14.5 gap-2.5 pl-2 pr-4.5 text-[13px] sm:h-16 sm:gap-3 sm:pl-2.5 sm:pr-5.5 sm:text-sm"
              } ${
                active
                  ? "border-foreground bg-foreground text-background shadow-[0_4px_14px_rgba(20,20,20,0.18)]"
                  : "border-border bg-surface-raised text-foreground hover:border-foreground"
              }`}
            >
              <span
                className={`relative shrink-0 overflow-hidden bg-surface shadow-[0_2px_6px_rgba(20,20,20,0.08)] transition-all ${EASE} ${
                  stuck
                    ? "h-6.5 w-6.5 rounded-lg sm:h-7 sm:w-7"
                    : "h-11 w-11 rounded-[10px] sm:h-12 sm:w-12"
                }`}
              >
                <SafeImage
                  src={category.image}
                  alt=""
                  sizes="48px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                  fallback={
                    <span className="flex h-full w-full items-center justify-center text-faint">
                      <BoxIcon size={16} />
                    </span>
                  }
                />
              </span>
              <span>{category.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
