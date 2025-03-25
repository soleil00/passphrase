"use client"
import type React from "react"
import { Suspense, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getAllUsers, getUserInfo } from "@/redux/slices/auth"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SettingsProvider } from "@/contexts/settings-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { TopNav } from "@/components/top-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        setIsLoading(true)
        try {
          await dispatch(getUserInfo()).unwrap()
          await dispatch(getAllUsers()).unwrap()
        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        router.push("/x7z9q/login")
      }
    }

    fetchData()
  }, [dispatch, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 p-8 rounded-xl">
          <div className="relative">
            <div className="relative z-10">
              <Image src="/logo.png" alt="Logo" width={120} height={120} className="animate-bounce rounded-full duration-2000" />
            </div>

            <div className="absolute inset-0 -m-4 rounded-full bg-primary/10 animate-ping" />
            <div className="absolute inset-0 -m-8 rounded-full bg-primary/5 animate-pulse" />
          </div>

          {/* Loading bar */}
          <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-loading-bar" />
          </div>

          {/* <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading admin dashboard...</p> */}
        </div>
      </div>
    )
  }

  return (
    <SettingsProvider>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-screen flex">
          <AdminSidebar />
          <div className="flex-1 lg:pl-72 transition-all duration-300 ease-in-out">
            <TopNav />
            <div className="container mx-auto p-3 max-w-7xl">
              <main className="w-full">
                <Suspense>{children}</Suspense>
              </main>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </SettingsProvider>
  )
}

