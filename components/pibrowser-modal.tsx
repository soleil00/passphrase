"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PibrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PibrowserModal({ isOpen, onClose }: PibrowserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] w-[90%] rounded-md">
        <DialogHeader>
          <DialogTitle>Authenticate through Pi Browser</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-center">
          <p>Please authenticate through the Pi Browser only.</p>
          {/* <Button onClick={() => window.open('https://pi-browser-url.com', '_blank')} className="mt-4">
            Open Pi Browser
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
