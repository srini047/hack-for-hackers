"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface ProcessingStepProps {
  videoFile: File | null;
  onComplete: (data: any) => void;
  onError: (error: string) => void;
}

interface ProjectData {
  job_id: string;
  title: string;
  tagline: string;
  problem_statement: string;
  solution: string;
  tech_stack: string[];
  transcript: string;
  features: string[];
}

export function ProcessingStep({
  videoFile,
  onComplete,
  onError,
}: ProcessingStepProps) {
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState("Uploading video...");
  const [insights, setInsights] = React.useState<string[]>([]);
  const hasStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (!videoFile) {
      onError("No video file provided");
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const uploadVideo = async () => {
      try {
        const formData = new FormData();
        formData.append("video", videoFile);

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

        setProgress(25);
        setStatus("Uploading video...");

        const response = await fetch(`${baseUrl}/api/project/create`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        setProgress(50);
        setStatus("Analyzing video content...");
        setInsights(["✅ Video uploaded successfully"]);

        const projectData: ProjectData = await response.json();

        setProgress(75);
        setStatus("Extracting project features...");
        setInsights((prev) => [
          ...prev,
          `✅ Detected ${projectData.features?.length ?? 0} features`,
        ]);

        setProgress(90);
        setStatus("Generating submission details...");
        setInsights((prev) => [
          ...prev,
          `✅ Identified Tech Stack: ${
            projectData.tech_stack?.join(", ") || "N/A"
          }`,
        ]);

        setProgress(100);
        setStatus("Complete!");
        setInsights((prev) => [
          ...prev,
          "✅ Generated submission details from video",
        ]);

        setTimeout(() => {
          onComplete(projectData);
        }, 1000);
      } catch (err) {
        console.error("[ProcessingStep] error:", err);
        onError(err instanceof Error ? err.message : "Failed to process video");
      }
    };

    uploadVideo();
  }, [videoFile, onComplete, onError]);

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-20 text-center animate-in fade-in slide-in-from-bottom-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          Processing Video
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          Sit back while our AI analyzes your demonstration and prepares your
          submission.
        </p>
      </div>

      <Card className="border-2 rounded-[40px] p-8 md:p-12 shadow-xl">
        <CardContent className="space-y-8 p-0">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span className="flex items-center gap-3">
              <Spinner className="h-6 w-6" /> {status}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-6 rounded-full" />

          <div className="bg-secondary/30 p-8 rounded-3xl text-left space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">
              AI Insights Found:
            </h3>
            <ul className="space-y-3 text-lg">
              {insights.map((insight, idx) => (
                <li
                  key={idx}
                  className="animate-in fade-in slide-in-from-left-4"
                >
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
