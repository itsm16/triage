"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, ArrowUp, Square, FileText, Search, X } from "lucide-react"
import { templates } from "~/lib/templates"
import { api } from "~/trpc/react"

export interface Reference {
  id: string
  type: "template" | "email"
  label: string
  value: string
}

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  isStreaming: boolean
  references: Reference[]
  onAddReference: (ref: Omit<Reference, "id">) => void
  onRemoveReference: (id: string) => void
  placeholder?: string
}

let refId = 1

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  references,
  onAddReference,
  onRemoveReference,
  placeholder = "Command...",
}: ChatInputProps) {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const templatesRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const newHeight = Math.min(el.scrollHeight, 160)
    el.style.height = `${newHeight}px`
    el.style.overflowY = el.scrollHeight > 160 ? "auto" : "hidden"
  }, [value])

  useEffect(() => {
    if (!showTemplates) return
    const close = (e: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) setShowTemplates(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [showTemplates])

  useEffect(() => {
    if (!showSearch) return
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [showSearch])

  useEffect(() => {
    if (!showSearch) {
      setSearchQuery("")
      setDebouncedSearch("")
      return
    }
    searchInputRef.current?.focus()
  }, [showSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const { data: searchResults } = api.corsair.listMessages.useQuery(
    { q: debouncedSearch || undefined },
    { enabled: showSearch && debouncedSearch.length > 0 },
  )

  const handleTemplateSelect = useCallback(
    (name: string, body: string) => {
      onAddReference({ type: "template", label: name, value: body })
      setShowTemplates(false)
    },
    [onAddReference],
  )

  const handleEmailSelect = useCallback(
    (label: string, id: string) => {
      onAddReference({ type: "email", label, value: id })
      setShowSearch(false)
      setSearchQuery("")
      setDebouncedSearch("")
    },
    [onAddReference],
  )

  return (
    <div className="mx-auto max-w-4xl">
      {references.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5 px-1">
          {references.map((ref) => (
            <span
              key={ref.id}
              className="inline-flex items-center gap-1 rounded-md border border-[#434656]/30 bg-[#1a1b1f] px-2 py-1 text-[11px] text-[#c3c5d9]"
            >
              <span className="mr-0.5 font-mono text-[9px] uppercase text-[#8d90a2]">
                {ref.type === "template" ? "TMP" : "ML"}
              </span>
              <span className="truncate max-w-[120px]">{ref.label}</span>
              <button
                onClick={() => onRemoveReference(ref.id)}
                className="ml-0.5 rounded p-0.5 text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#e3e2e7]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex-col gap-0 rounded-2xl border border-[#b6c4ff]/15 bg-black/30 backdrop-blur-sm transition-all duration-300">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none disabled:cursor-not-allowed disabled:opacity-40 resize-none min-h-[20px] max-h-[160px] px-4 pt-3"
          placeholder={placeholder}
          value={value}
          rows={1}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
              e.preventDefault()
              onSend()
            }
          }}
          disabled={isStreaming}
        />
        <div className="flex items-center gap-1.5 px-3 pb-2">
          <div className="relative" ref={templatesRef}>
            <button
              onClick={() => { setShowTemplates(!showTemplates); setShowSearch(false) }}
              className="flex size-8 items-center justify-center rounded-md text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#b6c4ff] disabled:cursor-not-allowed disabled:opacity-30"
              title="Use a template"
              disabled={isStreaming}
            >
              <FileText size={16} />
            </button>
            {showTemplates && (
              <div className="absolute bottom-full left-0 mb-1 z-10 w-48 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] py-1 shadow-2xl">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleTemplateSelect(t.name, t.body)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#c3c5d9] transition-colors hover:bg-[#292a2e]"
                  >
                    <FileText size={12} className="shrink-0 text-[#b6c4ff]" />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={searchRef}>
            <button
              onClick={() => { setShowSearch(!showSearch); setShowTemplates(false) }}
              className="flex size-8 items-center justify-center rounded-md text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#b6c4ff] disabled:cursor-not-allowed disabled:opacity-30"
              title="Reference an email"
              disabled={isStreaming}
            >
              <Search size={16} />
            </button>
            {showSearch && (
              <div className="absolute bottom-full left-0 mb-1 z-10 w-80 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] shadow-2xl overflow-hidden">
                <div className="border-b border-[#434656]/10 p-2">
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded border border-[#434656]/30 bg-[#0d0e12] px-2.5 py-1.5 text-xs text-[#e3e2e7] outline-none focus:border-[#b6c4ff] placeholder:text-[#8d90a2]/50"
                    placeholder="Search emails..."
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {!debouncedSearch ? (
                    <div className="p-4 text-center text-[10px] text-[#8d90a2]">Type to search emails</div>
                  ) : !searchResults ? (
                    <div className="p-4 text-center text-[10px] text-[#8d90a2]">Searching...</div>
                  ) : searchResults.messages.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-[#8d90a2]">No emails found</div>
                  ) : (
                    searchResults.messages.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleEmailSelect(m.subject || m.from || m.id!, m.id!)}
                        className="flex w-full flex-col gap-0.5 border-b border-[#434656]/5 px-3 py-2 text-left transition-colors hover:bg-[#292a2e]"
                      >
                        <span className="truncate text-xs font-medium text-[#e3e2e7]">{m.subject || "(no subject)"}</span>
                        <span className="truncate font-mono text-[9px] text-[#8d90a2]">{m.from}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mx-1 h-5 w-px shrink-0 bg-[#434656]/20" />

          <div className="flex-1" />

          <div className="flex items-center gap-1 shrink-0">
            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex size-8 items-center justify-center rounded-lg bg-[#ff3b30] text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                title="Stop generation"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                onClick={onSend}
                className="flex size-8 items-center justify-center rounded-lg bg-[#0055ff] text-[#e3e6ff] shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <ArrowUp size={17} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
