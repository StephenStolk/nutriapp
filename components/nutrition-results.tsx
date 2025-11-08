"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MealRecommendations } from "@/components/meal-recommendations"
import { BookmarkPlus, Check, Flame, Zap } from "lucide-react"
import { useState } from "react"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"

interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  analysis: string
  recommendations: string[]
  ingredients?: string[]
  notes?: string
}

interface NutritionResultsProps {
  data: NutritionData
  mealType: MealType
  selectedImage?: string
}

export function NutritionResults({ data, mealType, selectedImage }: NutritionResultsProps) {
  const [isLogged, setIsLogged] = useState<boolean>(false)
  const [isLogging, setIsLogging] = useState<boolean>(false)

  const macronutrients = [
    { name: "Protein", value: data.protein, unit: "g", color: "bg-primary", max: 50 },
    { name: "Carbs", value: data.carbs, unit: "g", color: "bg-primary", max: 60 },
    { name: "Fat", value: data.fat, unit: "g", color: "bg-accent", max: 30 },
  ]

  const micronutrients = [
    { name: "Fiber", value: data.fiber, unit: "g", icon: "🌾" },
    { name: "Sugar", value: data.sugar, unit: "g", icon: "🍯" },
    { name: "Sodium", value: data.sodium, unit: "mg", icon: "🧂" },
  ]

  const derivedIngredients = (() => {
    if (Array.isArray(data.ingredients) && data.ingredients.length > 0) return data.ingredients
    const lines = (data.analysis || "").split("\n")
    const start = lines.findIndex((l) => /(ingredients|foods? (identified|seen))/i.test(l))

    if (start === -1) return []
    const collected: string[] = []
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) break
     
      let cleaned = line
      if (/^\d+\.\s+/.test(cleaned)) cleaned = cleaned.replace(/^\d+\.\s+/, "")
      else if (/^[-*•]\s+/.test(cleaned)) cleaned = cleaned.replace(/^[-*•]\s+/, "")

      else break
      if (cleaned) collected.push(cleaned)
    }
    return collected.filter(Boolean).slice(0, 12)
  })()

  const mealBudget = {
    breakfast: 600,
    lunch: 800,
    dinner: 800,
    snacks: 300,
  }[mealType]
  const ringPct = Math.min(100, Math.max(0, (data.calories / mealBudget) * 100))

  const supabase = createClient();
  const {user, userId} = useUser();
  const router = useRouter();
  const handleLogFood = async () => {
    if (!userId) {
    console.error("User not logged in");
    alert("Please sign in to log your food.");
    router.push('/signin');
    return;
  }
    setIsLogging(true)

     try {
    // Food entry data
    const foodEntry = {
      user_id: userId,
      meal_type: mealType,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber ?? null,
      sugar: data.sugar ?? null,
      sodium: data.sodium ?? null,
      ingredients: data.ingredients ?? [],
      analysis: data.analysis ?? null,
      notes: data.notes || null
    };

    // Save to Supabase
    const { error } = await supabase.from("food_logs").insert(foodEntry);

    if (error) throw error;

    setIsLogged(true);

    // Show success for 2 seconds
    setTimeout(() => {
      setIsLogged(false);
    }, 2000);
    } catch (error) {
      console.error("Error logging food:", error)
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <Card className="p-6 bg-primary/5 border-primary/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            
            <div
              className="w-24 h-24 rounded-full grid place-items-center"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${ringPct}%, hsl(var(--muted)) ${ringPct}% 100%)`,
              }}
              aria-label="Calories ring"
            >
              <div className="w-20 h-20 rounded-full bg-background overflow-hidden shadow-inner">
                {selectedImage ? (
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Analyzed food"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center">
                    <Flame className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground leading-none">{data.calories}</div>
              <div className="text-xs text-muted-foreground font-medium">kcal</div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {Math.round(ringPct)}% of your {mealType} target ({mealBudget} kcal)
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 rounded-full">
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Log Food Button */}
      <Button
        onClick={handleLogFood}
        disabled={isLogging || isLogged}
        className={`w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
          isLogged
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
      >
        {isLogged ? (
          <>
            <Check className="h-5 w-5 mr-3" />
            Logged Successfully!
          </>
        ) : (
          <>
            <BookmarkPlus className="h-5 w-5 mr-3" />
            {isLogging ? "Logging..." : "Log My Food"}
          </>
        )}
      </Button>

      {/* Macronutrients */}
      <Card className="p-6 shadow-lg">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center">
          <div className="w-2 h-2 bg-primary rounded-full mr-2" />
          Macronutrients
        </h3>
        <div className="space-y-4">
          {macronutrients.map((macro) => (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{macro.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-foreground">
                  {macro.value}
                  {macro.unit}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${macro.color}`}
                  style={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

     
      <Card className="p-6 shadow-lg">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center">
          <div className="w-4 h-4 bg-accent rounded-full mr-2" />
          Other Nutrients
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {micronutrients.map((micro) => (
            <div key={micro.name} className="text-center p-3 rounded-xl bg-muted/30">
              <div className="text-lg mb-1">{micro.icon}</div>
              <div className="text-base font-bold text-foreground">
                {micro.value}
                {micro.unit}
              </div>
              <div className="text-xs text-muted-foreground font-medium">{micro.name}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ingredients */}
      {derivedIngredients.length > 0 && (
        <Card className="p-6 shadow-lg">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center">
            <div className="w-4 h-4 bg-primary rounded-full mr-2" />
            Identified Ingredients
          </h3>

          <div className="flex flex-wrap gap-2">

            {derivedIngredients.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs rounded-full px-3 py-1">
                {item}

              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Analysis */}
      <Card className="p-6 bg-muted/10 shadow-lg">
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center">

          <Zap className="w-4 h-4 text-primary mr-2" />
          AI Analysis
        </h3>
        <MarkdownRenderer content={data.analysis} />
      </Card>

      {/* Recommendations */}
      <Card className="p-6 shadow-lg">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center">
          <div className="w-4 h-4 bg-primary rounded-full mr-2" />
          
          Health Tips
        </h3>
        <div className="space-y-3">
          {data.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary-foreground font-bold">{index + 1}</span>
              </div>
              <div className="text-sm text-foreground leading-relaxed">
                <MarkdownRenderer content={rec} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <MealRecommendations currentMeal={mealType} nutritionData={data} />
    </div>
  )
}
