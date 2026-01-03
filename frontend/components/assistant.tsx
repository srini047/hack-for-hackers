"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Mic, Send, X, Volume2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function Assistant() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      content:
        "Hello! I am your accessibility assistant. You can chat with me or use your voice to control the site. How can I help you today?",
    },
  ])
  const [input, setInput] = React.useState("")

  const toggleAssistant = () => setIsOpen(!isOpen)

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    // Mock response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I've received your request. I'm processing it now to help you navigate AccessSubmit.",
        },
      ])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className="w-[400px] max-w-[90vw] shadow-2xl border-2 animate-in slide-in-from-bottom-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-6 w-6" />
              Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleAssistant} aria-label="Close assistant">
              <X className="h-6 w-6" />
            </Button>
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
          </CardContent>
          <CardFooter className="p-4 pt-0 gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Ask me anything..."
                className="h-14 text-lg pr-12 rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-10 w-10"
                onClick={handleSend}
                aria-label="Send message"
              >
                <Send className="h-6 w-6" />
              </Button>
            </div>
            <Button
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
              className="h-14 w-14 rounded-xl"
              onClick={() => setIsListening(!isListening)}
              aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
            >
              <Mic className={cn("h-7 w-7", isListening && "animate-pulse")} />
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex flex-row gap-4">
        <Button
          size="lg"
          variant="secondary"
          className="h-16 w-16 rounded-full shadow-xl border-2 hover:scale-105 transition-transform"
          aria-label="Voice Activation"
        >
          <Volume2 className="h-8 w-8" />
        </Button>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-xl border-2 hover:scale-105 transition-transform"
          onClick={toggleAssistant}
          aria-label="Toggle AI Assistant"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}
