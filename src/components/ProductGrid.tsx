import type { Product } from "@/lib/storefront/types";

import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  showImages = true,
  showStock = true,
  priority = true,
}: {
  products: Product[];
  showImages?: boolean;
  showStock?: boolean;
  /** Preloads the first row; long pages turn it off for grids further down. */
  priority?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          showImages={showImages}
          showStock={showStock}
          priority={priority && index < 5}
        />
      ))}
    </div>
  );
}
