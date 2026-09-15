import { BannerCarousel, type CarouselBanner } from "@/components/BannerCarousel";
import { CategoryRail } from "@/components/CategoryRail";
import { CategorySections } from "@/components/CategorySections";
import { ProductGrid } from "@/components/ProductGrid";
import { SetupNotice } from "@/components/SetupNotice";
import { StoreExplainer } from "@/components/StoreExplainer";
import { getCustomerCode } from "@/lib/customer/session";
import { groupProductsByCategory } from "@/lib/storefront/catalog";
import { getCatalogView, getStore } from "@/lib/storefront/store";

import audioBanner from "../../images/casego-banner-audio.png";
import casesBanner from "../../images/casego-banner-cases.png";
import deliveryBanner from "../../images/casego-banner-delivery.png";

const LOCAL_BANNERS: CarouselBanner[] = [
  {
    id: -1,
    image: casesBanner,
    eyebrow: "Case Go aksessuarlari",
    title: "Yangi g'iloflar — yangi uslub",
    description: "Telefoningiz uchun himoya, qulaylik va did bir joyda.",
  },
  {
    id: -2,
    image: audioBanner,
    eyebrow: "Kundalik texnologiya",
    title: "Kuchli ovoz. Tez quvvat.",
    description: "Quloqchinlar, kabellar va zaryadlovchilarni oson tanlang.",
  },
  {
    id: -3,
    image: deliveryBanner,
    eyebrow: "Tez va ishonchli",
    title: "Buyurtmangiz yo'lda",
    description: "Kerakli aksessuarlarni toping — qolganini biz hal qilamiz.",
  },
];

/** Catalog is cached for a minute, so the home page can be statically served. */
export const revalidate = 60;

export default async function HomePage() {
  const customerCode = await getCustomerCode();
  const [store, catalog] = await Promise.all([
    getStore(),
    getCatalogView(customerCode),
  ]);

  if (!catalog.configured) {
    return (
      <SetupNotice
        reason={catalog.reason ?? store.reason}
        error={catalog.error ?? store.error}
      />
    );
  }

  const groups = groupProductsByCategory(catalog.categories, catalog.products);

  return (
    // The category bar stays pinned for as long as this wrapper is on screen.
    <div className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* ERP artwork stays authoritative; branded local slides fill an empty feed. */}
        <BannerCarousel
          banners={store.banners.length > 0 ? store.banners : LOCAL_BANNERS}
        />
      </div>

      {/* Outside the width cap so the pinned bar's background spans the viewport. */}
      {groups.length > 0 && (
        <CategoryRail categories={groups.map((group) => group.category)} />
      )}

      {/* Padding rather than margin: a margin would collapse into the bar's
          compensating bottom margin and let the content jump. */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8">
        {/* Best sellers come from the ERP's sales history; the section stays
            hidden until that endpoint returns any product IDs. */}
        {catalog.topProducts.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Eng ko&apos;p sotilganlar
              </h2>
              <a
                href="#all-products"
                className="shrink-0 text-sm text-muted transition hover:text-foreground"
              >
                Barchasi
              </a>
            </div>
            <div className="mt-5">
              <ProductGrid
                products={catalog.topProducts.slice(0, 8)}
                showImages={catalog.showImages}
                showStock={catalog.showStock}
              />
            </div>
          </section>
        )}

        {groups.length > 0 && (
          <section id="all-products" className="mt-14 scroll-mt-36 first:mt-0">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Barcha mahsulotlar
              </h2>
              <span className="shrink-0 text-sm text-faint">
                {catalog.products.length} ta
              </span>
            </div>
            <CategorySections
              groups={groups}
              showImages={catalog.showImages}
              showStock={catalog.showStock}
            />
          </section>
        )}

        <StoreExplainer />
      </div>
    </div>
  );
}
