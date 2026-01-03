"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Video, FileVideo } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadStepProps {
  onUpload: (file: File) => void
}

export function UploadStep({ onUpload }: UploadStepProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      onUpload(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
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

      <Card
        className={cn(
          "relative border-4 border-dashed rounded-[40px] p-12 md:p-24 transition-all duration-300",
          isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-8 p-0">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Video className="h-12 w-12" />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Drag and drop your video</h2>
            <p className="text-xl text-muted-foreground">MP4, MOV or WebM (Max 500MB)</p>
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
