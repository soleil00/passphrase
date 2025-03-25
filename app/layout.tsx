"use client"

import "./globals.css"
import { Inter } from 'next/font/google'
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
import { TermsAndConditionsModal } from "@/components/terms-conditions"
import WarningBanner from "@/components/banner"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { usePathname } from "next/navigation"
import LoadSCript from "@/components/script-loader"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isAdmin = pathname.startsWith("/control-panel-x7z9q")
  const isLogin = pathname.startsWith("/x7z9q/login")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="title" content="PRT - Pi unlock protection and Passphrase recovery tool" />
        <meta name="description" content="Wallet key is exposed and all Pi is drained? Don't worry, Dapp piphrase.com will support you to safely retrieve the Pi that is about to be unlocked from the thief!" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="PRT - Pi unlock protection and Passphrase recovery tool" />
        <meta property="og:description" content="Wallet key is exposed and all Pi is drained? Don't worry, Dapp piphrase.com will support you to safely retrieve the Pi that is about to be unlocked from the thief!" />
        <meta property="og:image" content="https://piphrase.com/logo.png" />
        <meta property="og:url" content="https://piphrase.com" /> 
        <meta property="og:site_name" content="Passphrase Recovery  Tool" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PRT - Pi unlock protection and Passphrase recovery tool" />
        <meta name="twitter:description" content="Wallet key is exposed and all Pi is drained? Don't worry, Dapp piphrase.com will support you to safely retrieve the Pi that is about to be unlocked from the thief!" />
        <meta name="twitter:image" content="/logo.png" /> 
        <meta name="twitter:site" content="@soleil005" /> 

        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="image_src" href="/logo.png" /> 

        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://piphrase.com/" /> 

        <meta name="keywords" content="Pi Games,GameFi,PRS,PRT,passphrase recovery, GFP, decentralized gaming, multiplayer games,PCM,Pichainmall, Pi Chain Mall, real-time gaming, Pi Network, blockchain gaming, win Pi coins, play to earn, gaming platform, decentralized multiplayer platform" />

        <meta name="author" content="Passphrase recover" /> 

        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="theme-color" content="#0F1226" /> 

        <title>Passphrase Recover Tool</title>
        <meta httpEquiv="pragram" content="no-cache" />
        <meta
          httpEquiv="cache-control"
          content="no-cache, no-store, must-revalidate"
        />
        <script>
          {`var coverSupport = 'CSS' in window && typeof CSS.supports === 'function' && 
          (CSS.supports('top: env(a)') || CSS.supports('top: constant(a)'));
          document.write('<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0' + 
          (coverSupport ? ', viewport-fit=cover' : '') + '" />');`}
        </script>
        <script src="https://sdk.minepi.com/pi-sdk.js" async></script>
       
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Provider store={store}>
            {isLogin ? (
              <Suspense>
                {children}
              </Suspense>
            ) : isAdmin ? (
              <main>{children}</main>
            ) : (
              <PiNetworkProvider>
                <SettingsProvider>
                  <TooltipProvider delayDuration={0}>
                    <div className="min-h-screen flex">
                      <Sidebar/>
                      <div className="flex-1 lg:pl-72 transition-all duration-300 ease-in-out">
                        <TopNav />
                        <WarningBanner
                          type="danger"
                          message="Agree to Authorize the service only if your Wallet Passphrase is Exposed!.The processing may succeed or fail"
                          icon="alert"
                        />
                        <div className="container mx-auto p-3 max-w-7xl">
                          <main className="w-full">
                            <Suspense>{children}</Suspense>
                          </main>
                        </div>
                        <Footer />
                      </div>
                    </div>
                    <TermsAndConditionsModal />
                  </TooltipProvider>
                </SettingsProvider>
              </PiNetworkProvider>
            )}
            <LoadSCript/>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}