"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart/CartProvider";
import { useStore } from "@/lib/storefront/StoreProvider";
import { groupTotal, money } from "@/lib/storefront/currency";

import { ProductImage } from "./ProductImage";
import { QuantityInput } from "./QuantityInput";
import { CloseIcon } from "./icons";

export function CartView({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
} = {}) {
  const { items, setQty, remove, ready } = useCart();
  const store = useStore();

  if (!ready) {
    return <div className={`${compact ? "" : "mt-8"} h-40 animate-pulse rounded-2xl bg-surface`} />;
  }

  if (items.length === 0) {
    return (
      <div className={`${compact ? "" : "mt-8"} rounded-2xl border border-border bg-surface px-6 py-16 text-center`}>
        <p className="text-sm text-muted">Savat bo&apos;sh.</p>
        <Link
          href="/catalog"
          onClick={onNavigate}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-contrast transition hover:opacity-90"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className={`${compact ? "" : "mt-6"} divide-y divide-border border-y border-border`}>
        {items.map((item) => {
          const unitPrice = item.price;
          const detail = item.variant_name;

          return (
            <li key={item.key} className="flex gap-4 py-4">
              <Link
                href={`/product/${item.product_id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface"
              >
                <ProductImage src={item.image} alt={item.name} sizes="80px" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.product_id}`}
                      className="line-clamp-2 text-sm font-medium transition hover:text-muted"
                    >
                      {item.name}
                    </Link>
                    {detail && (
                      <div className="mt-0.5 text-xs text-faint">{detail}</div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(item.key)}
                    aria-label="O'chirish"
                    className="shrink-0 rounded-full p-1.5 text-faint transition hover:bg-surface hover:text-foreground"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div className="scale-90 origin-left">
                    <QuantityInput
                      value={item.qty}
                      max={item.maxQty}
                      allowDecimal={item.allowDecimal}
                      onChange={(qty) => setQty(item.key, qty)}
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {money(unitPrice * item.qty, item.currency, store.currency)}
                    </div>
                    {item.altPrice != null && item.altCurrency && (
                      <div className="text-[11px] text-faint">
                        ≈ {money(item.altPrice * item.qty, item.altCurrency, store.currency)}
                      </div>
                    )}
                    {item.qty > 1 && (
                      <div className="text-xs text-faint">
                        {money(unitPrice, item.currency, store.currency)} × {item.qty}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted">Jami</span>
        {/* Currencies are never converted client-side — they are listed apart. */}
        <span className="text-xl font-semibold">
          {groupTotal(items, store.currency)}
        </span>
      </div>

      <Link
        href="/checkout"
        onClick={onNavigate}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-contrast transition hover:opacity-90"
      >
        Buyurtmani rasmiylashtirish
      </Link>
    </>
  );
}
