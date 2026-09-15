import type { Metadata } from "next";

import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Buyurtmani rasmiylashtirish",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <CheckoutForm />
    </div>
  );
}
