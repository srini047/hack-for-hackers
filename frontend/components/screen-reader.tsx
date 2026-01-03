"use client";

import type React from "react";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { speak } from "@/lib/audio-service";
import { useRouter } from "next/navigation";

export function ScreenReaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().includes("MAC");

  useHotkeys({
    [isMac ? "meta+shift+h" : "ctrl+shift+h"]: () => {
      speak("Navigating to Home");
      router.push("/");
    },

    [isMac ? "meta+shift+s" : "ctrl+shift+s"]: () => {
      speak("Opening Submission Page");
      router.push("/submit");
    },

    [isMac ? "meta+shift+f" : "ctrl+shift+f"]: () => {
      speak("Opening Feedback Page");
      router.push("/feedback");
    },

    [isMac ? "meta+?" : "ctrl+?"]: () => {
      speak("Opening Help Guide");
      router.push("/help");
    },

    [isMac ? "meta+shift+a" : "ctrl+shift+a"]: () => {
      speak("Activating Assistant");
    },

    [isMac ? "meta+k" : "ctrl+k"]: () => {
      speak("Opening Command Palette");
    },
  });

  return <>{children}</>;
}
