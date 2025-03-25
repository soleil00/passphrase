"use client"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Loader, LogIn } from "lucide-react"
import { PibrowserModal } from "./pibrowser-modal"
import { authenticateUser, initializePiSDK, logout } from "@/redux/slices/auth"

export function TopNav() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { settings } = useSettings()
  const { currentUser, isPiBrowser, loading: isLoading } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const isAdmin = pathname.startsWith("/control-panel-x7z9q")

  const handlePiAuth = async () => {
    if (!isPiBrowser) {
      setOpen(true)
      return
    }

    setLoading(true)

    try {
      await dispatch(initializePiSDK()).unwrap()
      const result = await dispatch(authenticateUser()).unwrap()
    } catch (error) {
      setLoading(false)
      if (process.env.NODE_ENV !== "production") {
        console.error("Authentication failed:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = (username:string) => {
    if (!username) return ""
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background lg:ml-0">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={segment}>
                <span className="text-muted-foreground">/</span>
                <Link href={`/${pathSegments.slice(0, index + 1).join("/")}`} className="text-sm font-medium">
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div className="md:hidden">PRS</div>
        <div className="flex items-center gap-4">
          {/* <Notifications /> */}
          <ThemeToggle />
          {!currentUser ? (
            <Button variant="default" size="sm" className="w-full" onClick={handlePiAuth} disabled={loading}>
              {loading ? <Loader size="small" className="h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={currentUser.username} />
                    <AvatarFallback>{getUserInitials(currentUser.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem asChild>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => dispatch(logout())}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <PibrowserModal isOpen={open} onClose={() => setOpen(false)} />
    </header>
  )
}

