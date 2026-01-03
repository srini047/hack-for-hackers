import { Accessibility, Mail, Info, Eye } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30" role="contentinfo">
      <div className="container px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Accessibility className="h-6 w-6 text-primary" />
              <span className="text-xl font-black tracking-tighter">AccessSubmit</span>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Empowering every creator, regardless of ability, to share their vision with the world through accessible
              technology.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Quick Links</h3>
            <ul className="space-y-3 text-lg">
              <li>
                <Link href="/" className="hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:underline underline-offset-4">
                  Submit Project
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:underline underline-offset-4">
                  Share Feedback
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:underline underline-offset-4">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-lg">
          <p>© 2026 AccessSubmit. Built for accessibility first.</p>
        </div>
      </div>
    </footer>
  )
}
