import { useState, useCallback, useRef } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, GitBranch, Timer, Play, Mail, Plus, X } from 'lucide-react';

interface CanvasProps {
  flowLabel?: string;
}

const nodeTypes = [
  { type: 'trigger', label: 'Trigger', description: 'Starts the flow when an event occurs', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { type: 'condition', label: 'Condition', description: 'Branch based on a condition check', icon: GitBranch, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { type: 'delay', label: 'Delay', description: 'Wait for a specified duration', icon: Timer, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { type: 'action', label: 'Action', description: 'Perform an automated action', icon: Play, color: 'text-green-400', bg: 'bg-green-400/10' },
  { type: 'email', label: 'Send Email', description: 'Send an email notification', icon: Mail, color: 'text-pink-400', bg: 'bg-pink-400/10' },
] as const;

const defaultNodes: Node[] = [
  { id: 'trigger', type: 'default', position: { x: 200, y: 150 }, data: { label: 'Trigger' } },
  { id: 'action', type: 'default', position: { x: 450, y: 250 }, data: { label: 'Action' } },
];

const defaultEdges: Edge[] = [{ id: 'trigger-action', source: 'trigger', target: 'action' }];

let idCounter = 10;

export default function Canvas({ flowLabel }: CanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);
  const [showDrawer, setShowDrawer] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const addNode = useCallback((type: string, label: string) => {
    const id = `node_${idCounter++}`;
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: 200 + Math.random() * 300, y: 150 + Math.random() * 200 },
      data: { label },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  return (
    <div className="relative flex h-full w-full">
      <div ref={reactFlowWrapper} className="h-full flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#434656" />
          <Controls />
          <MiniMap
            nodeColor="#b6c4ff"
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: '#0d0e12', border: '1px solid rgba(67,70,86,0.1)' }}
          />
        </ReactFlow>
      </div>

      <button
        onClick={() => setShowDrawer(!showDrawer)}
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-1.5 text-xs font-medium text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
      >
        <Plus className="size-3.5" /> Nodes
      </button>

      {showDrawer && (
        <div className="flex w-72 shrink-0 flex-col border-l border-[#434656]/10 bg-[#0d0e12]">
          <div className="flex items-center justify-between border-b border-[#434656]/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#e3e2e7]">Node Palette</h2>
            <button
              onClick={() => setShowDrawer(false)}
              className="text-[#8d90a2] transition-colors hover:text-[#c3c5d9]"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {nodeTypes.map(({ type, label, description, icon: Icon, color, bg }) => (
              <button
                key={type}
                onClick={() => addNode(type, label)}
                onMouseEnter={() => setHoveredNode(type)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`group relative overflow-hidden rounded-lg border p-3 text-left transition-all duration-300 ${
                  hoveredNode === type
                    ? 'border-[#434656]/30 pb-10'
                    : 'border-[#434656]/10'
                } ${bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`size-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#e3e2e7]">{label}</p>
                    <p className="text-[11px] text-[#8d90a2]">Click to add</p>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 overflow-hidden px-3 transition-all duration-300 ${
                    hoveredNode === type ? 'max-h-8 pb-2 pt-1 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[11px] leading-tight text-[#8d90a2]">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
