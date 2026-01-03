"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Video, FileVideo, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { speak } from "@/lib/audio-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UploadStepProps {
  onUpload: (file: File) => void
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes

export function UploadStep({ onUpload }: UploadStepProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateAndUploadFile = (file: File) => {
    setError(null)
    setSuccess(null)

    if (!file.type.startsWith("video/")) {
      const errorMsg = "Please upload a valid video file (MP4, MOV, or WebM)"
      setError(errorMsg)
      speak(errorMsg)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `File size exceeds 100MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`
      setError(errorMsg)
      speak(errorMsg)
      return
    }

    const successMsg = `Video uploaded successfully: ${file.name}`
    setSuccess(successMsg)
    speak(successMsg)
    onUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndUploadFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndUploadFile(file)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Submit Your Project</h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload your video walk-through. Our AI will handle the rest—creating your title, description, and more.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-xl font-bold">Upload Error</AlertTitle>
          <AlertDescription className="text-lg">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-primary bg-primary/10 animate-in slide-in-from-top-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <AlertTitle className="text-xl font-bold text-primary">Upload Successful</AlertTitle>
          <AlertDescription className="text-lg text-foreground">{success}</AlertDescription>
        </Alert>
      )}

      <Card
        className={cn(
          "relative border-4 border-dashed rounded-[40px] p-12 md:p-24 transition-all duration-300",
          isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted hover:border-primary/50",
          error && "border-destructive",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-8 p-0">
          <div
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center transition-colors",
              error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
            )}
          >
            <Video className="h-12 w-12" />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Drag and drop your video</h2>
            <p className="text-xl text-muted-foreground">MP4, MOV or WebM (Max 100MB)</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              size="lg"
              className="h-16 flex-1 rounded-2xl text-xl font-bold"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose video file from your computer"
            >
              <Upload className="mr-2 h-6 w-6" /> Choose File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleFileSelect}
              aria-hidden="true"
            />
          </div>

          <div className="flex items-center gap-4 pt-8 text-muted-foreground">
            <FileVideo className="h-6 w-6" />
            <span className="text-lg">Voice command: "Choose file" or "Upload demo"</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
