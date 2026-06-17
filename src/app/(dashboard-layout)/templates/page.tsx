"use client"

import { useState } from "react"
import { FileText, Plus, Search } from "lucide-react"
import { templates } from "~/lib/templates"
import { useComposeStore } from "~/lib/compose-store"

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const open = useComposeStore((s) => s.open)

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <FileText className="size-5 text-[#b6c4ff]" />
          <h1 className="text-lg font-semibold text-[#e3e2e7]">Templates</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex w-64 items-center rounded border border-[#434656]/20 bg-[#1e1f23] px-3 py-1.5">
            <Search className="mr-2 text-[#8d90a2]" size={16} />
            <input
              className="w-full bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90">
            <Plus className="size-4" />
            New Template
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-1 p-6 md:p-10">
          {filtered.map((t) => (
            <div
              key={t.name}
              onClick={() => open("compose", undefined, { body: t.body })}
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-[#434656]/10 px-5 py-4 transition-colors hover:bg-[#1a1b1f]"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#292a2e]">
                  <FileText className="size-4 text-[#b6c4ff]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e3e2e7]">{t.name}</p>
                  <p className="text-xs text-[#8d90a2]">{t.body}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-sm text-[#8d90a2]">
              No templates found
            </div>
          )}
        </div>
      </div>
    </>
  )
}
