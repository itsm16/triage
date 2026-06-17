"use client"

import { Bot, Check, Loader2, User, XCircle, Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import type { ChatMessage as ChatMessageType, ActionItem, ConfirmationItem } from "~/lib/chat-store"
import { useChatStore } from "~/lib/chat-store"
import { EmailCard } from "~/components/chat/email-card"
import { useState, useCallback } from "react"

function ActionBadge({
  action,
  messageId,
  onExecute,
}: {
  action: ActionItem
  messageId: string
  onExecute?: (action: ActionItem, messageId: string) => void
}) {
  const addLog = useChatStore((s) => s.addLog)

  const handleClick = () => {
    if (onExecute) {
      onExecute(action, messageId)
    } else {
      addLog({
        status: "SUCCESS",
        label: action.label,
        detail: action.detail ?? "",
      })
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={action.status !== "pending"}
      className="flex w-full items-center justify-between rounded-md border border-[#434656]/20 bg-[#0d0e12] px-2.5 py-1.5 text-left transition-colors hover:border-[#b6c4ff]/30 disabled:opacity-60"
    >
      <div className="flex items-center gap-2 min-w-0">
        {action.status === "pending" && <Loader2 className="size-3 shrink-0 animate-spin text-[#8d90a2]" />}
        {action.status === "success" && <Check className="size-3 shrink-0 text-[#b6c4ff]" />}
        {action.status === "error" && <XCircle className="size-3 shrink-0 text-red-400" />}
        <div className="min-w-0">
          <p className="text-xs text-[#e3e2e7] truncate">{action.label}</p>
          {action.detail && (
            <p className="truncate font-mono text-[9px] text-[#8d90a2]">{action.detail}</p>
          )}
        </div>
      </div>
      {action.status === "pending" && (
        <span className="shrink-0 rounded bg-[#b6c4ff]/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-[#b6c4ff]">
          Execute
        </span>
      )}
    </button>
  )
}

function ConfirmationBox({ conf, messageId: _messageId }: { conf: ConfirmationItem; messageId: string }) {
  const [resolved, setResolved] = useState(false)
  const addLog = useChatStore((s) => s.addLog)

  if (resolved) return null

  return (
    <div className="rounded-md border border-[#434656]/20 bg-[#0d0e12] p-2.5">
      <p className="mb-2 text-xs text-[#e3e2e7]">{conf.question}</p>
      <div className="flex gap-1.5">
        <button
          onClick={() => {
            setResolved(true)
            conf.onConfirm()
            addLog({ status: "SUCCESS", label: "Confirmed", detail: conf.question })
          }}
          className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
            conf.destructive
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-[#0055ff] text-[#e3e6ff] hover:opacity-90"
          }`}
        >
          {conf.confirmLabel ?? "Yes"}
        </button>
        <button
          onClick={() => {
            setResolved(true)
            conf.onCancel?.()
            addLog({ status: "INFO", label: "Cancelled", detail: conf.question })
          }}
          className="rounded border border-[#434656]/30 px-2.5 py-1 text-[10px] text-[#c3c5d9] transition-colors hover:bg-[#292a2e]"
        >
          {conf.cancelLabel ?? "No"}
        </button>
      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      <span className="size-1.5 animate-bounce rounded-full bg-[#8d90a2] [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-[#8d90a2] [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-[#8d90a2] [animation-delay:300ms]" />
    </span>
  )
}

function InputRequest({ messageId: _messageId, onSubmit }: { messageId: string; onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("")

  const handleSubmit = useCallback(() => {
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue("")
  }, [value, onSubmit])

  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
        placeholder="Type your answer..."
        className="min-w-0 flex-1 rounded border border-[#434656]/30 bg-[#0d0e12] px-2.5 py-1.5 text-xs text-[#e3e2e7] placeholder-[#6b6e80] outline-none focus:border-[#b6c4ff]/50"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="flex size-7 items-center justify-center rounded bg-[#0055ff] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <Send className="size-3" />
      </button>
    </div>
  )
}

function renderContent(content: string) {
  const parts: { type: "markdown" | "emails"; content: string }[] = []
  const emailRegex = /%%EMAILS%%\n?([\s\S]*?)\n?%%\/EMAILS%%/g
  let lastIndex = 0
  let match

  while ((match = emailRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "markdown", content: content.slice(lastIndex, match.index) })
    }
    parts.push({ type: "emails", content: match[1]!.trim() })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: "markdown", content: content.slice(lastIndex) })
  }

  return parts.map((part, i) => {
    if (part.type === "emails") {
      const emails = part.content.split("\n").filter(Boolean).map((line) => {
        const sub = (/Subject:\s*"([^"]+)"/.exec(line))?.[1] ?? ""
        const from = (/From:\s*([^\s—–-]+)/.exec(line))?.[1] ?? ""
        const snippet = (/Snippet:\s*(.+)/.exec(line))?.[1] ?? undefined
        const msgMatch = /ID:\s*(\S+)/.exec(line)
        return { subject: sub, from, snippet, messageId: msgMatch?.[1] }
      })

      return (
        <div key={`e-${i}`} className="mt-2 space-y-1.5">
          {emails.map((e, j) => (
            <EmailCard key={j} {...e} />
          ))}
        </div>
      )
    }

    return (
      <div key={`m-${i}`} className="prose prose-invert prose-sm max-w-none break-words">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {part.content}
        </ReactMarkdown>
      </div>
    )
  })
}

export function ChatMessage({
  msg,
  onExecute,
  isStreaming,
  onInputResponse,
}: {
  msg: ChatMessageType
  onExecute?: (action: ActionItem, messageId: string) => void
  isStreaming?: boolean
  onInputResponse?: (messageId: string, text: string) => void
}) {
  const isAi = msg.role === "ai"
  const showLoading = isAi && isStreaming && !msg.content
  const toolCallStatuses = useChatStore((s) => s.toolCallStatuses)
  const showToolIndicator = isAi && isStreaming && toolCallStatuses.length > 0 && !msg.content

  return (
    <div className={`flex gap-2.5 ${isAi ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
          isAi ? "bg-[#0055ff]" : "border border-[#434656]/20 bg-[#343539]"
        }`}
      >
        {isAi ? (
          <Bot className="text-[#e3e6ff]" size={14} />
        ) : (
          <User className="text-[#b6c4ff]" size={14} />
        )}
      </div>

      <div className={`space-y-2 min-w-0 max-w-[calc(100%-2.5rem)] ${isAi ? "" : "items-end"}`}>
        <div
          className={`rounded-lg border break-words ${
            isAi
              ? "rounded-tl-none border-[#434656]/10 bg-[#1a1b1f] text-[#e3e2e7]"
              : "rounded-tr-none border-[#434656]/10 bg-[#0055ff] text-[#e3e6ff]"
          } px-3 py-2 text-sm leading-relaxed`}
        >
          {showToolIndicator ? (
            <div className="space-y-1">
              {toolCallStatuses.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#8d90a2]">
                  {t.status === "running" ? (
                    <Loader2 className="size-3 shrink-0 animate-spin text-[#b6c4ff]" />
                  ) : (
                    <Check className="size-3 shrink-0 text-[#b6c4ff]" />
                  )}
                  <span className={t.status === "done" ? "line-through decoration-[#8d90a2]/40" : ""}>{t.label}</span>
                </div>
              ))}
            </div>
          ) : showLoading ? <LoadingDots /> : (isAi ? renderContent(msg.content) : <p className="break-words">{msg.content}</p>)}

          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-2 space-y-1">
              {msg.actions.map((a) => (
                <ActionBadge key={a.id} action={a} messageId={msg.id} onExecute={onExecute} />
              ))}
            </div>
          )}

          {msg.confirmations && msg.confirmations.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {msg.confirmations.map((c) => (
                <ConfirmationBox key={c.id} conf={c} messageId={msg.id} />
              ))}
            </div>
          )}

          {msg.needsInput && !isStreaming && onInputResponse && (
            <InputRequest messageId={msg.id} onSubmit={(text) => onInputResponse(msg.id, text)} />
          )}
        </div>

        {msg.footnote && (
          <div className="rounded-lg border border-[#434656]/10 bg-[#0d0e12] px-3 py-2 text-[11px] italic text-[#c3c5d9]">
            {msg.footnote}
          </div>
        )}
      </div>
    </div>
  )
}
