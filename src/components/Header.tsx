"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/lib/cart/CartProvider";
import { useCustomer } from "@/lib/customer/CustomerProvider";
import { searchProducts, suggestProducts } from "@/lib/storefront/catalog";
import { useStore } from "@/lib/storefront/StoreProvider";
import type { Product } from "@/lib/storefront/types";

import { ProductImage } from "./ProductImage";
import { CartIcon, SearchIcon, UserIcon } from "./icons";
import { useShopUi } from "./ShopUiContext";

import caseGoLogo from "../../images/casego_logo.png";

/**
 * One row on every screen size. Search happens in place: the field widens
 * across the header and results drop down beneath it, with the page still
 * visible behind them.
 */
export function Header({ products }: { products: Product[] }) {
  const router = useRouter();
  const { count, ready } = useCart();
  const { customer } = useCustomer();
  const store = useStore();
  const { searchOpen, openSearch, closeSearch, openCatalog, openCart } = useShopUi();
  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const trimmed = searchOpen ? query.trim() : "";
  const direct = trimmed ? searchProducts(trimmed, products, 20) : [];
  const results =
    direct.length > 0 ? direct : trimmed ? suggestProducts(trimmed, products, 8) : [];

  // Search can also be opened from the bottom navigation.
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else inputRef.current?.blur();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeSearch();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [searchOpen, closeSearch]);

  const finishSearch = () => {
    setQuery("");
    closeSearch();
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5">
        {!searchOpen && (
          <Link
            href="/"
            aria-label={store.name}
            className="relative block aspect-228/108 h-9 shrink-0 overflow-hidden sm:h-11"
          >
            {/* The logo file is a 600×300 canvas whose artwork (name included)
                spans x 181–408, y 69–176; the offsets crop the padding away.
                Multiply drops the artwork's white backing onto the header. */}
            <Image
              src={caseGoLogo}
              alt=""
              sizes="256px"
              priority
              className="absolute left-[-79.4%] top-[-63.9%] w-[263.2%] max-w-none mix-blend-multiply"
            />
          </Link>
        )}

        <div className={`relative min-w-0 flex-1 ${searchOpen ? "" : "sm:max-w-xl"}`}>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
            <SearchIcon size={18} />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={openSearch}
            onKeyDown={(event) => {
              if (event.key === "Escape") finishSearch();
              if (event.key === "Enter" && results[0]) {
                router.push(`/product/${results[0].id}`);
                finishSearch();
              }
            }}
            placeholder="Mahsulot qidirish"
            aria-label="Mahsulot qidirish"
            className={`h-11 w-full rounded-full border pl-11 pr-4 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-faint ${
              searchOpen
                ? "search-open border-foreground bg-surface-raised shadow-[0_0_0_3px_rgba(22,21,15,0.08)]"
                : "border-border bg-surface hover:border-foreground/40"
            }`}
          />
        </div>

        {searchOpen ? (
          <button
            type="button"
            onClick={finishSearch}
            className="search-open shrink-0 rounded-full border border-border bg-surface-raised px-4 py-2.5 text-sm font-semibold transition hover:border-foreground"
          >
            Bekor
          </button>
        ) : (
          <nav className="ml-auto flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={openCatalog}
              className="hidden rounded-full px-3 py-2 text-sm text-muted transition hover:text-foreground sm:block"
            >
              Katalog
            </button>
            <Link
              href="/account"
              aria-label={customer ? "Shaxsiy kabinet" : "Kirish"}
              className="relative rounded-full p-2.5 text-muted transition hover:bg-surface hover:text-foreground"
            >
              <UserIcon size={20} />
              {customer && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-success" />
              )}
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label="Savat"
              data-cart-target
              className="relative rounded-full p-2.5 text-muted transition hover:bg-surface hover:text-foreground"
            >
              <CartIcon size={20} />
              {/* Rendered only after localStorage is read, so SSR markup matches. */}
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-contrast">
                  {count}
                </span>
              )}
            </button>
          </nav>
        )}
      </div>

      {trimmed && (
        <div className="pointer-events-none absolute inset-x-0 top-full">
          <div className="mx-auto max-w-7xl px-4 pt-2">
            <div className="search-open pointer-events-auto max-h-[min(70dvh,34rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface-raised p-2 shadow-[0_18px_45px_rgba(22,21,15,0.14)]">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  Mahsulot topilmadi.
                </p>
              ) : (
                <>
                  <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {direct.length > 0 ? "Natijalar" : "Shunga o'xshash mahsulotlar"}
                  </div>
                  <ul>
                    {results.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.id}`}
                          onClick={finishSearch}
                          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface"
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                            <ProductImage src={product.image} alt="" sizes="48px" />
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 text-sm font-medium">
                              {product.name}
                            </span>
                            <span className="mt-0.5 line-clamp-1 text-xs text-faint">
                              {product.category_name}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
