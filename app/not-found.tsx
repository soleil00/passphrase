import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Home, ArrowLeft, Search } from "lucide-react"

export default function NotFoundAlt() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="flex flex-col items-center text-center max-w-lg">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-70"></div>
          <div className="relative bg-background border border-primary/20 p-6 rounded-full">
            <Shield className="h-16 w-16 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">404 - Page Not Found</h1>

        <p className="text-xl text-muted-foreground mb-4">Oops! This page seems to be missing.</p>

        <p className="text-muted-foreground mb-8 max-w-md">
          The page you&apos;re looking for might have been moved, deleted, or perhaps never existed. Don&apos;t worry, your Pi is
          still safe.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button asChild size="lg" className="flex-1">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Return Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/services">
              <Search className="h-5 w-5 mr-2" />
              Browse Services
            </Link>
          </Button>
        </div>

        <Button asChild variant="ghost" className="mt-6">
          <Link href="javascript:history.back()">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Link>
        </Button>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Need assistance? Our support team is here to help.</p>
          <p className="mt-1">
            <Link href="/support" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

