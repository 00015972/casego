import type { CategoryProductGroup } from "@/lib/storefront/catalog";

import { ProductGrid } from "./ProductGrid";

/**
 * Every product, one section per top-level category. The section IDs are the
 * scroll targets for whichever category navigation sits above the list.
 */
export function CategorySections({
  groups,
  showImages,
  showStock,
}: {
  groups: CategoryProductGroup[];
  showImages: boolean;
  showStock: boolean;
}) {
  return (
    <div className="mt-8 space-y-14">
      {groups.map(({ category, products }, index) => (
        <section
          key={category.id}
          id={`category-${category.id}`}
          data-category-section={category.id}
          className="scroll-mt-36"
        >
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {category.name}
            </h2>
            <span className="shrink-0 text-xs text-faint">
              {products.length} ta
            </span>
          </div>
          <ProductGrid
            products={products}
            showImages={showImages}
            showStock={showStock}
            priority={index === 0}
          />
        </section>
      ))}
    </div>
  );
}
