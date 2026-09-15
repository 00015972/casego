"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/lib/cart/CartProvider";

import { CartIcon, HomeIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";
import { useShopUi } from "./ShopUiContext";

/** Thumb-reachable navigation on phones; hidden from tablet width up. */
export function BottomNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const { openSearch, openCatalog, openCart } = useShopUi();
  const items = [
    { href: "/", label: "Asosiy", icon: HomeIcon },
    { label: "Qidiruv", icon: SearchIcon, action: openSearch },
    { label: "Katalog", icon: MenuIcon, action: openCatalog },
    { label: "Savat", icon: CartIcon, action: openCart, cart: true },
    { href: "/account", label: "Kabinet", icon: UserIcon },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-lg items-stretch">
        {items.map((item) => {
          const { label, icon: Icon } = item;
          const href = "href" in item ? item.href : undefined;
          const active =
            href === "/" ? pathname === "/" : Boolean(href && pathname.startsWith(href));
          const content = (
            <>
              <span className="relative">
                <Icon size={21} />
                {"cart" in item && item.cart && ready && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-contrast">
                    {count}
                  </span>
                )}
              </span>
              {label}
            </>
          );
          const className = `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition ${active ? "text-foreground" : "text-faint"}`;

          return href ? (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <button
              key={label}
              type="button"
              onClick={() => "action" in item && item.action()}
              data-cart-target={"cart" in item && item.cart ? "" : undefined}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
      {/* Clears the home indicator on iOS. */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
