import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatInternalDate(internalDate?: string | null): string {
  if (!internalDate) return ""
  const ts = Number(internalDate)
  if (isNaN(ts)) return ""
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diff < 604_800_000) return d.toLocaleDateString([], { weekday: "short" })
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function parseFromHeader(from: string): string {
  if (!from) return ""
  const idx = from.indexOf("<")
  if (idx > 0) {
    const name = from.slice(0, idx).replace(/"/g, "").trim()
    if (name) return name
  }
  return from.replace(/[<>]/g, "").trim() || from
}

export function extractEmailFromHeader(from: string): string {
  if (!from) return ""
  const match = /<([^>]+)>/.exec(from)
  return match?.[1] ?? from
}
