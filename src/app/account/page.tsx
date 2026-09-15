import type { Metadata } from "next";

import { AccountView } from "@/components/AccountView";

export const metadata: Metadata = {
  title: "Shaxsiy kabinet",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <AccountView />
    </div>
  );
}
