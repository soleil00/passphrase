"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle } from "lucide-react"
import TermsComponent from "./terms"

export const TERMS_ACCEPTED_KEY = "terms-and-conditions-accepted"

interface TermsAndConditionsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onAccept?: () => void
}

export function TermsAndConditionsModal({ open, onOpenChange, onAccept }: TermsAndConditionsModalProps) {
  const [isOpen, setIsOpen] = useState(open || false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 30) {
      setHasScrolledToBottom(true)
    }
  }

  const handleAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "accepted")
    handleOpenChange(false)
    setShowAcceptanceModal(true)
    onAccept?.()
  }

  const handleReject = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "rejected")
    handleOpenChange(false)
    setShowRejectionModal(true)
  }

  const dialogOpen = open !== undefined ? open : isOpen

  return (
    <>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] w-[95%] rounded-md">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>Please read and accept our terms and conditions to continue.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[300px] mt-4" onScroll={handleScroll}>
            <TermsComponent/>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
            <Button onClick={handleAccept}  className="relative">
              {/* {!hasScrolledToBottom && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-md">
                  Please scroll to the bottom
                </div>
              )} */}
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={showAcceptanceModal} onOpenChange={setShowAcceptanceModal}>
        <DialogContent className="sm:max-w-[400px] w-[95%] ">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Terms Accepted
            </DialogTitle>
          </DialogHeader>
          <p>Thank you for accepting our Terms and Conditions. You can now use the application.</p>
          <DialogFooter>
            <Button onClick={() => setShowAcceptanceModal(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="sm:max-w-[400px] w-[95%]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="text-red-500" />
              Terms Rejected
            </DialogTitle>
          </DialogHeader>
          <p>
            You have rejected our Terms and Conditions. Unfortunately, you cannot use the application without accepting
            the terms. Please refresh the page if you wish to reconsider.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem(TERMS_ACCEPTED_KEY)
                window.location.reload()
              }}
            >
              Review Terms Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

