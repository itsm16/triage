"use client"

import { create } from "zustand"

export interface EmailPreviewData {
  id: string
  subject: string
  from: string
  snippet?: string
}

interface EmailPreviewStore {
  email: EmailPreviewData | null
  open: (email: EmailPreviewData) => void
  close: () => void
}

export const useEmailPreviewStore = create<EmailPreviewStore>((set) => ({
  email: null,
  open: (email) => set({ email }),
  close: () => set({ email: null }),
}))
