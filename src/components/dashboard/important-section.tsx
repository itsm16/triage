"use client"

import { HashIcon } from "lucide-react"
import Link from "next/link"
import { api } from "~/trpc/react"
import { useEmailPreviewStore } from "~/lib/email-preview-store"

export function ImportantSection() {
  const { data: important, isLoading } = api.corsair.listImportantMessages.useQuery()
  const openPreview = useEmailPreviewStore((s) => s.open)

  return (
    <section className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HashIcon className="size-4 text-[#b6c4ff]" />
          <h2 className="text-lg font-semibold text-[#e3e2e7]">Important & Unread</h2>
        </div>
        <Link href="/email" className="text-sm text-[#b6c4ff] hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-[#121317] px-4 py-3">
                <div className="mb-2 h-3 w-24 rounded bg-[#292a2e]" />
                <div className="h-3 w-40 rounded bg-[#292a2e]" />
              </div>
            ))}
          </div>
        ) : important?.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8d90a2]">No important unread emails</p>
        ) : (
          important?.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openPreview({ id: msg.id ?? "", subject: msg.subject, from: msg.from, snippet: msg.snippet })}
              className="flex w-full items-start gap-3 rounded-lg border border-[#434656]/10 bg-[#121317] px-4 py-3 text-left transition-colors hover:border-[#b6c4ff]/20"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#b6c4ff]/10">
                <HashIcon className="size-3.5 fill-[#b6c4ff] text-[#b6c4ff]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#e3e2e7]">{msg.from}</p>
                <p className="truncate text-sm font-semibold text-[#c3c5d9]">{msg.subject}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-[#8d90a2]">{msg.snippet}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
