import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles, ShieldCheck, ArrowRight, Mic, Eye, Keyboard, FileText, MessageSquare } from "lucide-react"
import { FeedbackSection } from "@/components/feedback-section"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-32 overflow-hidden" aria-labelledby="hero-title">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center rounded-full border px-3 md:px-4 py-1 md:py-1.5 text-base md:text-lg font-medium bg-secondary/50 text-primary animate-in fade-in slide-in-from-top-4">
            <Sparkles className="mr-2 h-4 w-5" />
            <span className="font-semibold">AI-Powered Project Submission Assistant</span>
          </div>
          <h1 id="hero-title" className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl leading-[1.1]">
            Hackathon Submissions, Zero Barriers.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl dyslexic-spacing leading-relaxed">
            Upload your demo video. Our multimodal AI extracts project metadata, generates comprehensive README files,
            and creates accessible submission documents. Supports screen readers, voice navigation, dyslexia-optimized
            typography, and color blindness modes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="h-14 md:h-16 px-8 md:px-10 rounded-full text-lg md:text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
            >
              <Link href="/submit">
                <Upload className="mr-2 h-5 w-6" />
                Upload Video <ArrowRight className="ml-2 h-5 w-6" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-14 md:h-16 px-8 md:px-10 rounded-full text-lg md:text-xl font-bold border-2 bg-transparent"
            >
              <Link href="/feedback">
                <MessageSquare className="mr-2 h-5 w-6" />
                Feedback
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 pt-8">
            {["Next.js", "ElevenLabs TTS", "Google Gemini", "Mongo DB"].map(
              (tech) => (
                <div
                  key={tech}
                  className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-secondary/60 border text-xs md:text-sm font-mono font-semibold"
                >
                  {tech}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary rounded-full blur-[120px]" />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/10" aria-labelledby="features-title">
        <div className="container px-4 md:px-6">
          <h2 id="features-title" className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-4">
            Built for Universal Accessibility
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            WCAG 2.2 Level AAA compliant. Every interaction is keyboard, voice, and screen-reader accessible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Dyslexia-Optimized",
                desc: "1.6x line height, increased letter spacing, and high-contrast semantic color tokens for cognitive accessibility.",
                icon: FileText,
                color: "text-blue-500",
              },
              {
                title: "Voice Navigation",
                desc: '"Hey Assistant" wake-word detection with ElevenLabs TTS feedback. Navigate via hotkeys.',
                icon: Mic,
                color: "text-green-500",
              },
              {
                title: "Vision Modes",
                desc: "Protanopia, Deuteranopia, and Tritanopia color palettes. Dark/light theme switching with persistent state.",
                icon: Eye,
                color: "text-purple-500",
              },
              {
                title: "Screen Reader First",
                desc: "Semantic HTML5, ARIA labels, live regions, and keyboard focus management. Tested with NVDA and JAWS.",
                icon: ShieldCheck,
                color: "text-orange-500",
              },
              {
                title: "Keyboard-Only Control",
                desc: "Cmd+K command palette, global hotkeys, and skip-to-content links. Zero mouse dependency.",
                icon: Keyboard,
                color: "text-red-500",
              },
              {
                title: "Multimodal AI",
                desc: "Video transcription, object detection, and OCR for comprehensive project analysis and metadata extraction.",
                icon: Sparkles,
                color: "text-yellow-500",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-start space-y-4 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-background border-2 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 flex items-center justify-center ${f.color}`}>
                  <f.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">{f.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16 md:py-24 bg-secondary/10" aria-labelledby="demo-title">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 md:space-y-6 mb-12">
            <h2 id="demo-title" className="text-3xl md:text-5xl lg:text-6xl font-black">
              See It In Action
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Watch how AccessSubmit transforms a demo video into a complete hackathon submission in under 2 minutes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="rounded-2xl md:rounded-[40px] border-2 md:border-4 overflow-hidden shadow-2xl bg-black">
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="AccessSubmit Demo Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    aria-label="Demo video showing AccessSubmit features and workflow"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <FeedbackSection />
    </div>
  )
}
