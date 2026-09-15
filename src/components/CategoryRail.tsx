import Link from "next/link";

import type { Category } from "@/lib/storefront/types";

import { SafeImage } from "./SafeImage";
import { BoxIcon } from "./icons";

/** Horizontally scrollable top-level categories with their ERP artwork. */
export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <div className="no-scrollbar -mx-4 mt-5 flex gap-6 overflow-x-auto px-4 pb-2 sm:gap-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalog?category=${category.id}`}
          className="group flex w-32 shrink-0 flex-col items-center gap-3 sm:w-40"
        >
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-surface sm:h-28 sm:w-28">
            <SafeImage
              src={category.image}
              alt=""
              sizes="112px"
              className="object-cover transition duration-300 group-hover:scale-105"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-faint">
                  <BoxIcon size={28} />
                </div>
              }
            />
          </div>
          <span className="line-clamp-3 min-h-11 w-full break-words px-1 text-center text-xs font-medium leading-tight [overflow-wrap:anywhere]">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
