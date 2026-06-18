"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Search, Mail as MailIcon } from "lucide-react"
import { NODE_DEF_MAP, type NodeType } from "./node-types"
import { api } from "~/trpc/react"

interface NodeConfigPanelProps {
  node: { id: string; type: NodeType; label: string; config: Record<string, unknown> } | null
  onUpdate: (id: string, updates: { label?: string; config?: Record<string, unknown> }) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onUpdate, onClose }: NodeConfigPanelProps) {
  const [label, setLabel] = useState("")
  const [config, setConfig] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (node) {
      setLabel(node.label)
      setConfig({ ...node.config })
    }
  }, [node])

  if (!node) return null

  const def = NODE_DEF_MAP[node.type]
  const Icon = def?.icon

  const update = (key: string, value: unknown) => {
    const next = { ...config, [key]: value }
    setConfig(next)
    onUpdate(node.id, { label, config: next })
  }

  const setLabelAndSave = (v: string) => {
    setLabel(v)
    onUpdate(node.id, { label: v, config })
  }

  return (
    <div className="absolute right-0 top-0 z-30 flex w-fit min-w-80 max-w-sm flex-col border-l border-[#434656]/10 bg-[#0d0e12] shadow-xl h-full">
      <div className="flex items-center justify-between border-b border-[#434656]/10 px-5 py-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`size-4 ${def?.color}`} />}
          <h2 className="text-sm font-semibold text-[#e3e2e7]">{def?.label ?? "Node"}</h2>
        </div>
        <button onClick={onClose} className="text-[#8d90a2] transition-colors hover:text-[#c3c5d9]">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Label</label>
          <input
            value={label}
            onChange={(e) => setLabelAndSave(e.target.value)}
            className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
          />
        </div>

        {node.type === "variables" && (
          <VariablesConfig config={config} onUpdate={update} />
        )}

        {(node.type === "template" || node.type === "email" || node.type === "draft" || node.type === "reply") && (
          <BodyConfig nodeType={node.type} config={config} onUpdate={update} />
        )}

        {(node.type === "email" || node.type === "draft") && (
          <EmailConfig config={config} onUpdate={update} />
        )}

        {node.type === "trigger" && (
          <TriggerConfig config={config} onUpdate={update} />
        )}

        {node.type === "listener" && (
          <ListenerConfig config={config} onUpdate={update} />
        )}

        {node.type === "reply" && (
          <ReplyConfig config={config} onUpdate={update} />
        )}
      </div>
    </div>
  )
}

function VariablesConfig({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}) {
  const vars: Array<{ key: string; value: string }> = (config.variables as Array<{ key: string; value: string }> | undefined) ?? []

  const setVars = (variables: Array<{ key: string; value: string }>) => {
    onUpdate("variables", variables)
  }

  const addVar = () => setVars([...vars, { key: "", value: "" }])
  const removeVar = (i: number) => setVars(vars.filter((_, idx) => idx !== i))
  const updateVar = (i: number, field: "key" | "value", v: string) => {
    const next = vars.map((item, idx) => (idx === i ? { ...item, [field]: v } : item))
    setVars(next)
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#8d90a2]">Variables</label>
      <div className="space-y-2">
        {vars.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              placeholder="name"
              value={v.key}
              onChange={(e) => updateVar(i, "key", e.target.value)}
              className="w-[90px] rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-2.5 py-1.5 text-xs text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
            />
            <span className="text-[#8d90a2]">=</span>
            <input
              placeholder="value"
              value={v.value}
              onChange={(e) => updateVar(i, "value", e.target.value)}
              className="flex-1 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-2.5 py-1.5 text-xs text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
            />
            <button onClick={() => removeVar(i)} className="shrink-0 text-[#8d90a2] hover:text-red-400">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addVar}
        className="mt-2 flex items-center gap-1 text-xs text-[#b6c4ff] transition-colors hover:text-[#c3c5d9]"
      >
        <Plus className="size-3" /> Add variable
      </button>
      <p className="mt-2 text-[11px] text-[#8d90a2]">Use {'{name}'} in other nodes to reference</p>
    </div>
  )
}

function BodyConfig({
  nodeType,
  config,
  onUpdate,
}: {
  nodeType: string
  config: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#8d90a2]">
        {nodeType === "template" ? "Template Body" : "Body"}
      </label>
      <textarea
        value={(config.body as string) ?? ""}
        onChange={(e) => onUpdate("body", e.target.value)}
        rows={6}
        placeholder={nodeType === "template" ? "Write template with {variable} references..." : "Email body..."}
        className="w-full resize-none rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
      />
    </div>
  )
}

function EmailConfig({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}) {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#8d90a2]">To</label>
        <input
          value={(config.to as string) ?? ""}
          onChange={(e) => onUpdate("to", e.target.value)}
          placeholder="recipient@example.com"
          className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Subject</label>
        <input
          value={(config.subject as string) ?? ""}
          onChange={(e) => onUpdate("subject", e.target.value)}
          placeholder="Subject"
          className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
        />
      </div>
    </>
  )
}

function TriggerConfig({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Event Type</label>
      <select
        value={(config.eventType as string) ?? "manual"}
        onChange={(e) => onUpdate("eventType", e.target.value)}
        className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#c3c5d9] outline-none focus:border-[#b6c4ff]/30"
      >
        <option value="manual">Manual</option>
        <option value="scheduled">Scheduled</option>
        <option value="email_received">Email Received</option>
      </select>
    </div>
  )
}

function ListenerConfig({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Gmail Filter (optional)</label>
      <input
        value={(config.filter as string) ?? ""}
        onChange={(e) => onUpdate("filter", e.target.value)}
        placeholder='e.g. "from:example.com"'
        className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
      />
      <p className="mt-1 text-[11px] text-[#8d90a2]">Leave empty to listen to all unread</p>
    </div>
  )
}

function ReplyConfig({
  config,
  onUpdate,
}: {
  config: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}) {
  const [searchQ, setSearchQ] = useState("")
  const [debounced, setDebounced] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQ), 300)
    return () => clearTimeout(t)
  }, [searchQ])

  const { data: searchResults } = api.corsair.listMessages.useQuery(
    { q: debounced || undefined },
    { enabled: debounced.length > 0 },
  )

  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Search email to reply to</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8d90a2]" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search emails..."
            className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 pl-8 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
          />
        </div>
      </div>

      {config.selectedEmail && (
        <div className="rounded-lg border border-[#434656]/20 bg-[#1a1b1f] p-3">
          <p className="text-[10px] font-medium text-[#b6c4ff] uppercase tracking-wider">Selected Email</p>
          <p className="mt-1 text-xs text-[#e3e2e7] truncate">{(config.selectedEmail as { subject: string; from: string }).subject}</p>
          <p className="text-[10px] text-[#8d90a2] truncate">{(config.selectedEmail as { subject: string; from: string }).from}</p>
          <button
            onClick={() => onUpdate("selectedEmail", undefined)}
            className="mt-1 text-[10px] text-red-400 hover:text-red-300"
          >
            Clear
          </button>
        </div>
      )}

      {debounced && !searchQ && (
        <div>
          <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Recent Emails</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[].map((_m: unknown) => null)}
            <p className="text-[10px] text-[#8d90a2] py-2 text-center">Type to search emails</p>
          </div>
        </div>
      )}

      {debounced && searchResults?.messages && (
        <div>
          <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Results</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {searchResults.messages.length === 0 ? (
              <p className="text-[10px] text-[#8d90a2] py-2 text-center">No emails found</p>
            ) : (
              searchResults.messages.slice(0, 10).map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onUpdate("selectedEmail", { id: m.id, subject: m.subject, from: m.from })
                    setSearchQ("")
                    setDebounced("")
                  }}
                  className="flex items-start gap-2 w-full rounded border border-[#434656]/10 bg-[#121317] p-2 text-left transition-colors hover:border-[#b6c4ff]/30"
                >
                  <MailIcon className="size-3 shrink-0 mt-0.5 text-[#8d90a2]" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-[#e3e2e7]">{m.subject || "(no subject)"}</p>
                    <p className="truncate text-[9px] text-[#8d90a2]">{m.from}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
