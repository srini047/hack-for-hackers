"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AccessibilityStore {
  colorBlindMode: boolean
  toggleColorBlindMode: () => void
}

export const useAccessibility = create<AccessibilityStore>()(
  persist(
    (set) => ({
      colorBlindMode: false,
      toggleColorBlindMode: () => set((state) => ({ colorBlindMode: !state.colorBlindMode })),
    }),
    { name: "accessibility-storage" },
  ),
)
