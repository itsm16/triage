import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { NODE_DEF_MAP, type NodeType } from "./node-types"

interface NodeConfigPanelProps {
  node: { id: string; type: NodeType; label: string; config: Record<string, any> } | null
  onUpdate: (id: string, updates: { label?: string; config?: Record<string, any> }) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onUpdate, onClose }: NodeConfigPanelProps) {
  const [label, setLabel] = useState("")
  const [config, setConfig] = useState<Record<string, any>>({})

  useEffect(() => {
    if (node) {
      setLabel(node.label)
      setConfig({ ...node.config })
    }
  }, [node])

  if (!node) return null

  const def = NODE_DEF_MAP[node.type]
  const Icon = def?.icon

  const update = (key: string, value: any) => {
    const next = { ...config, [key]: value }
    setConfig(next)
    onUpdate(node.id, { label, config: next })
  }

  const setLabelAndSave = (v: string) => {
    setLabel(v)
    onUpdate(node.id, { label: v, config })
  }

  return (
    <div className="absolute right-0 top-0 z-20 flex w-fit min-w-80 max-w-sm flex-col border-l border-[#434656]/10 bg-[#0d0e12] shadow-xl h-full">
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
      </div>
    </div>
  )
}

function VariablesConfig({
  config,
  onUpdate,
}: {
  config: Record<string, any>
  onUpdate: (key: string, value: any) => void
}) {
  const vars: Array<{ key: string; value: string }> = config.variables ?? []

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
  config: Record<string, any>
  onUpdate: (key: string, value: any) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#8d90a2]">
        {nodeType === "template" ? "Template Body" : "Body"}
      </label>
      <textarea
        value={config.body ?? ""}
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
  config: Record<string, any>
  onUpdate: (key: string, value: any) => void
}) {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#8d90a2]">To</label>
        <input
          value={config.to ?? ""}
          onChange={(e) => onUpdate("to", e.target.value)}
          placeholder="recipient@example.com"
          className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Subject</label>
        <input
          value={config.subject ?? ""}
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
  config: Record<string, any>
  onUpdate: (key: string, value: any) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Event Type</label>
      <select
        value={config.eventType ?? "manual"}
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
  config: Record<string, any>
  onUpdate: (key: string, value: any) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#8d90a2]">Gmail Filter (optional)</label>
      <input
        value={config.filter ?? ""}
        onChange={(e) => onUpdate("filter", e.target.value)}
        placeholder='e.g. "from:example.com"'
        className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
      />
      <p className="mt-1 text-[11px] text-[#8d90a2]">Leave empty to listen to all unread</p>
    </div>
  )
}
