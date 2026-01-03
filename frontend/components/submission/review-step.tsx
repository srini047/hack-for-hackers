"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Save, Check, Plus, Trash2, Send, Cpu, MessageCircle } from "lucide-react"
import { speak, getOppositeGenderVoice } from "@/lib/audio-service"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewStepProps {
  videoUrl: string
}

export function ReviewStep({ videoUrl }: ReviewStepProps) {
  const [formData, setFormData] = React.useState({
    title: "EcoTrack: Community Waste Management",
    tagline: "Cleaning our world, one neighbor at a time.",
    problem:
      "Community members struggle to coordinate local cleanup efforts and track impact in real-time. Existing tools are too complex or not accessible enough for everyone to join.",
    solution:
      "EcoTrack provides a voice-controlled interface for reporting waste and organizing cleanup events. It uses real-time mapping to show immediate community impact.",
    techStack: ["Next.js", "Tailwind CSS", "Supabase", "OpenAI API"],
    team: ["Alex Rivera", "Jamie Chen"],
    futureScope: "Integration with local municipality systems for official waste pickup scheduling.",
  })

  const [isSaved, setIsSaved] = React.useState(false)
  const [showFeedbackPrompt, setShowFeedbackPrompt] = React.useState(false)
  const [userGender, setUserGender] = React.useState<"male" | "female">("male")
  const router = useRouter()

  React.useEffect(() => {
    const stored = localStorage.getItem("user-gender")
    if (stored === "male" || stored === "female") {
      setUserGender(stored as "male" | "female")
    }

    const feedbackTimer = setTimeout(() => {
      setShowFeedbackPrompt(true)
      const assistantVoice = getOppositeGenderVoice(userGender)
      speak(
        "Your submission is ready! Would you like to share your experience with AccessSubmit? Your feedback helps us improve accessibility for everyone.",
        assistantVoice
      )
    }, 30000) // 30 seconds

    return () => clearTimeout(feedbackTimer)
  }, [userGender])

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleFeedbackYes = () => {
    setShowFeedbackPrompt(false)
    router.push("/feedback")
  }

  const handleFeedbackLater = () => {
    setShowFeedbackPrompt(false)
    const assistantVoice = getOppositeGenderVoice(userGender)
    speak("No problem! You can share feedback anytime from the help page.", assistantVoice)
  }

  return (
    <>
      <Dialog open={showFeedbackPrompt} onOpenChange={setShowFeedbackPrompt}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              Share Your Experience?
            </DialogTitle>
            <DialogDescription className="text-lg leading-relaxed pt-2">
              Help us improve AccessSubmit by sharing your feedback. Your insights make the platform better for
              everyone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleFeedbackLater}
              className="flex-1 h-14 text-lg font-semibold rounded-xl"
            >
              Maybe Later
            </Button>
            <Button
              size="lg"
              onClick={handleFeedbackYes}
              className="flex-1 h-14 text-lg font-bold rounded-xl"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Share Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-h-[85vh]">
        {/* Video Side */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1 rounded-[32px] overflow-hidden border-2 bg-black relative aspect-video lg:aspect-auto">
            <video src={videoUrl} controls className="w-full h-full object-contain" />
            <div className="absolute top-4 left-4">
              <div className="bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-full flex items-center gap-2 font-bold shadow-lg">
                <Video className="h-5 w-5" /> Reference Video
              </div>
            </div>
          </Card>
          <Card className="p-6 rounded-[24px] border-2 bg-secondary/20">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Cpu className="h-5 w-5" /> AI Transcription Notes
              </CardTitle>
            </CardHeader>
            <p className="text-lg italic text-muted-foreground leading-relaxed">
              "We wanted to make a project that focuses on community engagement... the map updates instantly when a new
              report is filed..."
            </p>
          </Card>
        </div>

        {/* Editor Side */}
        <Card className="flex flex-col rounded-[32px] border-2 shadow-xl overflow-hidden">
          <CardHeader className="border-b-2 p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-black">Edit Submission</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="rounded-full h-12 bg-transparent" onClick={handleSave}>
                {isSaved ? <Check className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                {isSaved ? "Saved" : "Save Progress"}
              </Button>
              <Button size="lg" className="rounded-full h-12 px-8 font-bold">
                Submit <Send className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full h-16 rounded-none border-b-2 bg-secondary/10 p-2 gap-2">
                <TabsTrigger
                  value="details"
                  className="flex-1 text-lg font-bold rounded-xl data-[state=active]:shadow-md"
                >
                  Project Details
                </TabsTrigger>
                <TabsTrigger value="readme" className="flex-1 text-lg font-bold rounded-xl data-[state=active]:shadow-md">
                  README / Description
                </TabsTrigger>
                <TabsTrigger value="team" className="flex-1 text-lg font-bold rounded-xl data-[state=active]:shadow-md">
                  Team & Links
                </TabsTrigger>
              </TabsList>

              <div className="p-8 space-y-8">
                <TabsContent value="details" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <Label htmlFor="title" className="text-xl font-bold">
                      Project Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-14 text-xl rounded-xl border-2 focus:ring-4 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="tagline" className="text-xl font-bold">
                      Tagline
                    </Label>
                    <Input
                      id="tagline"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="h-14 text-xl rounded-xl border-2 focus:ring-4 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xl font-bold">Tech Stack</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.map((tech, i) => (
                        <div
                          key={i}
                          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full flex items-center gap-2 text-lg font-medium border-2"
                        >
                          {tech}
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="rounded-full h-11 px-4 border-2 border-dashed bg-transparent">
                        <Plus className="mr-2 h-5 w-5" /> Add Tech
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="readme" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <Label htmlFor="problem" className="text-xl font-bold">
                      Problem Statement
                    </Label>
                    <Textarea
                      id="problem"
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      className="min-h-[150px] text-xl rounded-2xl border-2 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="solution" className="text-xl font-bold">
                      Solution Description
                    </Label>
                    <Textarea
                      id="solution"
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      className="min-h-[150px] text-xl rounded-2xl border-2 leading-relaxed"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="team" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <Label className="text-xl font-bold">Team Members</Label>
                    <div className="space-y-3">
                      {formData.team.map((member, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={member} className="h-12 text-lg rounded-xl" />
                          <Button variant="destructive" size="icon" className="h-12 w-12 rounded-xl">
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-dashed bg-transparent">
                        <Plus className="mr-2 h-5 w-5" /> Add Member
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="future" className="text-xl font-bold">
                      Future Scope
                    </Label>
                    <Textarea
                      id="future"
                      value={formData.futureScope}
                      onChange={(e) => setFormData({ ...formData, futureScope: e.target.value })}
                      className="min-h-[100px] text-xl rounded-2xl border-2 leading-relaxed"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
