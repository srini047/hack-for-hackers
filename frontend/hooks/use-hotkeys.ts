"use client"

import { useEffect } from "react"

/**
 * useHotkeys - React hook for cross-platform hotkeys
 * @param keyMap - Record of normalized key combos to callback functions
 *
 * Example:
 * useHotkeys({
 *   "meta+shift+h": goHome,       // Mac
 *   "ctrl+shift+h": goHome,       // Windows/Linux
 *   "meta+k": openPalette,        // Mac
 *   "ctrl+k": openPalette,        // Windows/Linux
 * })
 */
export function useHotkeys(keyMap: Record<string, () => void>) {
  useEffect(() => {
    const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().includes("MAC")

    const handler = (e: KeyboardEvent) => {
      // Ignore events from input fields
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return
      }

      // Build normalized combo string
      const comboParts = []

      if (e.ctrlKey && !isMac) comboParts.push("ctrl") // Ctrl only on non-Mac
      if (e.metaKey && isMac) comboParts.push("meta")   // Cmd on Mac
      if (e.shiftKey) comboParts.push("shift")
      if (e.altKey) comboParts.push("alt")

      // Use e.code (physical key) instead of e.key
      // Example: KeyH → h
      const key = e.code.replace(/^Key/, "").replace(/^Digit/, "").toLowerCase()
      comboParts.push(key)

      const combo = comboParts.join("+")

      if (keyMap[combo]) {
        e.preventDefault()
        keyMap[combo]()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [keyMap])
}
