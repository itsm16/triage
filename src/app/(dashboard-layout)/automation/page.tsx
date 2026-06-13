"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Plus, Trash2, Play, ArrowLeft, Zap, CalendarClock, Timer } from "lucide-react"

const Canvas = dynamic(() => import("~/components/canvas/canvas"), { ssr: false })

interface Flow {
  id: string
  name: string
  status: "active" | "inactive"
  lastRun: string
}

const initialFlows: Flow[] = [
  { id: "1", name: "Auto-label invoices", status: "active", lastRun: "2h ago" },
  { id: "2", name: "Slack digest daily", status: "active", lastRun: "1d ago" },
  { id: "3", name: "Archive promotions", status: "inactive", lastRun: "never" },
]

const cards = [
  { icon: Zap, label: "Trigger Now", desc: "Run a flow immediately", color: "text-yellow-400" },
  { icon: CalendarClock, label: "Report Daily", desc: "Schedule daily report", color: "text-blue-400" },
  { icon: Timer, label: "One Time", desc: "Run once on event", color: "text-green-400" },
]

export default function AutomationPage() {
  const [flows, setFlows] = useState<Flow[]>(initialFlows)
  const [viewingFlow, setViewingFlow] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  const deleteFlow = (id: string) => setFlows((prev) => prev.filter((f) => f.id !== id))

  const createFlow = () => {
    if (!newName.trim()) return
    const id = String(Date.now())
    setFlows((prev) => [...prev, { id, name: newName, status: "inactive", lastRun: "never" }])
    setNewName("")
  }

  if (viewingFlow) {
    const flow = flows.find((f) => f.id === viewingFlow)
    return (
      <div className="flex h-full w-full flex-col bg-[#0a0a0a]">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#434656]/10 px-4">
          <button
            onClick={() => setViewingFlow(null)}
            className="flex items-center gap-1 text-sm text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <span className="text-sm font-medium text-[#e3e2e7]">{flow?.name ?? "Flow"}</span>
        </header>
        <div className="flex-1">
          <Canvas flowLabel={flow?.name} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#121317]">
      <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
        <h1 className="text-lg font-semibold text-[#e3e2e7]">Automations</h1>

        <div className="grid grid-cols-3 gap-4">
          {cards.map((card) => (
            <button
              key={card.label}
              className="flex items-start gap-3 rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-4 text-left transition-colors hover:border-[#b6c4ff]/20"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#292a2e]">
                <card.icon className={`size-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#e3e2e7]">{card.label}</p>
                <p className="text-xs text-[#8d90a2]">{card.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createFlow()}
            placeholder="New flow name..."
            className="flex-1 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-4 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
          />
          <button
            onClick={createFlow}
            className="flex items-center gap-2 rounded-lg bg-[#0055ff] px-4 py-2 text-sm font-medium text-[#e3e6ff] transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> New Flow
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#434656]/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#434656]/10 bg-[#0d0e12]">
                <th className="px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">Name</th>
                <th className="px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">Last Run</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/10">
              {flows.map((flow) => (
                <tr
                  key={flow.id}
                  onClick={() => setViewingFlow(flow.id)}
                  className="cursor-pointer transition-colors hover:bg-[#292a2e]/50"
                >
                  <td className="px-5 py-4 text-sm font-medium text-[#e3e2e7]">{flow.name}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                        flow.status === "active"
                          ? "border border-green-500/20 bg-green-500/10 text-green-400"
                          : "border border-[#434656]/20 bg-[#292a2e] text-[#8d90a2]"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${flow.status === "active" ? "bg-green-400" : "bg-[#8d90a2]"}`} />
                      {flow.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#c3c5d9]">{flow.lastRun}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => deleteFlow(flow.id)}
                        className="rounded p-1.5 text-[#8d90a2] transition-colors hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
