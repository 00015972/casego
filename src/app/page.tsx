import Link from "next/link";

import { BannerCarousel, type CarouselBanner } from "@/components/BannerCarousel";
import { CategoryRail } from "@/components/CategoryRail";
import { ProductGrid } from "@/components/ProductGrid";
import { SetupNotice } from "@/components/SetupNotice";
import { StoreExplainer } from "@/components/StoreExplainer";
import { getCustomerCode } from "@/lib/customer/session";
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

  const newest = [...catalog.products].sort((a, b) => b.id - a.id).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* ERP artwork stays authoritative; branded local slides fill an empty feed. */}
      <BannerCarousel
        banners={store.banners.length > 0 ? store.banners : LOCAL_BANNERS}
      />

      {catalog.categories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Kategoriyalar</h2>
          <CategoryRail categories={catalog.categories} />
        </section>
      )}

      {/* Best sellers come from the ERP's sales history; the section stays
          hidden until that endpoint returns any product IDs. */}
      {catalog.topProducts.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Eng ko&apos;p sotilganlar
            </h2>
            <Link
              href="/catalog"
              className="shrink-0 text-sm text-muted transition hover:text-foreground"
            >
              Barchasi
            </Link>
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

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Yangi kelganlar</h2>
          <Link
            href="/catalog"
            className="shrink-0 text-sm text-muted transition hover:text-foreground"
          >
            Barchasi
          </Link>
        </div>
        <div className="mt-5">
          <ProductGrid
            products={newest}
            showImages={catalog.showImages}
            showStock={catalog.showStock}
          />
        </div>
      </section>

      <StoreExplainer />
    </div>
  );
}
