import { money } from "@/lib/storefront/currency";
import type { DisplayPrice } from "@/lib/storefront/product-view";

/**
 * The store-currency amount leads; the product's costing currency follows in
 * smaller type, and is omitted entirely when the two would say the same thing.
 */
export function PriceTag({
  price,
  storeCurrency,
  size = "sm",
}: {
  price: DisplayPrice;
  storeCurrency: string;
  size?: "sm" | "lg";
}) {
  const discounted = price.original != null && price.original > price.amount;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={
            size === "lg" ? "text-2xl font-semibold" : "text-[15px] font-semibold"
          }
        >
          {price.isFrom && (
            <span className="mr-1 text-xs font-normal text-faint">dan</span>
          )}
          {money(price.amount, price.currency, storeCurrency)}
        </span>
        {discounted && (
          <span
            className={`text-faint line-through ${size === "lg" ? "text-sm" : "text-xs"}`}
          >
            {money(price.original, price.currency, storeCurrency)}
          </span>
        )}
      </div>

      {price.alt && (
        <div className={`mt-0.5 text-faint ${size === "lg" ? "text-sm" : "text-[11px]"}`}>
          ≈ {money(price.alt.amount, price.alt.currency, storeCurrency)}
        </div>
      )}
    </div>
  );
}
