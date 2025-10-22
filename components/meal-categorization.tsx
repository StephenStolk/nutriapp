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
    <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-foreground">What meal is this?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose the meal type to get personalized nutritional insights
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mealOptions.map((meal) => {
            const Icon = meal.icon
            const isSelected = selectedMeal === meal.type

            return (
              <Button
                key={meal.type}
                variant="ghost"
                onClick={() => onMealSelect(meal.type)}
                className={`h-auto p-4 flex flex-col items-center space-y-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? "bg-primary/10 border-2 border-primary shadow-lg ring-2 ring-primary/20"
                    : "hover:bg-muted/50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-gradient-to-br " + meal.color : meal.bgColor
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-primary"}`} />
                </div>
                <div className="text-center space-y-1">
                  <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {meal.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{meal.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
