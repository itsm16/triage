export default function DashboardLoading() {
  return (
    <>
      <header className="flex h-8 shrink-0" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] space-y-8 p-6 md:p-10">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-[#292a2e]" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#292a2e]" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
              <div className="mb-4 h-5 w-36 animate-pulse rounded bg-[#292a2e]" />
              <div className="space-y-3">
                {Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-[#121317]" />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
              <div className="mb-4 h-5 w-24 animate-pulse rounded bg-[#292a2e]" />
              <div className="space-y-3">
                {Array.from({length: 2}).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-[#121317]" />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
              <div className="mb-4 h-5 w-28 animate-pulse rounded bg-[#292a2e]" />
              <div className="space-y-2">
                {Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 size-2 animate-pulse rounded-full bg-[#292a2e]" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-16 animate-pulse rounded bg-[#292a2e]" />
                      <div className="h-3 w-36 animate-pulse rounded bg-[#292a2e]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}