"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch } from "@/redux/hooks"
import { updateRequestProgress } from "@/redux/slices/requests"

interface EditProgressModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
}

export default function EditProgressModal({ isOpen, onClose, request }: EditProgressModalProps) {
  const [progress, setProgress] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Update progress whenever the request changes or modal opens
  useEffect(() => {
    if (request && isOpen) {
      console.log("Setting progress from request:", request.progress)
      setProgress(request.progress || "")
      setSaveError(null)
      setSaveSuccess(false)
    }
  }, [isOpen, request])

  const dispatch = useAppDispatch()

  const handleSaveProgress = async () => {
    if (!request?._id) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Dispatch the action to update progress
      await dispatch(
        updateRequestProgress({
          requestId: request._id,
          progress,
        }),
      ).unwrap()

      setSaveSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to update progress:", error)
      setSaveError("Failed to save progress. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        onClose()
        // Don't reset progress here as it will cause a flash of empty content
        // setProgress("")
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Request Progress</DialogTitle>
          <DialogDescription>
            Request ID: {request?._id} • Status: {request && getStatusBadge(request.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="progress" className="text-sm font-medium">
              Progress Notes
            </label>
            <Textarea
              id="progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="Enter progress notes for this request..."
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Document the current progress, steps taken, and any relevant information for this request.
            </p>
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{saveError}</div>
          )}

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              Progress saved successfully!
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveProgress} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Progress
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

