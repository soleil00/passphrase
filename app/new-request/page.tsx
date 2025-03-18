"use client"

import ProtectionRequestForm from "@/components/forms/protection-request-form"
import RecoveryRequestForm from "@/components/forms/recovery-request-form"
import { ServiceSelection } from "@/components/service-selection"
import RecoverSuccess from "@/components/service-success"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function NewRequestContent() {
  const searchParams = useSearchParams()
  const [service, setService] = useState<string | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    setService(searchParams.get("service")) // Only set service after the component mounts
  }, [searchParams])


  return (
    <div className="mx-auto">
      <Link href="/services" passHref>
        <Button variant="ghost" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </Link>
      {step === 0 ? (
        service === "protection" ? (
          <ProtectionRequestForm setStep2={setStep} />
        ) : service === "recovery" ? (
          <RecoveryRequestForm setStep2={setStep} />
        ) : (
          <div className="p-3">
            <ServiceSelection />
          </div>
        )
      ) : (
        <RecoverSuccess isProtection={service as string} />
      )}
    </div>
  )
}

