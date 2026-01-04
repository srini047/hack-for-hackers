"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import { ScreenReaderProvider } from "@/components/screen-reader";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Assistant } from "@/components/assistant";
import { CommandPalette } from "@/components/command-palette";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AccessibilityProvider>
        <ScreenReaderProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* <Assistant /> */}
          <CommandPalette />
        </ScreenReaderProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
