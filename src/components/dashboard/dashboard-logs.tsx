"use client"

import { HashIcon } from "lucide-react"
import { api } from "~/trpc/react"

export function DashboardLogs() {
  const { data: logs } = api.corsair.getRecentLogs.useQuery({ limit: 5 })

  return (
    <section className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
      <div className="mb-4 flex items-center gap-2">
        <HashIcon className="size-4 text-[#b6c4ff]" />
        <h2 className="text-lg font-semibold text-[#e3e2e7]">Recent Activity</h2>
      </div>
      <div className="space-y-2">
        {!logs || logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8d90a2]">No recent activity</p>
        ) : (
          <div className="relative">
            {logs.map((log, i) => (
              <div key={log.id} className="relative pb-5 last:pb-0">
                {i < logs.length - 1 && (
                  <div className="absolute left-[3px] top-[14px] w-[2px] bottom-0 bg-[#434656]/40" />
                )}
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-[5px] size-2 shrink-0 rounded-full border border-[#0d0e12] ${
                      log.status === "SUCCESS" || log.status === "RUNNING"
                        ? "bg-[#b6c4ff]"
                        : log.status === "ERROR"
                          ? "bg-red-400"
                          : "bg-[#434656]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] uppercase ${
                        log.status === "SUCCESS" || log.status === "RUNNING"
                          ? "text-[#b6c4ff]"
                          : log.status === "ERROR"
                            ? "text-red-400"
                            : "text-[#8d90a2]"
                      }`}>
                        {log.status}
                      </span>
                      <span className="font-mono text-[9px] text-[#8d90a2]">{log.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-[#e3e2e7]">{log.label}</p>
                    {log.detail && (
                      <p className="mt-0.5 truncate font-mono text-[9px] text-[#c3c5d9]/70">{log.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}