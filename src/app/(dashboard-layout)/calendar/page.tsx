"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { api } from "~/trpc/react"
import { useLoaderStore } from "~/lib/loader-store"
import { toast } from "sonner"
import "~/styles/calendar-dark.css"

export default function CalendarPage() {
  const calRef = useRef<FullCalendar>(null)
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState("dayGridMonth")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", startDate: "", startTime: "", endDate: "", endTime: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const setLoading = useLoaderStore((s) => s.setLoading)

  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: events, isLoading, refetch } = api.corsair.listEvents.useQuery(
    { timeMin: startOfMonth, timeMax: endOfMonth },
  )

  const defaultForm = { title: "", description: "", startDate: "", startTime: "", endDate: "", endTime: "" }

  const createEvent = api.corsair.createEvent.useMutation({
    onSuccess: () => { void refetch(); setShowForm(false); setFormData(defaultForm); toast.success("Event created") },
  })
  const updateEvent = api.corsair.updateEvent.useMutation({
    onSuccess: () => { void refetch(); toast.success("Event updated") },
  })
  const deleteEvent = api.corsair.deleteEvent.useMutation({
    onSuccess: () => { void refetch(); toast.success("Event deleted") },
  })

  useEffect(() => { setLoading(isLoading); return () => setLoading(false) }, [isLoading, setLoading])

  useEffect(() => {
    calRef.current?.getApi().changeView(view)
  }, [view])

  const handleNav = (dir: number) => {
    const api = calRef.current?.getApi()
    if (!api) return
    if (dir < 0) api.prev(); else api.next()
    setDate(api.getDate())
  }

  const handleDateSelect = (info: DateSelectArg) => {
    setEditingId(null)
    const pad = (n: number) => n.toString().padStart(2, "0")
    const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
    setFormData({
      title: "",
      description: "",
      startDate: fmtDate(info.start),
      startTime: fmtTime(info.start),
      endDate: fmtDate(info.end),
      endTime: fmtTime(info.end),
    })
    setShowForm(true)
  }

  const handleEventClick = (info: EventClickArg) => {
    setEditingId(info.event.id)
    const pad = (n: number) => n.toString().padStart(2, "0")
    const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
    const start = info.event.start ?? new Date()
    const end = info.event.end ?? new Date(start.getTime() + 3600000)
    setFormData({
      title: info.event.title,
      description: (info.event.extendedProps as { description?: string }).description ?? "",
      startDate: fmtDate(start),
      startTime: fmtTime(start),
      endDate: fmtDate(end),
      endTime: fmtTime(end),
    })
    setShowForm(true)
  }

  const handleEventDrop = (info: EventDropArg) => {
    updateEvent.mutate({
      id: info.event.id,
      start: { dateTime: info.event.start?.toISOString() ?? "" },
      end: { dateTime: info.event.end?.toISOString() ?? "" },
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const start = new Date(`${formData.startDate}T${formData.startTime}:00`)
    const end = new Date(`${formData.endDate}T${formData.endTime}:00`)

    if (editingId) {
      updateEvent.mutate({
        id: editingId,
        summary: formData.title,
        description: formData.description || undefined,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      })
    } else {
      createEvent.mutate({
        summary: formData.title,
        description: formData.description || undefined,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      })
    }
  }

  const handleDelete = () => {
    if (editingId) {
      deleteEvent.mutate({ id: editingId })
      setShowForm(false)
      setEditingId(null)
      setFormData(defaultForm)
    }
  }

  const formatTitle = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="flex h-full flex-col bg-[#121317]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#434656]/10 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-[#434656]/20 bg-[#1e1f23] p-1">
            <button onClick={() => handleNav(-1)} className="rounded p-1 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]">
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-medium text-[#e3e2e7]">{formatTitle(date)}</span>
            <button onClick={() => handleNav(1)} className="rounded p-1 text-[#c3c5d9] transition-colors hover:text-[#b6c4ff]">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              const now = new Date()
              now.setMinutes(0, 0, 0)
              const later = new Date(now.getTime() + 3600000)
              const pad = (n: number) => n.toString().padStart(2, "0")
              const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
              const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
              setFormData({
                title: "",
                description: "",
                startDate: fmtDate(now),
                startTime: fmtTime(now),
                endDate: fmtDate(later),
                endTime: fmtTime(later),
              })
              setShowForm(true)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#0055ff] px-3 py-1.5 text-sm font-medium text-[#e3e6ff] transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> New Event
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#434656]/20 bg-[#1e1f23] p-1">
          {[
            { key: "dayGridMonth", label: "Month" },
            { key: "timeGridWeek", label: "Week" },
            { key: "timeGridDay", label: "Day" },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                view === v.key ? "bg-[#0055ff] text-white" : "text-[#c3c5d9] hover:text-[#b6c4ff]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="calendar-dark h-full">
            <FullCalendar
              ref={calRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              views={{ dayGridMonth: { dayMaxEvents: 3 }, timeGridWeek: {}, timeGridDay: {} }}
              headerToolbar={false}
              height="100%"
              events={events ?? []}
              selectable
              editable
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              nowIndicator
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              firstDay={1}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit" }}
              dayHeaderFormat={{ weekday: "short" }}
              titleFormat={{ year: "numeric", month: "long" }}
              buttonText={{ today: "Today" }}
              noEventsText="No events"
              eventBackgroundColor="#0055ff"
              eventBorderColor="#0055ff"
              eventTextColor="#e3e6ff"
              moreLinkText={(num) => `+${num} more`}
            />
          </div>
        </div>

        {showForm && (
          <div className="flex w-80 shrink-0 flex-col border-l border-[#434656]/10 bg-[#0d0e12]">
            <div className="flex items-center justify-between border-b border-[#434656]/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#e3e2e7]">
                {editingId ? "Edit Event" : "New Event"}
              </h2>
              <button onClick={() => { setShowForm(false); setFormData(defaultForm); setEditingId(null) }} className="text-[#8d90a2] transition-colors hover:text-[#c3c5d9]">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#c3c5d9]">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  placeholder="Event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#c3c5d9]">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#c3c5d9]">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#c3c5d9]">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#c3c5d9]">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#c3c5d9]">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="h-24 w-full resize-none rounded-lg border border-[#434656]/20 bg-[#1a1b1f] px-3 py-2 text-sm text-[#e3e2e7] outline-none focus:border-[#b6c4ff]/30"
                  placeholder="Optional description"
                />
              </div>
              <div className="mt-auto flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto rounded-lg bg-[#0055ff] px-4 py-2 text-sm font-medium text-[#e3e6ff] transition-opacity hover:opacity-90"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
