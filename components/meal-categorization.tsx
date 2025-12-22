"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sunrise, Sun, Moon, Cookie } from "lucide-react"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"

interface MealCategorizationProps {
  selectedMeal: MealType | null
  onMealSelect: (meal: MealType) => void
}

const mealOptions = [
  {
    type: "breakfast" as MealType,
    label: "Breakfast",
    icon: Sunrise,
    description: "Morning fuel",
    color: "from-orange-400 to-yellow-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    type: "lunch" as MealType,
    label: "Lunch",
    icon: Sun,
    description: "Midday boost",
    color: "from-blue-400 to-cyan-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    type: "dinner" as MealType,
    label: "Dinner",
    icon: Moon,
    description: "Evening meal",
    color: "from-purple-400 to-indigo-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    type: "snacks" as MealType,
    label: "Snacks",
    icon: Cookie,
    description: "Quick bite",
    color: "from-green-400 to-emerald-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
]

export function MealCategorization({ selectedMeal, onMealSelect }: MealCategorizationProps) {
  return (
    // UPDATE the MealCategorization component styling to match the theme.
// In components/meal-categorization.tsx, update the Card styles:

<Card className="p-5 bg-card border-[#c9fa5f]/10 rounded-2xl">
  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
    <span className="text-xl">🍽️</span>
    Select Meal Type
  </h3>
  
  <div className="grid grid-cols-2 gap-3">
    {/* Breakfast Button */}
    <button
      onClick={() => onMealSelect("breakfast")}
      className={`p-4 rounded-xl transition-all duration-300 ${
        selectedMeal === "breakfast"
          ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f] shadow-lg"
          : "bg-muted/20 hover:bg-muted/40 border-2 border-transparent"
      }`}
    >
      <div className="text-3xl mb-2">☕</div>
      <div className="text-sm font-semibold">Breakfast</div>
    </button>

    {/* Lunch Button */}
    <button
      onClick={() => onMealSelect("lunch")}
      className={`p-4 rounded-xl transition-all duration-300 ${
        selectedMeal === "lunch"
          ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f] shadow-lg"
          : "bg-muted/20 hover:bg-muted/40 border-2 border-transparent"
      }`}
    >
      <div className="text-3xl mb-2">🍱</div>
      <div className="text-sm font-semibold">Lunch</div>
    </button>

    {/* Dinner Button */}
    <button
      onClick={() => onMealSelect("dinner")}
      className={`p-4 rounded-xl transition-all duration-300 ${
        selectedMeal === "dinner"
          ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f] shadow-lg"
          : "bg-muted/20 hover:bg-muted/40 border-2 border-transparent"
      }`}
    >
      <div className="text-3xl mb-2">🍽️</div>
      <div className="text-sm font-semibold">Dinner</div>
    </button>

    {/* Snacks Button */}
    <button
      onClick={() => onMealSelect("snacks")}
      className={`p-4 rounded-xl transition-all duration-300 ${
        selectedMeal === "snacks"
          ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f] shadow-lg"
          : "bg-muted/20 hover:bg-muted/40 border-2 border-transparent"
      }`}
    >
      <div className="text-3xl mb-2">🍪</div>
      <div className="text-sm font-semibold">Snacks</div>
    </button>
  </div>
</Card>
  )
}
