import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartPanel } from "@/components/AddToCartPanel";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductImage } from "@/components/ProductImage";
import { similarProducts } from "@/lib/storefront/catalog";
import { getCustomerCode } from "@/lib/customer/session";
import { displayPrice } from "@/lib/storefront/product-view";
import { findProduct, getCatalogView, getStore } from "@/lib/storefront/store";

export const revalidate = 60;

/** Every product gets a real, indexable URL — pre-rendered from the catalog. */
export async function generateStaticParams() {
  const { products } = await getCatalogView();
  return products.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(Number(id));
  if (!product) return { title: "Mahsulot topilmadi" };

  const description =
    product.description?.trim() ||
    `${product.name} — ${product.category_name ?? "Casego"} do'konida.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();
  const customerCode = await getCustomerCode();

  const [product, catalog, store] = await Promise.all([
    findProduct(productId, customerCode),
    getCatalogView(customerCode),
    getStore(),
  ]);

  if (!product) notFound();

  const similar = similarProducts(product, catalog.products, 4);
  const price = displayPrice(product, store.currency);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-faint">
        <Link href="/" className="transition hover:text-foreground">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/catalog" className="transition hover:text-foreground">
          Katalog
        </Link>
        {product.category_id && product.category_name && (
          <>
            <span>/</span>
            <Link
              href={`/catalog?category=${product.category_id}`}
              className="transition hover:text-foreground"
            >
              {product.category_name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
          {catalog.showImages ? (
            <ProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 512px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center text-lg font-medium text-muted">
              {product.name}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          {product.sku && (
            <div className="mt-2 font-mono text-xs text-faint">{product.sku}</div>
          )}

          <AddToCartPanel
            product={product}
            showStock={catalog.showStock}
            fallbackPrice={price}
          />

          {product.description?.trim() && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold">Tavsif</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            </div>
          )}

          {Object.keys(product.attributes ?? {}).length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold">Xususiyatlari</h2>
              <dl className="mt-3 divide-y divide-border text-sm">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-6 py-2">
                    <dt className="text-muted">{key}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold tracking-tight">O&apos;xshash mahsulotlar</h2>
          <div className="mt-5">
            <ProductGrid
              products={similar}
              showImages={catalog.showImages}
              showStock={catalog.showStock}
            />
          </div>
        </section>
      )}
    </div>
  );
}
