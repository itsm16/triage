"use client"

import { create } from "zustand"

export type ActionStatus = "pending" | "success" | "error"

export interface ToolCallStatus {
  label: string
  status: "running" | "done"
}

export interface ActionItem {
  id: string
  label: string
  detail?: string
  status: ActionStatus
  toolName?: string
  toolArgs?: unknown
}

export interface ConfirmationItem {
  id: string
  question: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
  destructive?: boolean
}

export interface ChatMessage {
  id: string
  role: "ai" | "user"
  content: string
  actions?: ActionItem[]
  confirmations?: ConfirmationItem[]
  footnote?: string
  conversation?: string
  needsInput?: boolean
}

export type OperationType = "calendar" | "email" | "template" | "confirm" | "system"

export type LogStatus = "PENDING" | "RUNNING" | "SUCCESS" | "ERROR" | "INFO"

export interface LogEntry {
  id: string
  time: string
  status: LogStatus
  label: string
  detail: string
  operation?: OperationType
}

interface ChatStore {
  messages: ChatMessage[]
  logs: LogEntry[]
  isStreaming: boolean
  toolCallStatuses: ToolCallStatus[]
  addMessage: (msg: Omit<ChatMessage, "id">) => string
  appendToMessage: (messageId: string, content: string) => void
  addLog: (log: Omit<LogEntry, "id" | "time">) => void
  updateLog: (id: string, updates: Partial<LogEntry>) => void
  removeLog: (id: string) => void
  removeMessage: (id: string) => void
  setActionStatus: (messageId: string, actionId: string, status: ActionStatus) => void
  setStreaming: (streaming: boolean) => void
  resetToolCalls: () => void
  addToolCall: (label: string) => void
  finishToolCalls: () => void
  clearMessages: () => void
  clearLogs: () => void
}

let msgId = 1

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false })
}

function loadLogs(): LogEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("chat-logs") ?? "[]")
  } catch {
    return []
  }
}

function persistLogs(logs: LogEntry[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("chat-logs", JSON.stringify(logs))
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  logs: loadLogs(),
  isStreaming: false,
  toolCallStatuses: [],
  addMessage: (msg) => {
    const id = `msg_${msgId++}`
    set((s) => ({
      messages: [...s.messages, { ...msg, id }],
    }))
    return id
  },
  appendToMessage: (messageId, content) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + content } : m,
      ),
    })),
  addLog: (log: Omit<LogEntry, "id" | "time">) =>
    set((s) => {
      const maxId = s.logs.reduce((max, l) => {
        const num = parseInt(l.id.replace("log_", ""), 10)
        return isNaN(num) ? max : Math.max(max, num)
      }, 0)
      const newLog = { ...log, id: `log_${maxId + 1}`, time: now() }
      const updated = [...s.logs, newLog]
      persistLogs(updated)
      return { logs: updated }
    }),
  updateLog: (id, updates) =>
    set((s) => {
      const updated = s.logs.map((l) => (l.id === id ? { ...l, ...updates } : l))
      persistLogs(updated)
      return { logs: updated }
    }),
  removeLog: (id) =>
    set((s) => {
      const updated = s.logs.filter((l) => l.id !== id)
      persistLogs(updated)
      return { logs: updated }
    }),
  removeMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),
  setActionStatus: (messageId, actionId, status) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              actions: m.actions?.map((a) =>
                a.id === actionId ? { ...a, status } : a,
              ),
            }
          : m,
      ),
    })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  resetToolCalls: () => set({ toolCallStatuses: [] }),
  addToolCall: (label) =>
    set((s) => {
      const updated = s.toolCallStatuses.map((t) =>
        t.status === "running" ? { ...t, status: "done" as const } : t,
      )
      if (updated.length < 4) {
        updated.push({ label, status: "running" })
      } else {
        updated[updated.length - 1] = { label, status: "running" }
      }
      return { toolCallStatuses: updated }
    }),
  finishToolCalls: () =>
    set((s) => ({
      toolCallStatuses: s.toolCallStatuses.map((t) => ({ ...t, status: "done" as const })),
    })),
  clearMessages: () => set({ messages: [], logs: [] }),
  clearLogs: () =>
    set((s) => {
      persistLogs([])
      return { logs: [] }
    }),
}))
