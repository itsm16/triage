"use client"

import { useEffect, useRef } from "react"
import { CheckCircle, XCircle, Loader2, X } from "lucide-react"
import { useChatStore, type LogEntry, type LogStatus } from "~/lib/chat-store"

function DotIcon({ status }: { status: LogStatus }) {
  switch (status) {
    case "RUNNING": return <Loader2 size={10} className="animate-spin text-[#0d0e12]" />
    case "SUCCESS": return <CheckCircle size={10} className="text-[#0d0e12]" />
    case "ERROR": return <XCircle size={10} className="text-white" />
    default: return null
  }
}

function dotFill(status: LogStatus): string {
  switch (status) {
    case "SUCCESS": return "bg-[#b6c4ff]"
    case "RUNNING": return "bg-[#b6c4ff]"
    case "ERROR": return "bg-red-400"
    default: return "bg-[#434656]"
  }
}

function dotBorderCls(status: LogStatus): string {
  switch (status) {
    case "RUNNING": return "border-[#b6c4ff]"
    default: return "border-[#0d0e12]"
  }
}

function OperationItem({
  log,
  stemActive,
  tailActive,
  isLast,
}: {
  log: LogEntry
  stemActive: boolean
  tailActive: boolean
  isLast: boolean
}) {
  const removeLog = useChatStore((s) => s.removeLog)
  const isColored = log.status === "SUCCESS" || log.status === "RUNNING"
  const isError = log.status === "ERROR"

  function overlayCls(active: boolean) {
    return isError ? "bg-red-400 opacity-100" : active ? "bg-[#b6c4ff] opacity-100" : "opacity-0"
  }

  return (
    <div className="group relative pb-12 last:pb-0">
      {/* Stem — gray line from top through the dot */}
      <div className="absolute left-0 top-0 w-[2px] h-5 bg-[#434656]/40" />
      <div
        className={`absolute left-0 top-0 w-[2px] h-5 transition-opacity duration-[1500ms] ease-linear ${overlayCls(stemActive)}`}
      />

      {/* Tail — gray connector from below dot to next item's top */}
      {!isLast && (
        <>
          <div className="absolute left-0 top-5 w-[2px] bottom-0 bg-[#434656]/40" />
          <div
            className={`absolute left-0 top-5 w-[2px] bottom-0 transition-opacity duration-[1500ms] ease-linear ${overlayCls(tailActive)}`}
          />
        </>
      )}

      {/* Dot */}
      <div
        className={`absolute left-[-7px] top-[3px] z-10 flex size-4 items-center justify-center rounded-full border-2 transition-all duration-1000 ease-in-out ${dotBorderCls(log.status)} ${dotFill(log.status)}`}
      >
        <DotIcon status={log.status} />
      </div>

      {/* Content */}
      <div className="pl-5 pt-[3px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[8px] uppercase transition-colors duration-1000 ease-in-out ${
              isColored ? "text-[#b6c4ff]" : isError ? "text-red-400" : "text-[#8d90a2]"
            }`}>
              {log.status}
            </span>
            <span className={`font-mono text-[10px] transition-colors duration-1000 ease-in-out ${
              isColored ? "text-[#b6c4ff]" : isError ? "text-red-400" : "text-[#8d90a2]"
            }`}>
              {log.time}
            </span>
          </div>
          <button
            onClick={() => removeLog(log.id)}
            className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-0.5 text-[#8d90a2] hover:bg-[#292a2e] hover:text-[#e3e2e7]"
          >
            <X size={10} />
          </button>
        </div>
          <p className={`mt-0.5 text-[11px] font-medium transition-colors duration-1000 ease-in-out ${isColored ? "text-[#e3e2e7]" : "text-[#8d90a2]"} ${log.status === "RUNNING" ? "animate-pulse-gentle" : ""}`}>
          {log.label}
        </p>
        {log.detail && (
          <p className="mt-0.5 font-mono text-[9px] leading-relaxed text-[#c3c5d9]/70 line-clamp-2">{log.detail}</p>
        )}
      </div>
    </div>
  )
}

export function ActivityLog() {
  const logs = useChatStore((s) => s.logs)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Frontier: last non-PENDING item — blue fills from top to here
  let lastActiveIdx = -1
  if (logs) {
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i]?.status !== "PENDING") {
        lastActiveIdx = i
        break
      }
    }
  }

  return (
    <aside className="hidden w-72 flex-col border-l border-[#434656]/20 bg-[#0d0e12] lg:flex h-screen overflow-y-auto">
      <div className="border-b border-[#434656]/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">
            Operations
          </h2>
          <span
            className={`flex size-2 rounded-full ${logs.some(l => l.status === "RUNNING") ? "animate-pulse bg-[#b6c4ff]" : logs.length > 0 ? "bg-[#b6c4ff]/60" : "bg-[#434656]/40"}`}
          />
        </div>
        <p className="mt-0.5 text-[10px] text-[#c3c5d9]/60">Real-time execution log</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {logs.length === 0 ? (
          <div className="py-10 text-center text-[10px] text-[#8d90a2]">No operations yet</div>
        ) : (
          <div className="relative">
            {/* Top cap — line only, no dot, aligned left-0 with item lines */}
            <div className="absolute left-0 top-0 w-[2px] h-[43px] bg-[#434656]/40" />
            <div
              className={`absolute left-0 top-0 w-[2px] h-[43px] transition-opacity duration-[1500ms] ease-linear ${
                lastActiveIdx >= 0 ? "bg-[#b6c4ff] opacity-100" : "opacity-0"
              }`}
            />

            <div className="pt-[40px]">
              {logs.map((log, i) => (
                <OperationItem
                  key={log.id}
                  log={log}
                  stemActive={i <= lastActiveIdx}
                  tailActive={i + 1 <= lastActiveIdx}
                  isLast={i === logs.length - 1}
                />
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}