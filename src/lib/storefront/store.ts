import "server-only";

import { cache } from "react";

import {
  StorefrontError,
  getCatalog,
  getStoreInfo,
  getTopProductIds,
  media,
} from "./client";
import { buildCategoryTree, productsByIds } from "./catalog";
import { normalizeCurrency } from "./currency";
import type { CatalogResponse, Category, Product, StoreBanner } from "./types";

/**
 * Why the storefront has no data. A rejected key needs a person to fix the
 * configuration; a network blip resolves itself, so the two must not show the
 * same message.
 */
export type FailureReason = "auth" | "unavailable";

/** Everything the shell needs, with safe defaults when the API is unreachable. */
export interface StoreSummary {
  name: string;
  /** Normalised currency code the store prices in (`"USD"`, `"UZS"`). */
  currency: string;
  banners: StoreBanner[];
  /** False when the storefront key is missing or rejected. */
  configured: boolean;
  reason?: FailureReason;
  error?: string;
}

export interface CatalogView {
  products: Product[];
  categories: Category[];
  topProducts: Product[];
  showImages: boolean;
  showStock: boolean;
  configured: boolean;
  reason?: FailureReason;
  error?: string;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : "Do'kon ma'lumotlari yuklanmadi";
}

/**
 * Image URLs arrive either absolute (a CDN or a URL the shop owner pasted) or
 * relative to the API host. Resolving them here means client components only
 * ever see absolute URLs, and can treat anything else as malformed.
 */
function withAbsoluteImages(catalog: CatalogResponse): CatalogResponse {
  return {
    ...catalog,
    results: catalog.results.map((product) => ({
      ...product,
      image: media(product.image),
    })),
    category_images: catalog.category_images.map((category) => ({
      ...category,
      image: media(category.image),
    })),
  };
}

/** A missing or rejected key is a setup problem; anything else is transient. */
function classify(error: unknown): FailureReason {
  if (error instanceof StorefrontError) {
    if (error.status === 401 || error.status === 403 || error.status === 500) {
      return "auth";
    }
  }
  return "unavailable";
}

/**
 * A failed store call must not blank the whole site — the layout renders the
 * shell either way and surfaces the reason on the page instead.
 */
export const getStore = cache(async (): Promise<StoreSummary> => {
  try {
    const info = await getStoreInfo();
    return {
      name: info.store || info.organization || "Casego",
      currency: normalizeCurrency(info.currency) || "UZS",
      banners: (info.banners ?? []).map((banner) => ({
        ...banner,
        image: media(banner.image),
      })),
      configured: true,
    };
  } catch (error) {
    return {
      name: "Casego",
      currency: "UZS",
      banners: [],
      configured: false,
      reason: classify(error),
      error: describe(error),
    };
  }
});

/**
 * The catalog, its derived category tree and the best-seller list, resolved in
 * one place. The API has no per-product endpoint, so every page that needs a
 * product reads it out of this list.
 */
export const getCatalogView = cache(
  async (customerCode?: string): Promise<CatalogView> => {
    try {
      const [raw, top] = await Promise.all([
        getCatalog(customerCode),
        // Best sellers are a nice-to-have; never fail the page over them.
        getTopProductIds(12).catch(() => ({ product_ids: [] })),
      ]);

      const catalog = withAbsoluteImages(raw);

      return {
        products: catalog.results ?? [],
        categories: buildCategoryTree(catalog),
        topProducts: productsByIds(top.product_ids ?? [], catalog.results ?? []),
        showImages: catalog.show_images !== false,
        showStock: catalog.show_stock !== false,
        configured: true,
      };
    } catch (error) {
      return {
        products: [],
        categories: [],
        topProducts: [],
        showImages: true,
        showStock: true,
        configured: false,
        reason: classify(error),
        error: describe(error),
      };
    }
  },
);

export const findProduct = cache(async (
  id: number,
  customerCode?: string,
): Promise<Product | null> => {
  const { products } = await getCatalogView(customerCode);
  return products.find((product) => product.id === id) ?? null;
});
