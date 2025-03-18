"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Clock, CheckCircle, AlertCircle, ArrowRight, Loader } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchRequests, type IRequest } from "@/redux/slices/requests"
import { useRouter } from "next/navigation"

const formatDate = (dateString: Date) => {
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

export function ServiceHistory() {
  const [selectedService, setSelectedService] = useState<IRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useAppDispatch()
  const { requests } = useAppSelector((state) => state.requests)
  const router = useRouter()

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true)
      try {
        await dispatch(fetchRequests()).unwrap()
      } catch (error) {
        console.error("Failed to fetch requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [dispatch])

  const handleShowMore = (service: IRequest) => {
    setSelectedService(service)
    setIsDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold mb-2">Service History</h1>
        <p className="text-muted-foreground mb-4">View your past service requests</p>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your service history...</p>
        </div>
      ) : requests.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-muted/50 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-medium mb-2">No service requests found</h3>
          <p className="text-muted-foreground mb-6">You haven&apos;t made any protection or recovery requests yet.</p>
          <Button onClick={() => router.push("/new-request")}>
            Create New Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((service) => (
            <Card key={service._id} className="overflow-hidden p-1">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {service.requestType === "protection" ? (
                      <Shield className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Key className="h-5 w-5 text-green-500" />
                    )}
                    <CardTitle className="text-lg">{service.requestType}</CardTitle>
                  </div>
                  <Badge className={cn("ml-2", getStatusColor(service.status || ""))}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(service.status || "")}
                      {service.status}
                    </span>
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  <span className="text-xs mt-1 block">Requested on: {formatDate(service.createdAt)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p className="line-clamp-2">
                    <span className="font-medium">Note:</span> {service.note}
                  </p>
                </div>
              </CardContent>
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleShowMore(service)}
                >
                  View Details
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Dialog for showing more details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedService?.requestType === "protection" ? (
                <Shield className="h-5 w-5 text-blue-500" />
              ) : (
                <Key className="h-5 w-5 text-green-500" />
              )}
              {selectedService?.requestType}
            </DialogTitle>
            <DialogDescription>Request details for {selectedService?.note}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Status</h3>
              <Badge className={cn(getStatusColor(selectedService?.status || ""))}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(selectedService?.status || "")}
                  {selectedService?.status}
                </span>
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Note</h3>
              <p className="text-sm text-muted-foreground">{selectedService?.note}</p>
            </div>

            {selectedService?.requestType === "protection" && selectedService.mainnetWalletAddress && (
              <div>
                <h3 className="text-sm font-medium mb-1">Mainnet Wallet Address</h3>
                <div className="bg-muted p-3 rounded-md text-xs font-mono break-all">
                  {selectedService.mainnetWalletAddress}
                </div>
              </div>
            )}

            {selectedService?.requestType === "protection" && selectedService.piBalance && (
              <div>
                <h3 className="text-sm font-medium mb-1">Pi Balance to Protect</h3>
                <div className="bg-muted p-3 rounded-md text-xs font-mono">{selectedService.piBalance} π</div>
              </div>
            )}

            {selectedService?.requestType === "recovery" && selectedService.wordsRemembered && (
              <div>
                <h3 className="text-sm font-medium mb-1">Words Remembered</h3>
                <div className="bg-muted p-3 rounded-md text-xs font-mono break-all">
                  {selectedService.wordsRemembered}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Requested on: {selectedService?.createdAt ? formatDate(selectedService.createdAt) : ""}
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

