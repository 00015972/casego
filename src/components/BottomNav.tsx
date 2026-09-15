"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/lib/cart/CartProvider";
import { scrollBehavior } from "@/lib/scroll";

import { CartIcon, HomeIcon, MenuIcon, SearchIcon } from "./icons";
import { useShopUi } from "./ShopUiContext";

/** A floating pill of the main shop actions, kept in reach on every screen size. */
export function BottomNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const { searchOpen, openSearch, openCatalog, openCart } = useShopUi();
  const items = [
    { href: "/", label: "Asosiy", icon: HomeIcon },
    { label: "Qidiruv", icon: SearchIcon, action: openSearch, search: true },
    { label: "Savat", icon: CartIcon, action: openCart, path: "/cart", cart: true },
    { label: "Katalog", icon: MenuIcon, action: openCatalog },
  ] as const;

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="fixed bottom-[calc(1.125rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[72%] max-w-95 -translate-x-1/2 items-center justify-between gap-1 rounded-full border border-border bg-surface-raised/85 px-4 py-2 shadow-[0_8px_32px_rgba(20,20,20,0.12),0_2px_8px_rgba(20,20,20,0.06)] backdrop-blur-xl backdrop-saturate-150 sm:w-3/4"
    >
      {items.map((item) => {
        const { label, icon: Icon } = item;
        const path =
          "href" in item ? item.href : "path" in item ? item.path : undefined;
        // While search is open in the header, it is the active destination.
        const active = searchOpen
          ? "search" in item
          : path === "/"
            ? pathname === "/"
            : Boolean(path && pathname.startsWith(path));
        const isCart = "cart" in item && item.cart;
        const content = (
          <>
            <span
              className={`relative flex h-7.5 w-11 items-center justify-center rounded-[14px] transition duration-300 group-active:scale-[0.88] ${
                active
                  ? "bg-surface"
                  : "group-hover:-translate-y-0.5 group-hover:bg-surface/70"
              }`}
            >
              <Icon size={20} />
              {isCart && ready && count > 0 && (
                <span className="absolute -top-0.75 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-raised bg-accent px-1 text-[9px] font-bold leading-none text-accent-contrast">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            <span className="mt-0.75 text-[9.5px] font-semibold tracking-[0.02em]">
              {label}
            </span>
          </>
        );
        const className = `group flex flex-1 flex-col items-center justify-center rounded-[20px] py-1.5 transition-colors duration-200 ${
          active ? "text-foreground" : "text-muted hover:text-foreground"
        }`;

        return "href" in item ? (
          <Link
            key={label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={(event) => {
              // Already here: return to the top instead of re-navigating.
              if (!active) return;
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: scrollBehavior() });
            }}
            className={className}
          >
            {content}
          </Link>
        ) : (
          <button
            key={label}
            type="button"
            onClick={item.action}
            data-cart-target={isCart ? "" : undefined}
            className={className}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
