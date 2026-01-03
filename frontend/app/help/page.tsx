"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Mic,
  Keyboard,
  Command,
  Volume2,
  Eye,
  User,
  MessageSquare,
  Type,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAccessibility } from "@/contexts/accessibility-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Save } from "lucide-react";

export default function HelpPage() {
  const {
    fontFamily: currentFont,
    fontSize: currentSize,
    lineHeight: currentLineHeight,
    letterSpacing: currentSpacing,
    applySettings,
    resetSettings,
  } = useAccessibility();

  const [staged, setStaged] = useState({
    fontFamily: currentFont,
    fontSize: currentSize,
    lineHeight: currentLineHeight,
    letterSpacing: currentSpacing,
  });

  // sync staged state when global state changes (e.g. on mount or external reset)
  useEffect(() => {
    setStaged({
      fontFamily: currentFont,
      fontSize: currentSize,
      lineHeight: currentLineHeight,
      letterSpacing: currentSpacing,
    });
  }, [currentFont, currentSize, currentLineHeight, currentSpacing]);

  const handleApply = () => {
    applySettings(staged);
  };

  const handleReset = () => {
    resetSettings();
  };

  const hotkeys = [
    { keys: "Alt + H", action: "Navigate to Home" },
    { keys: "Alt + S", action: "Open Submission Page" },
    { keys: "Alt + ?", action: "Open this Help Guide" },
    { keys: "Alt + A", action: "Focus AI Assistant" },
    { keys: "Cmd/Ctrl + K", action: "Open Command Palette" },
  ];

  const accessibilityFeatures = [
    {
      icon: Mic,
      title: "Voice Commands & Hey Assistant",
      desc: 'Say "Hey Assistant" anytime to activate the AI assistant. Enable continuous voice conversation mode for hands-free interaction. Gender-adaptive voices provide personalized responses.',
    },
    {
      icon: Eye,
      title: "Color Blindness Mode",
      desc: "Toggle specialized palettes for Protanopia, Deuteranopia, or Tritanopia via the Eye icon in the navigation bar.",
    },
    {
      icon: Command,
      title: "Command Palette",
      desc: "Press Cmd+K to search all features. Every result includes audio confirmation for visually impaired users.",
    },
    {
      icon: Volume2,
      title: "Audio Feedback (ElevenLabs)",
      desc: "Every interaction has audio output. The assistant uses gender-swapped voices for natural conversation: male users hear female voices, female users hear male voices.",
    },
    {
      icon: MessageSquare,
      title: "Voice-to-Voice Chat",
      desc: "Enable voice conversation mode in the assistant to speak your questions and hear responses without typing. Perfect for hands-free navigation.",
    },
    {
      icon: User,
      title: "Gender Voice Preference",
      desc: "Click the user icon in the assistant to toggle your gender preference. This determines the voice gender for all audio responses throughout the site.",
    },
  ];

  return (
    <div className="container max-w-4xl px-4 py-8 md:py-12 lg:py-24">
      <div className="flex flex-col items-center text-center space-y-4 mb-12 md:mb-16">
        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <HelpCircle className="h-8 w-8 md:h-10 md:w-10" />
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight">
          Help & Accessibility Guide
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
          New to AccessSubmit? Learn how to navigate using voice, keyboard, or
          screen readers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
        {accessibilityFeatures.map((item, i) => (
          <div
            key={i}
            className="p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 bg-card space-y-4 hover:shadow-lg transition-shadow"
          >
            <item.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-16 md:mb-20 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl border-2 bg-card space-y-8 md:space-y-12">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2 md:gap-3">
          <Type className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          Dyslexia & Typography Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-lg md:text-xl font-bold">
                Select Font
              </label>
              <Select
                value={staged.fontFamily}
                onValueChange={(val: any) =>
                  setStaged((prev) => ({ ...prev, fontFamily: val }))
                }
              >
                <SelectTrigger className="w-full h-11 md:h-12 text-base md:text-lg">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    System Sans-Serif (Default)
                  </SelectItem>
                  <SelectItem value="dyslexic" className="font-dyslexic">
                    OpenDyslexic
                  </SelectItem>
                  <SelectItem value="comic" className="font-comic">
                    Comic Sans MS
                  </SelectItem>
                  <SelectItem value="lexend" className="font-lexend">
                    Lexend
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-bold text-base md:text-lg">
                  Font Size
                </span>
                <span className="text-primary font-mono text-base md:text-lg">
                  {staged.fontSize}%
                </span>
              </div>
              <Slider
                value={[staged.fontSize]}
                onValueChange={([val]) =>
                  setStaged((prev) => ({ ...prev, fontSize: val }))
                }
                min={80}
                max={150}
                step={5}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-bold text-base md:text-lg">
                  Line Height
                </span>
                <span className="text-primary font-mono text-base md:text-lg">
                  {staged.lineHeight.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[staged.lineHeight]}
                onValueChange={([val]) =>
                  setStaged((prev) => ({ ...prev, lineHeight: val }))
                }
                min={1.2}
                max={2.5}
                step={0.1}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-bold text-base md:text-lg">
                  Letter Spacing
                </span>
                <span className="text-primary font-mono text-base md:text-lg">
                  {staged.letterSpacing.toFixed(2)}em
                </span>
              </div>
              <Slider
                value={[staged.letterSpacing]}
                onValueChange={([val]) =>
                  setStaged((prev) => ({ ...prev, letterSpacing: val }))
                }
                min={0}
                max={0.3}
                step={0.01}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg md:text-xl font-bold">Live Preview</h3>
          <div
            className={`p-6 md:p-8 rounded-2xl bg-secondary/30 text-center transition-all text-base md:text-lg ${
              staged.fontFamily === "dyslexic"
                ? "font-dyslexic"
                : staged.fontFamily === "comic"
                ? "font-comic"
                : staged.fontFamily === "lexend"
                ? "font-lexend"
                : "font-sans"
            }`}
            style={{
              fontSize: `${staged.fontSize}%`,
              lineHeight: staged.lineHeight,
              letterSpacing: `${staged.letterSpacing}em`,
            }}
          >
            The quick brown fox jumps over the lazy dog. Adjust the controls
            above to see how the text changes in real-time before applying it to
            the entire website.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="h-13 md:h-14 px-6 md:px-8 rounded-xl font-bold gap-2 text-base md:text-lg"
              onClick={handleApply}
            >
              <Save className="h-5 w-5" />
              Apply Settings
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 md:h-14 px-6 md:px-8 rounded-xl font-bold gap-2 bg-transparent text-base md:text-lg"
              onClick={handleReset}
            >
              <RotateCcw className="h-5 w-5" />
              Reset to Default
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-16 md:mb-20 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl border-2 bg-gradient-to-br from-primary/5 to-secondary/10">
        <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
          <Mic className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          How to Use Voice Features
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">
              Activating the Assistant
            </h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                Say "Hey Assistant" anywhere on the site to open the AI helper
              </li>
              <li>
                Click the microphone button in the bottom-right corner to toggle
                wake-word listening
              </li>
              <li>Use Alt+A hotkey to focus the assistant instantly</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">
              Voice Conversation Mode
            </h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>Open the assistant and click "Start Voice Conversation"</li>
              <li>
                Speak your questions naturally - no need to press any buttons
              </li>
              <li>
                The assistant will respond with audio using the opposite gender
                voice
              </li>
              <li>Click "Stop Voice Conversation" when you're done</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">
              Audio Input & Output
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Chat messages are automatically read aloud when received</li>
              <li>
                Male users hear female assistant voices, female users hear male
                voices
              </li>
              <li>
                Click the user icon in the assistant to change your gender
                preference
              </li>
              <li>All navigation actions have audio confirmation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-3xl font-black mb-8 flex items-center gap-2">
          <Keyboard className="h-8 w-8" />
          Hotkey Registry
        </h2>
        <div className="rounded-3xl border-2 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 border-b-2">
                <th className="px-6 py-4 text-xl font-bold">Shortcut</th>
                <th className="px-6 py-4 text-xl font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {hotkeys.map((hotkey, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-6 py-6">
                    <kbd className="px-3 py-1.5 rounded-lg border-2 bg-background font-mono text-xl font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                      {hotkey.keys}
                    </kbd>
                  </td>
                  <td className="px-6 py-6 text-xl text-muted-foreground">
                    {hotkey.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              How do I start my submission?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              Simply click the "Upload Video" button on the home page or say
              "Start Submission" to the assistant. You'll be prompted to upload
              a video file of your project demo (max 100MB).
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              What are the video requirements?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              We support standard video formats including MP4, MOV, WEBM, and
              AVI. The maximum file size is 100MB. Larger files will be rejected
              with an audio notification.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              How does the "Hey Assistant" wake word work?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              The site continuously listens for "Hey Assistant" when wake-word
              mode is enabled (indicated by the pulsing microphone icon). Once
              detected, the assistant opens automatically and confirms with
              audio. You can disable this feature by clicking the microphone
              button.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              Can I edit the generated content?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              Yes! After the AI processes your video, you'll be taken to an
              editor where you can review and refine everything from the project
              title to the tech stack. After 30 seconds, you'll be prompted to
              share feedback about your experience.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              How does the feedback system work?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              After completing your submission, you'll receive a feedback prompt
              after 30 seconds. You can share feedback via audio recording or a
              text form. If you start typing, audio recording automatically
              pauses. Visit /feedback anytime to share your experience.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
