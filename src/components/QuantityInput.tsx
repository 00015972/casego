"use client";

import { useState } from "react";

import { formatQty } from "@/lib/storefront/currency";

/**
 * Stepper that tolerates free typing — the value is only clamped on blur, so
 * clearing the field mid-edit does not snap back to 1.
 */
export function QuantityInput({
  value,
  max,
  allowDecimal = false,
  disabled = false,
  onChange,
}: {
  value: number;
  max: number;
  allowDecimal?: boolean;
  disabled?: boolean;
  onChange: (qty: number) => void;
}) {
  const [draft, setDraft] = useState(() => formatQty(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // Re-sync the text field when the committed quantity changes from outside
  // (cart edits, clamping), without an effect round-trip.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(formatQty(value));
  }

  const step = allowDecimal ? 0.5 : 1;
  const commit = (raw: string) => {
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      onChange(step);
      setDraft(formatQty(step));
      return;
    }
    const next = Math.min(allowDecimal ? parsed : Math.floor(parsed), max);
    onChange(next);
    setDraft(formatQty(next));
  };

  const nudge = (delta: number) => {
    const next = Math.min(Math.max(step, Number((value + delta).toFixed(3))), max);
    onChange(next);
  };

  return (
    <div className="flex h-12 items-center rounded-full border border-border">
      <button
        type="button"
        disabled={disabled || value <= step}
        onClick={() => nudge(-step)}
        aria-label="Kamaytirish"
        className="h-full w-11 rounded-l-full text-lg text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:text-border"
      >
        −
      </button>
      <input
        value={draft}
        disabled={disabled}
        inputMode={allowDecimal ? "decimal" : "numeric"}
        aria-label="Miqdor"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="h-full w-12 border-x border-border bg-transparent text-center text-sm outline-none"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => nudge(step)}
        aria-label="Ko'paytirish"
        className="h-full w-11 rounded-r-full text-lg text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:text-border"
      >
        +
      </button>
    </div>
  );
}
