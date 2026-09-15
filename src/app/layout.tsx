import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { CartProvider } from "@/lib/cart/CartProvider";
import { CustomerProvider } from "@/lib/customer/CustomerProvider";
import { StoreProvider } from "@/lib/storefront/StoreProvider";
import { getCatalogView, getStore } from "@/lib/storefront/store";
import { getCustomerCode } from "@/lib/customer/session";
import { StorefrontShell } from "@/components/StorefrontShell";
import { Footer } from "@/components/Footer";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans-stack",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Casego — telefon g'iloflari va aksessuarlar",
    template: "%s · Casego",
  },
  description:
    "Casego — telefon g'iloflari, himoya oynalari va aksessuarlar onlayn do'koni. Buyurtma bering, do'kon siz bilan bog'lanadi.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Store name and display currency are needed by nearly every component, so
  // they are fetched once here and shared through context.
  const customerCode = await getCustomerCode();
  const [store, catalog] = await Promise.all([
    getStore(),
    getCatalogView(customerCode),
  ]);

  return (
    <html lang="uz" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <StoreProvider value={store}>
          <CustomerProvider>
            <CartProvider>
              <StorefrontShell
                products={catalog.products}
                categories={catalog.categories}
                footer={<Footer />}
              >
                {children}
              </StorefrontShell>
            </CartProvider>
          </CustomerProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
