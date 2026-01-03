"use client"

import * as React from "react"
import { UploadStep } from "@/components/submission/upload-step"
import { ProcessingStep } from "@/components/submission/processing-step"
import { ReviewStep } from "@/components/submission/review-step"

type Step = "upload" | "processing" | "review"

export default function SubmitPage() {
  const [step, setStep] = React.useState<Step>("upload")
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null)

  const handleUpload = (file: File) => {
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
    setStep("processing")
  }

  const handleProcessingComplete = () => {
    setStep("review")
  }

  return (
    <div className="container px-4 py-12 md:py-20 max-w-7xl mx-auto">
      {step === "upload" && <UploadStep onUpload={handleUpload} />}
      {step === "processing" && <ProcessingStep onComplete={handleProcessingComplete} />}
      {step === "review" && videoUrl && <ReviewStep videoUrl={videoUrl} />}
    </div>
  )
}
