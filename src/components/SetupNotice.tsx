import type { FailureReason } from "@/lib/storefront/store";

/**
 * Shown instead of products when the catalog cannot be loaded. A rejected key
 * needs someone to fix the configuration; a network blip just needs a retry,
 * so the two say different things.
 */
export function SetupNotice({
  reason = "unavailable",
  error,
}: {
  reason?: FailureReason;
  error?: string;
}) {
  const isSetup = reason === "auth";

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-xl font-semibold">
          {isSetup ? "Do'kon hali ulanmagan" : "Katalog vaqtincha mavjud emas"}
        </h1>

        {isSetup ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Storefront kaliti topilmadi yoki backend uni qabul qilmadi. Kalitni
            ERP SuperAdmin panelidan oling: <b>tashkilot → Online Store</b>,
            so&apos;ng uni{" "}
            <code className="rounded bg-background px-1.5 py-0.5">.env.local</code>{" "}
            faylidagi{" "}
            <code className="rounded bg-background px-1.5 py-0.5">
              DUKONLINE_STOREFRONT_KEY
            </code>{" "}
            ga qo&apos;ying.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Do&apos;kon serveriga ulanib bo&apos;lmadi. Biroz kuting va
            sahifani yangilang.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-background px-3 py-2 font-mono text-xs text-sale">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
