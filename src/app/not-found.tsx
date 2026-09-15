import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Sahifa topilmadi</h1>
      <p className="mt-3 text-sm text-muted">
        Siz qidirgan sahifa mavjud emas yoki mahsulot katalogdan olib
        tashlangan.
      </p>
      <Link
        href="/catalog"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-contrast transition hover:opacity-90"
      >
        Katalogga o&apos;tish
      </Link>
    </div>
  );
}
