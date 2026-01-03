"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Home, Upload, HelpCircle, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { speak } from "@/lib/audio-service"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
        if (!open) speak("Command palette opened. Type to find pages or actions.")
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="max-h-[300px] sm:max-h-[450px]">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                speak("Navigating home")
                router.push("/")
              })
            }
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                speak("Navigating to submission")
                router.push("/submit")
              })
            }
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Submit Video</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                speak("Navigating to help")
                router.push("/help")
              })
            }
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help Guide</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                speak("Navigating feedback")
                router.push("/feedback")
              })
            }
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Feedback Submission</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                speak("Light mode activated")
                setTheme("light")
              })
            }
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                speak("Dark mode activated")
                setTheme("dark")
              })
            }
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
