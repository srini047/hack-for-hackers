"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  FileQuestion,
  Search,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { speak } from "@/lib/audio-service";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = React.useState(10);
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => {
    // Announce the error immediately on mount
    const initialMessage =
      "Invalid route. Page not found. Are you looking for Home, Submit, or Help pages? You will be redirected to the home page in 10 seconds.";
    speak(initialMessage);

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          speak("Redirecting you to the home page now.");
          setTimeout(() => {
            router.push("/");
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleNavigation = (path: string, label: string) => {
    speak(`Navigating to ${label}`);
    router.push(path);
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 py-12">
      <Card className="w-full max-w-3xl shadow-2xl border-4 border-destructive/20">
        <CardHeader className="text-center space-y-6 pb-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-5xl md:text-7xl font-black tracking-tight">
            404
          </CardTitle>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Page Not Found</h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              The route you entered is invalid or does not exist.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-secondary px-8 py-4 rounded-2xl">
              <FileQuestion className="h-8 w-8 text-primary" />
              <p className="text-2xl font-bold">Redirecting in {countdown}s</p>
            </div>
            <p className="text-lg text-muted-foreground">
              You will be automatically redirected to the home page, or choose a
              page below:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              size="lg"
              variant="default"
              className="h-24 flex flex-col gap-2 rounded-2xl text-lg"
              onClick={() => handleNavigation("/", "Home")}
            >
              <Home className="h-8 w-8" />
              <span className="font-bold">Home</span>
            </Button>

            <Button
              size="lg"
              variant="default"
              className="h-24 flex flex-col gap-2 rounded-2xl text-lg"
              onClick={() => handleNavigation("/submit", "Submit Video")}
            >
              <Upload className="h-8 w-8" />
              <span className="font-bold">Submit Video</span>
            </Button>

            <Button
              size="lg"
              variant="default"
              className="h-24 flex flex-col gap-2 rounded-2xl text-lg"
              onClick={() => handleNavigation("/help", "Help Guide")}
            >
              <Search className="h-8 w-8" />
              <span className="font-bold">Help Guide</span>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
              <FileQuestion className="h-6 w-6" />
              Voice command: Say "Go home" or "Submit video" or "Help"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
