"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Bell,
  History,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { api } from "~/trpc/react"

import { useNotificationStore } from "~/lib/notification-store"
import { toast } from "sonner"
import { useComposeStore } from "~/lib/compose-store"
import { EmailList, type EmailListItem } from "~/components/email/email-list"
import { EmailThread } from "~/components/email/email-thread"

const TAB_TO_CATEGORY: Record<string, string> = {
  updates: "CATEGORY_UPDATES",
  social: "CATEGORY_SOCIAL",
  promotions: "CATEGORY_PROMOTIONS",
  drafts: "DRAFT",
  sent: "SENT",
  trash: "TRASH",
}

const TAB_TO_QUERY: Record<string, string> = {
  primary: "category:primary",
}

const CATEGORY_TO_TAB = Object.fromEntries(
  Object.entries(TAB_TO_CATEGORY).map(([k, v]) => [v, k])
)

const KNOWN_MODIFIERS = new Set([
  ...Object.keys(TAB_TO_CATEGORY),
  ...Object.keys(TAB_TO_QUERY),
  "all",
])

function parseSearch(
  input: string,
  currentLabel: string | undefined,
  currentQuery: string | undefined
): { labelIds: string[] | undefined; query: string } {
  const match = /:(\w+)/.exec(input)
  if (match?.[1] != null && match?.index != null) {
    const mod = match[1].toLowerCase()
    const before = input.slice(0, match.index).trimEnd()
    const after = input.slice(match.index + match[0].length).trimStart()
    const rest = (before + " " + after).trim()

    if (mod === "all") return { labelIds: undefined, query: rest }

    const tabQuery = TAB_TO_QUERY[mod]
    if (tabQuery) return { labelIds: undefined, query: tabQuery + (rest ? ` ${rest}` : "") }

    const label = TAB_TO_CATEGORY[mod]
    if (label) return { labelIds: [label], query: rest }
  }

  if (currentQuery) {
    return { labelIds: undefined, query: currentQuery + (input ? ` ${input}` : "") }
  }
  return {
    labelIds: currentLabel ? [currentLabel] : undefined,
    query: input,
  }
}

function contextLabel(parsedLabelIds: string[] | undefined, parsedQuery: string | undefined): string {
  if (parsedQuery) {
    for (const [tab, query] of Object.entries(TAB_TO_QUERY)) {
      if (parsedQuery === query || parsedQuery.startsWith(query + " ")) return tab
    }
  }
  if (!parsedLabelIds || parsedLabelIds.length === 0) return "all"
  const id = parsedLabelIds[0]
  if (!id) return "all"
  return CATEGORY_TO_TAB[id] ?? "all"
}

export default function EmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)
  const [tokens, setTokens] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showReplies, setShowReplies] = useState(true)
  const [currentLabel, setCurrentLabel] = useState<string | undefined>(undefined)
  const [currentQuery, setCurrentQuery] = useState<string | undefined>(undefined)
  const notifCount = useNotificationStore((s) => s.count)
  const resetNotifs = useNotificationStore((s) => s.reset)

  const [searchInput, setSearchInput] = useState("")
  const [debouncedInput, setDebouncedInput] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const pageNum = Number(searchParams.get("page")) || 1

  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === "") params.delete(k)
        else params.set(k, v)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  const tabParam = searchParams.get("tab")

  useEffect(() => {
    let newLabel: string | undefined
    let newQuery: string | undefined
    if (tabParam) {
      if (TAB_TO_QUERY[tabParam]) {
        newQuery = TAB_TO_QUERY[tabParam]
      } else if (TAB_TO_CATEGORY[tabParam]) {
        newLabel = TAB_TO_CATEGORY[tabParam]
      }
    }
    setCurrentLabel(newLabel)
    setCurrentQuery(newQuery)
    setPageToken(undefined)
    setTokens([])
    setActiveId(null)
    setActiveThreadId(null)
    setSelectedIds(new Set())
    setSearchInput("")
    setDebouncedInput("")
  }, [tabParam])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedInput(searchInput)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  const parsed = parseSearch(debouncedInput, currentLabel, currentQuery)
  const utils = api.useUtils()
  const queryInput = { pageToken, labelIds: parsed.labelIds, q: parsed.query || undefined }

  const { data, refetch } = api.corsair.listMessages.useQuery(queryInput)

  const [streamMessages, setStreamMessages] = useState<EmailListItem[]>([])
  const [streamMeta, setStreamMeta] = useState<{ nextPageToken: string | null; totalExpected: number } | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)
  const prevKeyRef = useRef("")

  const requestBody = JSON.stringify(queryInput)
  const queryKey = requestBody
  if (queryKey !== prevKeyRef.current) {
    prevKeyRef.current = queryKey
    streamAbortRef.current?.abort()
    streamAbortRef.current = null
    setStreamMessages([])
    setStreamMeta(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    streamAbortRef.current = controller
    const signal = controller.signal

    const run = async () => {
      try {
        const response = await fetch("/api/email/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
          signal,
        })

        if (!response.ok) {
          console.error("email stream: HTTP", response.status)
          return
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done || signal.aborted) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            if (signal.aborted) break

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const event: { type: string; nextPageToken?: string | null; ids?: string[]; message?: EmailListItem } = JSON.parse(line.slice(6))

            if (event.type === "ids") {
              setStreamMeta({ nextPageToken: event.nextPageToken ?? null, totalExpected: event.ids?.length ?? 0 })
            } else if (event.type === "message") {
              setStreamMessages((prev) => [...prev, event.message!])
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        console.error("email stream error:", err)
      }
    }

    void run()

    return () => {
      controller.abort()
    }
  }, [queryKey, requestBody])

  const displayMessages = data?.messages ?? streamMessages
  const totalExpected = streamMeta?.totalExpected ?? 20
  const activeThread = api.corsair.getThread.useQuery(
    { id: activeThreadId! },
    { enabled: !!activeThreadId }
  )

  const isTrash = (parsed.labelIds ?? (currentLabel ? [currentLabel] : [])).includes("TRASH")

  function optimisticRemove(id: string) {
    const prev = utils.corsair.listMessages.getData(queryInput)
    if (prev) {
      utils.corsair.listMessages.setData(queryInput, {
        ...prev,
        messages: prev.messages.filter(m => m.id !== id),
      })
    }
  }

  function optimisticMarkRead(id: string) {
    const prev = utils.corsair.listMessages.getData(queryInput)
    if (prev) {
      utils.corsair.listMessages.setData(queryInput, {
        ...prev,
        messages: prev.messages.map(m =>
          m.id === id
            ? { ...m, labelIds: m.labelIds?.filter(l => l !== "UNREAD") ?? [] }
            : m
        ),
      })
    }
  }

  const modifyMsg = api.corsair.modifyMessage.useMutation({
    onSettled: () => refetch(),
  })
  const deleteMsg = api.corsair.deleteMessage.useMutation({
    onSettled: () => refetch(),
    onError: () => toast.error("Failed to delete email"),
  })
  const createEvent = api.corsair.createEvent.useMutation()
  const openCompose = useComposeStore((s) => s.open)

  const nextPageToken = streamMeta?.nextPageToken ?? data?.nextPageToken

  const goNext = () => {
    if (nextPageToken) {
      setTokens((prev) => [...prev, pageToken ?? ""])
      setPageToken(nextPageToken)
      setActiveId(null)
      setActiveThreadId(null)
      updateUrl({ page: String(pageNum + 1) })
    }
  }

  const goPrev = () => {
    if (tokens.length > 0) {
      const newTokens = [...tokens]
      const prev = newTokens.pop()!
      setTokens(newTokens)
      setPageToken(prev || undefined)
      setActiveId(null)
      setActiveThreadId(null)
      updateUrl({ page: String(pageNum - 1) })
    }
  }

  const threadMessages = activeThread.data ?? []

  const handleArchive = () => {
    if (!activeId) return
    optimisticRemove(activeId)
    setActiveId(null)
    setActiveThreadId(null)
    modifyMsg.mutate(
      { id: activeId, removeLabelIds: ["INBOX"] },
      {
        onSuccess: () => toast.success("Email archived"),
        onError: () => toast.error("Failed to archive"),
      }
    )
  }

  const handleTrash = () => {
    if (!activeId) return
    optimisticRemove(activeId)
    setActiveId(null)
    setActiveThreadId(null)
    modifyMsg.mutate(
      { id: activeId, addLabelIds: ["TRASH"], removeLabelIds: ["INBOX"] },
      {
        onSuccess: () => toast.success("Email trashed"),
        onError: () => toast.error("Failed to trash"),
      }
    )
  }

  const handlePermanentDelete = () => {
    if (!activeId) return
    optimisticRemove(activeId)
    setActiveId(null)
    setActiveThreadId(null)
    deleteMsg.mutate(
      { id: activeId },
      {
        onSuccess: () => toast.success("Email permanently deleted"),
      }
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

  const handleSelectAll = () => {
    const allIds = displayMessages.map((m) => m.id).filter(Boolean) as string[]
    if (allIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }

  const handleSelectRange = (start: number, end: number) => {
    const ids = displayMessages
      .slice(start, end + 1)
      .map((m) => m.id)
      .filter(Boolean) as string[]
    setSelectedIds(new Set(ids))
  }

  const handleBulkTrash = () => {
    const ids = Array.from(selectedIds)
    setSelectedIds(new Set())
    for (const id of ids) optimisticRemove(id)
    setActiveId(null)
    setActiveThreadId(null)

    let count = 0
    let hasError = false
    if (isTrash) {
      for (const id of ids) {
        deleteMsg.mutate(
          { id },
          {
            onSuccess: () => {
              count++
              if (count === ids.length) {
                if (!hasError)
                  toast.success(`${ids.length} emails permanently deleted`)
              }
            },
            onError: () => {
              hasError = true
              count++
              if (count === ids.length)
                toast.error("Failed to delete some emails")
            },
          }
        )
      }
    } else {
      for (const id of ids) {
        modifyMsg.mutate(
          { id, addLabelIds: ["TRASH"], removeLabelIds: ["INBOX"] },
          {
            onSuccess: () => {
              count++
              if (count === ids.length)
                toast.success(`${ids.length} emails trashed`)
            },
            onError: () => {
              hasError = true
              count++
              if (count === ids.length)
                toast.error("Failed to trash some emails")
            },
          }
        )
      }
    }
  }

  const targetMsg =
    threadMessages.find((m) => m.id === activeId) ??
    threadMessages[threadMessages.length - 1]

  const handleConvertToMeeting = () => {
    if (!targetMsg) return
    const msg = targetMsg as { subject?: string; from?: string; snippet?: string }
    const start = new Date()
    start.setHours(start.getHours() + 1, 0, 0, 0)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    createEvent.mutate(
      {
        summary: msg.subject ?? "Meeting",
        description: `From email: ${msg.subject ?? ""}\nFrom: ${msg.from ?? ""}\n\n${msg.snippet ?? ""}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
      {
        onSuccess: () => toast.success("Meeting added to calendar"),
        onError: () => toast.error("Failed to create meeting"),
      }
    )
  }

  const handleReply = () => {
    const target =
      (threadMessages.find((m) => m.id === activeId) ??
        threadMessages[threadMessages.length - 1]) as
        { from: string; subject: string; id: string; threadId: string } | undefined
    if (!target) return
    openCompose("reply", {
      from: target.from,
      subject: target.subject,
      emailId: target.id,
      threadId: target.threadId,
    })
  }

  const handleSelectMessage = (id: string, threadId: string) => {
    setActiveId(id)
    setActiveThreadId(threadId)
    optimisticMarkRead(id)
    modifyMsg.mutate({ id, removeLabelIds: ["UNREAD"] })
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setPageToken(undefined)
    setTokens([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const val = e.currentTarget.value
      if (val === "") {
        e.preventDefault()
        setSearchInput(":all ")
        setPageToken(undefined)
        setTokens([])
        return
      }
      const match = /^:(\w+)\s/.exec(val)
      if (match?.[1] != null && KNOWN_MODIFIERS.has(match[1].toLowerCase())) {
        const rest = val.slice(match[0].length)
        e.preventDefault()
        setSearchInput(rest)
        setPageToken(undefined)
        setTokens([])
      }
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-[#434656]/10 bg-[#121317]/80 px-4 backdrop-blur-md">
        <div className="flex w-full max-w-md items-center rounded border border-[#434656]/20 bg-[#1e1f23] px-3 py-1.5">
          <Search className="mr-2 size-4 shrink-0 text-[#8d90a2]" />
          <span className="mr-1 shrink-0 rounded bg-[#b6c4ff]/10 px-1.5 py-0.5 text-xs font-medium text-[#b6c4ff]">
            :{contextLabel(parsed.labelIds, parsed.query)}
          </span>
          <input
            ref={inputRef}
            className="w-full bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2]/50 outline-none"
            placeholder="Search emails... (e.g. :promotions meeting)"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPageToken(undefined)
              setTokens([])
            }}
            onKeyDown={handleKeyDown}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="ml-auto rounded p-0.5 text-[#8d90a2] transition-colors hover:text-[#e3e2e7]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-[#8d90a2]">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkTrash}
                className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="size-3.5" />{" "}
                {isTrash ? "Delete" : "Trash"}
              </button>
            </>
          )}
          <button
            onClick={() => { resetNotifs(); void refetch() }}
            className="relative flex items-center text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]"
          >
            <Bell className="size-5" />
            {notifCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
          <History className="size-5 cursor-pointer text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]" />
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] items-start overflow-y-hidden">
        <EmailList
          messages={displayMessages}
          totalExpected={totalExpected}
          activeId={activeId}
          selectedIds={selectedIds}
          tokensLength={tokens.length}
          pageNum={pageNum}
          nextPageToken={nextPageToken}
          messagesCount={displayMessages.length}
          onSelectMessage={handleSelectMessage}
          onToggleSelect={toggleSelect}
          onSelectAll={handleSelectAll}
          onSelectRange={handleSelectRange}
          onGoNext={goNext}
          onGoPrev={goPrev}
        />

        <EmailThread
          activeId={activeId}
          isFetching={activeThread.isFetching}
          threadMessages={threadMessages}
          showReplies={showReplies}
          isTrash={isTrash}
          onToggleReplies={() => setShowReplies(!showReplies)}
          onReply={handleReply}
          onConvertToMeeting={handleConvertToMeeting}
          onArchive={handleArchive}
          onTrash={handleTrash}
          onDelete={handlePermanentDelete}
        />
      </div>
    </>
  )
}
