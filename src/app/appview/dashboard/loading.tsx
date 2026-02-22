export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <div className="h-9 w-64 bg-[var(--slate-200)] rounded-lg animate-pulse" />
            <div className="h-5 w-48 bg-[var(--slate-200)] rounded-lg animate-pulse mt-2" />
          </div>
          <div className="w-10 h-10 bg-[var(--slate-200)] rounded-full animate-pulse" />
        </div>

        {/* Status card skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--slate-200)]">
          <div className="h-5 w-24 bg-[var(--slate-200)] rounded animate-pulse mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--slate-200)] rounded-full animate-pulse" />
            <div>
              <div className="h-5 w-40 bg-[var(--slate-200)] rounded animate-pulse" />
              <div className="h-4 w-28 bg-[var(--slate-200)] rounded animate-pulse mt-1" />
            </div>
          </div>
        </div>

        {/* Connections skeleton */}
        <div>
          <div className="h-6 w-44 bg-[var(--slate-200)] rounded animate-pulse mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-[var(--slate-200)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[var(--slate-200)] rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-20 bg-[var(--slate-200)] rounded animate-pulse" />
                    <div className="h-4 w-16 bg-[var(--slate-200)] rounded animate-pulse mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
