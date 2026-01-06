"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, MicOff, Send, CheckCircle } from "lucide-react";
import { speak, getOppositeGenderVoice } from "@/lib/audio-service";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [disabilityType, setDisabilityType] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [feedbackMode, setFeedbackMode] = React.useState<"form" | "audio">(
    "form"
  );
  const [userGender, setUserGender] = React.useState<"male" | "female">("male");
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const stored = localStorage.getItem("user-gender");
    if (stored === "male" || stored === "female")
      setUserGender(stored as "male" | "female");

    const assistantVoice = getOppositeGenderVoice(userGender);
    speak(
      "Welcome to the feedback page. Please share your experience with Platform.",
      assistantVoice
    );
  }, []);

  React.useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  React.useEffect(() => {
    if (!isSubmitted) return;

    const assistantVoice = getOppositeGenderVoice(userGender);

    const timeout = setTimeout(() => {
      speak(
        "You are being redirected to the home page",
        assistantVoice
      );
      router.push("/");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isSubmitted, router, userGender]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) =>
        audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedbackMode("audio");
      const assistantVoice = getOppositeGenderVoice(userGender);
      speak("Recording started. Share your feedback now.", assistantVoice);
    } catch (error) {
      console.error("Microphone access denied:", error);
      const assistantVoice = getOppositeGenderVoice(userGender);
      speak(
        "Unable to access microphone. Please check your permissions.",
        assistantVoice
      );
    }
  };

  const stopRecording = () => {
    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve();
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        setAudioBlob(blob);
        setIsRecording(false);

        const assistantVoice = getOppositeGenderVoice(userGender);
        speak(
          "Recording stopped. Submitting your audio feedback now.",
          assistantVoice
        );

        await submitFeedback();

        resolve();
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    });
  };

  const handleFormFocus = () => {
    if (isRecording) stopRecording();
    setFeedbackMode("form");
  };

  const submitFeedback = async () => {
    const assistantVoice = getOppositeGenderVoice(userGender);

    speak(
      "Submitting your feedback. Thank you for helping us improve Access Submit.",
      assistantVoice
    );

    let audioBase64: string | null = null;

    if (audioBlob) {
      audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
    }

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          disabilityType,
          feedbackText: feedback || null,
          audioBase64,
        }),
      });

      setIsSubmitted(true);
      speak(
        "Your feedback has been submitted successfully. We appreciate your input.",
        assistantVoice
      );
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      speak(
        "There was an error submitting your feedback. Please try again later.",
        assistantVoice
      );
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRecording) {
      await stopRecording();
    }

    await submitFeedback();
  };

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 md:py-24">
        <Card className="border-2 shadow-xl">
          <CardContent className="pt-16 pb-16 flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-center">
              Thank You!
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Your feedback has been recorded. Your insights help us build a
              more accessible platform for everyone.
            </p>
            <Button size="lg" className="mt-4 h-14 px-8 text-lg" asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 md:py-20">
      <div className="space-y-6 mb-12">
        <h1 className="text-4xl md:text-6xl font-black">Share Your Feedback</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Your experience matters. Help us improve Access Submit by sharing your
          thoughts via audio recording or the form below.
        </p>
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Feedback Form
          </CardTitle>
          <CardDescription className="text-base">
            All fields except disability type are optional. Your feedback is
            anonymous and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitFeedback} className="space-y-8">
            {/* Audio Recording Section */}
            <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border-2">
              <Label className="text-xl font-bold flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audio Feedback (Optional)
              </Label>
              <p className="text-sm text-muted-foreground">
                Record your feedback using your voice. Recording will
                automatically pause if you start typing in the form.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className="flex-1 h-14 text-lg font-semibold"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-5 w-5" />
                      Stop Recording ({recordingTime}s)
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Start Audio Recording
                    </>
                  )}
                </Button>
              </div>
              {isRecording && (
                <div className="flex items-center gap-3 text-red-500 animate-pulse">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold">
                    Recording in progress...
                  </span>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={handleFormFocus}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-lg font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFormFocus}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="disability" className="text-lg font-semibold">
                  Type of Disability{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Select
                  value={disabilityType}
                  onValueChange={setDisabilityType}
                >
                  <SelectTrigger
                    id="disability"
                    className="h-14 text-lg"
                    onFocus={handleFormFocus}
                  >
                    <SelectValue placeholder="Select if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual Impairment</SelectItem>
                    <SelectItem value="hearing">Hearing Impairment</SelectItem>
                    <SelectItem value="motor">
                      Motor/Physical Disability
                    </SelectItem>
                    <SelectItem value="cognitive">
                      Cognitive Disability
                    </SelectItem>
                    <SelectItem value="dyslexia">Dyslexia</SelectItem>
                    <SelectItem value="colorblind">Color Blindness</SelectItem>
                    <SelectItem value="multiple">
                      Multiple Disabilities
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="none">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="feedback" className="text-lg font-semibold">
                  Feedback / Comments
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your experience with Access Submit. What worked well? What could be improved?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  onFocus={handleFormFocus}
                  className="min-h-[200px] text-lg resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-16 text-xl font-bold rounded-xl"
              disabled={!name && !email && !feedback && !audioBlob}
            >
              <Send className="mr-2 h-6 w-6" />
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
