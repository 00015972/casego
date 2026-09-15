export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8">
      <div className="h-56 rounded-3xl bg-surface" />
      <div className="mt-10 h-6 w-40 rounded bg-surface" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="h-72 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
