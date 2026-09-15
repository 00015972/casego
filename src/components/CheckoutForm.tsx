"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/lib/cart/CartProvider";
import { useCustomer } from "@/lib/customer/CustomerProvider";
import { useStore } from "@/lib/storefront/StoreProvider";
import { toOrderItem } from "@/lib/cart/types";
import { groupTotal } from "@/lib/storefront/currency";
import type { DeliveryType, OrderPayload } from "@/lib/storefront/types";

import { MapPicker, reverseGeocode } from "./MapPicker";
import { CheckIcon, MapIcon, PinIcon } from "./icons";

const PAYMENT_METHODS = [
  { id: "cash", title: "Naqd", hint: "Yetkazib berilganda to'lash" },
  { id: "card", title: "Karta", hint: "Kuryerga karta orqali" },
  { id: "transfer", title: "O'tkazma", hint: "Hisob raqamiga o'tkazish" },
  { id: "click", title: "Click", hint: "Click orqali to'lov" },
  { id: "payme", title: "Payme", hint: "Payme orqali to'lov" },
  { id: "uzum", title: "Uzum", hint: "Uzum orqali to'lov" },
  { id: "humo", title: "Humo", hint: "Humo kartasi orqali" },
  { id: "uzcard", title: "UzCard", hint: "UzCard orqali" },
  { id: "installment", title: "Bo'lib to'lash", hint: "Muddatli to'lov" },
  { id: "credit", title: "Nasiya", hint: "Mijoz hisobiga qarz" },
  { id: "mixed", title: "Aralash", hint: "Bir nechta usulda to'lash" },
  { id: "exchange_credit", title: "Ayirboshlash", hint: "Almashuv va qo'shimcha to'lov" },
] as const;

export function CheckoutForm() {
  const { items, clear, ready } = useCart();
  const { customer } = useCustomer();
  const store = useStore();

  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryType>("courier");
  const [payment, setPayment] = useState<string>("cash");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  // Null means untouched, so a customer loaded from localStorage can prefill
  // the field without an effect or overwriting anything the shopper typed.
  const nameValue = name ?? customer?.name ?? "";
  const phoneValue = phone ?? customer?.phone ?? "";

  const courier = delivery === "courier";

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Qurilma joylashuvni qo'llamaydi");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(next);
        const foundAddress = await reverseGeocode(next);
        if (foundAddress) setAddress(foundAddress);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Joylashuvga ruxsat berilmadi");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const submit = async () => {
    if (!nameValue.trim() || !phoneValue.trim()) {
      setError("Ism va telefon raqami majburiy");
      return;
    }
    if (courier && !address.trim() && !coords) {
      setError("Manzil kiriting yoki joylashuvni belgilang");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload: OrderPayload = {
      customer_name: nameValue.trim(),
      phone: phoneValue.trim(),
      delivery_type: delivery,
      payment_method: payment,
      ...(courier
        ? { address: address.trim(), landmark: landmark.trim() }
        : {}),
      ...(courier && coords
        ? { latitude: coords.lat, longitude: coords.lng }
        : {}),
      ...(customer ? { customer_code: customer.customer_code } : {}),
      items: items.map(toOrderItem),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Buyurtma yuborilmadi");

      setOrderNo(data.order_no);
      clear();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Buyurtma yuborilmadi");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNo) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
          <CheckIcon size={26} />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Buyurtma qabul qilindi</h1>
        <p className="mt-1 text-sm text-muted">Buyurtma raqami</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{orderNo}</p>
        <p className="mt-4 text-sm text-muted">
          Do&apos;kon tez orada siz bilan bog&apos;lanadi.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-contrast transition hover:opacity-90"
        >
          Xaridni davom ettirish
        </Link>
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <p className="text-sm text-muted">Savat bo&apos;sh.</p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-contrast transition hover:opacity-90"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-foreground focus:bg-background";

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Buyurtmani rasmiylashtirish
      </h1>

      <div className="mt-6 space-y-6">
        <Section label="Yetkazib berish">
          <div className="flex gap-3">
            {(
              [
                ["courier", "Kuryer"],
                ["pickup", "Olib ketaman"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setDelivery(value)}
                className={`h-12 flex-1 rounded-xl border text-sm font-medium transition ${
                  delivery === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {courier && (
          <>
            <Section label="Manzil">
              <input
                className={inputClass}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Ko'cha, uy, xonadon"
              />
              <button
                onClick={locate}
                disabled={locating}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
              >
                <PinIcon size={16} />
                {locating
                  ? "Aniqlanmoqda…"
                  : coords
                    ? "Joylashuv belgilandi"
                    : "Joylashuvimni aniqlash"}
              </button>
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className={`ml-4 mt-2 inline-flex items-center gap-1.5 text-sm transition hover:text-foreground ${
                  coords ? "text-success" : "text-muted"
                }`}
              >
                <MapIcon size={16} />
                {coords ? "Xaritada o'zgartirish" : "Xaritadan belgilash"}
              </button>
            </Section>

            <Section label="Mo'ljal">
              <input
                className={inputClass}
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                placeholder="Masalan: maktab yonida"
              />
            </Section>
          </>
        )}

        <Section label="Ism">
          <input
            className={inputClass}
            value={nameValue}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ismingiz"
          />
        </Section>

        <Section label="Telefon">
          <input
            className={inputClass}
            value={phoneValue}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            placeholder="+998 90 123 45 67"
          />
        </Section>

        <Section label="To'lov">
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setPayment(method.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  payment === method.id
                    ? "border-foreground"
                    : "border-border hover:border-muted"
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{method.title}</div>
                  <div className="text-xs text-faint">{method.hint}</div>
                </div>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 transition ${
                    payment === method.id
                      ? "border-foreground bg-foreground"
                      : "border-border"
                  }`}
                />
              </button>
            ))}
          </div>
        </Section>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-sale/10 px-4 py-3 text-sm text-sale">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-baseline justify-between border-t border-border pt-5">
        <span className="text-sm text-muted">Jami</span>
        <span className="text-xl font-semibold">
          {groupTotal(items, store.currency)}
        </span>
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-5 h-12 w-full rounded-full bg-accent text-sm font-medium text-accent-contrast transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Yuborilmoqda…" : "Buyurtmani yuborish"}
      </button>

      <MapPicker
        open={mapOpen}
        initial={coords}
        onPick={(next, foundAddress) => {
          setCoords(next);
          if (foundAddress) setAddress(foundAddress);
          setMapOpen(false);
        }}
        onClose={() => setMapOpen(false)}
      />
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
      </div>
      {children}
    </div>
  );
}
