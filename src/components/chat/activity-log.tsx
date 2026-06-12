"use client"

const logs = [
  { time: "14:32:01", status: "SUCCESS", label: "CAL_QUERY_EXEC", detail: "Cross-referenced user_cal_01 and peer_cal_john_doe for conflict resolution." },
  { time: "14:32:05", status: "SUCCESS", label: "MAIL_DISPATCH", detail: "Invite sent via SMTP relay. Thread ID: PHOENIX_M_2991." },
  { time: "14:30:45", status: "INFO", label: "AUTO_SUMMARIZE", detail: "Background indexing of 14 new unread emails completed." },
]

const context = [
  { label: "Project", value: "Phoenix" },
  { label: "Priority", value: "High" },
  { label: "Tokens", value: "4.2k/32k" },
]

export function ActivityLog() {
  return (
    <aside className="hidden w-80 flex-col border-l border-[#434656]/20 bg-[#0d0e12] lg:flex">
      <div className="border-b border-[#434656]/10 p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#8d90a2]">
            Activity Log
          </h2>
          <span className="flex size-2 animate-pulse rounded-full bg-[#b6c4ff]" />
        </div>
        <p className="text-sm text-[#c3c5d9]">Real-time execution status</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {logs.map((log) => (
          <div key={log.time} className="relative border-l border-[#434656]/30 pl-6">
            <div
              className={`absolute left-[-5px] top-1 size-2.5 rounded-full ${
                log.status === "SUCCESS" ? "bg-[#b6c4ff]" : "bg-[#434656]/30"
              }`}
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[11px] ${
                    log.status === "SUCCESS" ? "text-[#b6c4ff]" : "text-[#8d90a2]"
                  }`}
                >
                  {log.time}
                </span>
                <span className="font-mono text-[10px] text-[#8d90a2]">
                  {log.status}
                </span>
              </div>
              <p className="text-sm text-[#e3e2e7]">{log.label}</p>
              <p className="font-mono text-[10px] leading-relaxed text-[#c3c5d9]/70">
                {log.detail}
              </p>
            </div>
          </div>
        ))}

        <div className="mt-8 rounded-xl border border-[#434656]/10 bg-[#1e1f23] p-4">
          <h3 className="mb-3 font-mono text-[11px] text-[#8d90a2]">
            CURRENT CONTEXT
          </h3>
          <div className="space-y-3">
            {context.map((c) => (
              <div key={c.label} className="flex items-center justify-between">
                <span className="text-sm text-[#c3c5d9]">{c.label}</span>
                <span className="font-mono text-xs text-[#b6c4ff]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#434656]/10 bg-[#1a1b1f] p-6">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#434656]/20">
            <div className="h-full w-3/4 rounded-full bg-[#b6c4ff]" />
          </div>
          <span className="font-mono text-[10px] text-[#8d90a2]">STORAGE: 74%</span>
        </div>
      </div>
    </aside>
  )
}
