"use client"

import type React from "react"

import { useHotkeys } from "@/hooks/use-hotkeys"
import { speak } from "@/lib/audio-service"
import { useRouter } from "next/navigation"

export function ScreenReaderProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useHotkeys({
    "alt+h": () => {
      speak("Navigating to Home")
      router.push("/")
    },
    "alt+s": () => {
      speak("Opening Submission Page")
      router.push("/submit")
    },
    "alt+?": () => {
      speak("Opening Help Guide")
      router.push("/help")
    },
    "alt+a": () => {
      speak("Activating Assistant")
      // Logic to focus assistant input
    },
  })

  return <>{children}</>
}
