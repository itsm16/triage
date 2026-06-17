"use client"

import { useMemo } from "react"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { api } from "~/trpc/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"

type Filter = "today" | "upcoming" | "past"

function getRange(filter: Filter, now: Date) {
  switch (filter) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      return { timeMin: start.toISOString(), timeMax: end.toISOString() }
    }
    case "upcoming": {
      const end = new Date(now)
      end.setDate(end.getDate() + 30)
      return { timeMin: now.toISOString(), timeMax: end.toISOString() }
    }
    case "past": {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return { timeMin: start.toISOString(), timeMax: now.toISOString() }
    }
  }
}

type CalendarEvent = {
  id?: string
  title: string
  start: string | undefined
  end: string | undefined
  allDay: boolean
}

function formatEventTime(start: string | undefined, end: string | undefined, allDay: boolean): string {
  if (allDay || !start || !end) return "All day"
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }
  return `${fmt(start)} - ${fmt(end)}`
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "today", label: "Today's" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
]

export function EventsSection() {
  const now = useMemo(() => {
    const d = new Date()
    d.setSeconds(0, 0)
    return d
  }, [])

  const todayRange = useMemo(() => getRange("today", now), [now])
  const upcomingRange = useMemo(() => getRange("upcoming", now), [now])
  const pastRange = useMemo(() => getRange("past", now), [now])

  const today = api.corsair.listEvents.useQuery(todayRange)
  const upcoming = api.corsair.listEvents.useQuery(upcomingRange)
  const past = api.corsair.listEvents.useQuery(pastRange)

  const queries = { today, upcoming, past }

  return (
    <section className="rounded-xl border border-[#434656]/10 bg-[#1a1b1f] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-[#b6c4ff]" />
          <h2 className="text-lg font-semibold text-[#e3e2e7]">Events</h2>
        </div>
        <Link href="/calendar" className="text-sm text-[#b6c4ff] hover:underline">
          View all
        </Link>
      </div>

      <Accordion type="multiple" className="w-full">
        {FILTERS.map((f) => {
          const q = queries[f.key]
          return (
            <AccordionItem key={f.key} value={f.key}>
              <AccordionTrigger className="px-1 py-3 text-sm text-[#c3c5d9] hover:no-underline">
                {f.label}
                <span className="ml-2 text-xs text-[#8d90a2]">
                  ({q.data?.length ?? 0})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {q.isLoading ? (
                    <p className="py-4 text-center text-sm text-[#8d90a2]">Loading...</p>
                  ) : !q.data || q.data.length === 0 ? (
                    <p className="py-4 text-center text-sm text-[#8d90a2]">
                      {f.key === "today"
                        ? "No events today"
                        : f.key === "upcoming"
                          ? "No upcoming events"
                          : "No past events"}
                    </p>
                  ) : (
                    q.data.map((ev: CalendarEvent) => (
                      <Link
                        key={ev.id}
                        href="/calendar"
                        className="flex items-start gap-3 rounded-lg border border-[#434656]/10 bg-[#121317] px-4 py-3 transition-colors hover:border-[#b6c4ff]/20"
                      >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#b6c4ff]/10">
                          <Clock className="size-3.5 text-[#b6c4ff]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#e3e2e7]">{ev.title}</p>
                          <p className="text-xs text-[#8d90a2]">
                            {formatEventTime(ev.start, ev.end, ev.allDay)}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}
