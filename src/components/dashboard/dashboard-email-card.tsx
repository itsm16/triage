"use client"

import { HashIcon } from "lucide-react"
import { useEmailPreviewStore } from "~/lib/email-preview-store"

interface DashboardEmailCardProps {
  id: string
  subject: string
  from: string
  snippet?: string
}

export function DashboardEmailCard({ id, subject, from, snippet }: DashboardEmailCardProps) {
  const openPreview = useEmailPreviewStore((s) => s.open)

  return (
    <button
      onClick={() => openPreview({ id, subject, from, snippet })}
      className="flex w-full items-start gap-3 rounded-lg border border-[#434656]/10 bg-[#121317] px-4 py-3 text-left transition-colors hover:border-[#b6c4ff]/20"
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#b6c4ff]/10">
        <HashIcon className="size-3.5 fill-[#b6c4ff] text-[#b6c4ff]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#e3e2e7]">{from}</p>
        <p className="truncate text-sm font-semibold text-[#c3c5d9]">{subject}</p>
        {snippet && (
          <p className="mt-0.5 line-clamp-1 text-xs text-[#8d90a2]">{snippet}</p>
        )}
      </div>
    </button>
  )
}
