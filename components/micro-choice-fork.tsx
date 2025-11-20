"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, TrendingDown, TrendingUp, Clock } from "lucide-react"

interface MicroChoiceForkProps {
  isOpen: boolean
  onClose: () => void
  foodItem: { name: string; calories: number }
  onChoice: (choice: 'continue' | 'shift') => void
}

export function MicroChoiceFork({ isOpen, onClose, foodItem, onChoice }: MicroChoiceForkProps) {
  const [countdown, setCountdown] = useState(3)
  const [phase, setPhase] = useState<'countdown' | 'choice'>('countdown')

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3)
      setPhase('countdown')
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setPhase('choice')
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  const handleChoice = (choice: 'continue' | 'shift') => {
    onChoice(choice)
    onClose()
  }

  if (!isOpen) return null

  const setbackMinutes = Math.round(foodItem.calories / 10)

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-card border-2 border-[#c9fa5f]/30 p-6">
        {phase === 'countdown' ? (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center">
              <span className="text-5xl font-bold text-[#c9fa5f]">{countdown}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Pause & Reflect</h3>
            <p className="text-sm text-muted-foreground">
              You're about to log: <span className="font-semibold text-foreground">{foodItem.name}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center">
                <GitBranch className="h-6 w-6 text-[#c9fa5f]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Choose Your Path</h3>
              <p className="text-xs text-muted-foreground">This moment shapes your future</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Left Path: Continue */}
              <button
                onClick={() => handleChoice('continue')}
                className="p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  <h4 className="text-sm font-bold text-foreground">Continue</h4>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>+{foodItem.calories} cal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{setbackMinutes} min setback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Short-term satisfaction</span>
                  </div>
                </div>
              </button>

              {/* Right Path: Shift */}
              <button
                onClick={() => handleChoice('shift')}
                className="p-4 rounded-xl border-2 border-[#c9fa5f]/30 bg-[#c9fa5f]/10 hover:bg-[#c9fa5f]/20 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-[#c9fa5f]" />
                  <h4 className="text-sm font-bold text-foreground">Shift</h4>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c9fa5f]">•</span>
                    <span>Choose healthier option</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#c9fa5f]">•</span>
                    <span>+1 discipline point</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#c9fa5f]">•</span>
                    <span>Future-self alignment</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                Every choice is a vote for the person you're becoming
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}