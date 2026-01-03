import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Mic, MousePointer2, Keyboard, Eye } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:py-24">
      <div className="flex flex-col items-center text-center space-y-4 mb-16">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <HelpCircle className="h-10 w-10" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Help & Accessibility Guide</h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
          New to AccessSubmit? Learn how to navigate using voice, keyboard, or screen readers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[
          {
            icon: Mic,
            title: "Voice Commands",
            desc: "Use 'Hey Assistant' or click the microphone to navigate. Commands like 'Upload Video' or 'Go Home' work anywhere.",
          },
          {
            icon: Keyboard,
            title: "Keyboard Navigation",
            desc: "Our site follows strict WCAG standards. Use Tab to move and Enter to select. Every element has clear focus states.",
          },
          {
            icon: Eye,
            title: "Visual Comfort",
            desc: "Toggle High Contrast or Dyslexia-friendly fonts using the accessibility menu in the bottom right.",
          },
          {
            icon: MousePointer2,
            title: "Large Targets",
            desc: "All buttons and inputs are designed with large touch targets (minimum 44x44px) for easy interaction.",
          },
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-3xl border-2 bg-card space-y-4">
            <item.icon className="h-8 w-8 text-primary" />
            <h3 className="text-2xl font-bold">{item.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              How do I start my submission?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              Simply click the "Get Started" button on the home page or say "Start Submission". You'll be prompted to
              upload a video file of your project demo.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              What file formats are supported?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              We support standard video formats including MP4, MOV, and WebM. Max file size is 500MB.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-b-2 py-4">
            <AccordionTrigger className="text-2xl font-bold hover:no-underline text-left">
              Can I edit the generated content?
            </AccordionTrigger>
            <AccordionContent className="text-xl text-muted-foreground leading-relaxed pt-4">
              Yes! After the AI processes your video, you'll be taken to an editor where you can review and refine
              everything from the project title to the tech stack.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
