"use client"

import { Mail, ExternalLink } from "lucide-react"
import { useEmailPreviewStore } from "~/lib/email-preview-store"

interface EmailCardProps {
  subject: string
  from: string
  snippet?: string
  messageId?: string
}

export function EmailCard({ subject, from, snippet, messageId }: EmailCardProps) {
  const openPreview = useEmailPreviewStore((s) => s.open)

  return (
    <div className="flex items-center gap-3 rounded-md border border-[#434656]/20 bg-[#0d0e12] px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#b6c4ff]/10">
        <Mail className="size-4 text-[#b6c4ff]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-[#e3e2e7]">{subject}</p>
        <p className="truncate text-[10px] text-[#8d90a2]">{from}</p>
        {snippet && (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-[#6b6e80]">{snippet}</p>
        )}
      </div>
      <button
        onClick={() => openPreview({ id: messageId ?? "", subject, from, snippet })}
        className="flex shrink-0 items-center gap-1 rounded border border-[#434656]/30 px-2 py-1 text-[10px] text-[#c3c5d9] transition-colors hover:border-[#b6c4ff] hover:text-[#b6c4ff]"
      >
        <ExternalLink className="size-3" />
        View
      </button>
    </div>
  )
}
