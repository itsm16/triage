"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "sonner"

import { ActivityLog } from "~/components/chat/activity-log"
import { ChatInput, type Reference } from "~/components/chat/chat-input"
import { ChatMessage } from "~/components/chat/chat-message"
import { useChatStore, type ActionItem, type LogEntry } from "~/lib/chat-store"
import { templates } from "~/lib/templates"
import { api } from "~/trpc/react"
import { Bot, Mail, Calendar, Sparkles } from "lucide-react"

type StreamEvent =
  | { type: "token"; content: string }
  | { type: "done"; content: string; conversation: string }
  | { type: "tool_call"; name: string; args: Record<string, unknown>; conversation: string }
  | { type: "tool_result"; name: string; result: string }
  | { type: "error"; message: string }

function extractErrorMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null
    const err = parsed?.error as Record<string, unknown> | undefined
    const msg = err?.message
    if (typeof msg === "string") {
      try {
        const inner = JSON.parse(msg) as Record<string, unknown> | null
        const innerErr = inner?.error as Record<string, unknown> | undefined
        return typeof innerErr?.message === "string" ? innerErr.message : msg
      } catch {
        return msg
      }
    }
    return typeof err?.status === "string" ? err.status : raw
  } catch {
    return raw
  }
}

function summarizeError(raw: string): string {
  const msg = extractErrorMessage(raw)
  const lower = msg.toLowerCase()
  if (lower.includes("quota") || lower.includes("billing") || lower.includes("rate limit")) {
    return "Too many requests — billing or quota limit reached. Please try again later."
  }
  if (lower.includes("unauthorized") || lower.includes("auth") || lower.includes("permission")) {
    return "Authorization failed. Please reconnect your account."
  }
  if (lower.includes("not found") || lower.includes("doesn't exist")) {
    return "Resource not found."
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Request timed out. Please try again."
  }
  if (msg.length > 300) return msg.slice(0, 300) + "…"
  return msg
}

function friendlyLabel(name: string, args: Record<string, unknown>): string {
  const code = typeof args?.code === "string" ? args.code : ""
  if (code.includes("messages.list") || code.includes("messages.get") || code.includes("threads.list")) return "Fetching emails"
  if (code.includes("messages.send") || code.includes("drafts.create")) return "Sending email"
  if (code.includes("labels.list") || code.includes("labels.get")) return "Reading labels"
  if (code.includes(".delete") || code.includes(".destroy") || code.includes(".trash")) return "Deleting message"
  if (code.includes(".modify")) return "Updating message"
  if (code.includes("calendar") || code.includes("events.")) return "Accessing calendar"
  if (code.includes("templates") || code.includes("template")) return "Accessing templates"
  if (name === "list_operations") return "Scanning available tools"
  if (name === "get_schema") return "Reading tool details"
  return name.replace(/_/g, " ")
}

type AgentResult =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: { name: string; args: unknown }; conversation: string }

let refId = 1

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const addMessage = useChatStore((s) => s.addMessage)
  const appendToMessage = useChatStore((s) => s.appendToMessage)
  const setStreaming = useChatStore((s) => s.setStreaming)
  const logs = useChatStore((s) => s.logs)
  const addLog = useChatStore((s) => s.addLog)
  const updateLogStore = useChatStore((s) => s.updateLog)
  const updateMessageConversation = useChatStore((s) => s.updateMessageConversation)
  const addToolCall = useChatStore((s) => s.addToolCall)
  const finishToolCalls = useChatStore((s) => s.finishToolCalls)
  const resetToolCalls = useChatStore((s) => s.resetToolCalls)
  const setActionStatus = useChatStore((s) => s.setActionStatus)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const executeAction = api.corsair.chat.executeAction.useMutation()
  const saveLogMutation = api.corsair.saveLog.useMutation()
  const updateLogMutation = api.corsair.updateLog.useMutation()

  const addLogSync = useCallback((log: Omit<LogEntry, "id" | "time">) => {
    const id = addLog(log)
    saveLogMutation.mutate({
      label: log.label,
      detail: log.detail,
      status: log.status,
      operation: log.operation ?? "system",
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    })
    return id
  }, [addLog, saveLogMutation])

  const updateLogSync = useCallback((id: string, updates: Partial<LogEntry>) => {
    updateLogStore(id, updates)
    if (updates.status) {
      updateLogMutation.mutate({ id, status: updates.status })
    }
  }, [updateLogStore, updateLogMutation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleAddReference = useCallback((ref: Omit<Reference, "id">) => {
    setReferences((prev) => [...prev, { id: `ref_${refId++}`, ...ref }])
  }, [])

  const handleRemoveReference = useCallback((id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const streamChat = useCallback(
    async (body: Record<string, unknown>) => {
      abortRef.current?.abort()
      const abort = new AbortController()
      abortRef.current = abort

      resetToolCalls()
      const pendingMsg = addMessage({ role: "ai", content: "" })
      setStreaming(true)

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abort.signal,
        })

        if (!res.ok) {
          const text = await res.text().catch(() => "Request failed")
          appendToMessage(pendingMsg, `\n\n> ❌ **${summarizeError(text)}**`)
          setStreaming(false)
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          appendToMessage(pendingMsg, "\n\n> ❌ **No response body**")
          setStreaming(false)
          return
        }

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            try {
              const event = JSON.parse(line.slice(6)) as StreamEvent

              switch (event.type) {
                case "token":
                  finishToolCalls()
                  appendToMessage(pendingMsg, event.content)
                  break
                case "tool_call":
                  addToolCall(friendlyLabel(event.name, event.args))
                  updateMessageConversation(pendingMsg, event.conversation)
                  break
                case "done":
                  finishToolCalls()
                  appendToMessage(pendingMsg, "")
                  updateMessageConversation(pendingMsg, event.conversation)
                  setStreaming(false)
                  break
                case "error":
                  appendToMessage(pendingMsg, `\n\n> ❌ **${summarizeError(event.message)}**`)
                  setStreaming(false)
                  break
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        appendToMessage(pendingMsg, `\n\n> ❌ **${err instanceof Error ? err.message : "Request failed"}**`)
        setStreaming(false)
      }
    },
    [addMessage, appendToMessage, setStreaming, addToolCall, finishToolCalls, resetToolCalls, updateMessageConversation],
  )

  const handleInputResponse = useCallback(
    (messageId: string, text: string) => {
      const msg = messages.find((m) => m.id === messageId)
      addMessage({ role: "user", content: text })
      addLogSync({ status: "INFO", label: text, detail: "", operation: "system" })
      void streamChat({ message: text, conversation: msg?.conversation })
    },
    [addMessage, addLogSync, messages, streamChat],
  )

  const handleExecute = useCallback(
    (action: ActionItem, messageId: string) => {
      if (!action.toolName) return
      const msg = messages.find((m) => m.id === messageId)
      const conv = msg?.conversation

      setActionStatus(messageId, action.id, "success")
      const match = [...logs].reverse().find((l) => l.label === action.label && l.status === "PENDING")
      if (match) updateLogSync(match.id, { status: "RUNNING" })

      const doExecute = (conversation: string) => {
        executeAction.mutate(
          {
            toolName: action.toolName!,
            toolArgs: action.toolArgs,
            conversation,
          },
          {
            onSuccess: (raw) => {
              if (match) updateLogSync(match.id, { status: "SUCCESS" })
              const result = raw as AgentResult
              if (result.type === "text") {
                addMessage({ role: "ai", content: result.content })
              } else {
                addMessage({
                  role: "ai",
                  content: "Another action needs approval:",
                  actions: [
                    {
                      id: `action_${Date.now()}`,
                      label: result.toolCall.name,
                      detail: JSON.stringify(result.toolCall.args),
                      status: "pending",
                      toolName: result.toolCall.name,
                      toolArgs: result.toolCall.args,
                    },
                  ],
                  conversation: result.conversation,
                })
              }
            },
            onError: () => {
              if (match) updateLogSync(match.id, { status: "ERROR" })
              toast.error("Action failed")
            },
          },
        )
      }

      if (conv) {
        doExecute(conv)
      } else {
        void streamChat({ message: `Confirmed: proceed with ${action.label}`, reviewMode: true, approvedTool: { name: action.toolName, args: action.toolArgs } })
      }
    },
    [setActionStatus, updateLogSync, addMessage, logs, messages, executeAction, streamChat],
  )

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
  }, [setStreaming])

  const handleSend = useCallback(() => {
    if (isStreaming) return

    const text = input.trim()
    if (!text && references.length === 0) return

    const resolvedRefs = references.map((r) => {
      if (r.type === "template") {
        const tpl = templates.find((t) => t.name === r.label)
        return tpl
          ? `[Template: ${r.label}]\nBody: "${tpl.body}"\n(Replace {name} with the recipient's name)`
          : `[template:${r.label}]`
      }
      return `[Email reference: ${r.label}]`
    })
    const refContext = resolvedRefs.join("\n\n")
    const fullContent = refContext ? `${refContext}\n\n${text}` : text

    addMessage({ role: "user", content: fullContent })
    addLogSync({ status: "INFO", label: text, detail: "", operation: "system" })
    setReferences([])
    setInput("")

    if (text) {
      const lastAi = [...messages].reverse().find((m) => m.role === "ai" && m.conversation)
      void streamChat({ message: fullContent, conversation: lastAi?.conversation })
    }
  }, [input, references, addMessage, addLogSync, streamChat, isStreaming, messages])

  return (
    <>
      <div className="flex h-full flex-1 overflow-hidden">
        <section className="flex h-screen overflow-y-auto flex-1 flex-col bg-[#121317]">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-4">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                onExecute={handleExecute}
                onInputResponse={handleInputResponse}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "ai"}
              />
            ))}
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0055ff]/10">
                    <Bot className="size-6 text-[#0055ff]" />
                  </div>
                  <h1 className="text-lg font-semibold text-[#e3e2e7]">How can I help you?</h1>
                  <p className="text-xs text-[#8d90a2]">Ask me about your email, calendar, or anything else</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2.5">
                  <button
                    onClick={() => {
                      if (isStreaming) return
                      addMessage({ role: "user", content: "Summarize my inbox" })
                      addLogSync({ status: "INFO", label: "Summarize my inbox", detail: "", operation: "system" })
                      void streamChat({ message: "Summarize my inbox" })
                    }}
                    disabled={isStreaming}
                    className="flex items-center gap-2 rounded-xl border border-[#434656]/20 bg-[#1a1b1f] px-4 py-3 text-left transition-colors hover:border-[#b6c4ff]/30 hover:bg-[#1e1f23] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                      <Mail className="size-4 text-[#b6c4ff]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#e3e2e7]">Summarize inbox</p>
                      <p className="text-[10px] text-[#8d90a2]">Get a quick overview</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (isStreaming) return
                      addMessage({ role: "user", content: "Schedule a meeting" })
                      addLogSync({ status: "INFO", label: "Schedule a meeting", detail: "", operation: "system" })
                      void streamChat({ message: "Schedule a meeting" })
                    }}
                    disabled={isStreaming}
                    className="flex items-center gap-2 rounded-xl border border-[#434656]/20 bg-[#1a1b1f] px-4 py-3 text-left transition-colors hover:border-[#b6c4ff]/30 hover:bg-[#1e1f23] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                      <Calendar className="size-4 text-[#b6c4ff]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#e3e2e7]">Schedule a meeting</p>
                      <p className="text-[10px] text-[#8d90a2]">Find a time and invite</p>
                    </div>
                  </button>
                  {/* <button
                    onClick={() => {
                      if (isStreaming) return
                      addMessage({ role: "user", content: "What templates do I have?" })
                      addLogSync({ status: "INFO", label: "What templates do I have?", detail: "", operation: "system" })
                      streamChat({ message: "What templates do I have?" })
                    }}
                    disabled={isStreaming}
                    className="flex items-center gap-2 rounded-xl border border-[#434656]/20 bg-[#1a1b1f] px-4 py-3 text-left transition-colors hover:border-[#b6c4ff]/30 hover:bg-[#1e1f23] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                      <FileText className="size-4 text-[#b6c4ff]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#e3e2e7]">View templates</p>
                      <p className="text-[10px] text-[#8d90a2]">Check saved responses</p>
                    </div>
                  </button> */}
                  <button
                    onClick={() => {
                      if (isStreaming) return
                      addMessage({ role: "user", content: "What can you do?" })
                      addLogSync({ status: "INFO", label: "What can you do?", detail: "", operation: "system" })
                      void streamChat({ message: "What can you do?" })
                    }}
                    disabled={isStreaming}
                    className="flex items-center gap-2 rounded-xl border border-[#434656]/20 bg-[#1a1b1f] px-4 py-3 text-left transition-colors hover:border-[#b6c4ff]/30 hover:bg-[#1e1f23] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#b6c4ff]/10">
                      <Sparkles className="size-4 text-[#b6c4ff]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#e3e2e7]">What can you do?</p>
                      <p className="text-[10px] text-[#8d90a2]">Explore my capabilities</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-[#434656]/20 bg-[#121317]/10 backdrop-blur-xs px-4 py-4 w-full">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onStop={handleStop}
              isStreaming={isStreaming}
              references={references}
              onAddReference={handleAddReference}
              onRemoveReference={handleRemoveReference}
            />
          </div>
        </section>

        <ActivityLog />
      </div>
    </>
  )
}
