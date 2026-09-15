"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { createPersistentStore } from "@/lib/persistent-store";
import { isWeightUnit, normalizeCurrency } from "@/lib/storefront/currency";
import { maxQtyForUnit } from "@/lib/storefront/product-view";
import type { Product } from "@/lib/storefront/types";

import type { CartItem } from "./types";

const store = createPersistentStore<CartItem[]>("casego_cart", []);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Kept as a component so the tree has an obvious mount point, even though
  // the store itself is module-level and needs no context.
  return <>{children}</>;
}

export function useCart() {
  const { value: items, ready } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  /** Adds a line, or tops up an existing one, never exceeding `maxQty`. */
  const add = useCallback((item: CartItem) => {
    store.set((current) => {
      const existing = current.find((x) => x.key === item.key);
      if (!existing) {
        const qty = Math.min(item.qty, item.maxQty);
        if (qty <= 0) return current;
        return [...current, { ...item, qty }];
      }
      const qty = Math.min(existing.qty + item.qty, existing.maxQty);
      if (qty === existing.qty) return current;
      return current.map((x) => (x.key === item.key ? { ...x, qty } : x));
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    store.set((current) => {
      const item = current.find((x) => x.key === key);
      if (!item) return current;
      const capped = Math.min(qty, item.maxQty);
      if (capped <= 0) return current.filter((x) => x.key !== key);
      return current.map((x) => (x.key === key ? { ...x, qty: capped } : x));
    });
  }, []);

  const remove = useCallback((key: string) => {
    store.set((current) => current.filter((x) => x.key !== key));
  }, []);

  const clear = useCallback(() => store.set(() => []), []);

  /** Refreshes saved line prices and stock after login or an ERP catalog update. */
  const syncProducts = useCallback((products: Product[], storeCurrency: string) => {
    const byId = new Map(products.map((product) => [product.id, product]));
    store.set((current) => {
      let changed = false;
      const next = current.flatMap((item) => {
        const product = byId.get(item.product_id);
        if (!product) return [item];

        const variant = item.variant_id
          ? product.variants.find((option) => option.id === item.variant_id)
          : null;
        const unit = !item.variant_id
          ? product.units.find((option) => option.unit_id === item.unit_id) ?? product.units[0]
          : null;
        const source = variant ?? unit;
        if (!source) return [item];

        const maxQty = variant
          ? variant.stock == null
            ? 9999
            : Math.floor(variant.stock)
          : maxQtyForUnit(product, unit ?? null);
        const qty = Math.min(item.qty, maxQty);
        if (qty <= 0) {
          changed = true;
          return [];
        }

        const altCurrency = normalizeCurrency(source.currency);
        const showAlt =
          Boolean(altCurrency) &&
          altCurrency !== normalizeCurrency(storeCurrency) &&
          source.cur_price != null;
        const updated: CartItem = {
          ...item,
          price: source.price,
          currency: storeCurrency,
          altPrice: showAlt ? source.cur_price : null,
          altCurrency: showAlt ? altCurrency : null,
          maxQty,
          qty,
          allowDecimal: unit ? isWeightUnit(unit.unit_name) : false,
        };
        if (
          updated.price !== item.price ||
          updated.currency !== item.currency ||
          updated.altPrice !== item.altPrice ||
          updated.altCurrency !== item.altCurrency ||
          updated.maxQty !== item.maxQty ||
          updated.qty !== item.qty ||
          updated.allowDecimal !== item.allowDecimal
        ) {
          changed = true;
        }
        return [updated];
      });
      return changed ? next : current;
    });
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );

  return { items, count, ready, add, setQty, remove, clear, syncProducts };
}
