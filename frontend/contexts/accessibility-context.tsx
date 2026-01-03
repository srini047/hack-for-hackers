"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia"

interface AccessibilitySettings {
  fontFamily: "default" | "dyslexic" | "comic-sans" | "lexend"
  fontSize: number
  lineHeight: number
  letterSpacing: number
}

interface AccessibilityContextType extends AccessibilitySettings {
  colorBlindMode: ColorBlindMode
  setColorBlindMode: (mode: ColorBlindMode) => void
  applySettings: (settings: AccessibilitySettings) => void
  resetSettings: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontFamily: "default",
  fontSize: 100,
  lineHeight: 1.6,
  letterSpacing: 0.05,
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [colorBlindMode, setColorBlindModeState] = useState<ColorBlindMode>("none")
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    // Load all accessibility state from localStorage on mount
    const storedColor = localStorage.getItem("accessibility-color-blind-mode")
    if (storedColor && ["none", "protanopia", "deuteranopia", "tritanopia"].includes(storedColor)) {
      setColorBlindModeState(storedColor as ColorBlindMode)
    }

    const storedSettings = localStorage.getItem("accessibility-settings")
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings))
      } catch (e) {
        console.error("[v0] Failed to parse stored accessibility settings", e)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement
      // Clean up all font classes before applying new ones
      root.classList.remove("protanopia", "deuteranopia", "tritanopia", "font-dyslexic", "font-comic", "font-lexend")

      if (colorBlindMode !== "none") root.classList.add(colorBlindMode)
      if (settings.fontFamily !== "default") {
        root.classList.add(`font-${settings.fontFamily}`)
      }

      root.style.setProperty("--custom-font-size", `${settings.fontSize}%`)
      root.style.setProperty("--custom-line-height", settings.lineHeight.toString())
      root.style.setProperty("--custom-letter-spacing", `${settings.letterSpacing}em`)

      localStorage.setItem("accessibility-color-blind-mode", colorBlindMode)
      localStorage.setItem("accessibility-settings", JSON.stringify(settings))
    }
  }, [colorBlindMode, settings])

  const applySettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        colorBlindMode,
        setColorBlindMode: setColorBlindModeState,
        ...settings,
        applySettings,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}
