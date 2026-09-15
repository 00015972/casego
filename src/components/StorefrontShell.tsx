"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/lib/cart/CartProvider";
import { scrollToSection } from "@/lib/scroll";
import { useStore } from "@/lib/storefront/StoreProvider";
import type { Category, Product } from "@/lib/storefront/types";

import { BottomNav } from "./BottomNav";
import { CartView } from "./CartView";
import { Header } from "./Header";
import { SafeImage } from "./SafeImage";
import { ShopUiContext, type ShopUiValue } from "./ShopUiContext";
import { BoxIcon, CloseIcon } from "./icons";

type OpenPanel = "search" | "catalog" | "cart" | null;

export function StorefrontShell({
  products,
  categories,
  children,
  footer,
}: {
  products: Product[];
  categories: Category[];
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const [panel, setPanel] = useState<OpenPanel>(null);
  const { syncProducts } = useCart();
  const store = useStore();
  const pathname = usePathname();
  // Product pages end on their similar-products rail instead of the footer.
  const showFooter = !pathname.startsWith("/product/");

  useEffect(() => {
    syncProducts(products, store.currency);
  }, [products, store.currency, syncProducts]);

  // Search opens in place, so only the drawer and the sheet take over the page.
  useEffect(() => {
    if (!panel || panel === "search") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [panel]);

  const controls = useMemo(
    () => ({
      openSearch: () => setPanel("search"),
      closeSearch: () =>
        setPanel((current) => (current === "search" ? null : current)),
      openCatalog: () => setPanel("catalog"),
      openCart: () => setPanel("cart"),
    }),
    [],
  );
  const shopUi = useMemo<ShopUiValue>(
    () => ({ ...controls, searchOpen: panel === "search" }),
    [controls, panel],
  );

  return (
    <ShopUiContext.Provider value={shopUi}>
      <Header products={products} />
      {/* Without the footer, the page itself has to clear the floating nav. */}
      <main
        className={`flex-1 ${showFooter ? "" : "pb-[calc(6rem+env(safe-area-inset-bottom))]"}`}
      >
        {children}
      </main>
      {showFooter && footer}
      <BottomNav />
      <CategoryDrawer
        open={panel === "catalog"}
        categories={categories}
        onClose={() => setPanel(null)}
      />
      <CartSheet open={panel === "cart"} onClose={() => setPanel(null)} />
    </ShopUiContext.Provider>
  );
}

function CategoryDrawer({
  open,
  categories,
  onClose,
}: {
  open: boolean;
  categories: Category[];
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const visible = categories.filter(
    (category) =>
      !normalized ||
      category.name.toLowerCase().includes(normalized) ||
      category.children.some((child) => child.name.toLowerCase().includes(normalized)),
  );

  // The home page lists every product under its top-level category, so each
  // entry is a jump to that section — scrolled to directly when already there.
  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    onClose();
    if (pathname === "/" && scrollToSection(sectionId)) event.preventDefault();
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
      <button aria-label="Katalogni yopish" onClick={onClose} className={`absolute inset-0 bg-foreground/35 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true" aria-label="Katalog">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Katalog</h2>
            <button onClick={onClose} aria-label="Yopish" className="rounded-full p-2 text-muted hover:bg-surface">
              <CloseIcon size={20} />
            </button>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bo'limlarni qidirish..." className="mt-4 h-11 w-full rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-foreground" />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3 pb-24">
          <Link href="/#all-products" onClick={(event) => jumpTo(event, "all-products")} className="flex rounded-xl bg-surface-raised px-4 py-3 text-sm font-medium">Barcha mahsulotlar</Link>
          {visible.map((category) => (
            <Link
              key={category.id}
              href={`/#category-${category.id}`}
              onClick={(event) => jumpTo(event, `category-${category.id}`)}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-medium"
            >
              <CategoryThumb category={category} />
              <span className="flex-1">{category.name}</span>
              <span className="text-xs text-faint">{category.count}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

function CategoryThumb({ category }: { category: Category }) {
  return (
    <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface">
      <SafeImage
        src={category.image}
        alt=""
        sizes="36px"
        className="object-cover"
        fallback={<span className="m-auto text-faint"><BoxIcon size={17} /></span>}
      />
    </span>
  );
}

function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { count, ready } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
      <button aria-label="Savatni yopish" onClick={onClose} className={`absolute inset-0 bg-foreground/35 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      {/* The sheet never scrolls as a whole: its lines scroll and the total stays pinned. */}
      <section className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] max-w-140 flex-col overflow-hidden rounded-t-[28px] bg-background shadow-[0_-8px_40px_rgba(20,20,20,0.15)] transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`} role="dialog" aria-modal="true" aria-label="Savatcha">
        <div className="mx-auto mt-3.5 h-1 w-10 shrink-0 rounded-full bg-border" />
        <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-3.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[22px] font-semibold tracking-tight">Savatcha</h2>
            {ready && count > 0 && (
              <span className="rounded-full bg-sale/10 px-3 py-1 text-xs font-semibold text-sale">{count} ta</span>
            )}
          </div>
          <button onClick={onClose} aria-label="Yopish" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-raised text-muted transition hover:text-foreground">
            <CloseIcon size={18} />
          </button>
        </div>
        <CartView compact onNavigate={onClose} />
      </section>
    </div>
  );
}
