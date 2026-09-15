import type { OrderItemPayload } from "@/lib/storefront/types";

/**
 * One cart line. A product enters the cart either as a plain unit or as a
 * variant, and `key` distinguishes them so the same product can appear as
 * several lines.
 *
 * Prices here are display-only — the order payload carries ids and quantities,
 * and the backend prices the order itself.
 */
export interface CartItem {
  key: string;
  product_id: number;
  name: string;
  image: string;

  unit_id: number | null;
  variant_id: number | null;
  unit_name: string;
  variant_name: string;

  /** Amount in the store's own currency, which is what the customer pays. */
  price: number;
  currency: string;
  /** The same amount in the product's costing currency, when it differs. */
  altPrice: number | null;
  altCurrency: string | null;

  qty: number;
  maxQty: number;
  /** Weight units (kg, g) accept fractional quantities. */
  allowDecimal: boolean;
}

/** Strips display-only fields down to what `POST /storefront/orders/` wants. */
export function toOrderItem(item: CartItem): OrderItemPayload {
  return {
    product_id: item.product_id,
    ...(item.variant_id ? { variant_id: item.variant_id } : {}),
    ...(item.unit_id ? { unit_id: item.unit_id } : {}),
    qty: item.qty,
  };
}
