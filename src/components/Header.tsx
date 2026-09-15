"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/lib/cart/CartProvider";
import { useCustomer } from "@/lib/customer/CustomerProvider";
import { useStore } from "@/lib/storefront/StoreProvider";

import { CartIcon, SearchIcon, UserIcon } from "./icons";
import { useShopUi } from "./ShopUiContext";

import caseGoLogo from "../../images/casego-logo.png";

function SearchTrigger() {
  const { openSearch } = useShopUi();
  return (
    <button
      type="button"
      onClick={openSearch}
      className="relative flex-1"
      aria-label="Mahsulot qidirish"
    >
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
        <SearchIcon size={18} />
      </span>
      <span className="flex h-11 w-full items-center rounded-full border border-border bg-surface pl-11 pr-4 text-left text-sm text-faint transition hover:border-foreground hover:bg-background">
        Mahsulot qidirish
      </span>
    </button>
  );
}

export function Header() {
  const { count, ready } = useCart();
  const { customer } = useCustomer();
  const store = useStore();
  const { openCatalog, openCart } = useShopUi();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl"
        >
          <Image
            src={caseGoLogo}
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 object-contain"
          />
          <span>{store.name}</span>
        </Link>

        <div className="hidden flex-1 sm:block">
          <SearchTrigger />
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:ml-0">
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
      </div>

      <div className="px-4 pb-3 sm:hidden">
        <SearchTrigger />
      </div>
    </header>
  );
}
