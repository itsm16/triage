"use client"

import { create } from "zustand"

export type ComposeType = "compose" | "reply"

export interface ComposeFormData {
  to: string
  subject: string
  body: string
  includeInvite?: boolean
  inviteTitle?: string
  inviteStart?: string
  inviteEnd?: string
}

export interface ComposeInstance {
  id: string
  type: ComposeType
  replyTo?: {
    from: string
    subject: string
    emailId: string
  }
  formData: ComposeFormData
  minimized: boolean
}

interface ComposeStore {
  instances: ComposeInstance[]
  open: (type: ComposeType, replyTo?: { from: string; subject: string; emailId: string }, initialData?: Partial<ComposeFormData>) => void
  close: (id: string) => void
  updateFormData: (id: string, data: Partial<ComposeFormData>) => void
  toggleMinimize: (id: string) => void
}

let nextId = 1

export const useComposeStore = create<ComposeStore>((set) => ({
  instances: [],
  open: (type, replyTo, initialData) =>
    set((state) => {
      if (state.instances.length >= 2) return state
      return {
        instances: [
          ...state.instances,
          {
            id: `compose_${nextId++}`,
            type,
            replyTo,
            formData: {
              to: replyTo ? replyTo.from.replace(/.*<([^>]+)>/, '$1').replace(/^"|"$/g, '').trim() : "",
              subject: replyTo ? `Re: ${replyTo.subject}` : "",
              body: "",
              ...initialData,
            },
            minimized: false,
          },
        ],
      }
    }),
  close: (id) =>
    set((state) => ({
      instances: state.instances.filter((i) => i.id !== id),
    })),
  updateFormData: (id, data) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === id ? { ...i, formData: { ...i.formData, ...data } } : i,
      ),
    })),
  toggleMinimize: (id) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === id ? { ...i, minimized: !i.minimized } : i,
      ),
    })),
}))
