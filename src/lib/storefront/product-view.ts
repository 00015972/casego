import { isOutOfStock } from "./catalog";
import { isWeightUnit, normalizeCurrency } from "./currency";
import type { Product, ProductUnit, ProductVariant } from "./types";

/**
 * Prices arrive twice over: `price` in the store's own currency, and
 * `cur_price` converted into the product's `currency`. A so'm store whose
 * products are costed in USD therefore reports both 32 280 and 2.69.
 *
 * The store currency leads, because that is what a local customer pays; the
 * converted figure rides along as a secondary label, and is dropped when it
 * would merely repeat the same number in the same currency.
 */
export interface DisplayPrice {
  amount: number;
  /** Struck-through original, when the ERP records a discount. */
  original: number | null;
  currency: string;
  /** True when several options exist, so the card shows a "from" price. */
  isFrom: boolean;
  /** The same price in the product's costing currency, when it differs. */
  alt: { amount: number; currency: string } | null;
}

function buildAlt(
  converted: number | null | undefined,
  currency: string | null | undefined,
  storeCurrency: string,
): DisplayPrice["alt"] {
  const code = normalizeCurrency(currency);
  if (!code || code === normalizeCurrency(storeCurrency)) return null;
  if (converted == null) return null;
  return { amount: converted, currency: code };
}

function cheapest<T>(items: T[], priceOf: (item: T) => number): T {
  return items.reduce((low, item) => (priceOf(item) < priceOf(low) ? item : low));
}

export function displayPrice(
  product: Product,
  storeCurrency: string,
): DisplayPrice {
  if (product.has_variants && product.variants.length > 0) {
    const pick = cheapest<ProductVariant>(product.variants, (v) => v.price);
    return {
      amount: pick.price,
      original: pick.original_price,
      currency: storeCurrency,
      isFrom: product.variants.length > 1,
      alt: buildAlt(pick.cur_price, pick.currency, storeCurrency),
    };
  }

  const units = product.units ?? [];
  if (units.length > 0) {
    const pick = cheapest<ProductUnit>(units, (u) => u.price);
    return {
      amount: pick.price,
      original: pick.original_price,
      currency: storeCurrency,
      isFrom: units.length > 1,
      alt: buildAlt(pick.cur_price, pick.currency, storeCurrency),
    };
  }

  return {
    amount: 0,
    original: null,
    currency: storeCurrency,
    isFrom: false,
    alt: null,
  };
}

/**
 * Whether the product can go straight into the cart from a card, or needs the
 * detail page to pick a variant or unit first.
 */
export function needsSelection(product: Product): boolean {
  if (isOutOfStock(product)) return false;
  if (product.has_variants && product.variants.length > 1) return true;
  return (product.units?.length ?? 0) > 1;
}

/** How many of a unit can be bought, given the product's base stock. */
export function maxQtyForUnit(product: Product, unit: ProductUnit | null): number {
  if (product.stock_type !== "tracked") return 9999;
  const multiplier = unit?.multiplier || 1;
  const available = (product.stock ?? 0) / multiplier;
  return Math.max(0, isWeightUnit(unit?.unit_name) ? available : Math.floor(available));
}
