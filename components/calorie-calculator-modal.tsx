"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Target, Activity, User, X, TrendingUp, Apple, Utensils } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

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
  weeklyChange?: string
  bmi?: number
}

export default function CalorieCalculatorModal({ isOpen, onClose, onSave }: CalorieCalculatorModalProps) {
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

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr: number
    if (formData.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    const tdee = bmr * activityMultiplier

    // Calculate BMI for personalized recommendations
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    
    // Intelligent deficit/surplus calculation based on user profile
    let goalCalories = tdee
    let deficit = 0
    let adjustmentReason = ""

    switch (formData.goal) {
      case "lose-slow":
        // Adjust deficit based on BMI and weight
        if (bmi > 30) {
          deficit = 500 // Larger deficit safe for higher BMI
          adjustmentReason = "Adjusted to 500 kcal deficit based on your current weight"
        } else if (bmi < 25) {
          deficit = 250 // Smaller deficit for those closer to goal
          adjustmentReason = "Adjusted to 250 kcal deficit for sustainable fat loss"
        } else {
          deficit = 300
        }
        goalCalories = Math.max(tdee - deficit, bmr * 1.15) // Never go below 15% above BMR
        break
      case "lose-fast":
        // Smart deficit scaling
        if (bmi > 30) {
          deficit = 700
          adjustmentReason = "Adjusted to 700 kcal deficit - safe range for your current weight"
        } else if (bmi < 25) {
          deficit = 400
          adjustmentReason = "Adjusted to 400 kcal deficit - optimal for lean individuals"
        } else {
          deficit = 500
        }
        goalCalories = Math.max(tdee - deficit, bmr * 1.2) // Safety floor
        break
      case "gain-muscle":
        // Lean muscle gain - smaller surplus
        goalCalories = tdee + (activityMultiplier > 1.6 ? 350 : 300)
        break
      case "gain-fast":
        // Faster weight gain
        goalCalories = tdee + (activityMultiplier > 1.6 ? 600 : 500)
        break
      default: // maintain
        goalCalories = tdee
    }

    // Intelligent macro calculation based on multiple factors
    let proteinRatio = 0.25,
      carbRatio = 0.45,
      fatRatio = 0.3

    // Protein requirements (g/kg bodyweight approach)
    let proteinGramsPerKg = 1.6 // Base for maintenance
    
    if (formData.goal.includes("lose")) {
      proteinGramsPerKg = bmi > 28 ? 2.0 : 2.2 // Higher protein to preserve muscle
      proteinRatio = 0.35
      carbRatio = 0.35
      fatRatio = 0.3
    } else if (formData.goal.includes("gain")) {
      proteinGramsPerKg = 1.8 // Muscle building
      proteinRatio = 0.25
      carbRatio = activityMultiplier > 1.6 ? 0.50 : 0.45 // More carbs for active individuals
      fatRatio = activityMultiplier > 1.6 ? 0.25 : 0.30
    } else {
      proteinGramsPerKg = 1.6
      // Adjust for activity level
      if (activityMultiplier > 1.7) {
        carbRatio = 0.50
        proteinRatio = 0.25
        fatRatio = 0.25
      }
    }

    // Calculate optimal protein first, then balance other macros
    const optimalProteinGrams = Math.round(weight * proteinGramsPerKg)
    const proteinCalories = optimalProteinGrams * 4
    
    // Remaining calories for carbs and fats
    const remainingCalories = goalCalories - proteinCalories
    const carbCalories = Math.round(remainingCalories * (carbRatio / (carbRatio + fatRatio)))
    const fatCalories = remainingCalories - carbCalories

    const macros = {
      protein: {
        calories: proteinCalories,
        grams: optimalProteinGrams,
      },
      carbs: {
        calories: carbCalories,
        grams: Math.round(carbCalories / 4),
      },
      fat: {
        calories: fatCalories,
        grams: Math.round(fatCalories / 9),
      },
    }

    const range = {
      min: Math.round(goalCalories - 100),
      max: Math.round(goalCalories + 100),
    }

    // Intelligent, personalized guidance
    const guidance: string[] = []
    
    // Add adjustment reason if applicable
    if (adjustmentReason) {
      guidance.push(adjustmentReason)
    }

    // BMI-based insights
    if (bmi < 18.5) {
      guidance.push("Your BMI suggests you're underweight. Focus on nutrient-dense foods and consider consulting a healthcare provider.")
    } else if (bmi >= 25 && bmi < 30 && formData.goal === "maintain") {
      guidance.push("Consider a small calorie deficit to reach a healthier weight range.")
    }

    // Protein adequacy
    const proteinPerKg = macros.protein.grams / weight
    if (proteinPerKg < 1.2) {
      guidance.push(`At ${proteinPerKg.toFixed(1)}g/kg, your protein is low. Aim for ${Math.round(weight * 1.6)}g for better results.`)
    } else if (proteinPerKg >= 2.0 && formData.goal.includes("gain")) {
      guidance.push("Your protein intake is optimal for muscle building and recovery.")
    }

    // Activity-specific advice
    if (activityMultiplier >= 1.725 && macros.carbs.grams < 200) {
      guidance.push("As a very active person, consider increasing carbs to 200-250g for better performance and recovery.")
    }

    // Fat intake validation
    if (macros.fat.grams < 45) {
      guidance.push("Fat intake seems low. Include avocados, nuts, and olive oil for hormone health.")
    } else if (macros.fat.grams > 80 && formData.goal.includes("lose")) {
      guidance.push("Consider reducing fat intake slightly and increasing carbs for more energy during workouts.")
    }

    // Age-specific guidance
    if (age > 40 && proteinPerKg < 1.8) {
      guidance.push("After 40, higher protein (1.8-2.0g/kg) helps maintain muscle mass and metabolism.")
    }

    // Safety warnings
    if (goalCalories < bmr * 1.15) {
      guidance.push("⚠️ This target is very low and may slow your metabolism. Consider a more moderate approach.")
    }

    // Weekly weight change estimation
    let weeklyWeightChange = ""
    if (formData.goal.includes("lose")) {
      const weeklyDeficit = deficit * 7
      const kgPerWeek = (weeklyDeficit / 7700).toFixed(2)
      weeklyWeightChange = `Expected weight loss: ~${kgPerWeek}kg/week (${(parseFloat(kgPerWeek) * 2.205).toFixed(2)}lbs/week)`
    } else if (formData.goal.includes("gain")) {
      const surplus = goalCalories - tdee
      const weeklySurplus = surplus * 7
      const kgPerWeek = (weeklySurplus / 7700).toFixed(2)
      weeklyWeightChange = `Expected weight gain: ~${kgPerWeek}kg/week (${(parseFloat(kgPerWeek) * 2.205).toFixed(2)}lbs/week)`
    }

    // Intelligent meal example based on profile
    let mealExample = ""
    
    if (goalCalories < 1600) {
      if (formData.goal.includes("lose")) {
        mealExample = "🍳 Breakfast: Greek yogurt parfait with berries & almonds (300 kcal, 25g protein) • 🥗 Lunch: Grilled chicken salad with quinoa (450 kcal, 40g protein) • 🍲 Dinner: Baked salmon with roasted vegetables (500 kcal, 35g protein) • 🍎 Snack: Apple with protein shake (250 kcal, 20g protein)"
      } else {
        mealExample = "🍳 Breakfast: Egg white omelet with veggies (280 kcal) • 🥗 Lunch: Turkey wrap with mixed greens (420 kcal) • 🍲 Dinner: Grilled fish with steamed broccoli (480 kcal) • 🍎 Snacks: Fruit & cottage cheese (320 kcal)"
      }
    } else if (goalCalories < 2200) {
      if (activityMultiplier > 1.55) {
        mealExample = "🍳 Breakfast: Oatmeal with protein powder, banana & peanut butter (500 kcal, 35g protein) • 🥙 Lunch: Chicken burrito bowl with brown rice (650 kcal, 45g protein) • 🥩 Dinner: Lean steak with sweet potato & green beans (700 kcal, 50g protein) • 💪 Post-workout: Protein smoothie with berries (350 kcal, 30g protein)"
      } else {
        mealExample = "🍳 Breakfast: Scrambled eggs with whole wheat toast & avocado (450 kcal) • 🥗 Lunch: Turkey sandwich with side salad (550 kcal) • 🍗 Dinner: Grilled chicken breast with rice & vegetables (700 kcal) • 🥤 Snacks: Greek yogurt & mixed nuts (400 kcal)"
      }
    } else if (goalCalories < 2800) {
      mealExample = "🍳 Breakfast: 4 eggs with toast, avocado & turkey bacon (650 kcal, 45g protein) • 🥙 Lunch: Double chicken bowl with quinoa & beans (800 kcal, 60g protein) • 🥩 Dinner: Salmon with pasta & roasted vegetables (850 kcal, 50g protein) • 💪 Snacks: Protein shake, granola bar & banana (600 kcal, 35g protein)"
    } else {
      mealExample = "🍳 Breakfast: Large egg scramble with cheese, toast & fruit (750 kcal, 50g protein) • 🥙 Lunch: Double meat chipotle bowl with rice (950 kcal, 70g protein) • 🥩 Dinner: 8oz steak with loaded sweet potato & salad (1000 kcal, 65g protein) • 💪 Snacks: Mass gainer shake, trail mix & Greek yogurt (800 kcal, 50g protein)"
    }

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories: Math.round(goalCalories),
      macros,
      range,
      guidance,
      mealExample,
      weeklyChange: weeklyWeightChange,
      bmi: Math.round(bmi * 10) / 10,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = Object.values(formData).every((value) => value !== "")

  const {user, userId} = useUser();
  const supabase = createClient();

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

  const handleSave = async () => {
  if (!result) return;
  if (!userId) return;

  try {
    // 1) check if a goal exists for this user
    const { data: existing, error: selectError } = await supabase
      .from("user_goals")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing goal:", selectError);
      return;
    }

    if (existing && existing.id) {
      // 2a) update existing row
      const { error: updateError } = await supabase
        .from("user_goals")
        .update({
          daily_goal: result.goalCalories,
          effective_from: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
          // optionally update created_at? usually not
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating goal:", updateError);
        return;
      }
    } else {
      // 2b) insert new row
      const { error: insertError } = await supabase.from("user_goals").insert({
        user_id: userId,
        daily_goal: result.goalCalories,
        effective_from: new Date().toISOString().slice(0, 10),
      });

      if (insertError) {
        console.error("Error inserting goal:", insertError);
        return;
      }
    }

    // success: update UI
    onSave(result.goalCalories);
    resetForm();
     onClose();

  } catch (err) {
    console.error("Unexpected error saving goal:", err);
  }
};


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background mt-24 px-3">
      <div className="h-full overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold mt-4">Calorie Calculator</h3>
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

              <Button onClick={calculateCalories} disabled={!isFormValid} className="w-full h-10 rounded-[5px] mb-8" size="default">
                <Calculator className="h-4 w-4 mr-2" />
                <span className="text-sm">Calculate My Daily Calories</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main Result */}
              <div className="text-center space-y-2 p-4 bg-primary/5 rounded-[5px]">
                <h4 className="text-base font-semibold text-foreground">Your Daily Calorie Target</h4>
                <div className="text-2xl font-bold text-primary">{result.goalCalories} kcal</div>
                <div className="text-xs text-muted-foreground">
                  Range: {result.range.min} - {result.range.max} kcal/day
                </div>
                {result.weeklyChange && (
                  <div className="text-xs font-medium text-primary mt-2 bg-primary/10 px-3 py-1 rounded-full inline-block">
                    {result.weeklyChange}
                  </div>
                )}
                {result.bmi && (
                  <div className="text-xs text-muted-foreground mt-1">
                    BMI: {result.bmi} • BMR: {result.bmr} kcal • TDEE: {result.tdee} kcal
                  </div>
                )}
              </div>

              {/* Macronutrient Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>Macronutrient Breakdown</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm p-2 ">
                    <div className="text-xs text-muted-foreground">Protein</div>
                    <div className="text-sm font-semibold">{result.macros.protein.grams}g</div>
                    <div className="text-xs text-muted-foreground">{result.macros.protein.calories} kcal</div>
                  </div>
                  <div className="text-center p-2 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground">Carbs</div>
                    <div className="text-sm font-semibold">{result.macros.carbs.grams}g</div>
                    <div className="text-xs text-muted-foreground">{result.macros.carbs.calories} kcal</div>
                  </div>
                  <div className="text-center p-2 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
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
                <Button onClick={handleSave} className="w-full h-9 rounded-[5px]" size="default">
                  <span className="text-sm">Use This Goal</span>
                </Button>
                <Button variant="outline" onClick={() => setResult(null)} className="w-full h-9 rounded-[5px]" size="default">
                  <span className="text-sm">Recalculate</span>
                </Button>
              </div>

              {/* Call to Action */}
              <div className="text-center p-3 bg-[#c9fa5f]/10 rounded-[5px] mb-8">
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
