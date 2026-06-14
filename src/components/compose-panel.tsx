"use client"

import { useState, useRef, useEffect } from "react"
import {
  AtSign,
  Calendar,
  ChevronDown,
  FileText,
  Minimize2,
  Paperclip,
  Save,
  Send,
  Smile,
  X,
} from "lucide-react"
import { useComposeStore, type ComposeInstance } from "~/lib/compose-store"
import { composeSchema } from "~/lib/compose-schema"
import { templates } from "~/lib/templates"
import { api } from "~/trpc/react"
import { toast } from "sonner"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function ComposeModal({ instance, index }: { instance: ComposeInstance; index: number }) {
  const { close, updateFormData, toggleMinimize } = useComposeStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflict, setConflict] = useState<{ timeMin: string; timeMax: string } | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const templatesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showTemplates) return
    const close = (e: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
        setShowTemplates(false)
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [showTemplates])
  const utils = api.useUtils()
  const sendMsg = api.corsair.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent")
      utils.corsair.listMessages.invalidate()
      utils.corsair.getThread.invalidate()
      close(instance.id)
    },
    onError: () => toast.error("Failed to send message"),
  })
  const saveDraft = api.corsair.saveDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft saved")
      utils.corsair.listMessages.invalidate()
      close(instance.id)
    },
    onError: () => toast.error("Failed to save draft"),
  })

  const rightPos = index === 0 ? 16 : 672

  const doSend = () => {
    sendMsg.mutate({
      to: instance.formData.to,
      subject: instance.formData.subject,
      body: instance.formData.body,
      threadId: instance.replyTo?.threadId,
      inviteTitle: instance.formData.includeInvite ? instance.formData.inviteTitle || instance.formData.subject : undefined,
      inviteStart: instance.formData.includeInvite ? instance.formData.inviteStart : undefined,
      inviteEnd: instance.formData.includeInvite ? instance.formData.inviteEnd : undefined,
    })
  }

  const handleSend = async () => {
    const result = composeSchema.safeParse(instance.formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    if (instance.formData.includeInvite && instance.formData.inviteStart && instance.formData.inviteEnd) {
      try {
        const { hasConflict } = await utils.corsair.checkAvailability.fetch({
          timeMin: new Date(instance.formData.inviteStart).toISOString(),
          timeMax: new Date(instance.formData.inviteEnd).toISOString(),
        })
        if (hasConflict) {
          setConflict({
            timeMin: instance.formData.inviteStart,
            timeMax: instance.formData.inviteEnd,
          })
          return
        }
        console.log("err",hasConflict)
      } catch {
        // availability check failed, proceed anyway
      }
    }
    doSend()
  }

  const handleSave = () => {
    const result = composeSchema.safeParse(instance.formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    saveDraft.mutate({
      to: instance.formData.to,
      subject: instance.formData.subject,
      body: instance.formData.body,
    })
  }

  const toggleInvite = () => {
    const next = !instance.formData.includeInvite
    if (next) {
      const now = new Date()
      now.setMinutes(0, 0, 0)
      const later = new Date(now.getTime() + 3600000)
      updateFormData(instance.id, {
        includeInvite: true,
        inviteTitle: instance.formData.subject || "Meeting",
        inviteStart: `${fmtDate(now)}T${fmtTime(now)}`,
        inviteEnd: `${fmtDate(later)}T${fmtTime(later)}`,
      })
    } else {
      updateFormData(instance.id, {
        includeInvite: false,
        inviteTitle: undefined,
        inviteStart: undefined,
        inviteEnd: undefined,
      })
    }
  }

  const title = instance.type === "reply" ? "Reply" : "New Message"
  const subtitle = instance.type === "reply" && instance.replyTo
    ? `Re: ${instance.replyTo.subject}`
    : undefined

  return (
    <div
      className="absolute flex w-[640px] flex-col rounded-t-xl border border-[#434656]/20 bg-[#121317] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
      style={{ bottom: 16, right: rightPos }}
    >
      <div className="flex items-center justify-between rounded-t-xl border-b border-[#434656]/10 bg-[#0d0e12] px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.1em] text-[#e3e2e7]">
          {title}
          {subtitle && (
            <span className="max-w-[200px] truncate text-[10px] font-normal normal-case text-[#8d90a2]">
              {subtitle}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleMinimize(instance.id)}
            className="rounded p-1 text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#c3c5d9]"
          >
            <Minimize2 className="size-4" />
          </button>
          <button
            onClick={() => close(instance.id)}
            className="rounded p-1 text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#c3c5d9]"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {instance.minimized ? null : (
        <>
          <div className="flex items-center gap-3 border-b border-[#434656]/10 px-4 py-2">
            <span className="w-10 shrink-0 font-mono text-[10px] uppercase text-[#8d90a2]">To</span>
            <input
              value={instance.formData.to}
              onChange={(e) => {
                updateFormData(instance.id, { to: e.target.value })
                if (errors.to) setErrors((prev) => ({ ...prev, to: "" }))
              }}
              className="flex-1 bg-transparent text-sm text-[#e3e2e7] outline-none"
              placeholder="Recipients"
            />
            {errors.to && <span className="shrink-0 text-[10px] text-red-400">{errors.to}</span>}
          </div>

          <div className="flex items-center gap-3 border-b border-[#434656]/10 px-4 py-2">
            <span className="w-10 shrink-0 font-mono text-[10px] uppercase text-[#8d90a2]">Subj</span>
            <input
              value={instance.formData.subject}
              onChange={(e) => {
                updateFormData(instance.id, { subject: e.target.value })
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }))
              }}
              className="flex-1 bg-transparent text-sm text-[#e3e2e7] outline-none"
              placeholder="Subject"
            />
            {errors.subject && <span className="shrink-0 text-[10px] text-red-400">{errors.subject}</span>}
          </div>

          <div className="flex gap-3 px-4 pb-0 pt-3">
            <textarea
              value={instance.formData.body}
              onChange={(e) => updateFormData(instance.id, { body: e.target.value })}
              className="min-h-[320px] flex-1 resize-none bg-transparent text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none"
              placeholder="Write your message..."
              autoFocus
            />
          </div>

          {instance.formData.includeInvite && (
            <div className="grid grid-cols-2 gap-3 border-t border-[#434656]/10 px-4 py-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-[#8d90a2] uppercase tracking-wider">Title</label>
                <input
                  value={instance.formData.inviteTitle || ""}
                  onChange={(e) => updateFormData(instance.id, { inviteTitle: e.target.value })}
                  className="w-full rounded border border-[#434656]/20 bg-[#1a1b1f] px-2 py-1.5 text-xs text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  placeholder="Event title"
                />
              </div>
              <div />
              <div>
                <label className="mb-1 block text-[10px] font-medium text-[#8d90a2] uppercase tracking-wider">Start</label>
                <input
                  type="datetime-local"
                  value={instance.formData.inviteStart || ""}
                  onChange={(e) => updateFormData(instance.id, { inviteStart: e.target.value })}
                  className="w-full rounded border border-[#434656]/20 bg-[#1a1b1f] px-2 py-1.5 text-xs text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-[#8d90a2] uppercase tracking-wider">End</label>
                <input
                  type="datetime-local"
                  value={instance.formData.inviteEnd || ""}
                  onChange={(e) => updateFormData(instance.id, { inviteEnd: e.target.value })}
                  className="w-full rounded border border-[#434656]/20 bg-[#1a1b1f] px-2 py-1.5 text-xs text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#434656]/10 p-2">
            <div className="flex items-center gap-1">
              <div className="relative" ref={templatesRef}>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex shrink-0 items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-[#c3c5d9] transition-colors hover:bg-[#292a2e]"
                >
                  <FileText className="size-3.5" />
                  Templates
                  <ChevronDown className="size-3" />
                </button>
                {showTemplates && (
                  <div className="absolute bottom-full left-0 mb-1 w-56 rounded-lg border border-[#434656]/20 bg-[#1a1b1f] py-1 shadow-2xl">
                    {templates.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          updateFormData(instance.id, { body: t.body })
                          setShowTemplates(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#c3c5d9] transition-colors hover:bg-[#292a2e]"
                      >
                        <FileText className="size-3.5 shrink-0 text-[#b6c4ff]" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{t.name}</div>
                          <div className="truncate text-[10px] text-[#8d90a2]">{t.body}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="mx-1 h-4 w-px bg-[#434656]/20" />
              <button className="rounded px-2 py-0.5 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e]">B</button>
              <button className="rounded px-2 py-0.5 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e] italic">I</button>
              <button className="rounded px-2 py-0.5 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e] underline">U</button>
              <span className="mx-1 h-4 w-px bg-[#434656]/20" />
              <button className="rounded px-2 py-0.5 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e]">Link</button>
              <button className="rounded px-2 py-0.5 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e]">List</button>
              <span className="mx-1 h-4 w-px bg-[#434656]/20" />
              <button
                onClick={toggleInvite}
                className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                  instance.formData.includeInvite
                    ? "bg-[#0055ff]/20 text-[#b6c4ff]"
                    : "text-[#8d90a2] hover:bg-[#292a2e] hover:text-[#c3c5d9]"
                }`}
              >
                <Calendar className="size-3.5" />
              </button>
              <button className="rounded px-2 py-0.5 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#c3c5d9]">
                <Paperclip className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 px-1">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-[#8d90a2] transition-colors hover:bg-[#292a2e] hover:text-[#c3c5d9]"
              >
                <Save className="size-3.5" />
                Save
              </button>
              <AtSign className="size-4 shrink-0 text-[#8d90a2] transition-colors hover:text-[#b6c4ff]" />
              <Smile className="size-4 shrink-0 text-[#8d90a2] transition-colors hover:text-[#b6c4ff]" />
              <div className="mx-1 h-5 w-px bg-[#434656]/20" />
              <button
                onClick={handleSend}
                className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1 font-mono text-[10px] text-[#e3e6ff] transition-opacity hover:opacity-90"
              >
                <Send className="size-3.5" />
                Send
                <span className="rounded bg-[#e3e6ff]/20 px-1 py-0.5 font-mono text-[9px] text-[#e3e6ff]">
                  Cmd+Enter
                </span>
              </button>
            </div>
          </div>
        </>
      )}
      {conflict && (
        <div className="absolute inset-0 z-20 flex items-end justify-center rounded-t-xl bg-black/40 pb-16">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-[#434656]/20 bg-[#1a1b1f] p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="mb-3 text-sm font-medium text-[#e3e2e7]">
              You already have an event scheduled during this time.
            </p>
            <p className="mb-4 text-xs text-[#8d90a2]">
              Do you still want to send this calendar invite?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConflict(null)}
                className="rounded-lg border border-[#434656]/20 px-4 py-1.5 text-xs font-medium text-[#c3c5d9] transition-colors hover:bg-[#292a2e]"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConflict(null); doSend() }}
                className="rounded-lg bg-[#0055ff] px-4 py-1.5 text-xs font-medium text-[#e3e6ff] transition-opacity hover:opacity-90"
              >
                Send anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ComposePanel() {
  const instances = useComposeStore((s) => s.instances)

  if (instances.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {instances.map((instance, index) => (
        <div key={instance.id} className="pointer-events-auto">
          <ComposeModal instance={instance} index={instances.length - 1 - index} />
        </div>
      ))}
    </div>
  )
}
