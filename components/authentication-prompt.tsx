"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { authenticateUser, initializePiSDK } from "@/redux/slices/auth"
import { CheckCircle, LogIn, Loader, ShieldAlert } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AuthenticationPromptProps {
  title?: string
  description?: string
  onSuccess?: () => void
}

export function AuthenticationPrompt({
  title = "Authentication Required",
  description = "You need to be logged in to access this content",
  onSuccess,
}: AuthenticationPromptProps) {
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)


  useEffect(() => {
    if (currentUser && onSuccess) {
      onSuccess()
    }
  }, [currentUser, onSuccess])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleAuthenticate = async () => {
    setLoading(true)

    try {
      await dispatch(initializePiSDK()).unwrap()
      const result = await dispatch(authenticateUser()).unwrap()
      setSuccess(true)

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (error) {
      setLoading(false)
      if (process.env.NODE_ENV !== "production") {
        console.error("Authentication failed:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (currentUser) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-muted shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {success ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-100 dark:bg-green-900 p-4 rounded-full"
                >
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
              ) : (
                <div className="bg-primary/10 p-4 rounded-full">
                  <ShieldAlert className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">{success ? "Authentication Successful" : title}</CardTitle>
            <CardDescription className="mt-2">
              {success ? "You have been successfully authenticated" : description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center"
              >
                <p className="text-green-700 dark:text-green-300">You now have access to all features</p>
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground text-sm">
                <p>To protect your Pi and ensure secure transactions, we require authentication before proceeding.</p>
                <p className="mt-2">Your wallet security is our top priority.</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pt-2 pb-6">
            {!success && (
              <Button size="lg" onClick={handleAuthenticate} disabled={loading} className="w-full max-w-xs">
                {loading ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Authenticate with Pi
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

