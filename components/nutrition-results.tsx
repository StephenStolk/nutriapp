"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MealRecommendations } from "@/components/meal-recommendations"
import { BookmarkPlus, Check } from "lucide-react"
import { useState, useEffect } from "react"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

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

  // ✅ NEW FIELDS
  suggestedNames?: string[]  // ADD THIS LINE
  selectedFoodName?: string
  servingSize?: string
  servingUnit?: string
  vitamins?: Record<string, string>
  minerals?: Record<string, string>
}

interface NutritionResultsProps {
  data: NutritionData
  mealType: MealType
  selectedImage?: string
}

export function NutritionResults({ data, mealType }: NutritionResultsProps) {
  const [isLogged, setIsLogged] = useState(false)
  const [isLogging, setIsLogging] = useState(false)

  const supabase = createClient()
  const { userId } = useUser()
  const router = useRouter()

  const [isEditingName, setIsEditingName] = useState(false)
const [customName, setCustomName] = useState("")
const [selectedFoodName, setSelectedFoodName] = useState<string>(() => {
  // Set initial selected name
  if (data.suggestedNames && data.suggestedNames.length > 0) {
    return data.suggestedNames[0]
  }
  return ""
})

useEffect(() => {
  if (data.suggestedNames && data.suggestedNames.length > 0 && !selectedFoodName) {
    setSelectedFoodName(data.suggestedNames[0])
  }
}, [data.suggestedNames])

  const derivedIngredients = (() => {
    if (Array.isArray(data.ingredients) && data.ingredients.length > 0)
      return data.ingredients
    return []
  })()

  const handleLogFood = async () => {
  if (!userId) {
    alert("Please sign in to log your food.")
    router.push("/signin")
    return
  }

  if (!selectedFoodName) {
    alert("Please select or enter a food name first.")
    return
  }

  setIsLogging(true)
  try {
    const foodEntry = {
      user_id: userId,
      meal_type: mealType,
      food_name: selectedFoodName, // ← Add this
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber ?? null,
      sugar: data.sugar ?? null,
      sodium: data.sodium ?? null,
      serving_size: data.servingSize ?? null,
      serving_unit: data.servingUnit ?? null,
      vitamins: data.vitamins ?? {},
      minerals: data.minerals ?? {},
      ingredients: data.ingredients ?? [],
      analysis: data.analysis ?? null,
      notes: data.notes || null,
    }

    const { error } = await supabase.from("food_logs").insert(foodEntry)
    if (error) throw error

    setIsLogged(true)
    setTimeout(() => {
      setIsLogged(false)
      router.push(`/${userId}/nutrition`)
    }, 1500)
  } catch (err) {
    console.error("Logging error:", err)
    alert("Failed to log food. Please try again.")
  } finally {
    setIsLogging(false)
  }
}

  return (
  <div className="min-h-screen bg-black pb-24">
    {/* Hero Section with Food Image/Name */}
    <div className="relative h-48">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl">🍽️</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          {selectedFoodName || "Select your meal"}
        </h1>
        {!selectedFoodName && (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm text-[#c9fa5f] font-semibold hover:underline"
          >
            Choose from suggestions →
          </button>
        )}
        {selectedFoodName && data.servingSize && data.servingUnit && (
          <p className="text-sm text-gray-400">
            Serving: {data.servingSize} {data.servingUnit}
          </p>
        )}
      </div>
    </div>

    {/* Calories Hero Card */}
    <div className="mx-1.5 -mt-8 mb-6">
      <Card className="relative overflow-hidden bg-[#161616] rounded-sm px-6">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white/70 mb-1">Total Calories</p>
            <p className="text-3xl font-black text-white">{data.calories}</p>
            <p className="text-sm text-white/70 mt-1">kcal</p>
          </div>
          {/* <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center">
            <span className="text-4xl">🔥</span>
          </div> */}
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-black/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/5 rounded-full" />
      </Card>
    </div>

    {/* Macronutrients Grid */}
    <div className="mx-1.5 mb-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Macronutrients
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <Card className="h-[160px] bg-[#161616] rounded-sm p-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-0 flex items-center justify-center">
              <span className="text-lg">💪</span>
            </div>
            <p className="text-2xl font-bold text-white">{data.protein}g</p>
            <p className="text-xs text-gray-400">Protein</p>
          </div>
        </Card>

        <Card className="h-[160px] bg-[#161616] rounded-sm p-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-0 flex items-center justify-center">
              <span className="text-lg">🌾</span>
            </div>
            <p className="text-2xl font-bold text-white">{data.carbs}g</p>
            <p className="text-xs text-gray-400 mt-1">Carbs</p>
          </div>
        </Card>

        <Card className="h-[160px] rounded-sm bg-[#161616] p-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-0 flex items-center justify-center">
              <span className="text-lg">🥑</span>
            </div>
            <p className="text-2xl font-bold text-white">{data.fat}g</p>
            <p className="text-xs text-gray-400 mt-1">Fat</p>
          </div>
        </Card>
      </div>
    </div>

    {/* Additional Nutrients */}
    <div className="mx-1.5 mb-6">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[#161616] rounded-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{data.fiber}g</p>
              <p className="text-xs text-gray-400">Fiber</p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#161616] rounded-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="text-lg">🍬</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{data.sugar}g</p>
              <p className="text-xs text-gray-400">Sugar</p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    {/* Ingredients */}
    {derivedIngredients.length > 0 && (
      <div className="mx-1.5 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Ingredients
        </h3>
        <Card className="bg-gray-900 border-gray-800 rounded-sm p-5">
          <div className="flex flex-wrap gap-2">
            {derivedIngredients.map((item, i) => (
              <Badge key={i} className="bg-[#c9fa5f]/10 text-[#c9fa5f] border-[#c9fa5f]/30 rounded-full px-3 py-1 text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    )}

    {/* Analysis */}
    <div className="mx-1.5 mb-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Nutritional Analysis
      </h3>
      <Card className="bg-[#161616] border-gray-800 rounded-sm p-4">
        <div className="flex items-start gap-3 mb-3">
          {/* <div className="w-10 h-10 rounded-xl bg-[#c9fa5f]/20 border border-[#c9fa5f]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📊</span>
          </div> */}
          <MarkdownRenderer content={data.analysis} />
        </div>
      </Card>
    </div>

    {/* Recommendations */}
    <div className="mx-1.5 mb-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        Health Tips
        
      </h3>
      <div className="space-y-3">
        {data.recommendations.map((rec, i) => (
          <Card key={i} className="bg-gradient-to-r from-[#c9fa5f]/10 to-transparent border-[#c9fa5f]/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c9fa5f] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-black">{i + 1}</span>
              </div>
              <div className="flex-1 pt-1">
                <MarkdownRenderer content={rec} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>


   <div className="mb-1 p-4 pt-8">
  <Button
    onClick={handleLogFood}
    disabled={isLogging || isLogged || !selectedFoodName}
    className="w-full h-14 text-base font-bold rounded-sm bg-[#c9fa5f] text-black hover:bg-[#b8e954] transition-all"
  >
    {isLogged ? (
      <>
        <Check className="h-5 w-5 mr-2" />
        Logged Successfully!
      </>
    ) : (
      <>
        <BookmarkPlus className="h-5 w-5 mr-2" />
        {isLogging ? "Logging..." : "Log My Food"}
      </>
    )}
  </Button>
</div>

    {/* Food Name Selection Modal */}
    {isEditingName && (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end animate-in fade-in duration-200">
        <Card className="w-full bg-gray-900 border-t-2 border-[#c9fa5f]/30 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">What's this dish?</h3>
            <p className="text-sm text-gray-400">
              Select from AI suggestions or enter custom name
            </p>
          </div>

          <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto">
            {(data.suggestedNames || []).map((name: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedFoodName(name)
                  setIsEditingName(false)
                  setCustomName("")
                }}
                className="w-full p-4 rounded-2xl text-left transition-all bg-gray-800 hover:bg-gray-700 border-2 border-transparent hover:border-[#c9fa5f]/50"
              >
                <p className="font-semibold text-white">{name}</p>
              </button>
            ))}

            <div className="pt-3 border-t border-gray-800">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Or type your own..."
                className="w-full p-4 rounded-2xl bg-gray-800 text-white border-2 border-gray-700 focus:border-[#c9fa5f] outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingName(false)
                setCustomName("")
              }}
              className="flex-1 h-12 rounded-xl border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (customName.trim()) {
                  setSelectedFoodName(customName.trim())
                  setIsEditingName(false)
                  setCustomName("")
                }
              }}
              disabled={!customName.trim()}
              className="flex-1 h-12 rounded-xl bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-bold"
            >
              Confirm Custom
            </Button>
          </div>
        </Card>
      </div>
    )}

    <MealRecommendations currentMeal={mealType} nutritionData={data} />
  </div>
)
}
