"use client";

import { useEffect, useState } from "react";

import { useCustomer } from "@/lib/customer/CustomerProvider";
import { useStore } from "@/lib/storefront/StoreProvider";
import { money } from "@/lib/storefront/currency";
import type {
  CustomerAccountResponse,
  CustomerSale,
} from "@/lib/storefront/types";

import { CloseIcon } from "./icons";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Naqd", card: "Karta", transfer: "O'tkazma", credit: "Nasiya",
  mixed: "Aralash", click: "Click", payme: "Payme", uzum: "Uzum",
  humo: "Humo", uzcard: "UzCard", installment: "Bo'lib to'lash",
  exchange_credit: "Ayirboshlash",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  new: { label: "Yangi", className: "bg-blue-500/10 text-blue-700" },
  confirmed: { label: "Tasdiqlangan", className: "bg-amber-500/10 text-amber-700" },
  sold: { label: "Yetkazilgan", className: "bg-success/10 text-success" },
  cancelled: { label: "Bekor", className: "bg-surface text-faint" },
};

type AccountTab = "profile" | "sales" | "orders" | "payments";

function formatDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function paymentLabel(method?: string) {
  return method ? PAYMENT_LABELS[method] || method : "—";
}

export function AccountView() {
  const { customer, signIn, signOut, ready } = useCustomer();
  const store = useStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<AccountTab>("profile");
  const [selectedSale, setSelectedSale] = useState<CustomerSale | null>(null);
  const [loaded, setLoaded] = useState<{
    code: string;
    data: CustomerAccountResponse;
  } | null>(null);

  const customerCode = customer?.customer_code;

  useEffect(() => {
    if (!customerCode) return;
    let cancelled = false;
    fetch(`/api/customer?code=${encodeURIComponent(customerCode)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Hisob yuklanmadi");
        return data as CustomerAccountResponse;
      })
      .then((data) => {
        if (!cancelled) {
          setLoaded({
            code: customerCode,
            data: {
              customer: data.customer,
              sales: data.sales ?? [],
              online_orders: data.online_orders ?? [],
              payments: data.payments ?? [],
            },
          });
        }
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Hisob yuklanmadi");
      });
    return () => {
      cancelled = true;
    };
  }, [customerCode]);

  const submit = async () => {
    if (!code.trim()) {
      setError("ID kiriting");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kirish amalga oshmadi");
      signIn(data);
      setCode("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kirish amalga oshmadi");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;

  if (!customer) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-xl font-semibold tracking-tight">Mijoz sifatida kirish</h1>
        <p className="mt-2 text-sm text-muted">Do&apos;kondan olgan ID raqamingizni kiriting. Kirgach shaxsiy narxlaringiz va xaridlar tarixi ko&apos;rinadi.</p>
        <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && void submit()} placeholder="CUST-XXXXXX" className="mt-6 h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm tracking-widest outline-none transition focus:border-foreground" />
        {error && <p className="mt-3 text-sm text-sale">{error}</p>}
        <button onClick={() => void submit()} disabled={busy} className="mt-4 h-12 w-full rounded-full bg-accent text-sm font-medium text-accent-contrast transition hover:opacity-90 disabled:opacity-60">
          {busy ? "Tekshirilmoqda…" : "Kirish"}
        </button>
      </div>
    );
  }

  const data = loaded && loaded.code === customerCode ? loaded.data : null;
  const account = data?.customer ?? customer;
  const tabs: { key: AccountTab; label: string }[] = [
    { key: "profile", label: "Hisobim" },
    { key: "sales", label: "Xaridlar" },
    { key: "orders", label: "Zakazlar" },
    { key: "payments", label: "To'lovlar" },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{account.name || "Mijoz"}</h1>
          <p className="mt-1 font-mono text-xs text-faint">{account.customer_code || account.code}</p>
          {account.phone && <p className="mt-0.5 text-sm text-muted">{account.phone}</p>}
        </div>
        <button onClick={signOut} className="shrink-0 rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-foreground hover:text-foreground">Chiqish</button>
      </div>

      <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto border-b border-border px-4">
        {tabs.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition ${tab === item.key ? "border-foreground text-foreground" : "border-transparent text-faint"}`}>
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-5 rounded-xl bg-sale/10 px-4 py-3 text-sm text-sale">{error}</p>}
      {!data && !error ? (
        <div className="mt-6 h-36 animate-pulse rounded-2xl bg-surface" />
      ) : data ? (
        <div className="mt-6">
          {tab === "profile" && <ProfileTab data={data} baseCurrency={store.currency} />}
          {tab === "sales" && <SalesTab sales={data.sales} baseCurrency={store.currency} onSelect={setSelectedSale} />}
          {tab === "orders" && <OrdersTab orders={data.online_orders} baseCurrency={store.currency} />}
          {tab === "payments" && <PaymentsTab payments={data.payments} baseCurrency={store.currency} />}
        </div>
      ) : null}

      {selectedSale && <SaleDetail sale={selectedSale} baseCurrency={store.currency} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}

function ProfileTab({ data, baseCurrency }: { data: CustomerAccountResponse; baseCurrency: string }) {
  const debts = Object.entries(data.customer.currency_debts ?? {});
  const total = data.sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-sale/20 bg-sale/5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-sale">Qarz</div>
        <div className="mt-2 text-xl font-semibold">{money(data.customer.debt ?? 0, baseCurrency, baseCurrency)}</div>
        {debts.map(([currency, amount]) => <div key={currency} className="mt-1 text-sm text-sale">{money(amount, currency, baseCurrency)}</div>)}
      </div>
      <div className="rounded-2xl border border-success/20 bg-success/5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-success">Ortiqcha to&apos;lov</div>
        <div className="mt-2 text-xl font-semibold">{money(data.customer.credit ?? 0, baseCurrency, baseCurrency)}</div>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5 sm:col-span-2">
        <div className="text-xs text-faint">Jami xarid qilingan</div>
        <div className="mt-1 text-lg font-semibold">{money(total, baseCurrency, baseCurrency)}</div>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-surface px-5 py-12 text-center text-sm text-muted">{children}</div>;
}

function SalesTab({ sales, baseCurrency, onSelect }: { sales: CustomerSale[]; baseCurrency: string; onSelect: (sale: CustomerSale) => void }) {
  if (!sales.length) return <Empty>Xaridlar yo&apos;q.</Empty>;
  return (
    <div className="space-y-3">
      {sales.map((sale, index) => (
        <button key={sale.receipt_number ?? index} onClick={() => onSelect(sale)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-surface-raised p-4 text-left transition hover:border-foreground">
          <div className="min-w-0"><div className="font-mono text-sm">{sale.receipt_number || `Xarid #${index + 1}`}</div><div className="mt-1 text-xs text-faint">{formatDate(sale.created_at)} · {paymentLabel(sale.payment_method)}</div></div>
          <div className="text-right"><div className="text-sm font-semibold">{money(sale.total ?? 0, baseCurrency, baseCurrency)}</div>{(sale.debt ?? 0) > 0 && <div className="mt-1 text-xs text-sale">Qarz: {money(sale.debt_currency_amount ?? sale.debt, sale.debt_currency ?? baseCurrency, baseCurrency)}</div>}</div>
        </button>
      ))}
    </div>
  );
}

function OrdersTab({ orders, baseCurrency }: { orders: CustomerAccountResponse["online_orders"]; baseCurrency: string }) {
  if (!orders.length) return <Empty>Zakazlar yo&apos;q.</Empty>;
  return <div className="space-y-3">{orders.map((order, index) => {
    const status = STATUS_LABELS[order.status ?? ""] ?? { label: order.status || "—", className: "bg-surface text-muted" };
    return <div key={order.order_no ?? index} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-raised p-4"><div><div className="font-mono text-sm">{order.order_no || `Zakaz #${index + 1}`}</div><div className="mt-1 text-xs text-faint">{formatDate(order.created_at)}</div><div className="mt-2 text-sm font-semibold">{money(order.total ?? 0, baseCurrency, baseCurrency)}</div></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></div>;
  })}</div>;
}

function PaymentsTab({ payments, baseCurrency }: { payments: CustomerAccountResponse["payments"]; baseCurrency: string }) {
  if (!payments.length) return <Empty>To&apos;lovlar yo&apos;q.</Empty>;
  return <div className="space-y-3">{payments.map((payment, index) => <div key={`${payment.created_at}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-raised p-4"><div><div className="text-base font-semibold text-success">+{money(payment.amount ?? 0, payment.currency ?? baseCurrency, baseCurrency)}</div><div className="mt-1 text-xs text-faint">{formatDate(payment.created_at)}</div>{payment.note && <div className="mt-1 text-xs text-muted">{payment.note}</div>}</div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 font-semibold text-success">✓</div></div>)}</div>;
}

function SaleDetail({ sale, baseCurrency, onClose }: { sale: CustomerSale; baseCurrency: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Xarid tafsilotlari">
      <button className="absolute inset-0" onClick={onClose} aria-label="Yopish" />
      <div className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-mono text-lg font-semibold">{sale.receipt_number || "Xarid"}</h2><p className="mt-1 text-xs text-faint">{formatDate(sale.created_at)}</p></div><button onClick={onClose} aria-label="Yopish" className="rounded-full p-2 text-muted hover:bg-surface"><CloseIcon size={19} /></button></div>
        <div className="mt-5 divide-y divide-border border-y border-border">{(sale.items ?? []).map((item, index) => {
          const qty = Number(item.qty ?? item.quantity) || 0;
          const serial = item.serial;
          const specs = serial ? [serial.storage, serial.color, serial.region, serial.battery != null ? `${serial.battery}%` : ""].filter(Boolean).join(" · ") : "";
          return <div key={index} className="flex justify-between gap-4 py-3 text-sm"><div><div className="text-muted">{item.name || item.product_name || "Mahsulot"}</div>{serial && <div className="mt-1 font-mono text-[11px] text-faint">IMEI {serial.imei}{specs ? ` · ${specs}` : ""}</div>}</div><div className="shrink-0 font-medium">{qty} {item.unit || item.unit_name} × {money(item.price ?? 0, baseCurrency, baseCurrency)}</div></div>;
        })}</div>
        <dl className="mt-5 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted">To&apos;lov usuli</dt><dd className="font-medium">{paymentLabel(sale.payment_method)}</dd></div>{(sale.payment_breakdown ?? []).map((part, index) => <div key={index} className="flex justify-between text-xs"><dt className="text-faint">· {paymentLabel(part.method)}</dt><dd>{money(part.amount ?? 0, baseCurrency, baseCurrency)}</dd></div>)}<div className="flex justify-between"><dt className="text-muted">To&apos;landi</dt><dd className="font-medium">{money(sale.paid ?? 0, baseCurrency, baseCurrency)}</dd></div>{(sale.debt ?? 0) > 0 && <div className="flex justify-between text-sale"><dt>Nasiya (qarz)</dt><dd className="font-semibold">{money(sale.debt_currency_amount ?? sale.debt, sale.debt_currency ?? baseCurrency, baseCurrency)}</dd></div>}<div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-medium">Jami</dt><dd className="font-semibold">{money(sale.total ?? 0, baseCurrency, baseCurrency)}</dd></div></dl>
      </div>
    </div>
  );
}
