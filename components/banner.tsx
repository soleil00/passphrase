"use client"

import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react"
import { useState } from "react"

interface WarningBannerProps {
  type?: "warning" | "info" | "danger"
  message: string
  subMessage?: string
  icon?: "alert" | "info" | "shield"
  dismissible?: boolean
}

export default function WarningBanner({
  type = "warning",
  message = "Important security notice",
  subMessage,
  icon = "alert",
  dismissible = true,
}: WarningBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const getBackgroundColor = () => {
    switch (type) {
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-amber-600"
      case "info":
        return "bg-gradient-to-r from-blue-500 to-blue-600"
      case "danger":
        return "bg-gradient-to-r from-red-500 to-red-600"
      default:
        return "bg-gradient-to-r from-amber-500 to-amber-600"
    }
  }

  const getIcon = () => {
    switch (icon) {
      case "alert":
        return <AlertTriangle className="h-6 w-6 text-white" />
      case "info":
        return <Info className="h-6 w-6 text-white" />
      case "shield":
        return <ShieldAlert className="h-6 w-6 text-white" />
      default:
        return <AlertTriangle className="h-6 w-6 text-white" />
    }
  }

  return (
    <div className={`relative w-full ${getBackgroundColor()} shadow-lg`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center px-3 py-1 justify-center rounded-full bg-white/20 backdrop-blur-sm">
            {getIcon()}
          </div>
          <div>
            <p className="font-medium text-white">{message}</p>
            {subMessage && <p className="text-sm text-white/80">{subMessage}</p>}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    </div>
  )
}

