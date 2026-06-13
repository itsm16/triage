"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Archive,
  AtSign,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Inbox,
  Search,
  Trash2,
  Send,
  Tag,
} from "lucide-react"
import { api } from "~/trpc/react"
import { useLoaderStore } from "~/lib/loader-store"
import { toast } from "sonner"
import { useComposeStore } from "~/stores/compose-store"

const CATEGORIES = [
  { id: undefined, label: "All", icon: Inbox },
  { id: "CATEGORY_PRIMARY", label: "Primary", icon: Inbox },
  { id: "CATEGORY_SOCIAL", label: "Social", icon: AtSign },
  { id: "CATEGORY_PROMOTIONS", label: "Promotions", icon: Tag },
  { id: "CATEGORY_UPDATES", label: "Updates", icon: Bell },
  { id: "CATEGORY_FORUMS", label: "Forums", icon: Bell },
]

const CATEGORY_LABEL_NAMES: Record<string, string> = {
  CATEGORY_PRIMARY: "Primary",
  CATEGORY_SOCIAL: "Social",
  CATEGORY_PROMOTIONS: "Promotions",
  CATEGORY_UPDATES: "Updates",
  CATEGORY_FORUMS: "Forums",
}

const TAB_TO_CATEGORY: Record<string, string> = {
  primary: "CATEGORY_PRIMARY",
  updates: "CATEGORY_UPDATES",
  social: "CATEGORY_SOCIAL",
  promotions: "CATEGORY_PROMOTIONS",
  drafts: "DRAFT",
  sent: "SENT",
}

export default function EmailPage() {
  const searchParams = useSearchParams()
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)
  const [tokens, setTokens] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [category, setCategory] = useState<string | undefined>(undefined)
  const setLoading = useLoaderStore((s) => s.setLoading)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && TAB_TO_CATEGORY[tab]) {
      setCategory(TAB_TO_CATEGORY[tab])
    } else {
      setCategory(undefined)
    }
    setPageToken(undefined)
    setTokens([])
    setActiveId(null)
    setSelectedIds(new Set())
  }, [searchParams])

  const { data, isLoading, refetch } = api.corsair.listMessages.useQuery({
    pageToken,
    labelIds: category ? [category] : undefined,
  })
  const activeMsg = api.corsair.getMessage.useQuery({ id: activeId! }, { enabled: !!activeId })
  const { data: labels } = api.corsair.listLabels.useQuery(undefined, { enabled: !!activeId })

  const modifyMsg = api.corsair.modifyMessage.useMutation({
    onSuccess: () => refetch(),
  })
  const createEvent = api.corsair.createEvent.useMutation()
  const openCompose = useComposeStore((s) => s.open)

  useEffect(() => {
    setLoading(isLoading)
    return () => setLoading(false)
  }, [isLoading, setLoading])

  const messages = data?.messages ?? []
  const nextPageToken = data?.nextPageToken

  const goNext = () => {
    if (nextPageToken) {
      setTokens((prev) => [...prev, pageToken ?? ""])
      setPageToken(nextPageToken)
      setActiveId(null)
    }
  }

  const goPrev = () => {
    if (tokens.length > 0) {
      const newTokens = [...tokens]
      const prev = newTokens.pop()!
      setTokens(newTokens)
      setPageToken(prev || undefined)
      setActiveId(null)
    }
  }

  const active = activeMsg.data

  const handleArchive = () => {
    if (!activeId) return
    modifyMsg.mutate(
      { id: activeId, removeLabelIds: ["INBOX"] },
      { onSuccess: () => toast.success("Email archived"), onError: () => toast.error("Failed to archive") },
    )
  }

  const handleTrash = () => {
    if (!activeId) return
    modifyMsg.mutate(
      { id: activeId, addLabelIds: ["TRASH"], removeLabelIds: ["INBOX"] },
      { onSuccess: () => toast.success("Email trashed"), onError: () => toast.error("Failed to trash") },
    )
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkTrash = () => {
    let count = 0
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      modifyMsg.mutate(
        { id, addLabelIds: ["TRASH"], removeLabelIds: ["INBOX"] },
        { onSuccess: () => { count++; if (count === ids.length) toast.success(`${ids.length} emails trashed`) } },
      )
    }
    setSelectedIds(new Set())
  }

  const handleConvertToMeeting = () => {
    if (!active) return
    const start = new Date()
    start.setHours(start.getHours() + 1, 0, 0, 0)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    createEvent.mutate(
      {
        summary: active.subject || "Meeting",
        description: `From email: ${active.subject}\nFrom: ${active.from}\n\n${active.snippet}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
      {
        onSuccess: () => toast.success("Meeting added to calendar"),
        onError: () => toast.error("Failed to create meeting"),
      },
    )
  }

  const activeLabelNames = active?.labelIds
    ?.filter((id) => id.startsWith("CATEGORY_"))
    .map((id) => CATEGORY_LABEL_NAMES[id])
    .filter(Boolean) ?? []

  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <div className="flex w-full max-w-md items-center rounded border border-[#434656]/20 bg-[#1e1f23] px-3 py-1.5">
          <Search className="mr-2 text-[#8d90a2]" size={18} />
          <input
            className="w-full bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none"
            placeholder="Search Command (Cmd+K)"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-[#8d90a2]">{selectedIds.size} selected</span>
              <button onClick={handleBulkTrash} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20">
                <Trash2 className="size-3.5" /> Delete
              </button>
            </>
          )}
          <Bell className="size-5 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
          <History className="size-5 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex w-[420px] shrink-0 flex-col border-r border-[#434656]/10 bg-[#0d0e12] min-h-0">

          <div className="flex items-center justify-between border-b border-[#434656]/10 px-4 py-3">
            <button
              onClick={goPrev}
              disabled={tokens.length === 0}
              className="flex items-center gap-1 text-sm text-[#c3c5d9] transition-colors hover:text-[#b6c4ff] disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-4" /> Prev
            </button>
            <span className="text-xs text-[#434656]">{messages.length} emails</span>
            <button
              onClick={goNext}
              disabled={!nextPageToken}
              className="flex items-center gap-1 text-sm text-[#c3c5d9] transition-colors hover:text-[#b6c4ff] disabled:opacity-30 disabled:pointer-events-none"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Email list container */}
          <div className="overflow-y-auto h-[calc(100vh-110px)] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#434656]/50 [&::-webkit-scrollbar-track]:bg-transparent">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-sm text-[#8d90a2]">
                Loading...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-sm text-[#8d90a2]">
                No emails found
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => msg.id && setActiveId(msg.id)}
                  className={`relative w-full border-l-2 px-4 py-3 text-left transition-colors box-border ${
                    msg.id === activeId
                      ? "border-[#b6c4ff] bg-[#b6c4ff]/5"
                      : "border-transparent hover:bg-[#292a2e]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      onClick={(e) => { e.stopPropagation(); msg.id && toggleSelect(msg.id) }}
                      className={`mt-1 flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border transition-colors ${
                        (msg.id && selectedIds.has(msg.id))
                          ? "border-[#b6c4ff] bg-[#b6c4ff]"
                          : "border-[#434656]/40 bg-[#1a1b1f] hover:border-[#b6c4ff]/60"
                      }`}
                    >
                      {(msg.id && selectedIds.has(msg.id)) && (
                        <svg className="size-2.5 text-[#121317]" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`truncate text-base ${
                            msg.id === activeId
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

        <section className="flex flex-1 flex-col overflow-hidden bg-[#121317]">
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#8d90a2]">
              Select an email to read
            </div>
          ) : activeMsg.isFetching ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#8d90a2]">
              Loading email...
            </div>
          ) : active ? (
            <>
              <header className="flex h-12 shrink-0 items-center justify-end gap-2 border-b border-[#434656]/10 px-8">
                <button
                  onClick={() => openCompose("reply", { from: active.from, subject: active.subject, emailId: activeId! })}
                  className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90"
                >
                  <Send className="size-[18px]" />
                  Reply
                </button>
                <button
                  onClick={handleConvertToMeeting}
                  className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90"
                >
                  <Calendar className="size-[18px]" />
                  Convert to Meeting
                </button>
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-1 rounded p-1.5 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]"
                  title="Archive (E)"
                >
                  <Archive className="size-4" />
                </button>
                <button
                  onClick={handleTrash}
                  className="flex items-center gap-1 rounded p-1.5 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]"
                  title="Trash (#)"
                >
                  <Trash2 className="size-4" />
                </button>
                <button className="flex items-center gap-1 rounded p-1.5 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]">
                  <Clock className="size-4" />
                </button>
              </header>

              {activeLabelNames.length > 0 && (
                <div className="flex shrink-0 items-center gap-2 border-b border-[#434656]/10 px-8 py-2">
                  {activeLabelNames.map((name) => (
                    <span
                      key={name}
                      className="flex items-center gap-1 rounded bg-[#0055ff]/10 px-2 py-0.5 font-mono text-[10px] text-[#b6c4ff]"
                    >
                      <Tag className="size-3" />
                      {name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-4xl flex-col pt-3">
                    <h1 className="mb-2 shrink-0 text-lg font-semibold leading-7 tracking-tight text-[#e3e2e7]">
                      {active.subject}
                    </h1>
                    <div className="mb-3 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-[#343539] text-[10px] font-bold text-[#c3c5d9]">
                            {active.from.charAt(0)}
                          </div>
                          <div className="text-xs font-medium text-[#e3e2e7]">
                            {active.from}
                          </div>
                          <span className="text-[10px] text-[#8d90a2]">
                            to {active.to}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#8d90a2]">
                          {active.date}
                        </span>
                      </div>
                    </div>

                     {active.bodyHtml ? (
                      <iframe
                        className="w-full rounded border-0"
                        style={{ minHeight: "calc(100vh - 240px)" }}
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                        title="email content"
                        srcDoc={`<html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>body{margin:0;padding:1rem;padding-bottom:8rem;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#121317;color:#c3c5d9}img{max-width:100%}a{color:#b6c4ff}</style></head><body>${active.bodyHtml}</body></html>`}
                      />
                    ) : (
                      <div className="whitespace-pre-line text-base leading-relaxed text-[#c3c5d9]">{active.bodyText || active.snippet}</div>
                    )}
                  </div>
                </div>
            </>
          ) : null}
        </section>
      </div>
    </>
  )
}
