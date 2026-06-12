"use client"

import { Mic, Paperclip, ArrowUp } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = "Type a command (e.g. 'Reschedule my 2pm')...",
}: ChatInputProps) {
  return (
    <div className="max-w-4xl mx-auto rounded-2xl border border-white/8 bg-[rgba(22,22,22,0.7)] p-2 flex items-center gap-3 shadow-[0_0_20px_rgba(0,85,255,0.1)] backdrop-blur-[12px]">
      <button className="flex size-10 items-center justify-center text-[#8d90a2] transition-colors hover:text-[#b6c4ff]">
        <Paperclip size={20} />
      </button>
      <input
        className="flex-1 bg-transparent text-base text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
      />
      <div className="flex items-center gap-2 pr-2">
        <button className="flex size-8 items-center justify-center text-[#8d90a2] transition-colors hover:text-[#b6c4ff]">
          <Mic size={18} />
        </button>
        <button
          onClick={onSend}
          className="flex size-10 items-center justify-center rounded-xl bg-[#0055ff] text-[#e3e6ff] shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
  )
}
