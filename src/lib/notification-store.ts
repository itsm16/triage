"use client"

import { create } from "zustand"

interface NotificationState {
  count: number
  increment: () => void
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}))
