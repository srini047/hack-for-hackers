"use client";

import * as React from "react";
import { UploadStep } from "@/components/submission/upload-step";
import { ProcessingStep } from "@/components/submission/processing-step";
import { ReviewStep } from "@/components/submission/review-step";

type Step = "upload" | "processing" | "review";

interface ProjectData {
  job_id: string;
  title: string;
  tagline: string;
  problem_statement: string;
  solution: string;
  tech_stack: string[];
  transcript: string;
  features: string[];
  status?: string;
}

export default function SubmitPage() {
  const [step, setStep] = React.useState<Step>("upload");
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [projectData, setProjectData] = React.useState<ProjectData | null>(
    null
  );
  const [processingError, setProcessingError] = React.useState<string | null>(
    null
  );

  const handleUpload = (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setStep("processing");
  };

  const handleProcessingComplete = (data: ProjectData) => {
    setProjectData(data);
    setStep("review");
  };

  const handleProcessingError = (error: string) => {
    setProcessingError(error);
  };

  return (
    <div className="container px-4 py-12 md:py-20 max-w-7xl mx-auto">
      {step === "upload" && <UploadStep onUpload={handleUpload} />}
      {step === "processing" && (
        <ProcessingStep
          videoFile={videoFile}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      )}
      {step === "review" && videoUrl && projectData && (
        <ReviewStep videoUrl={videoUrl} initialData={projectData} />
      )}
    </div>
  );
}
