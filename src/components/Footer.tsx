import Link from "next/link";

import { getStore } from "@/lib/storefront/store";

export async function Footer() {
  const store = await getStore();

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <div className="text-lg font-semibold tracking-tight">{store.name}</div>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Telefon g&apos;iloflari, himoya oynalari va aksessuarlar. Buyurtma
            bering — do&apos;kon siz bilan bog&apos;lanadi.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold">Do&apos;kon</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/catalog" className="transition hover:text-foreground">
                Katalog
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-foreground">
                Savat
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition hover:text-foreground">
                Shaxsiy kabinet
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold">Buyurtma</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Kuryer orqali yetkazib berish yoki do&apos;kondan olib ketish.
            Naqd, karta, Click, Payme, Uzum va boshqa qulay to&apos;lov usullari.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-faint">
          © {new Date().getFullYear()} {store.name}
        </div>
      </div>
    </footer>
  );
}
