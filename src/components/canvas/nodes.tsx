import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { NODE_DEF_MAP, type NodeType } from "./node-types"
import { Loader2, AlertTriangle } from "lucide-react"

function configSummary(type: NodeType, config: Record<string, any>): string {
  switch (type) {
    case "trigger":
      return config.eventType ?? "manual"
    case "variables": {
      const vars = config.variables ?? []
      return vars.length > 0 ? `${vars.length} variable(s)` : "No variables"
    }
    case "template":
      return config.body ? `${config.body.slice(0, 30)}...` : "No body"
    case "email":
      return config.to ? `To: ${config.to}` : "No recipient"
    case "draft":
      return config.to ? `Draft to: ${config.to}` : "No recipient"
    case "listener":
      return config.filter ? `Filter: ${config.filter}` : "All unread"
    case "reply":
      return config.body ? `${config.body.slice(0, 30)}...` : "No body"
    default:
      return ""
  }
}

function WorkflowNode({ data, selected }: NodeProps) {
  const { type, label, config, execState } = data as {
    type: NodeType
    label: string
    config: Record<string, any>
    execState?: "running" | "completed" | "error"
  }
  const def = NODE_DEF_MAP[type]
  const Icon = def?.icon
  const summary = configSummary(type, config ?? {})
  const isRunning = execState === "running"
  const isCompleted = execState === "completed"
  const isError = execState === "error"
  const isTrigger = type === "trigger"

  return (
    // main block
    <div
      className={`relative min-w-[220px] rounded-lg shadow-xl border ${
        selected
          ? "border-[#0055ff] shadow-[0_0_0_1px_#0055ff]"
          : "border-[#434656]/20 hover:border-[#b6c4ff]/50"
      } bg-[#1e1f23]`}
    >
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !-top-0 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 !bg-[#8d90a2] !rounded-full !border-2 !border-[#121317] group-hover:!bg-[#b6c4ff] !cursor-crosshair"
        />
      )}
        <div className="flex items-center justify-between border-b border-[#434656]/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isRunning ? "bg-[#b6c4ff] animate-pulse" : isCompleted ? "bg-green-500" : isError ? "bg-amber-500" : "bg-[#8d90a2]"
              }`}
            />
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#8d90a2]">
              {def?.label ?? type}
            </span>
          </div>
          {isError ? (
            <AlertTriangle className="size-3.5 text-amber-500" />
          ) : isRunning ? (
            <Loader2 className="size-3.5 animate-spin text-[#b6c4ff]" />
          ) : null}
        </div>
      <div className="flex items-center gap-3 p-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded ${def?.bg}`}>
          {Icon && <Icon className={`size-5 ${def?.color}`} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#e3e2e7]">{label}</p>
          <p className="truncate text-[11px] text-[#8d90a2]">{summary}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className=" !w-3 !h-3 !-bottom-0 !left-1/2 !-translate-x-1/2 !translate-y-1/2 !bg-[#8d90a2] !rounded-full !border-2 !border-[#121317] group-hover:!bg-[#b6c4ff] !cursor-crosshair"
      />
    </div>
  )
}

export default memo(WorkflowNode)
