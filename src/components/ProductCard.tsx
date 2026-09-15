"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { animateToCart } from "@/lib/cart/animate-cart";
import { useCart } from "@/lib/cart/CartProvider";
import { getCartProductState } from "@/lib/cart/product-state";
import { useStore } from "@/lib/storefront/StoreProvider";
import { isOutOfStock } from "@/lib/storefront/catalog";
import { formatQty, isWeightUnit, normalizeCurrency } from "@/lib/storefront/currency";
import {
  displayPrice,
  maxQtyForUnit,
  needsSelection,
} from "@/lib/storefront/product-view";
import type { Product } from "@/lib/storefront/types";

import { PriceTag } from "./PriceTag";
import { ProductImage } from "./ProductImage";

export function ProductCard({
  product,
  showImages = true,
  showStock = true,
  priority = false,
}: {
  product: Product;
  showImages?: boolean;
  showStock?: boolean;
  priority?: boolean;
}) {
  const store = useStore();
  const { items, add, setQty } = useCart();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [justAdded, setJustAdded] = useState(false);

  const price = displayPrice(product, store.currency);
  const soldOut = isOutOfStock(product);
  const mustChoose = needsSelection(product);
  const discounted = price.original != null && price.original > price.amount;
  const unit = product.units?.[0] ?? null;
  const variant = product.has_variants ? (product.variants?.[0] ?? null) : null;
  const cartKey = variant
    ? `${product.id}_v${variant.id}`
    : `${product.id}_u${unit?.unit_id ?? 0}`;
  const maxQty = variant
    ? variant.stock != null
      ? Math.floor(variant.stock)
      : 9999
    : maxQtyForUnit(product, unit);
  const cartItem = items.find((item) => item.key === cartKey);
  const cartState = getCartProductState(cartItem?.qty, maxQty);
  const finished = soldOut || cartState.atLimit;

  /** Single-option products skip the detail page entirely. */
  const quickAdd = () => {
    const source = variant ?? unit;
    const altCode = normalizeCurrency(source?.currency);
    const showAlt =
      Boolean(altCode) &&
      altCode !== normalizeCurrency(store.currency) &&
      source?.cur_price != null;

    const base = {
      product_id: product.id,
      name: product.name,
      image: product.image,
      price: source?.price ?? 0,
      currency: store.currency,
      altPrice: showAlt ? (source?.cur_price as number) : null,
      altCurrency: showAlt ? altCode : null,
      qty: 1,
      allowDecimal: isWeightUnit(unit?.unit_name),
    };

    if (variant) {
      add({
        ...base,
        key: `${product.id}_v${variant.id}`,
        unit_id: null,
        variant_id: variant.id,
        unit_name: "dona",
        variant_name: variant.name,
        maxQty,
      });
    } else {
      add({
        ...base,
        key: `${product.id}_u${unit?.unit_id ?? 0}`,
        unit_id: unit?.unit_id ?? null,
        variant_id: null,
        unit_name: unit?.unit_name || "dona",
        variant_name: "",
        maxQty,
      });
    }

    if (addButtonRef.current) animateToCart(addButtonRef.current);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 650);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised transition duration-200 ${
        finished
          ? "shadow-[0_8px_24px_-16px_rgba(0,0,0,0.18)]"
          : "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]"
      }`}
    >
      <Link
        href={`/product/${product.id}`}
        className={`relative block aspect-square overflow-hidden ${finished ? "bg-surface" : "bg-white"}`}
      >
        <div
          className={`relative h-full w-full transition duration-300 ${
            finished ? "scale-[1.015] opacity-40 blur-[1px] saturate-50" : ""
          }`}
        >
          {showImages ? (
            <ProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm font-medium text-muted">
              {product.name}
            </div>
          )}

          {discounted && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-sale px-2 py-1 text-[11px] font-semibold text-white">
              −{Math.round(product.discount_percent)}%
            </span>
          )}
        </div>

        {finished && (
          <span className="absolute inset-0 bg-white/35 backdrop-blur-[1px]" aria-hidden="true" />
        )}
        {finished && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/88 px-3 py-1.5 text-[11px] font-semibold text-muted shadow-sm backdrop-blur-sm">
            Tugadi
          </span>
        )}
      </Link>

      {/* flex-1 + mt-auto on the footer keeps every button on the same
          baseline, however many lines the product name wraps to. */}
      <div className={`flex flex-1 flex-col p-3.5 ${finished ? "bg-surface/25" : ""}`}>
        <div className={`transition duration-300 ${finished ? "opacity-45" : ""}`}>
          {product.category_name && (
            <div className="line-clamp-1 text-[10px] uppercase tracking-wide text-faint">
              {product.category_name}
            </div>
          )}
          <Link
            href={`/product/${product.id}`}
            className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug transition hover:text-muted"
          >
            {product.name}
          </Link>

          <div className="mt-2">
            <PriceTag price={price} storeCurrency={store.currency} />
          </div>

          {cartState.atLimit && !soldOut ? (
            <div className="mt-1 text-[11px] font-semibold text-sale">Tugadi</div>
          ) : (
            showStock &&
            !soldOut &&
            product.stock_type === "tracked" &&
            maxQty <= 5 && (
              <div className="mt-1 text-[11px] text-sale">
                Oxirgi {formatQty(maxQty)} {variant ? "dona" : unit?.unit_name || "dona"}
              </div>
            )
          )}
        </div>

        <div className="mt-auto pt-3">
          {soldOut ? (
            <button
              disabled
              className="h-10 w-full cursor-not-allowed rounded-full bg-surface text-[13px] font-medium text-faint"
            >
              Tugadi
            </button>
          ) : mustChoose ? (
            <Link
              href={`/product/${product.id}`}
              className="flex h-10 w-full items-center justify-center rounded-full border border-foreground text-[13px] font-medium transition hover:bg-foreground hover:text-background"
            >
              Tanlash
            </Link>
          ) : cartState.inCart ? (
            <div
              className={`cart-control-enter flex h-10 w-full items-center overflow-hidden rounded-full border border-foreground ${
                justAdded ? "cart-control-pulse" : ""
              }`}
              aria-label={`Savatdagi miqdor: ${formatQty(cartState.quantity)}`}
            >
              <button
                type="button"
                onClick={() => setQty(cartKey, cartState.quantity - 1)}
                aria-label="Kamaytirish"
                className="h-full w-12 text-lg transition hover:bg-surface"
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-semibold tabular-nums">
                {formatQty(cartState.quantity)}
              </span>
              <button
                ref={addButtonRef}
                type="button"
                disabled={cartState.atLimit}
                onClick={quickAdd}
                aria-label={cartState.atLimit ? "Qoldiq tugadi" : "Ko'paytirish"}
                className="h-full w-12 text-lg transition hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
              >
                +
              </button>
            </div>
          ) : (
            <button
              ref={addButtonRef}
              onClick={quickAdd}
              className="h-10 w-full rounded-full bg-accent text-[13px] font-medium text-accent-contrast transition hover:opacity-90"
            >
              Savatga
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
