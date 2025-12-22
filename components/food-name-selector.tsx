// CREATE a new component file: components/food-name-selector.tsx

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Search } from "lucide-react"

interface FoodNameSelectorProps {
  suggestedNames: string[]
  onSelect: (name: string) => void
  isOpen: boolean
  onClose: () => void
}

export function FoodNameSelector({ suggestedNames, onSelect, isOpen, onClose }: FoodNameSelectorProps) {
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [customName, setCustomName] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  if (!isOpen) return null

  const handleSelect = (name: string) => {
    setSelectedName(name)
  }

  const handleConfirm = () => {
    const finalName = showCustomInput && customName.trim() 
      ? customName.trim() 
      : selectedName || suggestedNames[0]
    
    onSelect(finalName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-[#c9fa5f]/20 rounded-2xl p-6 animate-slide-up">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">What's this dish?</h3>
          <p className="text-sm text-muted-foreground">
            Select the closest match or enter a custom name
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {suggestedNames.map((name, index) => (
            <button
              key={index}
              onClick={() => {
                handleSelect(name)
                setShowCustomInput(false)
              }}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                selectedName === name && !showCustomInput
                  ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f]"
                  : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{name}</span>
                {selectedName === name && !showCustomInput && (
                  <Check className="h-5 w-5 text-black" />
                )}
              </div>
            </button>
          ))}

          {/* Custom Name Option */}
          <button
            onClick={() => {
              setShowCustomInput(true)
              setSelectedName(null)
            }}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
              showCustomInput
                ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f]"
                : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5" />
              <span className="font-medium">Enter custom name</span>
            </div>
          </button>

          {showCustomInput && (
            <div className="pl-4">
              <Input
                type="text"
                placeholder="Type your dish name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-xl border-[#c9fa5f]/30 focus:border-[#c9fa5f] bg-background"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-12 border-2"
          >
            Skip
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedName && !customName.trim() && !showCustomInput}
            className="flex-1 rounded-xl h-12 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-semibold"
          >
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  )
}