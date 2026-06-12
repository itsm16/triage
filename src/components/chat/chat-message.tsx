"use client"

import { Bot, CheckCircle, User } from "lucide-react"

interface ActionItem {
  label: string
  detail: string
  status: string
}

interface ChatMessageProps {
  role: "ai" | "user"
  content: string
  actions?: ActionItem[]
  footnote?: string
}

export function ChatMessage({ role, content, actions, footnote }: ChatMessageProps) {
  const isAi = role === "ai"

  return (
    <div className={`flex gap-4 max-w-3xl ${isAi ? "" : "ml-auto flex-row-reverse"}`}>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          isAi
            ? "bg-[#0055ff]"
            : "border border-[#434656]/20 bg-[#343539]"
        }`}
      >
        {isAi ? (
          <Bot className="text-[#e3e6ff]" size={20} />
        ) : (
          <User className="text-[#b6c4ff]" size={20} />
        )}
      </div>

      <div className={`space-y-4 ${isAi ? "" : "items-end"}`}>
        <div
          className={`rounded-xl border ${
            isAi
              ? "rounded-tl-none border-[#434656]/10 bg-[#1a1b1f] text-[#e3e2e7]"
              : "rounded-tr-none border-[#434656]/10 bg-[#0055ff] text-[#e3e6ff] shadow-lg"
          } p-4 text-base`}
        >
          <p>{content}</p>
          {actions && (
            <div className="mt-4 space-y-2">
              {actions.map((a) => (
                <div
                  key={a.label}
                  className="flex items-center justify-between rounded-lg border border-[#b6c4ff]/20 bg-[#0d0e12] p-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-[#b6c4ff]" size={18} />
                    <div>
                      <p className="text-sm text-[#e3e2e7]">{a.label}</p>
                      <p className="font-mono text-[10px] text-[#8d90a2]">{a.detail}</p>
                    </div>
                  </div>
                  <span className="rounded bg-[#b6c4ff]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#b6c4ff]">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {footnote && (
          <div className="rounded-xl border border-[#434656]/10 bg-[#0d0e12] p-4 text-sm italic text-[#c3c5d9]">
            {footnote}
          </div>
        )}
      </div>
    </div>
  )
}
