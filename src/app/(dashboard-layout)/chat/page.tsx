"use client"

import { useState } from "react"
import { Bell, History, Search } from "lucide-react"

import { ActivityLog } from "~/components/chat/activity-log"
import { ChatInput } from "~/components/chat/chat-input"
import { ChatMessage } from "~/components/chat/chat-message"

interface Message {
  role: "ai" | "user"
  content: string
  actions?: { label: string; detail: string; status: string }[]
  footnote?: string
}

const suggestions = ["Summarize my inbox", "Find priority tasks"]

const initialMessages: Message[] = [
  {
    role: "ai",
    content: "Ready for operation. How can I assist with your triage ecosystem today?",
  },
  {
    role: "user",
    content:
      "Schedule a 30-minute meeting with John Doe for tomorrow afternoon to discuss the Project Phoenix roadmap.",
  },
  {
    role: "ai",
    content:
      "I've checked your schedule and John's availability.",
    actions: [
      {
        label: "Meeting Scheduled",
        detail: "Tomorrow, 2:30 PM - 3:00 PM",
        status: "Executed",
      },
    ],
    footnote:
      "Invitation sent to john.doe@acme.corp. Added to \"Project Phoenix\" workspace calendar.",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
  }

  return (
    <>
      {/* Top Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#8d90a2]" />
          <input
            className="w-full rounded-full border border-[#434656]/30 bg-[#0d0e12] py-1.5 pl-10 pr-4 text-sm text-[#e3e2e7] outline-none transition-all focus:border-[#b6c4ff]"
            placeholder="Search operations..."
          />
        </div>
        <div className="flex items-center gap-4">
          <Bell className="size-5 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
          <History className="size-5 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
          <div className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-[#434656]/20 bg-[#0055ff] text-sm font-bold text-[#e3e6ff]">
            AC
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        <section className="relative flex flex-1 flex-col bg-[#121317]">
          {/* Messages */}
          <div className="flex-1 space-y-8 overflow-y-auto p-6 pb-32">
            {messages.map((msg, i) => (
              <ChatMessage key={i} {...msg} />
            ))}
            {messages.length === 1 && (
              <div className="flex gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setMessages((prev) => [...prev, { role: "user", content: s }])
                    }}
                    className="rounded-full border border-[#434656]/30 px-3 py-1.5 font-mono text-xs text-[#c3c5d9] transition-colors hover:border-[#b6c4ff] hover:text-[#b6c4ff]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#121317] via-[#121317] to-transparent p-6">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
            />
          </div>
        </section>

        <ActivityLog />
      </div>
    </>
  )
}
