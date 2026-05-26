export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center">
          <span className="text-lg font-bold">Anti Dashboard</span>
        </div>
      </header>
      <main className="container py-4 space-y-4">
        <div className="h-20 animate-pulse rounded-lg border bg-card" />
        <div className="grid gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-card" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-lg border bg-card" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 animate-pulse rounded-lg border bg-card" />
          <div className="h-96 animate-pulse rounded-lg border bg-card" />
        </div>
      </main>
    </div>
  );
}
