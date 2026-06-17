"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type DefaultEdgeOptions,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Play, Save, Plus, X, Loader2 } from "lucide-react"
import { api } from "~/trpc/react"
import { NODE_DEFS, CATEGORIES, type NodeType } from "./node-types"
import { NodeConfigPanel } from "./node-config-panel"
import WorkflowNode from "./nodes"
import { toast } from "sonner"

const nodeTypes = { default: WorkflowNode }

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "step",
  style: { stroke: "#434656", strokeWidth: 1.5 },
}

let idCounter = 100

function buildPresetNodes(preset?: string): Node[] {
  if (preset === "send-email") {
    return [
      {
        id: "trigger_1",
        type: "default" as const,
        position: { x: 100, y: 50 },
        data: { type: "trigger" as NodeType, label: "Trigger", config: {} },
      },
      {
        id: "vars_1",
        type: "default" as const,
        position: { x: 200, y: 250 },
        data: {
          type: "variables" as NodeType,
          label: "Variables",
          config: { variables: [{ key: "name", value: "" }, { key: "email", value: "" }] },
        },
      },
      {
        id: "tmpl_1",
        type: "default" as const,
        position: { x: 300, y: 450 },
        data: {
          type: "template" as NodeType,
          label: "Template",
          config: { body: "Hi {name},\n\nThis is a test message.\n\nBest regards" },
        },
      },
      {
        id: "email_1",
        type: "default" as const,
        position: { x: 400, y: 650 },
        data: {
          type: "email" as NodeType,
          label: "Send Email",
          config: { to: "{email}", subject: "Hello {name}" },
        },
      },
    ]
  }
  return [
    {
      id: "trigger_1",
      type: "default" as const,
      position: { x: 250, y: 200 },
      data: { type: "trigger" as NodeType, label: "Trigger", config: {} },
    },
  ]
}

function buildChainEdges(nodes: Node[]): Edge[] {
  const edges: Edge[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i]
    const to = nodes[i + 1]
    if (!from || !to) continue
    edges.push({
      id: `e-${from.id}-${to.id}`,
      source: from.id,
      target: to.id,
    })
  }
  return edges
}

export default function Canvas({ workflowId, preset }: { workflowId?: string; preset?: string }) {
  const isOneTime = !workflowId
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const [nodes, setNodes] = useState<Node[]>(() =>
    isOneTime ? buildPresetNodes(preset) : [],
  )
  const [edges, setEdges] = useState<Edge[]>(() =>
    isOneTime ? buildChainEdges(buildPresetNodes(preset)) : [],
  )
  const [showDrawer, setShowDrawer] = useState(false)
  const [selectedNode, setSelectedNode] = useState<{
    id: string
    type: NodeType
    label: string
    config: Record<string, any>
  } | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { data: workflowData, isLoading } = api.workflow.get.useQuery(
    { id: workflowId! },
    { enabled: !isOneTime },
  )

  useEffect(() => {
    if (workflowData?.nodes) {
      const loadedNodes = workflowData.nodes.map((n: any) => ({
        id: n.id,
        type: "default" as const,
        position: { x: n.positionX, y: n.positionY },
        data: { type: n.type, label: n.label, config: n.config as Record<string, any> },
      }))
      setNodes(loadedNodes)
      setEdges(buildChainEdges(loadedNodes))
    }
  }, [workflowData])

  const setNodesExecState = useCallback((execState: "running" | "completed" | "error" | undefined, nodeIds?: string[]) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (nodeIds && !nodeIds.includes(n.id)) return n
        const data = n.data as Record<string, any>
        return { ...n, data: { ...data, execState } }
      }),
    )
  }, [])

  const setEdgeActive = useCallback((edgeIds: string[], active: boolean) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (!edgeIds.includes(e.id)) return e
        return {
          ...e,
          style: active
            ? { stroke: "#b6c4ff", strokeWidth: 2 }
            : { stroke: "#434656", strokeWidth: 1.5 },
        }
      }),
    )
  }, [])

  const animateExecution = useCallback(
    (nodeResults: { nodeId: string; status: string }[], nodeOrder: string[], doneMessage?: string) => {
      let i = 0
      const tick = () => {
        if (i >= nodeResults.length) return

        const prevId = i > 0 ? nodeOrder[i - 1] : undefined
        const currId = nodeOrder[i]
        if (!currId) return

        if (prevId) {
          setNodesExecState("completed", [prevId])
          setEdgeActive([`e-${prevId}-${currId}`], true)
        }

        if (i === 0 && nodeOrder.length > 1 && nodeOrder[1]) {
          setEdgeActive([`e-${nodeOrder[0]}-${nodeOrder[1]}`], true)
        }

        setNodesExecState("running", [currId])

        const result = nodeResults.find((r) => r.nodeId === currId)
        const isError = result?.status === "error"
        const isLast = i === nodeResults.length - 1
        i++

        if (isError) {
          setTimeout(() => {
            setNodesExecState("error", [currId])
            toast.error("Node failed")
          }, 700)
        } else if (isLast) {
          setTimeout(() => {
            setNodesExecState("completed", [currId])
            if (doneMessage) toast.success(doneMessage)
          }, 700)
        } else {
          animRef.current = setTimeout(tick, 700)
        }
      }

      tick()
    },
    [setNodesExecState, setEdgeActive],
  )

  const resetExecution = useCallback(() => {
    clearTimeout(animRef.current)
    setNodesExecState(undefined)
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { stroke: "#434656", strokeWidth: 1.5 },
      })),
    )
  }, [setNodesExecState])

  const saveNodesMut = api.workflow.saveNodes.useMutation({
    onSuccess: () => toast.success("Flow saved"),
    onError: (e) => toast.error(e.message),
  })
  const executeMut = api.workflow.execute.useMutation({
    onSuccess: (res) => {
      resetExecution()
      if (res.nodeResults && res.nodeResults.length > 0) {
        const order = res.nodeResults.map((r) => r.nodeId)
        animateExecution(res.nodeResults, order, res.success ? "Flow executed successfully" : undefined)
      } else if (!res.success) {
        toast.error(res.error ?? "Execution failed")
      }
    },
    onError: (e) => {
      resetExecution()
      toast.error(e.message)
    },
  })
  const executeOnceMut = api.workflow.executeOnce.useMutation({
    onSuccess: (res) => {
      resetExecution()
      if (res.nodeResults && res.nodeResults.length > 0) {
        const order = res.nodeResults.map((r) => r.nodeId)
        animateExecution(res.nodeResults, order, res.success ? "Flow executed successfully" : undefined)
      } else if (!res.success) {
        toast.error(res.error ?? "Execution failed")
      }
    },
    onError: (e) => {
      resetExecution()
      toast.error(e.message)
    },
  })

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  )

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const d = node.data as { type: NodeType; label: string; config: Record<string, any> }
      setSelectedNode({ id: node.id, type: d.type, label: d.label, config: d.config ?? {} })
    },
    [],
  )

  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  const addNode = useCallback((type: NodeType, label: string) => {
    const id = `node_${idCounter++}`
    const newNode: Node = {
      id,
      type: "default",
      position: { x: 200 + Math.random() * 300, y: 150 + Math.random() * 200 },
      data: { type, label, config: {} },
    }
    setNodes((nds) => [...nds, newNode])
    setShowDrawer(false)
  }, [])

  const updateNode = useCallback(
    (id: string, updates: { label?: string; config?: Record<string, any> }) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== id) return n
          const data = n.data as Record<string, any>
          return {
            ...n,
            data: {
              ...data,
              ...(updates.label ? { label: updates.label } : {}),
              ...(updates.config ? { config: updates.config } : {}),
            },
          }
        }),
      )
      setSelectedNode((prev) =>
        prev?.id === id ? { ...prev, ...updates } : prev,
      )
    },
    [],
  )

  const save = useCallback(() => {
    if (!workflowId) return
    saveNodesMut.mutate({
      workflowId,
      nodes: nodes.map((n) => {
        const d = n.data as { type: string; label: string; config: Record<string, any> }
        return {
          id: n.id,
          type: d.type,
          label: d.label,
          positionX: n.position.x,
          positionY: n.position.y,
          config: d.config ?? {},
        }
      }),
    })
  }, [nodes, workflowId, saveNodesMut])

  const run = useCallback(() => {
    resetExecution()
    const nodeIds: string[] = nodes.map((n) => n.id).filter(Boolean)
    if (nodeIds.length > 0) {
      setNodesExecState("running", [nodeIds[0]!])
      if (nodeIds.length > 1) {
        setEdgeActive([`e-${nodeIds[0]}-${nodeIds[1]}`], true)
      }
    }
    if (isOneTime) {
      executeOnceMut.mutate({
        nodes: nodes.map((n) => {
          const d = n.data as { type: string; config: Record<string, any> }
          return { id: n.id, type: d.type, config: d.config ?? {} }
        }),
      })
    } else {
      save()
      setTimeout(() => {
        executeMut.mutate({ workflowId: workflowId! })
      }, 300)
    }
  }, [nodes, isOneTime, workflowId, save, executeMut, executeOnceMut, resetExecution, setNodesExecState, setEdgeActive])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData("application/reactflow") as NodeType
      if (!type || !NODE_DEFS.find((d) => d.type === type)) return
      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!bounds) return
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }
      const id = `node_${idCounter++}`
      const def = NODE_DEFS.find((d) => d.type === type)!
      const newNode: Node = {
        id,
        type: "default",
        position,
        data: { type, label: def.label, config: {} },
      }
      setNodes((nds) => [...nds, newNode])
    },
    [],
  )

  useEffect(() => {
    return () => clearTimeout(animRef.current)
  }, [])

  if (!isOneTime && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#8d90a2]" />
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full">
      <div ref={reactFlowWrapper} className="h-full flex-1">
        <style>{`
          .react-flow__node-default {
            padding: 0 !important;
            width: fit-content !important;
            background: transparent !important;
            border: none !important;
          }
          .react-flow__node-default.selectable:hover {
            box-shadow: none !important;
          }
          .react-flow__node-default.selectable.selected,
          .react-flow__node-default.selectable:focus,
          .react-flow__node-default.selectable:focus-visible {
            box-shadow: none !important;
          }
          .react-flow__nodesselection-rect,
          .react-flow__nodesselection {
            display: none !important;
          }
        `}</style>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#434656" />
          <Controls />
          <MiniMap
            nodeColor="#b6c4ff"
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: "#0d0e12", border: "1px solid rgba(67,70,86,0.1)" }}
          />
        </ReactFlow>
      </div>

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className="flex items-center gap-1.5 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-1.5 text-xs font-medium text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
        >
          <Plus className="size-3.5" /> Nodes
        </button>
        <button
          onClick={save}
          disabled={saveNodesMut.isPending || isOneTime}
          className="flex items-center gap-1.5 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-1.5 text-xs font-medium text-[#c3c5d9] transition-colors hover:text-[#b6c4ff] disabled:opacity-50"
        >
          {saveNodesMut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save
        </button>
        <button
          onClick={run}
          disabled={executeMut.isPending || executeOnceMut.isPending}
          className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
        >
          {(executeMut.isPending || executeOnceMut.isPending) ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5" />
          )}
          {isOneTime ? "Run Once" : "Run"}
        </button>
      </div>

      {showDrawer && (
        <div
          className="absolute top-0 z-20 flex h-full w-fit min-w-60 flex-col border-l border-[#434656]/10 bg-[#0d0e12] shadow-xl"
          style={{ right: selectedNode ? 320 : 0 }}
        >
          <div className="flex items-center justify-between border-b border-[#434656]/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#e3e2e7]">Node Palette</h2>
            <button
              onClick={() => setShowDrawer(false)}
              className="text-[#8d90a2] transition-colors hover:text-[#c3c5d9]"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {CATEGORIES.map((cat) => {
              const catNodes = NODE_DEFS.filter((d) => d.category === cat.key)
              if (catNodes.length === 0) return null
              return (
                <div key={cat.key}>
                  <h5 className="text-[10px] font-medium uppercase tracking-widest text-[#8d90a2] mb-3">
                    {cat.label}
                  </h5>
                  {catNodes.map(({ type, label, description, icon: Icon, color, bg }) => (
                    <button
                      key={type}
                      onClick={() => addNode(type, label)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/reactflow", type)
                        e.dataTransfer.effectAllowed = "move"
                      }}
                      className={`group flex flex-col items-center gap-2 rounded-lg border border-[#434656]/10 bg-[#121317] p-3 transition-all duration-300 hover:border-[#b6c4ff]/30 ${cat.key === "triggers" || cat.key === "data" || cat.key === "content" ? "" : "w-full text-left"}`}
                    >
                      <div className={`flex size-8 items-center justify-center rounded ${bg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`size-4 ${color}`} />
                      </div>
                      <span className="text-[10px] font-medium text-[#e3e2e7]">{label}</span>
                      <div className="grid grid-rows-[0fr] transition-all duration-300 group-hover:grid-rows-[1fr]">
                        <p className="overflow-hidden text-[8px] text-[#8d90a2] leading-tight opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <NodeConfigPanel
        node={selectedNode}
        onUpdate={updateNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
