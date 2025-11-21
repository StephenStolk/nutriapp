"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionExpiryWarningProps {
  validTill: string | null
  planName: string
}

export function SubscriptionExpiryWarning({ validTill, planName }: SubscriptionExpiryWarningProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!validTill || planName === "Free") return

    const expiryDate = new Date(validTill)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    setDaysRemaining(diffDays)

    // Show warning if 7 days or less remaining
    if (diffDays > 0 && diffDays <= 7) {
      setShowWarning(true)
    }
  }, [validTill, planName])

  if (!showWarning) return null

  return (
    <Card className="mb-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 animate-in slide-in-from-top duration-500">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {daysRemaining === 1 
              ? "Your subscription expires tomorrow!" 
              : `Your subscription expires in ${daysRemaining} days`}
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Renew now to continue enjoying premium features without interruption.
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => router.push("/pricestructure?upgrade=true")}
              className="h-8 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Renew Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowWarning(false)}
              className="h-8"
            >
              Dismiss
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowWarning(false)}
          className="h-7 w-7 p-0 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}