"use client";

import { useState } from "react";

import { useCart } from "@/lib/cart/CartProvider";
import { getCartProductState } from "@/lib/cart/product-state";
import { useStore } from "@/lib/storefront/StoreProvider";
import { isOutOfStock } from "@/lib/storefront/catalog";
import { formatQty, isWeightUnit, normalizeCurrency } from "@/lib/storefront/currency";
import { maxQtyForUnit, type DisplayPrice } from "@/lib/storefront/product-view";
import type { CartItem } from "@/lib/cart/types";
import type { Product } from "@/lib/storefront/types";

import { CheckIcon } from "./icons";
import { PriceTag } from "./PriceTag";
import { QuantityInput } from "./QuantityInput";

function chipClass(active: boolean) {
  return `rounded-full border px-3.5 py-2 text-sm transition ${
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border text-muted hover:border-foreground hover:text-foreground"
  }`;
}

export function AddToCartPanel({
  product,
  showStock,
  fallbackPrice,
}: {
  product: Product;
  showStock: boolean;
  fallbackPrice: DisplayPrice;
}) {
  const store = useStore();
  const { items, add } = useCart();
  const [added, setAdded] = useState(false);

  const variants = product.has_variants ? product.variants : [];
  const units = product.units ?? [];

  const [variantId, setVariantId] = useState<number | null>(
    (variants.find((v) => v.in_stock) ?? variants[0])?.id ?? null,
  );
  const [unitId, setUnitId] = useState<number | null>(units[0]?.unit_id ?? null);
  const [qty, setQty] = useState(1);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0] ?? null;
  const unit = units.find((u) => u.unit_id === unitId) ?? units[0] ?? null;

  const soldOut = isOutOfStock(product);

  /** Whichever option is selected, priced in the store's own currency. */
  const selection = variant
    ? {
        price: variant.price,
        original: variant.original_price,
        altPrice: variant.cur_price,
        altCurrency: variant.currency,
        max: variant.stock != null ? Math.floor(variant.stock) : 9999,
        allowDecimal: false,
      }
    : {
        price: unit?.price ?? fallbackPrice.amount,
        original: unit?.original_price ?? null,
        altPrice: unit?.cur_price ?? null,
        altCurrency: unit?.currency ?? null,
        max: maxQtyForUnit(product, unit),
        allowDecimal: isWeightUnit(unit?.unit_name),
      };

  const altCode = normalizeCurrency(selection.altCurrency);
  const showAlt =
    altCode && altCode !== normalizeCurrency(store.currency) && selection.altPrice != null;
  const cartKey = variant
    ? `${product.id}_v${variant.id}`
    : `${product.id}_u${unit?.unit_id ?? 0}`;
  const cartItem = items.find((item) => item.key === cartKey);
  const cartState = getCartProductState(cartItem?.qty, selection.max);

  const shown: DisplayPrice = {
    amount: selection.price,
    original: selection.original,
    currency: store.currency,
    isFrom: false,
    alt: showAlt ? { amount: selection.altPrice as number, currency: altCode } : null,
  };
  const selectedQty = Math.min(qty, selection.max);

  const handleAdd = () => {
    const base = {
      product_id: product.id,
      name: product.name,
      image: product.image,
      price: selection.price,
      currency: store.currency,
      altPrice: showAlt ? (selection.altPrice as number) : null,
      altCurrency: showAlt ? altCode : null,
      qty: selectedQty,
      maxQty: selection.max,
      allowDecimal: selection.allowDecimal,
    };

    const item: CartItem = variant
      ? {
          ...base,
          key: `${product.id}_v${variant.id}`,
          unit_id: null,
          variant_id: variant.id,
          unit_name: "dona",
          variant_name: variant.name,
        }
      : {
          ...base,
          key: `${product.id}_u${unit?.unit_id ?? 0}`,
          unit_id: unit?.unit_id ?? null,
          variant_id: null,
          unit_name: unit?.unit_name || "dona",
          variant_name: "",
        };

    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-6">
      <PriceTag price={shown} storeCurrency={store.currency} size="lg" />

      {variants.length > 1 && (
        <Field label="Rang">
          {variants.map((option) => (
            <button
              key={option.id}
              disabled={!option.in_stock}
              onClick={() => setVariantId(option.id)}
              className={`${chipClass(variant?.id === option.id)} ${
                option.in_stock ? "" : "cursor-not-allowed line-through opacity-40"
              }`}
            >
              {option.name}
            </button>
          ))}
        </Field>
      )}

      {units.length > 1 && (
        <Field label="O'lchov">
          {units.map((option) => (
            <button
              key={option.unit_id ?? option.unit_name}
              onClick={() => setUnitId(option.unit_id)}
              className={chipClass(unit?.unit_id === option.unit_id)}
            >
              {option.unit_name || "dona"}
            </button>
          ))}
        </Field>
      )}

      {showStock && !soldOut && selection.max <= 5 && (
        <p className="mt-4 text-sm text-sale">
          {cartState.atLimit
            ? `Savatda ${formatQty(cartState.quantity)} ta · Qoldiq tugadi`
            : `Omborda ${formatQty(selection.max)} ta qoldi`}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <QuantityInput
          value={selectedQty}
          max={selection.max}
          allowDecimal={selection.allowDecimal}
          onChange={setQty}
          disabled={soldOut || selection.max <= 0}
        />
        <button
          onClick={handleAdd}
          disabled={soldOut || selection.max <= 0 || cartState.atLimit}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 sm:max-w-64 text-sm font-medium text-accent-contrast transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-border disabled:text-faint"
        >
          {soldOut || selection.max <= 0 ? (
            "Mavjud emas"
          ) : cartState.atLimit ? (
            <>
              <CheckIcon size={18} /> Tugadi · Savatda {cartState.quantity}
            </>
          ) : added ? (
            <>
              <CheckIcon size={18} /> Savatda {cartState.quantity}
            </>
          ) : (
            "Savatga qo'shish"
          )}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
