"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, X, Volume2, MessageSquare, MicOff, Mic, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { speak, getOppositeGenderVoice } from "@/lib/audio-service"
import { useConversation } from "@elevenlabs/react"

type UserGender = "male" | "female"

export function Assistant() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [isWakeWordActive, setIsWakeWordActive] = React.useState(false)
  const [isVoiceConversation, setIsVoiceConversation] = React.useState(false)
  const [userGender, setUserGender] = React.useState<UserGender>("male")
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      content:
        "Hello! I am your accessibility assistant. You can chat with me or use your voice to control the site. Say 'Hey Assistant' to activate me anytime. How can I help you today?",
    },
  ])
  const [input, setInput] = React.useState("")
  const recognitionRef = React.useRef<any>(null)
  const voiceRecognitionRef = React.useRef<any>(null)

  // Load gender preference from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("user-gender")
    if (stored === "male" || stored === "female") {
      setUserGender(stored as UserGender)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
          .toLowerCase()

        // Detect "Hey Assistant" wake word
        if (transcript.includes("hey assistant") || transcript.includes("hey assist")) {
          setIsOpen(true)
          const assistantVoice = getOppositeGenderVoice(userGender)
          speak("Yes, how can I help you?", assistantVoice)
          setIsWakeWordActive(true)
          if (recognitionRef.current) {
            recognitionRef.current.stop()
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.log("[v0] Speech recognition error:", event.error)
      }

      // Start listening for wake word by default
      recognitionRef.current.start()
      setIsListening(true)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [userGender])

  // Setup voice conversation recognition
  React.useEffect(() => {
    if (isVoiceConversation && typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      voiceRecognitionRef.current = new SpeechRecognition()
      voiceRecognitionRef.current.continuous = false
      voiceRecognitionRef.current.interimResults = false
      voiceRecognitionRef.current.lang = "en-US"

      voiceRecognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        console.log("[v0] Voice input:", transcript)

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: transcript }])

        // Mock AI response
        const response = `I heard you say: ${transcript}. I'm processing your request to help you navigate Access Submit.`
        setMessages((prev) => [...prev, { role: "assistant", content: response }])

        // Speak response with opposite gender voice
        const assistantVoice = getOppositeGenderVoice(userGender)
        await speak(response, assistantVoice)

        // Continue listening if voice conversation is still active
        if (isVoiceConversation && voiceRecognitionRef.current) {
          setTimeout(() => {
            voiceRecognitionRef.current?.start()
          }, 500)
        }
      }

      voiceRecognitionRef.current.onerror = (event: any) => {
        console.log("[v0] Voice conversation error:", event.error)
        if (isVoiceConversation && voiceRecognitionRef.current) {
          setTimeout(() => {
            voiceRecognitionRef.current?.start()
          }, 1000)
        }
      }

      voiceRecognitionRef.current.start()
    }

    return () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop()
      }
    }
  }, [isVoiceConversation, userGender])

  const toggleAssistant = () => {
    setIsOpen(!isOpen)
    const assistantVoice = getOppositeGenderVoice(userGender)
    if (!isOpen) {
      speak("Assistant opened", assistantVoice)
    } else {
      speak("Assistant closed", assistantVoice)
      setIsVoiceConversation(false)
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start()
        setIsListening(true)
      }
    }
  }

  const toggleWakeWordListening = () => {
    const assistantVoice = getOppositeGenderVoice(userGender)
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      speak("Wake word listening disabled", assistantVoice)
    } else if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
      speak("Wake word listening enabled. Say Hey Assistant to activate me.", assistantVoice)
    }
  }

  const conversation = useConversation({
    onConnect: () => console.log("[v0] ElevenLabs Connected"),
    onDisconnect: () => console.log("[v0] ElevenLabs Disconnected"),
    onMessage: (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message.message }])
    },
    onError: (error) => console.error("[v0] ElevenLabs Error:", error),
  })

  const toggleVoiceConversation = async () => {
    const assistantVoice = getOppositeGenderVoice(userGender)
    if (conversation.status === "connected") {
      await conversation.endSession()
      setIsVoiceConversation(false)
      speak("Voice conversation ended. You can now type your messages.", assistantVoice)
    } else {
      setIsVoiceConversation(true)
      // Note: agentId would be provided by the user in a real scenario
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "default-agent",
      })
      speak("Voice conversation started. I'm listening. Speak your message.", assistantVoice)
    }
  }

  // Toggle gender preference
  const toggleGender = () => {
    const newGender = userGender === "male" ? "female" : "male"
    setUserGender(newGender)
    localStorage.setItem("user-gender", newGender)
    const assistantVoice = getOppositeGenderVoice(newGender)
    speak(
      `Voice preference updated. I will now respond in a ${newGender === "male" ? "female" : "male"} voice.`,
      assistantVoice,
    )
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    const userInput = input
    setInput("")

    // Mock response
    setTimeout(async () => {
      const response = `I've received your request: "${userInput}". I'm processing it now to help you navigate Access Submit.`
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
        },
      ])
      // Speak response with opposite gender voice
      const assistantVoice = getOppositeGenderVoice(userGender)
      await speak(response, assistantVoice)
    }, 1000)
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3 md:gap-4">
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] max-w-[90vw] shadow-2xl border-2 animate-in slide-in-from-bottom-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold">Assistant</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Add gender toggle button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleGender}
                aria-label={`Current voice: ${userGender === "male" ? "Female" : "Male"}. Click to change`}
                title={`Assistant Voice: ${userGender === "male" ? "Female" : "Male"}`}
              >
                <User className={cn("h-5 w-5", userGender === "male" ? "text-pink-500" : "text-blue-500")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleAssistant} aria-label="Close assistant">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] overflow-y-auto space-y-4 p-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-1 max-w-[85%]",
                  m.role === "assistant" ? "self-start" : "self-end items-end text-right",
                )}
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl text-lg",
                    m.role === "assistant"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {/* Show voice conversation indicator */}
            {isVoiceConversation && (
              <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                <Mic className="h-5 w-5" />
                <span className="text-sm font-semibold">Listening...</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-3 md:p-4 pt-0 gap-2 flex-col">
            {/* Add voice conversation toggle */}
            <Button
              variant={conversation.status === "connected" ? "default" : "outline"}
              size="sm"
              className="w-full h-12 text-base font-semibold"
              onClick={toggleVoiceConversation}
            >
              {conversation.status === "connected" ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Voice Conversation
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Voice Conversation
                </>
              )}
            </Button>

            <div className="relative flex-1 w-full">
              <Input
                placeholder="Ask me anything..."
                className="h-12 md:h-14 text-lg pr-12 rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={isVoiceConversation}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-10 w-10 md:h-12 md:w-12"
                onClick={handleSend}
                aria-label="Send message"
                disabled={isVoiceConversation}
              >
                <Send className="h-6 w-6" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="flex flex-row gap-3 md:gap-4">
        <Button
          size="lg"
          variant={isListening ? "default" : "secondary"}
          className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-xl border-2"
          onClick={toggleWakeWordListening}
          aria-label={isListening ? "Disable Hey Assistant wake word" : "Enable Hey Assistant wake word"}
        >
          {isListening ? (
            <Volume2 className={cn("h-7 w-7 md:h-8 md:w-8", isListening && "animate-pulse text-primary-foreground")} />
          ) : (
            <MicOff className="h-7 w-7 md:h-8 md:w-8" />
          )}
        </Button>
        <Button
          size="lg"
          className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-xl border-2"
          onClick={toggleAssistant}
          aria-label="Toggle AI Assistant"
        >
          <MessageSquare className="h-7 w-7 md:h-8 md:w-8" />
        </Button>
      </div>
    </div>
  )
}
