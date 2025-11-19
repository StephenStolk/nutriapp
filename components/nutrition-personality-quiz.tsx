"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface QuizProps {
  isOpen: boolean
  onClose: () => void
}

const QUESTIONS = [
  {
    q: "When do you feel most energized?",
    options: [
      { text: "Morning (6-10 AM)", value: "morning" },
      { text: "Afternoon (12-4 PM)", value: "afternoon" },
      { text: "Evening (6-10 PM)", value: "evening" },
      { text: "Night (10 PM+)", value: "night" },
    ],
  },
  {
    q: "How do you approach meal planning?",
    options: [
      { text: "I plan everything ahead", value: "planner" },
      { text: "I decide day-of", value: "spontaneous" },
      { text: "I eat the same things", value: "routine" },
      { text: "I go with cravings", value: "intuitive" },
    ],
  },
  {
    q: "What triggers your snacking?",
    options: [
      { text: "Boredom", value: "boredom" },
      { text: "Stress/Emotions", value: "stress" },
      { text: "Social situations", value: "social" },
      { text: "Actual hunger", value: "hunger" },
    ],
  },
  {
    q: "Your ideal meal is:",
    options: [
      { text: "Quick & simple", value: "quick" },
      { text: "Flavorful & exciting", value: "flavorful" },
      { text: "Balanced & nutritious", value: "balanced" },
      { text: "Comforting & familiar", value: "comfort" },
    ],
  },
  {
    q: "When stressed, you:",
    options: [
      { text: "Eat more", value: "overeat" },
      { text: "Eat less", value: "undereat" },
      { text: "Crave specific foods", value: "crave" },
      { text: "Eating stays normal", value: "stable" },
    ],
  },
  {
    q: "Your biggest nutrition challenge:",
    options: [
      { text: "Late-night eating", value: "late_night" },
      { text: "Portion control", value: "portions" },
      { text: "Consistency", value: "consistency" },
      { text: "Healthy choices", value: "choices" },
    ],
  },
]

const PERSONALITY_TYPES = {
  "night-owl-snacker": {
    name: "Night Owl Snacker",
    description: "You thrive in the evening but struggle with late-night cravings.",
    icon: "🦉",
    strategies: [
      "Eat a high-protein dinner (keeps you full longer)",
      "Set a kitchen 'closing time' at 9 PM",
      "Keep healthy night snacks ready (Greek yogurt, nuts)",
      "Drink herbal tea after dinner to signal end of eating",
    ],
  },
  "stress-eater": {
    name: "Emotional Eater",
    description: "Food is your comfort during stressful moments.",
    icon: "💭",
    strategies: [
      "Create a 'stress toolkit': journal, walk, music playlist",
      "Practice 5-minute breathing before eating when stressed",
      "Keep comfort foods portioned (not in bulk)",
      "Build a stress-relief routine that doesn't involve food",
    ],
  },
  "routine-lover": {
    name: "Creature of Habit",
    description: "You love consistency and familiar meals.",
    icon: "🔄",
    strategies: [
      "Rotate 2-3 breakfast options weekly",
      "Try one new recipe per week",
      "Meal prep your favorite dishes in batches",
      "Use spices to add variety without changing base meals",
    ],
  },
  "social-butterfly": {
    name: "Social Butterfly",
    description: "You eat well alone but struggle in social settings.",
    icon: "🦋",
    strategies: [
      "Eat a protein-rich snack before social events",
      "Practice the 'two-plate rule' at buffets",
      "Order first at restaurants (avoid influence)",
      "Suggest active social activities beyond meals",
    ],
  },
  "intuitive-grazer": {
    name: "Intuitive Grazer",
    description: "You follow your body's cues but may overdo it.",
    icon: "🎯",
    strategies: [
      "Use the hunger scale (1-10) before eating",
      "Eat mindfully: no screens, focus on food",
      "Portion snacks instead of eating from bags",
      "Check-in: Am I hungry or just bored?",
    ],
  },
  "balanced-optimizer": {
    name: "Balanced Optimizer",
    description: "You're already doing well—focus on consistency!",
    icon: "⚖️",
    strategies: [
      "Track nutrition to fine-tune macros",
      "Set performance goals (energy, mood, workouts)",
      "Experiment with meal timing for optimization",
      "Share your knowledge and help others",
    ],
  },
}

export function NutritionPersonalityQuiz({ isOpen, onClose }: QuizProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { userId } = useUser()
  const supabase = createClient()

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[step] = value
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      calculatePersonality(newAnswers)
    }
  }

  const calculatePersonality = async (finalAnswers: string[]) => {
    // Simple scoring logic - you can make this more sophisticated
    const scores: Record<string, number> = {
      "night-owl-snacker": 0,
      "stress-eater": 0,
      "routine-lover": 0,
      "social-butterfly": 0,
      "intuitive-grazer": 0,
      "balanced-optimizer": 0,
    }

    // Q1: Energy timing
    if (finalAnswers[0] === "night") scores["night-owl-snacker"] += 3
    if (finalAnswers[0] === "morning") scores["balanced-optimizer"] += 2

    // Q2: Planning approach
    if (finalAnswers[1] === "routine") scores["routine-lover"] += 3
    if (finalAnswers[1] === "planner") scores["balanced-optimizer"] += 2
    if (finalAnswers[1] === "intuitive") scores["intuitive-grazer"] += 3

    // Q3: Snacking triggers
    if (finalAnswers[2] === "stress") scores["stress-eater"] += 3
    if (finalAnswers[2] === "social") scores["social-butterfly"] += 3
    if (finalAnswers[2] === "boredom") scores["night-owl-snacker"] += 2
    if (finalAnswers[2] === "hunger") scores["intuitive-grazer"] += 2

    // Q4: Ideal meal
    if (finalAnswers[3] === "comfort") scores["stress-eater"] += 2
    if (finalAnswers[3] === "balanced") scores["balanced-optimizer"] += 3

    // Q5: Stress response
    if (finalAnswers[4] === "overeat") scores["stress-eater"] += 3
    if (finalAnswers[4] === "crave") scores["stress-eater"] += 2
    if (finalAnswers[4] === "stable") scores["balanced-optimizer"] += 3

    // Q6: Biggest challenge
    if (finalAnswers[5] === "late_night") scores["night-owl-snacker"] += 3
    if (finalAnswers[5] === "consistency") scores["routine-lover"] += 2

    // Find highest score
    const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    const personality = PERSONALITY_TYPES[topType as keyof typeof PERSONALITY_TYPES]

    setResult({ type: topType, ...personality })

    // Save to database
    if (userId) {
      setSaving(true)
      try {
        await supabase.from("nutrition_personality").upsert({
          user_id: userId,
          personality_type: topType,
          quiz_answers: finalAnswers,
          strategies: personality.strategies,
        })
      } catch (error) {
        console.error("Error saving personality:", error)
      } finally {
        setSaving(false)
      }
    }
  }

  const resetQuiz = () => {
    setStep(0)
    setAnswers([])
    setResult(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-card border border-border/50 p-6">
        {!result ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nutrition Personality</h3>
                <p className="text-xs text-muted-foreground">Question {step + 1} of {QUESTIONS.length}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#c9fa5f] transition-all duration-300 rounded-full"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            <div className="mb-6">
              <h4 className="text-base font-semibold text-foreground mb-4">
                {QUESTIONS[step].q}
              </h4>
              <div className="space-y-2">
                {QUESTIONS[step].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      answers[step] === option.value
                        ? "border-[#c9fa5f] bg-[#c9fa5f]/10"
                        : "border-border/50 bg-muted/30 hover:border-[#c9fa5f]/50 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="w-full"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Your Nutrition Personality</h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{result.icon}</div>
              <h4 className="text-xl font-bold text-foreground mb-2">{result.name}</h4>
              <p className="text-sm text-muted-foreground">{result.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#c9fa5f]" />
                <h5 className="text-sm font-semibold text-foreground">Your Personalized Strategies</h5>
              </div>
              <div className="space-y-2">
                {result.strategies.map((strategy: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#c9fa5f]">{idx + 1}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{strategy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetQuiz}
                className="flex-1"
              >
                Retake Quiz
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
              >
                Got it!
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}