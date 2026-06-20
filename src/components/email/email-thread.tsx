"use client"

import { Archive, Calendar, Clock, Send, Trash2, AlertTriangle } from "lucide-react"
import { EmailMessage } from "~/components/email/email-message"

interface ThreadMessage {
  id?: string
  threadId?: string
  from?: string
  to?: string
  subject?: string
  date?: string
  bodyHtml?: string
  bodyText?: string | null
  snippet?: string
}

interface EmailThreadProps {
  activeId: string | null
  isFetching: boolean
  threadMessages: ThreadMessage[]
  showReplies: boolean
  isTrash?: boolean
  onToggleReplies: () => void
  onReply: () => void
  onConvertToMeeting: () => void
  onArchive: () => void
  onTrash: () => void
  onDelete?: () => void
}

export function EmailThread({
  activeId,
  isFetching,
  threadMessages,
  showReplies,
  isTrash,
  onToggleReplies,
  onReply,
  onConvertToMeeting,
  onArchive,
  onTrash,
  onDelete,
}: EmailThreadProps) {
  return (
    <section className="flex h-[calc(100vh-65px)] pb-5 w-full overflow-y-scroll flex-col bg-[#121317] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#434656]/50 [&::-webkit-scrollbar-track]:bg-transparent">
      {!activeId ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[#8d90a2]">
          Select an email to read
        </div>
      ) : isFetching ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[#8d90a2]">
          Loading email...
        </div>
      ) : threadMessages.length > 0 ? (
        <>
          <header className="sticky top-0 flex h-12 shrink-0 items-center justify-end gap-2 border-b border-[#434656]/10 bg-[#121317] px-8">
            {isTrash ? (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 rounded bg-red-500/20 px-3 py-1.5 font-mono text-[11px] text-red-400 transition-colors hover:bg-red-500/30"
              >
                <AlertTriangle className="size-[18px]" />
                Delete
              </button>
            ) : (
              <>
                <button
                  onClick={onReply}
                  className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90"
                >
                  <Send className="size-[18px]" />
                  Reply
                </button>
                <button
                  onClick={onConvertToMeeting}
                  className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90"
                >
                  <Calendar className="size-[18px]" />
                  Convert to Meeting
                </button>
                <button
                  onClick={onArchive}
                  className="flex items-center gap-1 rounded p-1.5 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]"
                  title="Archive (E)"
                >
                  <Archive className="size-4" />
                </button>
                <button
                  onClick={onTrash}
                  className="flex items-center gap-1 rounded p-1.5 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]"
                  title="Trash (#)"
                >
                  <Trash2 className="size-4" />
                </button>
                {/* <button className="flex items-center gap-1 rounded p-1.5 text-[#c3c5d9] transition-colors hover:text-[#e3e2e7]">
                  <Clock className="size-4" />
                </button> */}
              </>
            )}
          </header>

          <div className="">
            <div className="mx-auto flex w-full max-w-4xl flex-col pt-3 gap-2 ">
              <h1 className="mb-4 shrink-0 text-lg font-semibold leading-7 tracking-tight text-[#e3e2e7]">
                {threadMessages[0]?.subject}
              </h1>

              {threadMessages[0] && (
                <EmailMessage message={threadMessages[0]} variant="original" />
              )}

              {threadMessages.length > 1 && (
                <button
                  onClick={onToggleReplies}
                  className="my-4 flex items-center gap-2 text-xs text-[#8d90a2] transition-colors hover:text-[#b6c4ff]"
                >
                  <div className="h-px flex-1 bg-[#434656]/20" />
                  <span>
                    {showReplies ? "Hide" : "Show"} {threadMessages.length - 1} repl{threadMessages.length - 1 === 1 ? "y" : "ies"}
                  </span>
                  <div className="h-px flex-1 bg-[#434656]/20" />
                </button>
              )}

              {showReplies && threadMessages.slice(1).map((msg) => (
                <EmailMessage key={msg.id} message={msg} variant="reply" />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
