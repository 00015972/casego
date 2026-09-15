"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart/CartProvider";
import { useStore } from "@/lib/storefront/StoreProvider";
import { groupTotal, money } from "@/lib/storefront/currency";

import { ProductImage } from "./ProductImage";
import { QuantityInput } from "./QuantityInput";
import { ArrowRightIcon, CloseIcon } from "./icons";

const checkoutClass =
  "mt-3.5 flex h-13.5 w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold transition";

/**
 * Cart lines, then the total and the checkout action. `compact` fits it inside
 * the cart sheet, where the lines scroll and the total stays pinned below.
 */
export function CartView({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
} = {}) {
  const { items, setQty, remove, ready } = useCart();
  const store = useStore();

  return (
    <>
      <div className={compact ? "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5" : "mt-6"}>
        {!ready ? (
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <span className="text-[52px] leading-none opacity-50" aria-hidden="true">
              🛒
            </span>
            <p className="mt-1 text-lg font-semibold text-muted">Savat bo&apos;sh</p>
            <p className="text-[13px] text-faint">
              Mahsulot qo&apos;shish uchun katalogga qayting
            </p>
          </div>
        ) : (
          <ul className={`divide-y divide-border ${compact ? "" : "border-y border-border"}`}>
            {items.map((item) => {
              const unitPrice = item.price;
              const detail = item.variant_name;

              return (
                <li key={item.key} className="flex gap-4 py-4">
                  <Link
                    href={`/product/${item.product_id}`}
                    onClick={onNavigate}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface"
                  >
                    <ProductImage src={item.image} alt={item.name} sizes="80px" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.product_id}`}
                          onClick={onNavigate}
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
        )}
      </div>

      <div
        className={
          compact
            ? "shrink-0 border-t border-border px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4"
            : "mt-6"
        }
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-info/20 bg-info/8 px-5 py-4">
          <span className="text-[13px] font-semibold text-info">Jami summa</span>
          {/* Currencies are never converted client-side — they are listed apart. */}
          <span className="text-right text-xl font-bold tracking-tight">
            {groupTotal(items, store.currency)}
          </span>
        </div>

        {items.length > 0 ? (
          <Link
            href="/checkout"
            onClick={onNavigate}
            className={`${checkoutClass} bg-accent text-accent-contrast shadow-[0_4px_16px_rgba(20,20,20,0.2)] hover:opacity-90`}
          >
            Buyurtma berish
            <ArrowRightIcon size={18} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={`${checkoutClass} cursor-not-allowed bg-border text-faint`}
          >
            Buyurtma berish
            <ArrowRightIcon size={18} />
          </button>
        )}
      </div>
    </>
  );
}
