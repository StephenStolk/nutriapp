"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Target, Activity, User, X, TrendingUp, Apple, Utensils } from "lucide-react"

interface CalorieCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (calories: number) => void
}

interface CalorieResult {
  bmr: number
  tdee: number
  goalCalories: number
  macros: {
    protein: { grams: number; calories: number }
    carbs: { grams: number; calories: number }
    fat: { grams: number; calories: number }
  }
  range: { min: number; max: number }
  guidance: string[]
  mealExample: string
}

export function CalorieCalculatorModal({ isOpen, onClose, onSave }: CalorieCalculatorModalProps) {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    goal: "",
  })
  const [result, setResult] = useState<CalorieResult | null>(null)

  const activityLevels = [
    { value: "1.2", label: "Sedentary (little/no exercise)" },
    { value: "1.375", label: "Lightly active (light exercise 1-3 days/week)" },
    { value: "1.55", label: "Moderately active (moderate exercise 3-5 days/week)" },
    { value: "1.725", label: "Very active (hard exercise 6-7 days/week)" },
    { value: "1.9", label: "Extra active (very hard exercise, physical job)" },
  ]

  const goals = [
    { value: "lose-slow", label: "Lose weight slowly (-300 kcal/day)" },
    { value: "lose-fast", label: "Lose weight faster (-500 kcal/day)" },
    { value: "maintain", label: "Maintain weight" },
    { value: "gain-muscle", label: "Gain muscle (+300 kcal/day)" },
    { value: "gain-fast", label: "Gain weight faster (+500 kcal/day)" },
  ]

  const calculateCalories = () => {
    const age = Number.parseInt(formData.age)
    const weight = Number.parseFloat(formData.weight)
    const height = Number.parseFloat(formData.height)
    const activityMultiplier = Number.parseFloat(formData.activityLevel)

    let bmr: number
    if (formData.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    const tdee = bmr * activityMultiplier

    let goalCalories = tdee
    let deficit = 0

    switch (formData.goal) {
      case "lose-slow":
        deficit = 300
        goalCalories = tdee - deficit
        break
      case "lose-fast":
        deficit = 500
        goalCalories = tdee - deficit
        break
      case "gain-muscle":
        goalCalories = tdee + 300
        break
      case "gain-fast":
        goalCalories = tdee + 500
        break
      default: // maintain
        goalCalories = tdee
    }

    let proteinRatio = 0.25,
      carbRatio = 0.45,
      fatRatio = 0.3

    if (formData.goal.includes("lose")) {
      proteinRatio = 0.35 // Higher protein for weight loss
      carbRatio = 0.35
      fatRatio = 0.3
    } else if (formData.goal.includes("gain")) {
      proteinRatio = 0.25
      carbRatio = 0.5 // Higher carbs for muscle gain
      fatRatio = 0.25
    }

    const macros = {
      protein: {
        calories: Math.round(goalCalories * proteinRatio),
        grams: Math.round((goalCalories * proteinRatio) / 4),
      },
      carbs: {
        calories: Math.round(goalCalories * carbRatio),
        grams: Math.round((goalCalories * carbRatio) / 4),
      },
      fat: {
        calories: Math.round(goalCalories * fatRatio),
        grams: Math.round((goalCalories * fatRatio) / 9),
      },
    }

    const range = {
      min: Math.round(goalCalories - 100),
      max: Math.round(goalCalories + 100),
    }

    const guidance: string[] = []
    if (macros.protein.grams < weight * 1.2) {
      guidance.push("Consider increasing protein for better recovery and muscle maintenance.")
    }
    if (formData.goal.includes("lose") && macros.carbs.grams > 150) {
      guidance.push("You might benefit from slightly reducing carbs to enhance fat loss.")
    }
    if (macros.fat.grams < 50) {
      guidance.push("Ensure you include healthy fats for hormone balance and nutrient absorption.")
    }
    if (goalCalories < bmr * 1.1) {
      guidance.push("Your target is quite low. Consider a more moderate approach for sustainability.")
    }

    let mealExample = ""
    if (goalCalories < 1600) {
      mealExample =
        "Breakfast: Greek yogurt with berries (300 kcal) • Lunch: Grilled chicken salad (400 kcal) • Dinner: Baked fish with vegetables (500 kcal) • Snacks: Apple with almonds (300 kcal)"
    } else if (goalCalories < 2200) {
      mealExample =
        "Breakfast: Oatmeal with banana and nuts (450 kcal) • Lunch: Turkey sandwich with avocado (550 kcal) • Dinner: Lean beef with rice and vegetables (700 kcal) • Snacks: Protein smoothie (400 kcal)"
    } else {
      mealExample =
        "Breakfast: Eggs with toast and avocado (600 kcal) • Lunch: Chicken bowl with quinoa (700 kcal) • Dinner: Salmon with sweet potato (800 kcal) • Snacks: Trail mix and protein bar (600 kcal)"
    }

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories: Math.round(goalCalories),
      macros,
      range,
      guidance,
      mealExample,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = Object.values(formData).every((value) => value !== "")

  const handleSave = () => {
    if (result) {
      onSave(result.goalCalories)
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      age: "",
      gender: "",
      weight: "",
      height: "",
      activityLevel: "",
      goal: "",
    })
    setResult(null)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Calorie Calculator</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="w-8 h-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!result ? (
            <div className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-medium text-foreground">
                  <User className="h-3 w-3 text-primary" />
                  <span>Personal Information</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs text-muted-foreground">
                      Age (years)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gender" className="text-xs text-muted-foreground">
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="text-sm h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="weight" className="text-xs text-muted-foreground">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="height" className="text-xs text-muted-foreground">
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-medium text-foreground">
                  <Activity className="h-3 w-3 text-primary" />
                  <span>Activity Level</span>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="activity" className="text-xs text-muted-foreground">
                    Daily Activity
                  </Label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={(value) => handleInputChange("activityLevel", value)}
                  >
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="text-xs">
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-medium text-foreground">
                  <Target className="h-3 w-3 text-primary" />
                  <span>Goal</span>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="goal" className="text-xs text-muted-foreground">
                    What's your goal?
                  </Label>
                  <Select value={formData.goal} onValueChange={(value) => handleInputChange("goal", value)}>
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value} className="text-xs">
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateCalories} disabled={!isFormValid} className="w-full h-10" size="default">
                <Calculator className="h-4 w-4 mr-2" />
                <span className="text-sm">Calculate My Daily Calories</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main Result */}
              <div className="text-center space-y-2 p-4 bg-primary/5 rounded-lg">
                <h4 className="text-base font-semibold text-foreground">Your Daily Calorie Target</h4>
                <div className="text-2xl font-bold text-primary">{result.goalCalories} kcal</div>
                <div className="text-xs text-muted-foreground">
                  Range: {result.range.min} - {result.range.max} kcal/day
                </div>
              </div>

              {/* Macronutrient Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>Macronutrient Breakdown</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-xs text-muted-foreground">Protein</div>
                    <div className="text-sm font-semibold">{result.macros.protein.grams}g</div>
                    <div className="text-xs text-muted-foreground">{result.macros.protein.calories} kcal</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-xs text-muted-foreground">Carbs</div>
                    <div className="text-sm font-semibold">{result.macros.carbs.grams}g</div>
                    <div className="text-xs text-muted-foreground">{result.macros.carbs.calories} kcal</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-xs text-muted-foreground">Fat</div>
                    <div className="text-sm font-semibold">{result.macros.fat.grams}g</div>
                    <div className="text-xs text-muted-foreground">{result.macros.fat.calories} kcal</div>
                  </div>
                </div>
              </div>

              {/* Personalized Guidance */}
              {result.guidance.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-medium">
                    <Apple className="h-3 w-3 text-primary" />
                    <span>Personalized Tips</span>
                  </div>
                  <div className="space-y-1">
                    {result.guidance.map((tip, index) => (
                      <div key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Meal Structure */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <Utensils className="h-3 w-3 text-primary" />
                  <span>Example Daily Meals</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded leading-relaxed">
                  {result.mealExample}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 pt-2">
                <Button onClick={handleSave} className="w-full h-9" size="default">
                  <span className="text-sm">Use This Goal</span>
                </Button>
                <Button variant="outline" onClick={() => setResult(null)} className="w-full h-9" size="default">
                  <span className="text-sm">Recalculate</span>
                </Button>
              </div>

              {/* Call to Action */}
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Want a personalized meal plan that matches this breakdown?
                </p>
                <p className="text-xs font-medium text-primary mt-1">
                  Set your goal and start tracking your nutrition!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
