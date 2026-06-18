"use client"

import { useEffect, useState, useRef } from "react"
import { Bot, Mail, Calendar, Sparkles, User, Check, Loader2, ArrowUp } from "lucide-react"

type Step = "empty" | "typing" | "user-message" | "tool-calling" | "response" | "done"

const logsData = [
  { status: "SUCCESS", label: "List AWS invoices", detail: "Fetched 12 invoices from AWS billing" },
  { status: "SUCCESS", label: "Send a mail to Sarah Chen", detail: "Follow-up on Q2 Budget Review" },
  { status: "RUNNING", label: "Sync Google Calendar", detail: "Fetching upcoming events for next 7 days" },
  { status: "SUCCESS", label: "Archive processed invoices", detail: "Moved 8 threads to Finances folder" },
  { status: "SUCCESS", label: "Draft response to GitHub PR #892", detail: "Auto-generated review summary" },
]

export function LandingChatDemo() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<Step>("empty")
  const [typedChars, setTypedChars] = useState(0)
  const [showLogs, setShowLogs] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const inputText = "list aws invoices"

  useEffect(() => {
    if (logsEndRef.current) {
      const container = logsEndRef.current.closest(".overflow-y-auto")
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [showLogs])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const t1 = setTimeout(() => setStep("typing"), 1200)
    return () => clearTimeout(t1)
  }, [mounted])

  useEffect(() => {
    if (step !== "typing") return
    if (typedChars < inputText.length) {
      const t = setTimeout(() => setTypedChars((c) => c + 1), 60)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep("user-message"), 500)
    return () => clearTimeout(t)
  }, [step, typedChars])

  useEffect(() => {
    if (step !== "user-message") return
    const t = setTimeout(() => {
      setStep("tool-calling")
      setShowLogs(true)
    }, 700)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (step !== "tool-calling") return
    const t = setTimeout(() => setStep("response"), 1200)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (step !== "response") return
    const t = setTimeout(() => setStep("done"), 2500)
    return () => clearTimeout(t)
  }, [step])

  const ContainerCls = `flex size-full overflow-hidden rounded-lg border border-[#434656]/10 bg-[#121317] transition-[opacity,transform] duration-700 ${
    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
  }`

  return (
    <div className={ContainerCls}>
      {/* Chat Messages Area */}
      <section className="flex flex-1 flex-col bg-[#121317]">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-6">
          {/* Empty State */}
          {step === "empty" && (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-2 sm:gap-8 sm:px-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#0055ff]/10 sm:size-12">
                  <Bot className="size-5 text-[#0055ff] sm:size-6" />
                </div>
                <h1 className="text-sm font-semibold text-[#e3e2e7] sm:text-lg">How can I help you?</h1>
                <p className="text-[10px] text-[#8d90a2] sm:text-xs">Ask me about your email, calendar, or anything else</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2.5">
                {[
                  { icon: Mail, label: "Summarize inbox", desc: "Get a quick overview" },
                  { icon: Calendar, label: "Schedule a meeting", desc: "Find a time and invite" },
                  { icon: Sparkles, label: "What can you do?", desc: "Explore my capabilities" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2.5 transition-colors hover:border-[#b6c4ff]/30 hover:bg-[#1e1f23] sm:w-auto sm:px-4 sm:py-3"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#b6c4ff]/10 sm:size-8">
                      <item.icon className="size-3.5 text-[#b6c4ff] sm:size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#e3e2e7] sm:text-xs">{item.label}</p>
                      <p className="text-[9px] text-[#8d90a2] sm:text-[10px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Message */}
          {(step === "user-message" || step === "tool-calling" || step === "response" || step === "done") && (
            <div className="flex flex-row-reverse gap-2 sm:gap-2.5">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-[#434656]/20 bg-[#343539] sm:size-6">
                <User className="size-3 text-[#b6c4ff] sm:size-3.5" />
              </div>
              <div className="min-w-0 max-w-[calc(100%-1.75rem)] sm:max-w-[calc(100%-2.5rem)]">
                <div className="rounded-lg border border-[#434656]/10 bg-[#0055ff] px-2.5 py-1.5 text-xs leading-relaxed text-[#e3e6ff] rounded-tr-none sm:px-3 sm:py-2 sm:text-sm">
                  <p>list aws invoices</p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Calling Indicator */}
          {(step === "tool-calling") && (
            <div className="flex gap-2 sm:gap-2.5">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#0055ff] sm:size-6">
                <Bot className="size-3 text-[#e3e6ff] sm:size-3.5" />
              </div>
              <div className="min-w-0 max-w-[calc(100%-1.75rem)] sm:max-w-[calc(100%-2.5rem)]">
                <div className="rounded-lg border border-[#434656]/10 bg-[#1a1b1f] px-2.5 py-1.5 text-xs leading-relaxed text-[#e3e2e7] rounded-tl-none sm:px-3 sm:py-2 sm:text-sm">
                  <div className="space-y-1">
                    {["Fetching emails", "Reading labels", "Processing invoices"].map((label) => (
                      <div key={label} className="flex items-center gap-1.5 text-[10px] text-[#8d90a2] sm:text-[11px]">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#8d90a2] sm:text-[11px]">
                          <Loader2 className="size-2.5 shrink-0 animate-spin text-[#b6c4ff] sm:size-3" />
                          <span className={label === "Processing invoices" ? "" : "line-through decoration-[#8d90a2]/40"}>{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Response */}
          {(step === "response" || step === "done") && (
            <div className="flex gap-2 sm:gap-2.5">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#0055ff] sm:size-6">
                <Bot className="size-3 text-[#e3e6ff] sm:size-3.5" />
              </div>
              <div className="min-w-0 max-w-[calc(100%-1.75rem)] sm:max-w-[calc(100%-2.5rem)]">
                <div className="rounded-lg border border-[#434656]/10 bg-[#1a1b1f] px-2.5 py-1.5 text-xs leading-relaxed text-[#e3e2e7] rounded-tl-none sm:px-3 sm:py-2 sm:text-sm">
                  <p className="mb-1.5 text-[11px] sm:mb-2 sm:text-sm">Found <strong>12 AWS invoices</strong> from April 2026. Here&apos;s the summary:</p>
                  <div className="mb-1.5 space-y-1 sm:mb-2 sm:space-y-1.5">
                    {[
                      { subject: "AWS Invoice - April 2026 (#INV-0426-001)", from: "AWS Billing <no-reply@aws.com>", amount: "$1,234.56" },
                      { subject: "AWS Invoice - March 2026 (#INV-0326-015)", from: "AWS Billing <no-reply@aws.com>", amount: "$982.10" },
                      { subject: "AWS Support Plan - Q2 2026", from: "AWS Enterprise <support@aws.com>", amount: "$500.00" },
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md border border-[#434656]/20 bg-[#0d0e12] px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#b6c4ff]/10 sm:size-8">
                          <Mail className="size-3 text-[#b6c4ff] sm:size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium text-[#e3e2e7] sm:text-xs">{inv.subject}</p>
                          <p className="truncate text-[8px] text-[#8d90a2] sm:text-[10px]">{inv.from}</p>
                        </div>
                        <span className="shrink-0 font-mono text-[9px] text-[#c3c5d9] sm:text-[10px]">{inv.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-[#434656]/20 bg-[#0d0e12] px-2 py-1 sm:mt-2 sm:gap-2 sm:px-2.5 sm:py-1.5">
                    <Check className="size-2.5 shrink-0 text-[#b6c4ff] sm:size-3" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#e3e2e7] sm:text-xs">Summarize AWS invoices</p>
                      <p className="truncate font-mono text-[8px] text-[#8d90a2] sm:text-[9px]">Generate a cost breakdown report</p>
                    </div>
                    <span className="ml-auto shrink-0 rounded bg-[#b6c4ff]/10 px-1 py-0.5 font-mono text-[7px] uppercase text-[#b6c4ff] sm:px-1.5 sm:text-[8px]">Execute</span>
                  </div>
                  {step === "done" && (
                    <div className="mt-1.5 rounded-md border border-[#434656]/20 bg-[#0d0e12] p-2 sm:mt-2 sm:p-2.5">
                      <p className="text-[10px] text-[#e3e2e7] sm:text-xs">Would you like me to archive the processed invoices and send a summary to your finance team?</p>
                      <div className="mt-1.5 flex gap-1.5">
                        <span className="rounded bg-[#0055ff] px-2 py-0.5 text-[9px] font-medium text-[#e3e6ff] sm:px-2.5 sm:py-1 sm:text-[10px]">Yes</span>
                        <span className="rounded border border-[#434656]/30 px-2 py-0.5 text-[9px] text-[#c3c5d9] sm:px-2.5 sm:py-1 sm:text-[10px]">No</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="shrink-0 border-t border-[#434656]/20 bg-[#121317]/10 px-3 py-3 sm:px-4 sm:py-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex-col gap-0 rounded-xl border border-[#b6c4ff]/15 bg-black/30 backdrop-blur-sm sm:rounded-2xl">
              <div className="flex items-center px-3 pt-2 sm:px-4 sm:pt-3">
                {step === "typing" ? (
                  <span className="w-full bg-transparent text-xs text-[#e3e2e7] outline-none resize-none min-h-[16px] sm:text-sm sm:min-h-[20px]">
                    {inputText.slice(0, typedChars)}
                    <span className="animate-pulse text-[#b6c4ff]">|</span>
                  </span>
                ) : (
                  <span className="w-full bg-transparent text-xs text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none resize-none min-h-[16px] sm:text-sm sm:min-h-[20px]">
                    {step === "empty" ? (
                      <span className="text-[#8d90a2]/50">Command...</span>
                    ) : (
                      inputText
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 sm:px-3 sm:pb-2">
                <div className="flex items-center gap-1" />
                <div className="flex-1" />
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#0055ff] text-[#e3e6ff] shadow-lg sm:size-8">
                    <ArrowUp size={14} className="sm:size-[17px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <aside className="hidden w-72 flex-col border-l border-[#434656]/20 bg-[#0d0e12] lg:flex overflow-y-auto">
        <div className="border-b border-[#434656]/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">
              Operations
            </h2>
            <span className={`flex size-2 rounded-full ${showLogs ? "animate-pulse bg-[#b6c4ff]" : "bg-[#434656]/40"}`} />
          </div>
          <p className="mt-0.5 text-[10px] text-[#c3c5d9]/60">Real-time execution log</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {!showLogs ? (
            <div className="py-10 text-center text-[10px] text-[#8d90a2]">No operations yet</div>
          ) : (
            <div className="relative">
              <div className="absolute left-0 top-0 w-[2px] h-[43px] bg-[#434656]/40" />
              <div className="pt-[40px] space-y-0">
                {logsData.map((log, i) => (
                  <div key={log.label} className={`group relative pb-12 last:pb-0 ${step !== "done" && i >= 2 ? "opacity-40" : ""}`}>
                    <div className="absolute left-0 top-0 w-[2px] h-5 bg-[#434656]/40" />
                    {i < logsData.length - 1 && (
                      <div className="absolute left-0 top-5 w-[2px] bottom-0 bg-[#434656]/40" />
                    )}
                    <div className={`absolute left-[-7px] top-[3px] z-10 flex size-4 items-center justify-center rounded-full border-2 border-[#0d0e12] ${
                      log.status === "RUNNING" ? "bg-[#b6c4ff]" : "bg-[#b6c4ff]"
                    }`}>
                      {log.status === "RUNNING" ? (
                        <Loader2 size={10} className="animate-spin text-[#0d0e12]" />
                      ) : (
                        <Check size={10} className="text-[#0d0e12]" />
                      )}
                    </div>
                    <div className="pl-5 pt-[3px]">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[8px] uppercase ${
                          log.status === "RUNNING" ? "text-[#b6c4ff]" : "text-[#b6c4ff]"
                        }`}>{log.status}</span>
                      </div>
                      <p className={`mt-0.5 text-[11px] font-medium text-[#e3e2e7]`}>{log.label}</p>
                      <p className="mt-0.5 font-mono text-[9px] leading-relaxed text-[#c3c5d9]/70 line-clamp-2">{log.detail}</p>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
