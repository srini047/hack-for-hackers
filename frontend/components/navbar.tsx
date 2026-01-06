"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Accessibility, Menu, X, Eye } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAccessibility } from "@/contexts/accessibility-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { colorBlindMode, setColorBlindMode } = useAccessibility()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "Submit Video" },
    { href: "/help", label: "Help Guide" },
    { href: "/feedback", label: "Feedback" },
  ]

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2" aria-label="Access Submit Home">
            <Accessibility className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black tracking-tighter">Access Submit</span>
          </Link>
          <div className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  "text-lg font-medium transition-colors hover:text-primary min-h-[48px]",
                  pathname === link.href ? "text-primary bg-secondary" : "text-muted-foreground",
                )}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-12 w-12 md:px-6 md:w-auto bg-transparent"
                aria-label="Color blindness mode settings"
              >
                <Eye className="h-6 w-6" />
                <span className="sr-only md:not-sr-only md:ml-2">Vision</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Color Blindness Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setColorBlindMode("none")}
                className={cn("text-lg py-3", colorBlindMode === "none" && "bg-secondary")}
              >
                None (Default)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setColorBlindMode("protanopia")}
                className={cn("text-lg py-3", colorBlindMode === "protanopia" && "bg-secondary")}
              >
                Protanopia (Red-Blind)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setColorBlindMode("deuteranopia")}
                className={cn("text-lg py-3", colorBlindMode === "deuteranopia" && "bg-secondary")}
              >
                Deuteranopia (Green-Blind)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setColorBlindMode("tritanopia")}
                className={cn("text-lg py-3", colorBlindMode === "tritanopia" && "bg-secondary")}
              >
                Tritanopia (Blue-Blind)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full h-12 w-12 md:px-6 md:w-auto"
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* <Button size="lg" className="hidden sm:flex rounded-full px-8 font-bold text-lg h-12">
            Sign In
          </Button> */}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-12 w-12"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start text-xl py-8 h-auto",
                pathname === link.href ? "bg-secondary text-primary" : "text-muted-foreground",
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          {/* <Button size="lg" className="w-full rounded-xl py-8 h-auto font-bold text-xl mt-4">
            Sign In
          </Button> */}
        </div>
      )}
    </nav>
  )
}
