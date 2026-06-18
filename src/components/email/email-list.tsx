"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface EmailListItem {
  id?: string
  threadId?: string
  from: string
  subject: string
  date: string
  labelIds?: string[]
}

interface EmailListProps {
  messages: EmailListItem[]
  isLoading: boolean
  activeId: string | null
  selectedIds: Set<string>
  tokensLength: number
  pageNum: number
  nextPageToken: string | null | undefined
  messagesCount: number
  onSelectMessage: (id: string, threadId: string) => void
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onSelectRange: (start: number, end: number) => void
  onGoNext: () => void
  onGoPrev: () => void
}

export function EmailList({
  messages,
  isLoading,
  activeId,
  selectedIds,
  tokensLength,
  pageNum,
  nextPageToken,
  messagesCount,
  onSelectMessage,
  onToggleSelect,
  onSelectAll,
  onSelectRange,
  onGoNext,
  onGoPrev,
}: EmailListProps) {
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null)

  const allSelected = messages.length > 0 && messages.every((m) => m.id && selectedIds.has(m.id))
  const someSelected = messages.some((m) => m.id && selectedIds.has(m.id))

  const handleCheckClick = useCallback((e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    const msg = messages[idx]
    if (!msg?.id) return

    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, idx)
      const end = Math.max(lastClickedIndex, idx)
      onSelectRange(start, end)
    } else {
      onToggleSelect(msg.id)
    }
    setLastClickedIndex(idx)
  }, [messages, lastClickedIndex, onToggleSelect, onSelectRange])

  return (
    <section className="sticky top-0 flex w-[420px] shrink-0 flex-col border-r border-[#434656]/10 bg-[#0d0e12] h-full border">
      <div className="flex items-center justify-between border-b border-[#434656]/10 px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onGoPrev}
            disabled={tokensLength === 0}
            className="flex items-center justify-center rounded p-1 text-sm text-[#c3c5d9] transition-colors hover:text-[#b6c4ff] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[20px] text-center text-xs font-medium text-[#c3c5d9]">
            {pageNum}
          </span>
          <button
            onClick={onGoNext}
            disabled={!nextPageToken}
            className="flex items-center justify-center rounded p-1 text-sm text-[#c3c5d9] transition-colors hover:text-[#b6c4ff] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="text-xs text-[#434656]">{messagesCount} emails</span>
      </div>

      <div className="flex items-center gap-2 border-b border-[#434656]/10 px-4 py-1.5">
        <span
          onClick={onSelectAll}
          className={`flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border transition-colors ${
            allSelected
              ? "border-[#b6c4ff] bg-[#b6c4ff]"
              : someSelected
                ? "border-[#b6c4ff] bg-[#b6c4ff]/30"
                : "border-[#434656]/40 bg-[#1a1b1f] hover:border-[#b6c4ff]/60"
          }`}
        >
          {allSelected && (
            <svg className="size-3 text-[#121317]" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {someSelected && !allSelected && (
            <svg className="size-3 text-[#b6c4ff]" viewBox="0 0 12 12" fill="none">
              <rect x="2.5" y="5" width="7" height="2" fill="currentColor" />
            </svg>
          )}
        </span>
        <span className="text-[10px] text-[#8d90a2]">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
        </span>
      </div>

      <div className="h-[calc(100vh-156px)] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#434656]/50 [&::-webkit-scrollbar-track]:bg-transparent">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-[#8d90a2]">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-[#8d90a2]">
            No emails found
          </div>
        ) : (
          messages.map((msg, idx) => (
            <button
              key={msg.id}
              onClick={() => {
                if (msg.id && msg.threadId) {
                  onSelectMessage(msg.id, msg.threadId)
                }
              }}
              className={`relative w-full border-l-2 px-4 py-3 text-left transition-colors box-border ${msg.id === activeId
                ? "border-[#b6c4ff] bg-[#b6c4ff]/5"
                : "border-transparent hover:bg-[#292a2e]"
              }`}
            >
              {msg.labelIds?.includes("UNREAD") && (
                <span className="absolute left-4 top-3 size-[5] rounded-full bg-[#0b5cdf]" />
              )}
              <div className="flex items-start gap-2">
                <span
                  onClick={(e) => handleCheckClick(e, idx)}
                  className={`mt-4 flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border transition-colors ${(msg.id && selectedIds.has(msg.id))
                    ? "border-[#b6c4ff] bg-[#b6c4ff]"
                    : "border-[#434656]/40 bg-[#1a1b1f] hover:border-[#b6c4ff]/60"
                  }`}
                >
                  {(msg.id && selectedIds.has(msg.id)) && (
                    <svg className="size-2.5 text-[#121317]" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`truncate text-base ${msg.id === activeId
                        ? "font-bold"
                        : "font-medium"
                      } text-[#e3e2e7]`}
                    >
                      {msg.from.split("<")[0]}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-[#8d90a2]">
                      {msg.date}
                    </span>
                  </div>
                  <p className="truncate text-xs font-semibold text-[#e3e2e7]">
                    {msg.subject}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
