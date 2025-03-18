"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppDispatch } from "@/redux/hooks"
import { authenticateUser, initializePiSDK } from "@/redux/slices/auth"
import { CheckCircle, Lock, LogIn, Loader } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AuthenticationModalProps {
  isOpen: boolean
  onClose: () => void
}

const AuthenticationModal = ({ isOpen, onClose }: AuthenticationModalProps) => {

  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleAuthenticate = async () => {
    setLoading(true)

    try {
      await dispatch(initializePiSDK()).unwrap()
      const result = await dispatch(authenticateUser()).unwrap()

      // Show success animation before closing
      setSuccess(true)

      // Close modal after success animation
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setLoading(false)
      if (process.env.NODE_ENV !== "production") {
        console.error("Authentication failed:", error)
      }
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!loading) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md w-[90%] rounded-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-100 dark:bg-green-900 p-3 rounded-full"
              >
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
            ) : (
              <div className="bg-primary/10 p-3 rounded-full">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center">
            {success ? "Authentication Successful" : "Authentication Required"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {success ? "You have been successfully authenticated" : "You need to be logged in to access this service"}
          </DialogDescription>
        </DialogHeader>

        {/* {success && (
          <div className="py-4 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center"
            >
              <p className="text-green-700 dark:text-green-300">Redirecting you to the service...</p>
            </motion.div>
          </div>
        )} */}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!success && (
            <>
              <Button onClick={handleAuthenticate} className="sm:w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Authenticate
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose} className="sm:w-full" disabled={loading}>
                Cancel
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AuthenticationModal

