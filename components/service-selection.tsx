"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion } from "framer-motion"
import { useAppSelector } from "@/redux/hooks"
import { usePathname, useRouter } from "next/navigation"
import { services } from "@/constants"
import  AuthenticationModal  from "./authentication-modal"

export function ServiceSelection() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null)
  const { currentUser } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const pathname = usePathname()

  const isService = pathname.startsWith("/services")

  const handleSelectService = (id: string) => {
    // If user is not authenticated, show auth modal
    if (!currentUser) {
      setIsAuthModalOpen(true)
      setPendingServiceId(id)
      return
    }

    // Otherwise proceed with selection
    setSelectedService(id)
    router.push(`/new-request?service=${id}`)
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
    setPendingServiceId(null)
  }

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId)
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
        <h1 className="text-2xl font-bold mb-2">Choose Service</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="overflow-hidden">
          <div className="pt-">
            <RadioGroup
              value={selectedService || ""}
              onValueChange={handleServiceClick}
              className={`grid ${isService ? "grid-cols-1" : "grid-cols-2"} sm:grid-cols-2 gap-2`}
            >
              {services.map((service) => (
                <div
                  key={service._id}
                  className={`flex flex-col items-start p-2 rounded-lg border-2 ${
                    selectedService === service._id ? "border-primary bg-primary/5" : "border-muted"
                  }`}
                  onClick={() => handleServiceClick(service._id)}
                >
                  <RadioGroupItem value={service._id} id={service._id} className="sr-only" />
                  <div className="flex items-center justify-center w-full">
                    <Label htmlFor={service._id} className="flex flex-col items-center cursor-pointer w-full">
                      <service.icon className="h-10 w-10 mb-3 text-primary" />
                      <span className="text-lg font-semibold text-center">{service.name}</span>
                      <p
                        className={`text-sm text-muted-foreground text-center mt-1 ${!isService && "line-clamp-2"} mb-2`}
                      >
                        {service.subtitle}
                      </p>
                    </Label>
                  </div>
                  {isService && (
                    <ul className="space-y-2 sm:space-y-4 text-sm sm:text-base">
                      {service.howItWorks.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mr-1.5 sm:mr-2 mt-0.5" />
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className="mt-2 w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectService(service.type)
                    }}
                  >
                    GO
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </motion.div>

      {/* Authentication Modal */}
      <AuthenticationModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />
    </motion.div>
  )
}

