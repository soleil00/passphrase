"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Key,
  ArrowLeft,
  Play,
  Download,
  Mail,
  Phone,
  Globe,
  User,
  Wallet,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Mock data for the request details
const mockRequests = [
  {
    id: "REQ-8F3A2D1E",
    type: "recovery",
    status: "completed",
    date: "2023-11-15",
    details: "Recovered 1 missing word",
    fee: "25.00 Pi",
    originalBalance: "100.00 Pi",
    newBalance: "75.00 Pi",
    country: "United States",
    email: "user1@example.com",
    phone: "+1 234 567 8901",
    publicKey: "GDPWJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3W",
    howLost: "I wrote down my passphrase but later found I missed one word.",
    passphrase: [
      "word1",
      "word2",
      "word3",
      "word4",
      "word5",
      "word6",
      "word7",
      "word8",
      "word9",
      "word10",
      "word11",
      "word12",
      "word13",
      "word14",
      "word15",
      "word16",
      "word17",
      "word18",
      "word19",
      "word20",
      "word21",
      "word22",
      "word23",
      "???",
    ],
    missingPositions: [23],
    recoveredWords: ["word24"],
    notes: "User provided 23 words, missing the last word. Successfully recovered using our algorithm.",
  },
  {
    id: "REQ-9B7C3E2F",
    type: "protection",
    status: "completed",
    date: "2023-12-03",
    details: "Wallet secured successfully",
    fee: "0.00 Pi",
    originalBalance: "75.00 Pi",
    newBalance: "75.00 Pi",
    country: "Canada",
    email: "user2@example.com",
    phone: "+1 987 654 3210",
    publicKey: "GDPWJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3X",
    howLost: "I accidentally shared my passphrase on a suspicious website.",
    passphrase: [
      "word1",
      "word2",
      "word3",
      "word4",
      "word5",
      "word6",
      "word7",
      "word8",
      "word9",
      "word10",
      "word11",
      "word12",
      "word13",
      "word14",
      "word15",
      "word16",
      "word17",
      "word18",
      "word19",
      "word20",
      "word21",
      "word22",
      "word23",
      "word24",
    ],
    missingPositions: [],
    recoveredWords: [],
    notes: "User&apos;s wallet was compromised. We secured it by transferring Pi to a new wallet.",
  },
  {
    id: "REQ-5D4E6F2A",
    type: "recovery",
    status: "pending",
    date: "2024-01-10",
    details: "Recovering 2 missing words",
    fee: "Pending",
    originalBalance: "Pending",
    newBalance: "Pending",
    country: "United Kingdom",
    email: "user3@example.com",
    phone: "+44 1234 567890",
    publicKey: "GDPWJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3Y",
    howLost: "I lost my notebook with two words from my passphrase.",
    passphrase: [
      "word1",
      "word2",
      "word3",
      "word4",
      "word5",
      "word6",
      "word7",
      "word8",
      "word9",
      "word10",
      "word11",
      "word12",
      "word13",
      "word14",
      "???",
      "word16",
      "word17",
      "word18",
      "word19",
      "word20",
      "word21",
      "word22",
      "???",
      "word24",
    ],
    missingPositions: [14, 22],
    recoveredWords: [],
    notes: "",
  },
  {
    id: "REQ-7G8H9I0J",
    type: "protection",
    status: "pending",
    date: "2024-01-15",
    details: "Wallet protection request",
    fee: "Pending",
    originalBalance: "Pending",
    newBalance: "Pending",
    country: "Australia",
    email: "user4@example.com",
    phone: "+61 2 3456 7890",
    publicKey: "GDPWJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3Z",
    howLost: "I think my passphrase might have been compromised in a phishing attack.",
    passphrase: [
      "word1",
      "word2",
      "word3",
      "word4",
      "word5",
      "word6",
      "word7",
      "word8",
      "word9",
      "word10",
      "word11",
      "word12",
      "word13",
      "word14",
      "word15",
      "word16",
      "word17",
      "word18",
      "word19",
      "word20",
      "word21",
      "word22",
      "word23",
      "word24",
    ],
    missingPositions: [],
    recoveredWords: [],
    notes: "",
  },
  {
    id: "REQ-1K2L3M4N",
    type: "recovery",
    status: "processing",
    date: "2024-01-18",
    details: "Recovering 1 missing word",
    fee: "Pending",
    originalBalance: "Pending",
    newBalance: "Pending",
    country: "Germany",
    email: "user5@example.com",
    phone: "+49 123 4567890",
    publicKey: "GDPWJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH3WJDH40",
    howLost: "I&apos;m missing one word from my passphrase, position 15.",
    passphrase: [
      "word1",
      "word2",
      "word3",
      "word4",
      "word5",
      "word6",
      "word7",
      "word8",
      "word9",
      "word10",
      "word11",
      "word12",
      "word13",
      "word14",
      "???",
      "word16",
      "word17",
      "word18",
      "word19",
      "word20",
      "word21",
      "word22",
      "word23",
      "word24",
    ],
    missingPositions: [14],
    recoveredWords: [],
    notes: "Currently running recovery algorithm to find the missing word.",
  },
]

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [notes, setNotes] = useState("")

  // Find the request with the matching ID
  const request = mockRequests.find((req) => req.id === params.id)

  if (!request) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Request Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The request you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
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

  const handleRunScript = () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate script running
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          // Simulate successful recovery
          router.refresh()
        }
        return newProgress
      })
    }, 300)
  }

  return (
    <div className="">
      <div className="max-w-4x mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Request Details</h1>
          </div>
          <div className="flex items-center gap-2">
            {(request.status === "pending" || request.status === "processing") && (
              <Button onClick={handleRunScript} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Recovery Script
                  </>
                )}
              </Button>
            )}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {isProcessing && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {request.type === "recovery"
                    ? "Running recovery algorithm to find missing words..."
                    : "Securing wallet and transferring Pi to safe address..."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {request.type === "recovery" ? "Passphrase Recovery" : "Wallet Protection"} Request
                    </CardTitle>
                    <CardDescription>ID: {request.id}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
                    <TabsTrigger value="notes">Admin Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Request Type</h3>
                        <p className="font-medium">
                          {request.type === "recovery" ? (
                            <span className="flex items-center">
                              <Key className="h-4 w-4 mr-1 text-primary" />
                              Passphrase Recovery
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Shield className="h-4 w-4 mr-1 text-primary" />
                              Wallet Protection
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Date Submitted</h3>
                        <p className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {request.date}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p>{getStatusBadge(request.status)}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Fee</h3>
                        <p className="font-medium flex items-center">
                          <Wallet className="h-4 w-4 mr-1 text-muted-foreground" />
                          {request.fee}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        How {request.type === "recovery" ? "Lost" : "Compromised"}
                      </h3>
                      <p className="text-sm">{request.howLost}</p>
                    </div>

                    {request.status === "completed" && (
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Result</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Original Balance</p>
                            <p className="font-medium">{request.originalBalance}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">New Balance</p>
                            <p className="font-medium">{request.newBalance}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="passphrase" className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Sensitive Information</AlertTitle>
                      <AlertDescription>
                        This section contains the user&apos;s passphrase information. Handle with extreme care.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-4 gap-2">
                      {request.passphrase.map((word, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-md text-center text-sm ${
                            word === "???"
                              ? "bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800"
                              : request.recoveredWords.includes(word)
                                ? "bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-800"
                                : "bg-muted"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">Word {i + 1}</div>
                          <div className="font-medium">
                            {word === "???" ? (
                              <span className="text-amber-600 dark:text-amber-400">Missing</span>
                            ) : request.recoveredWords.includes(word) ? (
                              <span className="text-green-600 dark:text-green-400">{word}</span>
                            ) : (
                              word
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {request.recoveredWords.length > 0 && (
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Recovered Words</h3>
                        <div className="flex flex-wrap gap-2">
                          {request.recoveredWords.map((word, i) => (
                            <Badge key={i} className="bg-green-500">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Admin Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about this request..."
                        rows={5}
                        value={notes || request.notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <Button>Save Notes</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    {request.email}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    {request.phone}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Country</h3>
                  <p className="font-medium flex items-center">
                    <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                    {request.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Public Key</h3>
                  <p className="font-medium text-xs break-all">{request.publicKey}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/admin/users/${request.email}`}>
                    <User className="mr-2 h-4 w-4" />
                    View User Profile
                  </Link>
                </Button>

                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact User
                </Button>

                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>

                {(request.status === "pending" || request.status === "processing") && (
                  <Button className="w-full" variant="destructive">
                    Cancel Request
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
