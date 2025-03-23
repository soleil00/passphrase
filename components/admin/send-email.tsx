"use client"

import { useState, useRef } from "react"
import { X, Send, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipientEmail: string
  recipientName: string
  requestType: string
  requestId: string
}

type MessageStatus = "idle" | "sending" | "success" | "error"

export default function SendMessageModal({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  requestType,
  requestId,
}: SendMessageModalProps) {
  const [subject, setSubject] = useState(`Pi Network ${requestType} Request Update`)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<MessageStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Templates for quick responses
  const messageTemplates = [
    {
      name: "Request Received",
      subject: `Pi Network ${requestType} Request Received`,
      body: `Dear ${recipientName},\n\nWe have received your ${requestType} request and are currently reviewing it. We will update you once we have more information.\n\nThank you for your patience.\n\nBest regards,\nPi Network Support Team`,
    },
    {
      name: "Additional Information Needed",
      subject: `Pi Network ${requestType} Request - Additional Information Needed`,
      body: `Dear ${recipientName},\n\nWe are reviewing your ${requestType} request, but we need some additional information to proceed. Please provide the following:\n\n1. [Information needed]\n2. [Information needed]\n\nPlease reply to this email with the requested information.\n\nBest regards,\nPi Network Support Team`,
    },
    {
      name: "Request Approved",
      subject: `Pi Network ${requestType} Request Approved`,
      body: `Dear ${recipientName},\n\nWe are pleased to inform you that your ${requestType} request has been approved. Your account has been successfully recovered and you can now access it using your credentials.\n\nIf you have any further questions, please don't hesitate to contact us.\n\nBest regards,\nPi Network Support Team`,
    },
    {
      name: "Request Denied",
      subject: `Pi Network ${requestType} Request Status Update`,
      body: `Dear ${recipientName},\n\nAfter careful review of your ${requestType} request, we regret to inform you that we are unable to approve it at this time due to insufficient verification information.\n\nIf you believe this decision is incorrect, you may submit a new request with additional verification information.\n\nBest regards,\nPi Network Support Team`,
    },
  ]

  const applyTemplate = (templateIndex: number) => {
    const template = messageTemplates[templateIndex]
    setSubject(template.subject)
    setMessage(template.body)

    // Focus and scroll to the end of the textarea
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setErrorMessage("Please enter a message before sending")
      return
    }

    setStatus("sending")
    setErrorMessage("")

    try {
      // Call the actual API endpoint for sending emails
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          message,
          requestId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send email")
      }

      setStatus("success")

      // Reset form after successful send
      setTimeout(() => {
        if (status === "success") {
          onClose()
          setSubject(`Pi Network ${requestType} Request Update`)
          setMessage("")
          setStatus("idle")
        }
      }, 2000)
    } catch (error) {
      console.error("Error sending email:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email. Please try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Send Message to {recipientName}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>Message sent successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium mb-1">
              Recipient
            </label>
            <Input id="recipient" value={recipientEmail} disabled className="bg-gray-50" />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Subject
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <Textarea
              ref={textareaRef}
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[200px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message Templates</label>
            <div className="flex flex-wrap gap-2">
              {messageTemplates.map((template, index) => (
                <Button key={index} variant="outline" size="sm" onClick={() => applyTemplate(index)}>
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={status === "sending"}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={status === "sending" || status === "success"}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {status === "sending" ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

