import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Video, Sparkles, ShieldCheck, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="hero-title">
        <div className="container px-4 md:px-8 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-lg font-medium bg-secondary/50 text-primary animate-in fade-in slide-in-from-top-4">
            <Sparkles className="mr-2 h-5 w-5" />
            AI-Powered Accessibility
          </div>
          <h1 id="hero-title" className="text-5xl md:text-8xl font-black tracking-tight max-w-4xl leading-[1.1]">
            Your Voice, Your Video, Your Submission.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl dyslexic-spacing leading-relaxed">
            Upload your project demo video and let our AI generate your hackathon submission, README, and project
            details. Accessible, dyslexia-friendly, and voice-controlled.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Button
              asChild
              size="lg"
              className="h-16 px-10 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform"
            >
              <Link href="/submit">
                Get Started <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-full text-xl font-bold border-2 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/10" aria-labelledby="features-title">
        <div className="container px-4 md:px-8">
          <h2 id="features-title" className="text-4xl md:text-5xl font-bold text-center mb-16">
            Designed for Every Ability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Dyslexia Friendly",
                desc: "High-contrast themes, dyslexia-optimized typography, and spacious layouts for easier reading.",
                icon: ShieldCheck,
              },
              {
                title: "Voice Controlled",
                desc: "Every button, field, and interaction is accessible via voice commands for hands-free navigation.",
                icon: Video,
              },
              {
                title: "AI Video Analysis",
                desc: "We extract project titles, tech stacks, and descriptions directly from your video walk-through.",
                icon: Sparkles,
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-background border-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold">{f.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Preview */}
      <section className="py-24">
        <div className="container px-4 md:px-8">
          <div className="rounded-[40px] border-4 p-8 md:p-16 bg-card shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black">How It Works</h2>
                <ol className="space-y-6">
                  {[
                    "Upload your video walk-through",
                    "AI analyzes and generates content",
                    "Review side-by-side with video",
                    "Edit and submit to hackathons",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-6">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                        {i + 1}
                      </span>
                      <span className="text-2xl font-medium pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
                <Button size="lg" className="h-14 rounded-full text-lg px-8">
                  Try it now
                </Button>
              </div>
              <div className="aspect-video rounded-3xl border-2 bg-secondary/20 flex items-center justify-center shadow-inner overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40">
                      <Upload className="h-10 w-10" />
                    </div>
                    <p className="text-2xl font-bold">Upload Demo Video</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
