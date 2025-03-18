"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Key } from "lucide-react"
import { cn } from "@/lib/utils"

interface Service {
  _id: string
  name: string
  type: string
  description: string
  subtitle: string
  buttonText: string
  howItWorks: string[]
}

interface ServiceCardProps {
  service: Service
  isSelected: boolean
  onSelect: (id: string) => void
}

export function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  const icon = service.type === "protection" ? Shield : Key

  return (
    <Card
      className={cn(
        "h-full transition-all duration-200 cursor-pointer hover:border-primary/50 hover:shadow-md",
        isSelected && "border-primary ring-2 ring-primary/20",
      )}
      onClick={() => onSelect(service._id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {service.type === "protection" ? (
              <Shield className="h-5 w-5 text-blue-500" />
            ) : (
              <Key className="h-5 w-5 text-green-500" />
            )}
            <CardTitle className="text-lg">{service.name}</CardTitle>
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              service.type === "protection"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            )}
          >
            {service.type === "protection" ? "Protection" : "Recovery"}
          </div>
        </div>
        <CardDescription className="pt-2">{service.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{service.description}</p>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">How it works:</h4>
          <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
            {service.howItWorks.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(service._id)
          }}
        >
          {service.buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}

