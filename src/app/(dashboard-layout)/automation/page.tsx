"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Plus, Trash2, ArrowLeft, Zap } from "lucide-react"
import { api } from "~/trpc/react"
import { toast } from "sonner"

const Canvas = dynamic(() => import("~/components/canvas/canvas"), { ssr: false })

const ONE_TIME = "__onetime__"
const TRIGGER_NOW = "__triggernow__"

const cards = [
  { icon: Zap, label: "Trigger Now", desc: "Run a flow immediately", color: "text-yellow-400" },
  // { icon: CalendarClock, label: "Report Daily", desc: "Schedule daily report", color: "text-blue-400" },
  // { icon: Timer, label: "One Time", desc: "Run once on event", color: "text-green-400" },
]

export default function AutomationPage() {
  const [viewingFlow, setViewingFlow] = useState<string | null>(null)
  const [flowPreset, setFlowPreset] = useState<string | undefined>()
  const [newName, setNewName] = useState("")

  const { data: flows, refetch } = api.workflow.list.useQuery()
  const createMut = api.workflow.create.useMutation({
    onSuccess: () => { void refetch(); toast.success("Flow created") },
    onError: (e) => toast.error(e.message),
  })
  const deleteMut = api.workflow.delete.useMutation({
    onSuccess: () => { void refetch(); toast.success("Flow deleted") },
    onError: (e) => toast.error(e.message),
  })

  const createFlow = () => {
    if (!newName.trim()) return
    createMut.mutate({ name: newName })
    setNewName("")
  }

  const deleteFlow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMut.mutate({ id })
  }

  const openOneTime = (sentinel: string, preset?: string) => {
    setFlowPreset(preset)
    setViewingFlow(sentinel)
  }

  if (viewingFlow) {
    const isOneTime = viewingFlow === ONE_TIME || viewingFlow === TRIGGER_NOW
    const label = viewingFlow === TRIGGER_NOW ? "Trigger Now" : viewingFlow === ONE_TIME ? "One-Time Flow" : undefined
    const flow = !isOneTime ? flows?.find((f) => f.id === viewingFlow) : null
    return (
      <div className="flex h-full w-full flex-col bg-[#0a0a0a]">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#434656]/10 px-4">
          <button
            onClick={() => { setViewingFlow(null); setFlowPreset(undefined) }}
            className="flex items-center gap-1 text-sm text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <span className="text-sm font-medium text-[#e3e2e7]">
            {label ?? flow?.name ?? "Flow"}
          </span>
        </header>
        <div className="flex-1">
          <Canvas workflowId={isOneTime ? undefined : viewingFlow} preset={isOneTime ? flowPreset : undefined} />
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
              onClick={() => {
                if (card.label === "Trigger Now") openOneTime(TRIGGER_NOW, "send-email")
                else if (card.label === "One Time") openOneTime(ONE_TIME)
              }}
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
            disabled={createMut.isPending}
            className="flex items-center gap-2 rounded-lg bg-[#0055ff] px-4 py-2 text-sm font-medium text-[#e3e6ff] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="size-4" /> New Flow
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#434656]/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#434656]/10 bg-[#0d0e12]">
                <th className="px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">Name</th>
                <th className="px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#8d90a2]">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434656]/10">
              {(flows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-[#8d90a2]">No flows yet. Create one above.</td>
                </tr>
              ) : (
                (flows ?? []).map((flow) => (
                  <tr
                    key={flow.id}
                    onClick={() => setViewingFlow(flow.id)}
                    className="cursor-pointer transition-colors hover:bg-[#292a2e]/50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-[#e3e2e7]">{flow.name}</td>
                    <td className="px-5 py-4 text-sm text-[#c3c5d9]">
                      {new Date(flow.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => deleteFlow(flow.id, e)}
                          disabled={deleteMut.isPending}
                          className="rounded p-1.5 text-[#8d90a2] transition-colors hover:text-red-400"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
