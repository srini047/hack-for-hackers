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
          <aside role="complementary" aria-label="Voice assistant">
            <elevenlabs-convai agent-id="agent_0101kf5ctmk5f0bav1r03q66vkgj"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
          </aside>
          {/* <Assistant /> */}
          <CommandPalette />
        </ScreenReaderProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
