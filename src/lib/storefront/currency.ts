/**
 * Money formatting for a multi-currency catalog.
 *
 * A product's currency may be empty, which means "the store's base currency".
 * The store's own currency arrives as a symbol (`"$"`) while products use
 * codes (`"USD"`), so everything is normalised before comparison.
 */

export const DEFAULT_CURRENCY = "UZS";

export function normalizeCurrency(currency: string | null | undefined): string {
  const code = String(currency ?? "").trim().toUpperCase();
  if (code === "$" || code === "US$") return "USD";
  if (code === "SO'M" || code === "SUM") return "UZS";
  return code;
}

export function resolveCurrency(
  productCurrency: string | null | undefined,
  storeCurrency: string | null | undefined,
): string {
  return (
    normalizeCurrency(productCurrency) ||
    normalizeCurrency(storeCurrency) ||
    DEFAULT_CURRENCY
  );
}

/** Thin-space thousands separators, the convention used across UZ retail. */
function withThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatSom(amount: number): string {
  return `${withThousands(Math.round(Number(amount) || 0).toString())} so'm`;
}

/** `money(50, "USD") -> "$50"`, `money(50000, "UZS") -> "50 000 so'm"`. */
export function money(
  amount: number | null | undefined,
  currency?: string | null,
  baseCurrency: string = DEFAULT_CURRENCY,
): string {
  const code = normalizeCurrency(currency) || normalizeCurrency(baseCurrency) || DEFAULT_CURRENCY;
  if (code === "UZS") return formatSom(Number(amount) || 0);

  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const [whole, fraction] = Number.isInteger(value)
    ? [value.toString(), ""]
    : value.toFixed(2).split(".");

  const prefix = code === "USD" ? "$" : `${code} `;
  return prefix + withThousands(whole) + (fraction ? `.${fraction}` : "");
}

/**
 * A cart can hold items priced in different currencies, and the API offers no
 * conversion, so totals are summed per currency and shown side by side:
 * `"$52  +  300 000 so'm"`.
 */
export function groupTotal(
  items: { currency?: string; price: number; cur_price?: number | null; qty: number }[],
  baseCurrency: string = DEFAULT_CURRENCY,
): string {
  const totals = new Map<string, number>();

  for (const item of items) {
    const code = normalizeCurrency(item.currency) || normalizeCurrency(baseCurrency);
    const unitPrice = item.cur_price ?? item.price;
    totals.set(code, (totals.get(code) ?? 0) + unitPrice * item.qty);
  }

  if (totals.size === 0) return money(0, baseCurrency, baseCurrency);

  return [...totals.entries()]
    .map(([code, sum]) => money(sum, code, baseCurrency))
    .join("  +  ");
}

/** Weight-based units are sold in fractional quantities (0.5 kg). */
export function isWeightUnit(unitName: string | null | undefined): boolean {
  return /kilogram|kilogramm|gramm|\bkg\b|\bg\b/i.test((unitName ?? "").trim());
}

export function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : String(Number(qty.toFixed(3)));
}
