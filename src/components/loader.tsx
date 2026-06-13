"use client"

import { useLoaderStore } from "~/lib/loader-store"

export function Loader() {
  const isLoading = useLoaderStore((s) => s.isLoading)

  if (!isLoading) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[#b6c4ff]/20 border-t-[#b6c4ff]" />
        <p className="text-sm font-medium text-[#b6c4ff]">Loading...</p>
      </div>
    </div>
  )
}
