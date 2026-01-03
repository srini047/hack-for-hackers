"use client"

import { useEffect } from "react"

export function useHotkeys(keyMap: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const combo = [e.ctrlKey && "ctrl", e.shiftKey && "shift", e.altKey && "alt", e.key.toLowerCase()]
        .filter(Boolean)
        .join("+")

      if (keyMap[combo]) {
        e.preventDefault()
        keyMap[combo]()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [keyMap])
}
