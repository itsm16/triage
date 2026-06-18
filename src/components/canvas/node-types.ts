import {
  Zap,
  Variable,
  FileText,
  Mail,
  FileEdit,
  Reply,
  type LucideIcon,
} from "lucide-react"

export type NodeType = "trigger" | "variables" | "template" | "email" | "draft" | "listener" | "reply"

export type NodeCategory = "triggers" | "data" | "content" | "actions" | "listeners"

export interface NodeTypeDef {
  type: NodeType
  label: string
  icon: LucideIcon
  color: string      // dot/icon color
  bg: string         // icon background
  headerDot: string  // header dot color
  category: NodeCategory
  description: string
}

export const NODE_DEFS: NodeTypeDef[] = [
  {
    type: "trigger",
    label: "Trigger",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    headerDot: "bg-emerald-500",
    category: "triggers",
    description: "Starts the flow",
  },
  {
    type: "variables",
    label: "Variables",
    icon: Variable,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    headerDot: "bg-blue-500",
    category: "data",
    description: "Define key-value variables",
  },
  {
    type: "template",
    label: "Template",
    icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    headerDot: "bg-purple-500",
    category: "content",
    description: "Compose body with {variable} references",
  },
  {
    type: "email",
    label: "Send Email",
    icon: Mail,
    color: "text-primary",
    bg: "bg-primary/10",
    headerDot: "bg-primary",
    category: "actions",
    description: "Send an email",
  },
  {
    type: "draft",
    label: "Save Draft",
    icon: FileEdit,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    headerDot: "bg-orange-500",
    category: "actions",
    description: "Save as draft",
  },
  // {
  //   type: "listener",
  //   label: "Listener",
  //   icon: Ear,
  //   color: "text-green-400",
  //   bg: "bg-green-400/10",
  //   headerDot: "bg-green-500",
  //   category: "listeners",
  //   description: "Listen for incoming emails",
  // },
  {
    type: "reply",
    label: "Reply",
    icon: Reply,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    headerDot: "bg-cyan-500",
    category: "actions",
    description: "Reply to listened email",
  },
]

export const NODE_DEF_MAP = Object.fromEntries(
  NODE_DEFS.map((d) => [d.type, d])
) as Record<NodeType, NodeTypeDef>

export const CATEGORIES: { key: NodeCategory; label: string }[] = [
  { key: "triggers", label: "Triggers" },
  { key: "data", label: "Data" },
  { key: "content", label: "Content" },
  { key: "actions", label: "Actions" },
  { key: "listeners", label: "Listeners" },
]
