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
  addLog: (log: Omit<LogEntry, "id" | "time">) => string
  updateLog: (id: string, updates: Partial<LogEntry>) => void
  removeLog: (id: string) => void
  removeMessage: (id: string) => void
  updateMessageConversation: (id: string, conversation: string) => void
  updateMessageActions: (id: string, actions: ActionItem[]) => void
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

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  logs: [],
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
  addLog: (log: Omit<LogEntry, "id" | "time">) => {
    const id = `log_${msgId++}`
    set((s) => {
      const newLog = { ...log, id, time: now() }
      return { logs: [...s.logs, newLog] }
    })
    return id
  },
  updateLog: (id, updates) =>
    set((s) => ({
      logs: s.logs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  removeLog: (id) =>
    set((s) => ({
      logs: s.logs.filter((l) => l.id !== id),
    })),
  removeMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),
  updateMessageConversation: (id, conversation) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, conversation } : m,
      ),
    })),
  updateMessageActions: (id, actions) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, actions } : m,
      ),
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
  clearLogs: () => set({ logs: [] }),
}))
