"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  Save,
  Check,
  Plus,
  Trash2,
  Send,
  Cpu,
  MessageCircle,
  Copy,
  CopyCheck,
} from "lucide-react";
import { speak, getOppositeGenderVoice } from "@/lib/audio-service";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReviewStepProps {
  videoUrl: string;
  initialData?: {
    job_id: string;
    title: string;
    tagline: string;
    readme: string;
    problem_statement: string;
    solution: string;
    tech_stack: string[];
    transcript: string;
    features: string[];
  };
}

export function ReviewStep({ videoUrl, initialData }: ReviewStepProps) {
  const [formData, setFormData] = React.useState({
    title: initialData?.title || "LHD Build",
    tagline: initialData?.tagline || "New Year Countdown",
    readme:
      initialData?.readme || "## What it does\nCalculates the difference between the present time and the new year and displays the result as a countdown\n## How I built it\n- HTML\n- CSS\n- JS\n ## What we learnedLearnt to work in front-end and usage of JS to improve dynamicity.\n## What's next for New Year Countdown- Responsive\n- Added sound\n-A code that runs to greet the user every year through their mails.",
    problem:
      initialData?.problem_statement ||
      "The objective of this project is to design and implement a real-time New Year Countdown application that dynamically calculates and displays the remaining time until the New Year, using front-end web technologies to improve user interaction and responsiveness.",
    solution:
      initialData?.solution ||
      "Calculates the difference between the present time and the new year and displays the result as a countdown.",
    techStack: initialData?.tech_stack || [
      "HTML",
      "CSS",
      "JS",
    ],
    team: [""],
    futureScope:
      "- Improve responsiveness to support multiple screen sizes and devices\n- Integrate sound effects to enhance user experience\n- Implement an automated email greeting system to send New Year wishes to users annually",
  });

  const [isSaved, setIsSaved] = React.useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = React.useState(false);
  const [userGender, setUserGender] = React.useState<"male" | "female">("male");
  const router = useRouter();
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("user-gender");
    if (stored === "male" || stored === "female") {
      setUserGender(stored as "male" | "female");
    }

    const feedbackTimer = setTimeout(() => {
      setShowFeedbackPrompt(true);
      const assistantVoice = getOppositeGenderVoice(userGender);
      speak(
        "Your submission is ready! Would you like to share your experience with AccessSubmit? Your feedback helps us improve accessibility for everyone.",
        assistantVoice
      );
    }, 30000); // 30 seconds

    return () => clearTimeout(feedbackTimer);
  }, [userGender]);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFeedbackYes = () => {
    setShowFeedbackPrompt(false);
    router.push("/feedback");
  };

  const handleFeedbackLater = () => {
    setShowFeedbackPrompt(false);
    const assistantVoice = getOppositeGenderVoice(userGender);
    speak(
      "No problem! You can share feedback anytime from the help page.",
      assistantVoice
    );
  };

  const handleCopy = async () => {
    const payload = {
      videoUrl,
      submission: {
        title: formData.title,
        tagline: formData.tagline,
        readme: formData.readme,
        problem_statement: formData.problem,
        solution: formData.solution,
        tech_stack: formData.techStack,
        team: formData.team,
        future_scope: formData.futureScope,
      },
      initialData: {
        job_id: initialData?.job_id,
        transcript: initialData?.transcript,
        features: initialData?.features,
      },
      copiedAt: new Date().toUTCString(),
    };

    const json = JSON.stringify(payload, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

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
              Help us improve AccessSubmit by sharing your feedback. Your
              insights make the platform better for everyone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleFeedbackLater}
              className="flex-1 h-14 text-lg font-semibold rounded-xl bg-transparent"
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
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
            />
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
              {initialData?.transcript?.substring(0, 150) ||
                "Hello, this is one of the challenges of local hack day, build day one. So I've actually been to time of fact, so without direct"}
            </p>
          </Card>
        </div>

        {/* Editor Side */}
        <Card className="flex flex-col rounded-[32px] border-2 shadow-xl overflow-hidden">
          <CardHeader className="border-b-2 p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-black">
              Edit Submission
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-12 bg-transparent"
                onClick={handleSave}
              >
                {isSaved ? (
                  <Check className="mr-2 h-5 w-5" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isSaved ? "Saved" : "Save Progress"}
              </Button>

              {/* Copy Content as JSON */}
              <Button
                size="lg"
                onClick={handleCopy}
                className="rounded-full h-12 px-8 font-bold"
              >
                {isCopied ? (
                  <>
                    <CopyCheck className="mr-2 h-5 w-5" />
                    Copied
                  </>
                ) : (
                  <>
                    Copy <Copy className="ml-2 h-5 w-5" />
                  </>
                )}
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
                <TabsTrigger
                  value="readme"
                  className="flex-1 text-lg font-bold rounded-xl data-[state=active]:shadow-md"
                >
                  README / Description
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="flex-1 text-lg font-bold rounded-xl data-[state=active]:shadow-md"
                >
                  Team & Links
                </TabsTrigger>
              </TabsList>

              <div className="p-8 space-y-8">
                <TabsContent
                  value="details"
                  className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4"
                >
                  <div className="space-y-4">
                    <Label htmlFor="title" className="text-xl font-bold">
                      Project Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                      className="h-14 text-xl rounded-xl border-2 focus:ring-4 transition-all"
                    />
                  </div>

                  <TabsContent
                    value="readme"
                    className="mt-0 h-full animate-in fade-in slide-in-from-right-4"
                  >
                    <div className="flex flex-col h-full p-8 gap-4">
                      <Label className="text-xl font-bold">
                        README (Markdown)
                      </Label>

                      <Textarea
                        value={formData.readme}
                        onChange={(e) =>
                          setFormData({ ...formData, readme: e.target.value })
                        }
                        className="flex-1 resize-none text-lg rounded-2xl border-2 leading-relaxed overflow-y-auto"
                        placeholder="# Project Title\nDescribe your project here..."
                      />

                      <p className="text-sm text-muted-foreground shrink-0">
                        Supports GitHub-flavored Markdown. This will be used as
                        your project README.
                      </p>
                    </div>
                  </TabsContent>

                  <div className="space-y-4">
                    <Label className="text-xl font-bold">Tech Stack</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.map((tech, i) => (
                        <div
                          key={i}
                          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full flex items-center gap-2 text-lg font-medium border-2"
                        >
                          <Input
                            value={tech}
                            onChange={(e) => {
                              const updated = [...formData.techStack];
                              updated[i] = e.target.value;
                              setFormData({ ...formData, techStack: updated });
                            }}
                            className="h-8 text-base rounded-full bg-transparent border-0 px-2"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full p-0"
                            onClick={() => {
                              const updated = [...formData.techStack];
                              updated.splice(i, 1);
                              setFormData({ ...formData, techStack: updated });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="rounded-full h-11 px-4 border-2 border-dashed bg-transparent"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            techStack: [...formData.techStack, ""],
                          })
                        }
                      >
                        <Plus className="mr-2 h-5 w-5" /> Add Tech
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="readme"
                  className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4"
                >
                  <div className="space-y-4">
                    <Label htmlFor="problem" className="text-xl font-bold">
                      Problem Statement
                    </Label>
                    <Textarea
                      id="problem"
                      value={formData.problem}
                      onChange={(e) =>
                        setFormData({ ...formData, problem: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, solution: e.target.value })
                      }
                      className="min-h-[150px] text-xl rounded-2xl border-2 leading-relaxed"
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="team"
                  className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4"
                >
                  <div className="space-y-4">
                    <Label className="text-xl font-bold">Team Members</Label>
                    <div className="space-y-3">
                      {formData.team.map((member, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={member}
                            onChange={(e) => {
                              const updated = [...formData.team];
                              updated[i] = e.target.value;
                              setFormData({ ...formData, team: updated });
                            }}
                            className="h-12 text-lg rounded-xl"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-12 w-12 rounded-xl"
                            onClick={() => {
                              const updated = [...formData.team];
                              updated.splice(i, 1);
                              setFormData({ ...formData, team: updated });
                            }}
                          >
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl border-2 border-dashed bg-transparent"
                        onClick={() =>
                          setFormData({ ...formData, team: [...formData.team, ""] })
                        }
                      >
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          futureScope: e.target.value,
                        })
                      }
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
  );
}
