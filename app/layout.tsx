"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from "@/contexts/settings-context"
import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Provider } from "react-redux"
import store from "@/redux/store"
import { Footer } from "@/components/footer"
import { PiNetworkProvider } from "@/components/PiProvider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Flowers&Saints Dashboard",
//   description: "A modern, responsive financial dashboard",
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Provider store={store}>
          <PiNetworkProvider>
          <SettingsProvider>
            <TooltipProvider delayDuration={0}>
              <div className="min-h-screen flex">
                <Sidebar />
                <div className="flex-1 lg:pl-72 transition-all duration-300 ease-in-out">
                  <TopNav />
                  <div className="container mx-auto p-3 max-w-7xl">
                    <main className="w-full">
                      <Suspense>
                      {children}
                      </Suspense>
                    </main>
                  </div>
                  <Footer/>
                </div>
              </div>
            </TooltipProvider>
          </SettingsProvider>
          </PiNetworkProvider>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}

