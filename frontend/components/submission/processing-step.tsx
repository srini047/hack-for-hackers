"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface ProcessingStepProps {
  onComplete: () => void
}

export function ProcessingStep({ onComplete }: ProcessingStepProps) {
  const [progress, setProgress] = React.useState(0)
  const [status, setStatus] = React.useState("Uploading video...")

  React.useEffect(() => {
    const statuses = [
      { p: 25, s: "Analyzing video content..." },
      { p: 50, s: "Extracting project features..." },
      { p: 75, s: "Generating submission details..." },
      { p: 90, s: "Finalizing your draft..." },
      { p: 100, s: "Complete!" },
    ]

    const currentIdx = 0
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 1000)
          return 100
        }

        const nextProgress = prev + Math.random() * 5
        const nextStatus = statuses.find((s) => nextProgress >= s.p && prev < s.p)
        if (nextStatus) {
          setStatus(nextStatus.s)
        }

        return nextProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-20 text-center animate-in fade-in slide-in-from-bottom-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Processing Video</h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          Sit back while our AI analyzes your demonstration and prepares your submission.
        </p>
      </div>

      <Card className="border-2 rounded-[40px] p-8 md:p-12 shadow-xl">
        <CardContent className="space-y-8 p-0">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span className="flex items-center gap-3">
              <Spinner className="h-6 w-6" /> {status}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-6 rounded-full" />

          <div className="bg-secondary/30 p-8 rounded-3xl text-left space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">AI Insights Found:</h3>
            <ul className="space-y-3 text-lg">
              <li className={cn("transition-opacity", progress > 30 ? "opacity-100" : "opacity-0")}>
                ✅ Detected 3 unique features in the UI
              </li>
              <li className={cn("transition-opacity", progress > 60 ? "opacity-100" : "opacity-0")}>
                ✅ Identified Tech Stack: React, Tailwind, and Supabase
              </li>
              <li className={cn("transition-opacity", progress > 85 ? "opacity-100" : "opacity-0")}>
                ✅ Generated Problem Statement from audio cues
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
