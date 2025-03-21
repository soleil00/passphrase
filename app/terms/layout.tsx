import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Privacy | PiPhrase",
  description: "Terms of Service and Privacy Policy for PiPhrase Pi Recovery Service",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className="min-h-screen bg-background">
    {children}
    <div className="flex justify-center items-center">
      <img src="/faq.png"/>
      </div>
    </main>
}

