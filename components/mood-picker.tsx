"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smile, Meh, Frown, Angry, Moon, X } from "lucide-react"

interface MoodPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mood: string) => void
  foodLogId?: string
}

const MOODS = [
  { id: "happy", icon: Smile, emoji: "😊", label: "Happy", color: "#c9fa5f" },
  { id: "neutral", icon: Meh, emoji: "😐", label: "Neutral", color: "#808080" },
  { id: "sad", icon: Frown, emoji: "😢", label: "Sad", color: "#6b7280" },
  { id: "angry", icon: Angry, emoji: "😡", label: "Angry", color: "#ef4444" },
  { id: "tired", icon: Moon, emoji: "😴", label: "Tired", color: "#8b5cf6" },
]

export function MoodPicker({ isOpen, onClose, onSelect }: MoodPickerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-sm bg-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">How are you feeling?</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Tracking your mood helps us understand your eating patterns better
        </p>

        <div className="grid grid-cols-5 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => {
                onSelect(mood.id)
                onClose()
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {mood.emoji}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}