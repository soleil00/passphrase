"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { recoverPassphrase } from "@/redux/slices/passphrase"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"

export default function RecoveryPage() {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [words, setWords] = useState<string[]>(Array(24).fill(""))
  const [publicKey, setPublicKey] = useState("")
  const [recoveredPassphrase, setRecoveredPassphrase] = useState<string>("")
  const [validationError, setValidationError] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const dispatch = useAppDispatch()
  const {requests} = useAppSelector(state => state.requests)

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words]
    newWords[index] = value
    setWords(newWords)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const pastedWords = pastedText.trim().split(/[\s,]+/)

    if (pastedWords.length > 0) {
      const newWords = [...words]

      for (let i = 0; i < pastedWords.length && startIndex + i < 24; i++) {
        newWords[startIndex + i] = pastedWords[i]
      }

      setWords(newWords)
    }
  }

  const validatePublicKey = (key: string): boolean => {
    const regex = /^[A-Z0-9]+$/
    if (key.length !== 56) {
      setValidationError("❌ Public key must be exactly 56 characters long.")
      return false
    }
    if (!regex.test(key)) {
      setValidationError("❌ Public key must contain only uppercase letters (A-Z) and numbers (0-9).")
      return false
    }
    if (!key.startsWith("G")) {
      setValidationError("❌ Public key must start with &apos;G&apos;.")
      return false
    }
    setValidationError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePublicKey(publicKey.toUpperCase())) return

    setStep(2)
    setIsProcessing(true)
    setIsRunning(true)

    // Convert the words array to a passphrase string, using &quot;?&quot; for empty words
    const passphrase = words.map((word) => (word.trim() === "" ? "?" : word)).join(" ")

    try {
      const result = await dispatch(
        recoverPassphrase({
          passphrase,
          publicKey: publicKey.toUpperCase(),
        }),
      ).unwrap()

      setRecoveredPassphrase(result.passphrase)
    } catch (error) {
      console.log("Error in recovery:", error)
    } finally {
      setIsRunning(false)
    }

    // Simulate progress for UI feedback
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setIsProcessing(false)
        setIsSuccess(true)
      }
    }, 300)
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Passphrase Recovery</h1>
          <p className="text-muted-foreground">
            Recover your missing passphrase words by entering the ones you remember
          </p>
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Remembered Words</CardTitle>
              <CardDescription>
                Enter the words you remember in their correct positions. Leave unknown words blank.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                  <p className="text-sm text-muted-foreground mt-2">
                    Fill in the words you remember in their correct positions. Leave unknown words blank.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public-key">Public Key</Label>
                  <Input
                    id="public-key"
                    placeholder="Enter your public key"
                    value={publicKey}
                    autoCapitalize="characters"
                    onChange={(e) => setPublicKey(e.target.value)}
                    required
                  />
                  {validationError && <p className="text-sm text-destructive mt-1">{validationError}</p>}
                </div>

                <Alert className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    If recovery is successful, a 25% fee will be deducted from your Pi balance as payment for the
                    service.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isRunning}>
                  {isRunning ? "Recovering passphrase..." : "Recover My Passphrase"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <RecoveryResult
            recoveredPassphrase={recoveredPassphrase}
            isProcessing={isProcessing}
            isSuccess={isSuccess}
            progress={progress}
          />
        )}
      </div>
    </div>
  )
}

function RecoveryResult({
  recoveredPassphrase,
  isProcessing,
  isSuccess,
  progress,
}: {
  recoveredPassphrase: string
  isProcessing: boolean
  isSuccess: boolean | null
  progress: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery {isProcessing ? "In Progress" : isSuccess ? "Successful" : "Failed"}</CardTitle>
        <CardDescription>
          {isProcessing
            ? "Please wait while we recover your passphrase..."
            : isSuccess
              ? "Your passphrase has been successfully recovered"
              : "We couldn't recover your passphrase"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProcessing ? (
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              This may take a few moments. Please don&apos;t close this page.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Your Recovered Passphrase</h3>
              </div>
              <p className="text-sm font-mono bg-muted p-3 rounded break-all">{recoveredPassphrase}</p>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Security Notice</AlertTitle>
              <AlertDescription>
                Store this passphrase in a secure location. Never share it with anyone. This is the only time you&apos;ll see
                it.
              </AlertDescription>
            </Alert>
            <Button className="w-full">Copy Passphrase</Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-medium text-lg">Recovery Failed</h3>
            <p className="text-muted-foreground">
              We couldn&apos;t recover your passphrase with the provided information. Please try again with more accurate
              remembered words.
            </p>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
