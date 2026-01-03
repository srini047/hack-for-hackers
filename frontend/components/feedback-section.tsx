"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, FileText, Send, Check, AlertCircle } from "lucide-react"
import { speak } from "@/lib/audio-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

type FeedbackMode = "idle" | "audio" | "form"

export function FeedbackSection() {
  const [mode, setMode] = useState<FeedbackMode>("idle")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [textFeedback, setTextFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (mode === "form" && isRecording) {
      stopRecording()
      speak("Audio recording paused. Switching to text form.")
    }
  }, [mode])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        console.log("[v0] Audio recorded:", audioBlob.size, "bytes")
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      speak("Audio recording started")

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError("Microphone access denied. Please enable microphone permissions.")
      speak("Microphone access denied")
      console.error("[v0] Recording error:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      speak("Audio recording stopped")
    }
  }

  const handleAudioMode = async () => {
    if (mode === "audio" && isRecording) {
      stopRecording()
      setMode("idle")
    } else {
      setMode("audio")
      await startRecording()
    }
  }

  const handleFormMode = () => {
    setMode("form")
    speak("Switched to text feedback form")
  }

  const handleSubmitText = async () => {
    if (!textFeedback.trim()) {
      setError("Please enter your feedback before submitting.")
      return
    }

    setError(null)
    console.log("[v0] Text feedback submitted:", textFeedback)
    speak("Thank you for your feedback")
    setSubmitted(true)
    setTextFeedback("")

    setTimeout(() => {
      setSubmitted(false)
      setMode("idle")
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <section className="py-24 bg-secondary/10">
      <div className="container px-4 md:px-8 max-w-3xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-black">Help Us Improve</h2>
          <p className="text-xl text-muted-foreground">
            Share your experience with audio recording or text form. Your feedback shapes accessibility for all.
          </p>
        </div>

        <div className="rounded-3xl border-2 p-8 md:p-12 bg-background shadow-xl space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {submitted && (
            <Alert className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
              <Check className="h-5 w-5" />
              <AlertDescription className="text-base ml-2 font-semibold">
                Feedback submitted successfully! Thank you for helping us improve.
              </AlertDescription>
            </Alert>
          )}

          {mode === "idle" && (
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button
                  size="lg"
                  className="flex-1 h-16 text-lg font-bold rounded-xl"
                  onClick={handleAudioMode}
                  variant="default"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Record Audio Feedback
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-16 text-lg font-bold rounded-xl bg-transparent"
                  onClick={handleFormMode}
                  variant="outline"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Write Text Feedback
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Audio recording automatically pauses if you switch to the text form. All feedback is encrypted and
                anonymous.
              </p>
            </div>
          )}

          {mode === "audio" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div
                    className={`h-32 w-32 rounded-full flex items-center justify-center ${
                      isRecording
                        ? "bg-red-500/20 border-4 border-red-500 animate-pulse"
                        : "bg-primary/20 border-4 border-primary"
                    }`}
                  >
                    {isRecording ? <Mic className="h-16 w-16 text-red-500" /> : <MicOff className="h-16 w-16" />}
                  </div>
                  {isRecording && (
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 rounded-full animate-ping" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono">{formatTime(recordingTime)}</p>
                  <p className="text-base text-muted-foreground mt-2">
                    {isRecording ? "Recording in progress..." : "Ready to record"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-bold rounded-xl"
                  onClick={stopRecording}
                  variant="destructive"
                  disabled={!isRecording}
                >
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-bold rounded-xl"
                  onClick={() => setMode("idle")}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {mode === "form" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-3">
                <Label htmlFor="feedback" className="text-xl font-bold">
                  Your Feedback
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your experience with AccessSubmit. What worked well? What could be improved?"
                  value={textFeedback}
                  onChange={(e) => setTextFeedback(e.target.value)}
                  className="min-h-[200px] text-lg p-4 resize-none dyslexic-spacing"
                  aria-label="Feedback text area"
                />
                <p className="text-sm text-muted-foreground">{textFeedback.length} / 2000 characters</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-bold rounded-xl"
                  onClick={handleSubmitText}
                  disabled={!textFeedback.trim()}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Submit Feedback
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-bold rounded-xl"
                  onClick={() => setMode("idle")}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
