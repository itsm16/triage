"use client"

import { useState } from "react"
import { FileText, Plus, Search, Pencil, Trash2, X } from "lucide-react"
import { api } from "~/trpc/react"
import { useComposeStore } from "~/lib/compose-store"
import { toast } from "sonner"

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const open = useComposeStore((s) => s.open)

  const { data: templates, refetch } = api.templates.list.useQuery()
  const createMut = api.templates.create.useMutation({
    onSuccess: () => { void refetch(); toast.success("Template created") },
    onError: (e) => toast.error(e.message),
  })
  const updateMut = api.templates.update.useMutation({
    onSuccess: () => { void refetch(); toast.success("Template updated") },
    onError: (e) => toast.error(e.message),
  })
  const deleteMut = api.templates.delete.useMutation({
    onSuccess: () => { void refetch(); toast.success("Template deleted") },
    onError: (e) => toast.error(e.message),
  })

  const resetForm = () => {
    setName("")
    setSubject("")
    setBody("")
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    if (editingId) {
      updateMut.mutate({ id: editingId, name, subject, body })
    } else {
      createMut.mutate({ name, subject, body })
    }
    resetForm()
  }

  const handleEdit = (tmpl: { id: string; name: string; subject: string; body: string }) => {
    setName(tmpl.name)
    setSubject(tmpl.subject)
    setBody(tmpl.body)
    setEditingId(tmpl.id)
    setShowForm(true)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMut.mutate({ id })
  }

  const filtered = (templates ?? []).filter((t) =>
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
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 rounded bg-[#0055ff] px-3 py-1.5 font-mono text-[11px] text-[#e3e6ff] transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            New Template
          </button>
        </div>
      </header>

      {showForm && (
        <div className="border-b border-[#434656]/10 bg-[#1a1b1f] px-4 py-4 md:px-10">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#e3e2e7]">
                {editingId ? "Edit Template" : "New Template"}
              </h2>
              <button onClick={resetForm} className="text-[#8d90a2] hover:text-[#e3e2e7]">
                <X className="size-4" />
              </button>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
              className="w-full rounded border border-[#434656]/20 bg-[#121317] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="w-full rounded border border-[#434656]/20 bg-[#121317] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Template body"
              rows={4}
              className="w-full resize-none rounded border border-[#434656]/20 bg-[#121317] px-3 py-2 text-sm text-[#e3e2e7] placeholder-[#8d90a2] outline-none focus:border-[#b6c4ff]/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="rounded px-3 py-1.5 text-sm text-[#8d90a2] transition-colors hover:text-[#e3e2e7]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMut.isPending || updateMut.isPending}
                className="rounded bg-[#0055ff] px-4 py-1.5 text-sm text-[#e3e6ff] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-1 p-6 md:p-10">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => open("compose", undefined, { subject: t.subject, body: t.body })}
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-[#434656]/10 px-5 py-4 transition-colors hover:bg-[#1a1b1f]"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#292a2e]">
                  <FileText className="size-4 text-[#b6c4ff]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e3e2e7]">{t.name}</p>
                  <p className="text-xs text-[#8d90a2]">{t.body || t.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(t) }}
                  className="rounded p-1.5 text-[#8d90a2] transition-colors hover:text-[#b6c4ff]"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(t.id, e)}
                  disabled={deleteMut.isPending}
                  className="rounded p-1.5 text-[#8d90a2] transition-colors hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-sm text-[#8d90a2]">
              {search ? "No templates found" : "No templates yet. Create one above."}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
