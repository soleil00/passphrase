"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  PenTool,
  PlusCircle,
  ClipboardList,
  Users,
  Settings,
  BarChart2,
  Bell,
  Shield,
  Lock,
  HelpCircle,
  ChevronLeft,
  Menu,
  Ruler,
  LogOut,
  BadgeAlert,
  Search,
  Server,
  Star,
  LucideMapPinCheckInside,
  DollarSign,
  CrossIcon,
  Timer,
  ServerCog,
  Wand,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useAppSelector } from "@/redux/hooks"



const adminSettings = [
  { name: "Settings", href: "/control-panel-x7z9q/settings", icon: Settings },
  { name: "Security", href: "/control-panel-x7z9q/security", icon: Shield },
]

const bottomNavigation = [
  { name: "Privacy", href: "/privacy", icon: Lock },
  { name: "Terms", href: "/terms", icon: Ruler },
  { name: "Support", href: "/support", icon: HelpCircle },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const {requests} = useAppSelector(state => state.requests)
  const {currentUser} = useAppSelector(state => state.auth)

  const adminNavigation = [
    { name: "Dashboard", href: "/control-panel-x7z9q", icon: Home },
    { name: "All Requests", href: "/control-panel-x7z9q/requests", icon: ClipboardList, badge: `${requests.length}` },
    // ...(currentUser?.isSuperAdmin ? [{ name: "Recover", href: "/control-panel-x7z9q/recover", icon: Server }] : []),
    { name: "Recover", href: "/control-panel-x7z9q/recover", icon: Wand },
    { name: "Pending", href: "/control-panel-x7z9q/pending", icon: Timer },
    { name: "Processing", href: "/control-panel-x7z9q/processing", icon: ServerCog },
    { name: "Completed", href: "/control-panel-x7z9q/completed", icon: LucideMapPinCheckInside },
    { name: "Rejected", href: "/control-panel-x7z9q/rejected", icon: CrossIcon },
    { name: "Reviews", href: "/control-panel-x7z9q/reviews", icon: Star },
    // { name: "Earnigs", href: "/control-panel-x7z9q/earnings", icon: DollarSign },
    { name: "Users", href: "/control-panel-x7z9q/users", icon: Users, badge: "3" },
    { name: "Search", href: "/control-panel-x7z9q/search", icon: Search },
  ]

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleLogout = () => {
    // Implement logout functionality here
    console.log("Logging out...")
  }

  const NavItem = ({
    item,
    isBottom = false,
  }: {
    item: { href: string; name: string; icon: React.ElementType; badge?: string }
    isBottom?: boolean
  }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          onClick={() => isMobileOpen && handleMobileToggle()}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
            pathname === item.href
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            isCollapsed && "justify-center px-2",
          )}
        >
          <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && (
            <>
              <span>{item.name}</span>
              {/* {item.badge && (
                <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground">
                  {item.badge}
                </Badge>
              )} */}
            </>
          )}
          {/* {isCollapsed && item.badge && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
            >
              {item.badge}
            </Badge>
          )} */}
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.name}
          {item.badge && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      )}
    </Tooltip>
  )

  const NavSection = ({ title, items }: { title?: string; items: any[] }) => (
    <div className="space-y-1">
      {title && !isCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      )}
      {items.map((item) => (
        <NavItem key={item.name} item={item} />
      ))}
    </div>
  )

  return (
    <TooltipProvider>
      <>
        {/* Mobile menu toggle button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={handleMobileToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="border-b border-border">
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {!isCollapsed && (
                <Link href="/control-panel-x7z9q" className="flex items-center font-semibold">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-lg">Admin Panel</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-4 px-2 space-y-6">
            <NavSection items={adminNavigation} />
            {/* <NavSection title="Administration" items={adminSettings} /> */}
          </div>
          <div className="border-t border-border p-2 space-y-4">
            {/* <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav> */}

            {!isCollapsed && (
              <div className="px-3 py-2">
                {/* <GoogleTranslate /> */}
              </div>
            )}

            <div className="px-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className={cn("w-full justify-start", isCollapsed && "justify-center px-0")}
              >
                <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}

