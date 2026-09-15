"use client";

import Link from "next/link";

import { useCustomer } from "@/lib/customer/CustomerProvider";

const STEPS = [
  {
    number: "01",
    title: "Mahsulotni tanlang",
    text: "Katalogdan kerakli model, variant va mavjud miqdorni tanlang.",
  },
  {
    number: "02",
    title: "Buyurtmani yuboring",
    text: "Savatda miqdorni tekshirib, yetkazib berish va to'lov usulini belgilang.",
  },
  {
    number: "03",
    title: "Tasdiqni kuting",
    text: "Buyurtma raqami yaratiladi, do'kon tafsilotlarni tasdiqlash uchun bog'lanadi.",
  },
] as const;

export function StoreExplainer() {
  const { customer } = useCustomer();

  return (
    <section className="mt-20 rounded-3xl bg-foreground px-5 py-9 text-background sm:px-9 sm:py-11" aria-labelledby="order-explainer-title">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/55">Qanday ishlaydi</p>
        <h2 id="order-explainer-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Buyurtma berish oson</h2>
        <p className="mt-3 text-sm leading-relaxed text-background/65">Aniq qoldiqdan tanlaysiz, buyurtma yuborasiz va do&apos;kon tasdig&apos;ini olasiz.</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step) => (
          <article key={step.number} className="rounded-2xl border border-background/15 bg-background/5 p-5">
            <div className="text-xs font-semibold text-background/45">{step.number}</div>
            <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-background/60">{step.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-background p-5 text-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Hamkorlar uchun shaxsiy narxlar</h3>
          <p className="mt-1 text-sm text-muted">
            {customer
              ? `${customer.name || "Mijoz"} uchun shaxsiy narxlar faol.`
              : "Mijoz ID orqali kiring va narx darajangiz hamda hisob tarixini ko'ring."}
          </p>
        </div>
        <Link href="/account" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast">
          {customer ? "Hisobimni ochish" : "Hamkor sifatida kirish"}
        </Link>
      </div>
    </section>
  );
}
