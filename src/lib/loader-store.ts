"use client"

import { create } from "zustand"

interface LoaderState {
  isLoading: boolean
  setLoading: (v: boolean) => void
}

export const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,
  setLoading: (v) => set({ isLoading: v }),
}))
