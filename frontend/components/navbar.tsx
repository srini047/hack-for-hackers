"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Accessibility } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "Submit Video" },
    { href: "/help", label: "Help Guide" },
  ]

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2" aria-label="AccessSubmit Home">
            <Accessibility className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black tracking-tighter">AccessSubmit</span>
          </Link>
          <div className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  "text-lg font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary bg-secondary" : "text-muted-foreground",
                )}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full px-6"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button size="lg" className="rounded-full px-8 font-bold text-lg">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  )
}
