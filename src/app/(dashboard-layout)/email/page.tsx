"use client"

import { useState } from "react"
import {
  Archive,
  AtSign,
  Bell,
  Calendar,
  ChevronDown,
  Clock,
  History,
  PlusCircle,
  Search,
  Smile,
  Sparkles,
  Trash2,
} from "lucide-react"

const emails = [
  {
    id: 3,
    from: "Design Tokens",
    time: "Yesterday",
    subject: "New asset library available",
    preview: "The latest Figma variables for the dark mode theme have been published.",
    sender: "Design Tokens",
    senderEmail: "updates@figma.com",
    tag: null,
    active: false,
    body: "The latest Figma variables for the dark mode theme have been published.",
  },
  {
    id: 4,
    from: "Notion",
    time: "Yesterday",
    subject: "Weekly Engineering Digest",
    preview: "You have 12 mentions across 4 workspace pages that require attention.",
    sender: "Notion",
    senderEmail: "digest@notion.so",
    tag: null,
    active: false,
    body: "You have 12 mentions across 4 workspace pages that require attention.",
  },
  {
    id: 5,
    from: "Arc Browser",
    time: "Aug 12",
    subject: "New Release: Arc Max",
    preview: "Experience the future of browsing with our new AI-powered shortcuts and summarization.",
    sender: "Arc Browser",
    senderEmail: "updates@arc.net",
    tag: null,
    active: false,
    body: "Experience the future of browsing with our new AI-powered shortcuts and summarization.",
  },
]

export default function EmailPage() {
  const [activeId, setActiveId] = useState(emails[0]!.id)
  const active = emails.find((e) => e.id === activeId)!

  return (
    <>
      {/* Top Bar */}
      <header className="flex h-16 shrink-0 items-center border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <div className="flex w-full max-w-md items-center rounded border border-[#434656]/20 bg-[#1e1f23] px-3 py-1.5">
          <Search className="mr-2 text-[#8d90a2]" size={18} />
          <input
            className="w-full bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none"
            placeholder="Search Command (Cmd+K)"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Bell className="size-5 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
          <History className="size-5 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <section className="flex w-1/3 flex-col border-r border-[#434656]/10 bg-[#0d0e12]">
          <div className="flex items-center justify-between border-b border-[#434656]/10 px-6 py-4">
            <h2 className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#8d90a2]">
              Primary Inbox
            </h2>
            <span className="rounded border border-[#434656]/10 bg-[#292a2e] px-2 py-0.5 font-mono text-[10px] text-[#8d90a2]/40">
              G then I
            </span>
          </div>
          <div className="flex-1 divide-y divide-[#434656]/10 overflow-y-auto">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setActiveId(email.id)}
                className={`group relative w-full px-6 py-4 text-left transition-colors ${
                  email.id === activeId
                    ? "border-l-2 border-[#b6c4ff] bg-[#b6c4ff]/5"
                    : "hover:bg-[#292a2e]"
                }`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <span
                    className={`text-base ${
                      email.id === activeId
                        ? "font-bold text-[#b6c4ff]"
                        : "font-medium text-[#e3e2e7]"
                    }`}
                  >
                    {email.from}
                  </span>
                  <span className="font-mono text-[10px] text-[#8d90a2]">
                    {email.time}
                  </span>
                </div>
                <p className="mb-1 text-sm font-semibold text-[#e3e2e7] line-clamp-1">
                  {email.subject}
                </p>
                <p className="text-sm text-[#c3c5d9] line-clamp-2">
                  {email.preview}
                </p>
                {email.tag && (
                  <span className="mt-2 inline-block rounded border border-[#434656]/20 bg-[#343539] px-2 py-0.5 font-mono text-[9px] text-[#8d90a2]">
                    {email.tag}
                  </span>
                )}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded border border-[#434656]/10 bg-[#292a2e] px-2 py-0.5 font-mono text-[10px] text-[#8d90a2]/40">
                    E
                  </span>
                  <span className="rounded border border-[#434656]/10 bg-[#292a2e] px-2 py-0.5 font-mono text-[10px] text-[#8d90a2]/40">
                    H
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Email Detail */}
        <section className="flex flex-1 flex-col bg-[#121317]">
          {/* Action Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#434656]/10 px-8">
            <div className="flex items-center gap-6">
              {[
                { icon: Archive, label: "Archive", shortcut: "E" },
                { icon: Trash2, label: "Trash", shortcut: "#" },
                { icon: Clock, label: "Snooze", shortcut: "H" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="group flex items-center gap-2 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]"
                >
                  <action.icon className="size-5" />
                  <span className="font-mono text-[11px]">{action.label}</span>
                  <span className="ml-1 rounded border border-[#434656]/10 bg-[#292a2e] px-2 py-0.5 font-mono text-[10px] text-[#8d90a2]/40">
                    {action.shortcut}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90">
                <Calendar className="size-[18px]" />
                Convert to Meeting
              </button>
              <button className="flex items-center gap-2 rounded border border-[#434656]/20 px-3 py-1.5 font-mono text-[11px] transition-colors hover:bg-[#292a2e]">
                Templates
                <ChevronDown className="size-4" />
              </button>
            </div>
          </header>

          {/* Email Body */}
          <div className="flex-1 overflow-y-auto p-12">
            <div className="mx-auto max-w-2xl">
              <h1 className="mb-6 text-[32px] font-semibold leading-10 tracking-tight text-[#e3e2e7]">
                {active.subject}
              </h1>
              <div className="mb-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#343539] text-sm font-bold text-[#c3c5d9]">
                      {active.sender.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#e3e2e7]">
                          {active.sender}
                        </span>
                        <span className="text-sm text-[#8d90a2]">
                          &lt;{active.senderEmail}&gt;
                        </span>
                      </div>
                      <div className="text-sm text-[#8d90a2]">
                        To: Alex Chen &lt;alex@triage.ai&gt;
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#8d90a2]">
                    {active.time} (2 hours ago)
                  </span>
                </div>
              </div>

              <article className="space-y-4 text-base leading-relaxed text-[#c3c5d9] whitespace-pre-line">
                {active.body}
              </article>

              {/* Smart Reply */}
              <div className="mt-16 border-t border-[#434656]/10 pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <Sparkles className="size-[18px] fill-[#b6c4ff] text-[#b6c4ff]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b6c4ff]">
                    Smart Reply
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { text: "Looks good, proceed.", shortcut: "Shift + 1" },
                    {
                      text: "Need more technical details.",
                      shortcut: "Shift + 2",
                    },
                  ].map((r) => (
                    <button
                      key={r.text}
                      className="group rounded border border-[#b6c4ff]/20 bg-[#b6c4ff]/5 px-4 py-3 text-left transition-colors hover:bg-[#b6c4ff]/10"
                    >
                      <span className="mb-1 block text-sm text-[#b6c4ff]">
                        {r.text}
                      </span>
                      <span className="font-mono text-[10px] text-[#8d90a2]/60">
                        {r.shortcut}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reply Bar */}
          <footer className="border-t border-[#434656]/10 bg-[#0d0e12] p-4">
            <div className="mx-auto flex max-w-4xl items-center gap-4 rounded-xl border border-[#434656]/20 bg-[#121317] p-2 shadow-2xl">
              <PlusCircle className="ml-1 size-6 text-[#8d90a2] transition-colors hover:text-[#b6c4ff]" />
              <input
                className="flex-1 bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none"
                placeholder="Reply to Linear..."
              />
              <div className="flex items-center gap-2 px-2">
                <AtSign className="size-5 text-[#8d90a2] transition-colors hover:text-[#b6c4ff]" />
                <Smile className="size-5 text-[#8d90a2] transition-colors hover:text-[#b6c4ff]" />
                <div className="mx-1 h-6 w-px bg-[#434656]/20" />
                <button className="flex items-center gap-2 rounded bg-[#0055ff] px-4 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90">
                  Send
                  <span className="rounded bg-[#e3e6ff]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#e3e6ff]">
                    Cmd + Enter
                  </span>
                </button>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </>
  )
}
