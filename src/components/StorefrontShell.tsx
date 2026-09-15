"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCart } from "@/lib/cart/CartProvider";
import { useStore } from "@/lib/storefront/StoreProvider";
import { searchProducts, suggestProducts } from "@/lib/storefront/catalog";
import type { Category, Product } from "@/lib/storefront/types";

import { BottomNav } from "./BottomNav";
import { CartView } from "./CartView";
import { Header } from "./Header";
import { ProductImage } from "./ProductImage";
import { SafeImage } from "./SafeImage";
import { ShopUiContext, type ShopUiValue } from "./ShopUiContext";
import { BoxIcon, ChevronDownIcon, CloseIcon, SearchIcon } from "./icons";

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

  useEffect(() => {
    syncProducts(products, store.currency);
  }, [products, store.currency, syncProducts]);

  useEffect(() => {
    if (!panel) return;
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

  const controls = useMemo<ShopUiValue>(
    () => ({
      openSearch: () => setPanel("search"),
      openCatalog: () => setPanel("catalog"),
      openCart: () => setPanel("cart"),
    }),
    [],
  );

  return (
    <ShopUiContext.Provider value={controls}>
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      {footer}
      <BottomNav />
      <SearchOverlay
        open={panel === "search"}
        products={products}
        onClose={() => setPanel(null)}
      />
      <CategoryDrawer
        open={panel === "catalog"}
        categories={categories}
        onClose={() => setPanel(null)}
      />
      <CartSheet open={panel === "cart"} onClose={() => setPanel(null)} />
    </ShopUiContext.Provider>
  );
}

function SearchOverlay({
  open,
  products,
  onClose,
}: {
  open: boolean;
  products: Product[];
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const direct = trimmed ? searchProducts(trimmed, products, 6) : [];
  const suggestions = direct.length
    ? direct
    : trimmed
      ? suggestProducts(trimmed, products, 6)
      : [];

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  if (!open) return null;
  const submit = () => {
    if (!trimmed) return;
    onClose();
    router.push(`/catalog?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur" role="dialog" aria-modal="true" aria-label="Qidiruv">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:py-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
              <SearchIcon size={20} />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submit()}
              placeholder="Mahsulot nomi yoki kategoriyasi"
              aria-label="Mahsulot qidirish"
              className="h-14 w-full rounded-full border border-border bg-surface-raised pl-12 pr-5 text-base outline-none transition focus:border-foreground"
            />
          </div>
          <button onClick={onClose} aria-label="Yopish" className="rounded-full border border-border p-3 text-muted transition hover:text-foreground">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="mt-7">
          {!trimmed ? (
            <p className="text-center text-sm text-faint">Yozishni boshlang — natijalar shu yerda chiqadi.</p>
          ) : suggestions.length === 0 ? (
            <div className="rounded-2xl bg-surface px-5 py-12 text-center text-sm text-muted">Mahsulot topilmadi.</div>
          ) : (
            <>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">
                {direct.length ? "Natijalar" : "Shunga o'xshash mahsulotlar"}
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-raised">
                {suggestions.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} onClick={onClose} className="flex items-center gap-4 p-3 transition hover:bg-surface">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                      <ProductImage src={product.image} alt="" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm font-medium">{product.name}</div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-faint">{product.category_name}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={submit} className="mt-5 h-11 w-full rounded-full bg-accent text-sm font-medium text-accent-contrast">
                Barcha natijalarni ko&apos;rish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
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
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const normalized = query.trim().toLowerCase();
  const visible = categories.filter(
    (category) =>
      !normalized ||
      category.name.toLowerCase().includes(normalized) ||
      category.children.some((child) => child.name.toLowerCase().includes(normalized)),
  );

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
          <Link href="/catalog" onClick={onClose} className="flex rounded-xl bg-surface-raised px-4 py-3 text-sm font-medium">Barcha mahsulotlar</Link>
          {visible.map((category) => {
            const hasChildren = category.children.length > 0;
            const isOpen = expanded.has(category.id) || Boolean(normalized);
            return (
              <div key={category.id} className="overflow-hidden rounded-xl border border-border bg-surface-raised">
                {hasChildren ? (
                  <button
                    onClick={() => setExpanded((current) => {
                      const next = new Set(current);
                      if (next.has(category.id)) next.delete(category.id);
                      else next.add(category.id);
                      return next;
                    })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium"
                    aria-expanded={isOpen}
                  >
                    <CategoryThumb category={category} />
                    <span className="flex-1">{category.name}</span>
                    <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}><ChevronDownIcon size={17} /></span>
                  </button>
                ) : (
                  <Link href={`/catalog?category=${category.id}`} onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm font-medium"><CategoryThumb category={category} />{category.name}</Link>
                )}
                {hasChildren && isOpen && (
                  <div className="border-t border-border bg-surface/55">
                    <Link href={`/catalog?category=${category.id}`} onClick={onClose} className="block px-5 py-3 text-sm text-muted hover:text-foreground">Hammasi</Link>
                    {category.children
                      .filter((child) => !normalized || child.name.toLowerCase().includes(normalized))
                      .map((child) => (
                        <Link key={child.id} href={`/catalog?category=${child.id}`} onClick={onClose} className="block border-t border-border/70 px-5 py-3 text-sm text-muted hover:text-foreground">
                          {child.name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
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
  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
      <button aria-label="Savatni yopish" onClick={onClose} className={`absolute inset-0 bg-foreground/35 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <section className={`absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] max-w-2xl overflow-y-auto rounded-t-3xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`} role="dialog" aria-modal="true" aria-label="Savat">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Savat</h2>
          <div className="flex items-center gap-2">
            <Link href="/cart" onClick={onClose} className="text-xs font-medium text-muted underline underline-offset-4">To&apos;liq ko&apos;rish</Link>
            <button onClick={onClose} aria-label="Yopish" className="rounded-full p-2 text-muted hover:bg-surface"><CloseIcon size={19} /></button>
          </div>
        </div>
        <CartView compact onNavigate={onClose} />
      </section>
    </div>
  );
}
