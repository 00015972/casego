import type { Metadata } from "next";
import Link from "next/link";

import { CatalogCategorySections } from "@/components/CatalogCategorySections";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryChipBar } from "@/components/CategoryChipBar";
import { ProductGrid } from "@/components/ProductGrid";
import { SetupNotice } from "@/components/SetupNotice";
import { categoryWithDescendants, searchProducts, suggestProducts } from "@/lib/storefront/catalog";
import { getCustomerCode } from "@/lib/customer/session";
import { getCatalogView } from "@/lib/storefront/store";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Katalog",
  description: "Casego katalogi — g'iloflar, himoya oynalari va aksessuarlar.",
};

interface CatalogSearchParams {
  q?: string;
  category?: string;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { q, category } = await searchParams;
  const customerCode = await getCustomerCode();
  const catalog = await getCatalogView(customerCode);

  if (!catalog.configured) {
    return <SetupNotice reason={catalog.reason} error={catalog.error} />;
  }

  // The API offers no search or filtering, so both run over the cached catalog.
  let products = catalog.products;

  const categoryId = category ? Number(category) : null;
  if (categoryId && Number.isFinite(categoryId)) {
    const ids = categoryWithDescendants(catalog.categories, categoryId);
    products = products.filter(
      (product) => product.category_id != null && ids.has(product.category_id),
    );
  }

  const query = q?.trim();
  if (query) products = searchProducts(query, products);
  const fallbackProducts = query && products.length === 0
    ? suggestProducts(query, catalog.products, 8)
    : [];

  const heading = query
    ? `“${query}” bo'yicha natijalar`
    : (categoryId &&
        catalog.categories
          .flatMap((c) => [c, ...c.children])
          .find((c) => c.id === categoryId)?.name) ||
      "Barcha mahsulotlar";

  if (!query && !categoryId && products.length > 0) {
    return (
      <CatalogCategorySections
        categories={catalog.categories}
        products={products}
        showImages={catalog.showImages}
        showStock={catalog.showStock}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <CategoryChipBar
        categories={catalog.categories}
        activeId={categoryId}
        query={query}
      />
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <CategoryFilter
            categories={catalog.categories}
            activeId={categoryId}
            query={query}
            total={catalog.products.length}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
            <span className="shrink-0 text-sm text-faint">
              {products.length} ta
            </span>
          </div>

          <div className="mt-6">
            {products.length > 0 ? (
              <ProductGrid
                products={products}
                showImages={catalog.showImages}
                showStock={catalog.showStock}
              />
            ) : fallbackProducts.length > 0 ? (
              <div>
                <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center">
                  <p className="text-sm text-muted">“{query}” bo&apos;yicha aniq mos kelmadi.</p>
                </div>
                <h2 className="mb-4 mt-8 text-base font-semibold">Shunga o&apos;xshash mahsulotlar</h2>
                <ProductGrid products={fallbackProducts} showImages={catalog.showImages} showStock={catalog.showStock} />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
                <p className="text-sm text-muted">Hech narsa topilmadi.</p>
                <Link href="/catalog" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">Butun katalogni ko&apos;rish</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
