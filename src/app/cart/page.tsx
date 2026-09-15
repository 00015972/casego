import type { Metadata } from "next";

import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Savat",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold tracking-tight">Savat</h1>
      <CartView />
    </div>
  );
}
