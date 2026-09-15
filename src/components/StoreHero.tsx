import Link from "next/link";

/**
 * Shown in place of the banner carousel while no banners have been uploaded in
 * the ERP ("Online do'kon → Bannerlar"). Typographic rather than a stock photo,
 * so it never looks like placeholder product imagery.
 */
export function StoreHero({
  storeName,
  categoryCount,
  productCount,
}: {
  storeName: string;
  categoryCount: number;
  productCount: number;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
      <div className="flex flex-col gap-6 px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            {storeName}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            G&apos;iloflar, naushniklar va aksessuarlar
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            {productCount} ta mahsulot, {categoryCount} ta kategoriya. Buyurtma
            bering — do&apos;kon siz bilan bog&apos;lanadi.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-contrast transition hover:opacity-90"
          >
            Katalogni ko&apos;rish
          </Link>
          <Link
            href="/account"
            className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium transition hover:border-foreground"
          >
            Mijoz sifatida kirish
          </Link>
        </div>
      </div>
    </section>
  );
}
