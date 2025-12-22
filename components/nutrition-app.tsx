"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, RotateCcw } from "lucide-react"
import { MealCategorization } from "@/components/meal-categorization"
import { NutritionResults } from "@/components/nutrition-results"
import { FoodNameSelector } from "@/components/food-name-selector"

import { MealPlannerEnhanced } from "./meal-planner"
import { UserProfile } from "@/components/user-profile"
import { QuickMeals } from "@/components/quick-meals"
import { TodoList } from "@/components/todo-list"
import { Dashboard } from "@/components/dashboard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BottomNav } from "@/components/bottom-nav"
import { Journal } from "@/components/journal"
import { useUser } from "@/hooks/use-user"
import { useSubscription } from "@/hooks/use-subscription"
import { createClient } from "@/lib/supabase/client"
import { StepsTracker } from "@/components/steps-tracker"
import { WaterTracker } from "./water-tracker"
import { ExerciseTracker } from "./exercise-tracker"
import { WeightGoalPlanner } from "./weight-goal-planner"
import { Label } from "recharts"
import { ThemeToggle } from "./theme-toggle"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"
type ActivePage =
  | "home"
  | "dashboard"
  | "meal-planner"
  | "profile"
  | "quick-meals"
  | "todos"
  | "journal"
  | "steps"
  | "water"
  | "exercise"
  | "weight-goal"

export default function NutritionApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [nutritionData, setNutritionData] = useState<any>(null)
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")
  const [sideImage, setSideImage] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>("")

  const [showFoodNameSelector, setShowFoodNameSelector] = useState(false)
const [currentFoodLogId, setCurrentFoodLogId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const sideFileRef = useRef<HTMLInputElement>(null)
  const sideCameraRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()
  const { user, userId } = useUser()
  const [shortName, setShortName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const { plan, refreshSubscription } = useSubscription()

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return

      const { data, error } = await supabase.from("profiles").select("username").eq("id", userId).single()

      if (error) console.error("Error fetching username:", error)

      let displayName: string
      if (data?.username) {
        displayName = data.username.slice(0, 2).toUpperCase()
      } else {
        displayName = user.email?.split("@")[0].slice(0, 2).toUpperCase() ?? ""
      }

      setShortName(displayName)
      setLoading(false)
    }

    fetchUserName()
  }, [user, supabase])

  const canAnalyzeFood = (() => {
    if (!plan) return false

    if (plan.plan_name === "Pro Plan") return true

    if (plan.plan_name === "Free") {
      const last = plan.last_used_analyze_food ? new Date(plan.last_used_analyze_food) : null

      if (!last) return true // never used
      const ms24 = 24 * 60 * 60 * 1000
      const usedWithin24h = Date.now() - last.getTime() < ms24
      return !usedWithin24h
    }
    return false
  })()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setNutritionData(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleSideUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setSideImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }


  // REPLACE the handleAnalyze function (around line 105) with:

const handleAnalyze = async () => {
  if (!selectedImage || !mealType) return
  if (!canAnalyzeFood) {
    console.log("You've already used this feature today. Try again tomorrow!")
    return
  }

  setIsAnalyzing(true)

  try {
    const response = await fetch("/api/analyze-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: selectedImage,
        sideImage,
        mealType,
        notes: notes?.trim() || undefined,
      }),
    })

    if (!response.ok) throw new Error("Analysis failed")

    const data = await response.json()

    if (plan?.plan_name === "Free") {
      await fetch("/api/mark-feature-used", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "used_analyze_food",
          lastUsedColumn: "last_used_analyze_food",
        }),
      })
      await refreshSubscription()
    }

    setNutritionData(data)
    
    // Store the food log ID for later update
    if (data.foodLogId) {
      setCurrentFoodLogId(data.foodLogId)
    }
    
    // Show food name selector if we have suggestions
    if (data.suggestedNames && data.suggestedNames.length > 0) {
      setShowFoodNameSelector(true)
    }
    
  } catch (error) {
    console.error("Analysis error:", error)
      setNutritionData({
        calories: 400,
        protein: 22,
        carbs: 35,
        fat: 16,
        fiber: 6,
        sugar: 10,
        sodium: 600,
        analysis: "Unable to analyze the image at this time. Please try again later.",
        recommendations: [
          "Try to include a variety of colorful vegetables",
          "Balance your meals with protein, carbs, and healthy fats",
          "Stay hydrated throughout the day",
        ],
      })
  } finally {
    setIsAnalyzing(false)
  }
}

// ADD this new function in NutritionApp component (after handleAnalyze):

const handleFoodNameSelect = async (selectedName: string) => {
  if (!currentFoodLogId) return

  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from("food_logs")
      .update({ food_name: selectedName })
      .eq("id", currentFoodLogId)

    if (error) {
      console.error("Error updating food name:", error)
    } else {
      // Update local nutrition data
      setNutritionData((prev: any) => ({
        ...prev,
        selectedFoodName: selectedName
      }))
    }
  } catch (error) {
    console.error("Error in handleFoodNameSelect:", error)
  }
}

  const handleReset = () => {
    setSelectedImage(null)
    setMealType(null)
    setNutritionData(null)
    setIsAnalyzing(false)
    setSideImage(null)
    setNotes("")
  }

  const handleNavigation = (page: ActivePage) => {
  setActivePage(page)
}

  const handleAddFoodFromDashboard = (mealType: "breakfast" | "lunch" | "dinner" | "snacks") => {
    setActivePage("home")
    setMealType(mealType)
  }

  return (
    <div className="min-h-screen bg-background px-2">
      {/* <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
  <div className="m-auto w-full px-4 py-3">
    <div className="flex items-center justify-between px-1">
      <h1 className="text-xl font-bold text-foreground pt-3">Kalnut.</h1>

      <div className="flex items-center gap-4">

        Appearance + Theme Toggle
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Appearance</Label>
          <ThemeToggle />
        </div>

      
        {activePage === "home" && selectedImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset</span>
          </Button>
        )}

     
        <button
          onClick={() => handleNavigation("profile")}
          className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open profile"
          title="Profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm">{shortName}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </div>
  </div>
</header> */}


      <main className="container mx-auto w-full max-w-md px-4 py-4 md:py-6 pb-36">
        {activePage === "profile" && <UserProfile />}
        {activePage === "dashboard" && <Dashboard onAddFood={handleAddFoodFromDashboard} />}
        {activePage === "meal-planner" && <MealPlannerEnhanced />}
        {activePage === "quick-meals" && <QuickMeals />}
        {activePage === "todos" && <TodoList onOpenJournal={() => setActivePage("journal")} />}
        {activePage === "journal" && <Journal onBack={() => setActivePage("todos")} />}
        {activePage === "steps" && <StepsTracker />}
        {activePage === "water" && <WaterTracker />}
        {activePage === "exercise" && <ExerciseTracker />}
        {activePage === "weight-goal" && <WeightGoalPlanner />}

        {activePage === "home" && (
          <>
            {!selectedImage ? (
              <div className="space-y-6 md:space-y-8 animate-slide-up pb-20">
                <div className="text-center space-y-2 md:space-y-3 mt-12">
                  <h2 className="text-md md:text-2xl font-bold text-foreground">Analyze Your Food</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed px-1 md:px-2">
                    Take a photo or upload an image of your meal to get instant nutritional insights and track your
                    daily intake
                  </p>
                </div>

                <Card className="relative overflow-hidden border-2 border-dashed border-[#c9fa5f]/30 hover:border-[#c9fa5f]/50 transition-all duration-300 rounded-2xl">
  <div className="absolute inset-0 bg-gradient-to-br from-[#c9fa5f]/5 to-transparent" />
  <div className="relative p-8 md:p-10">
    <div className="flex flex-col items-center space-y-6">
      {/* Camera Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-[#c9fa5f] flex items-center justify-center shadow-lg">
          <Camera className="h-10 w-10 text-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
          <span className="text-xs">✓</span>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          Capture or Upload
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Get instant nutritional analysis powered by AI
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col w-full space-y-3 pt-4 max-w-xs">
        <Button
          onClick={handleCameraCapture}
          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-[#c9fa5f] hover:bg-[#b8e954] text-black"
          size="lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          Take Photo
        </Button>

        <Button
          onClick={handleFileSelect}
          variant="outline"
          className="w-full h-12 text-base font-semibold border-2 border-[#c9fa5f]/30 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/50 transition-all duration-300 rounded-xl"
          size="lg"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Image
        </Button>
      </div>
    </div>
  </div>
</Card>

                {/* <Card className="p-5 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 rounded-[5px]">
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-sm md:text-base font-semibold text-foreground">Optional: Improve accuracy</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 min-w-0">
                        <Button
                          onClick={() => sideCameraRef.current?.click()}
                          variant="default"
                          className="w-full h-10 sm:flex-1 rounded-[5px] h-10 md:h-12 text-sm md:text-base whitespace-nowrap"
                        >
                          <Camera className="h-5 w-5 md:h-5 md:w-5 mr-2" />
                          <span className="md:hidden">Add Side</span>
                          <span className="hidden md:inline">Add Side View</span>
                        </Button>
                        <Button
                          onClick={() => sideFileRef.current?.click()}
                          variant="outline"
                          className="w-full sm:flex-1 rounded-[5px] h-10 md:h-12 text-sm md:text-base whitespace-nowrap"
                        >
                          <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span className="md:hidden">Upload</span>
                          <span className="hidden md:inline">Upload Side Image</span>
                        </Button>
                      </div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-[5px] bg-background border border-gray-800 p-2.5 md:p-3 text-sm"
                        placeholder="Optional notes: e.g., 'chicken, white rice, avocado; ~1 tbsp olive oil'"
                      />
                      {sideImage && (
                        <div className="flex items-center gap-3">
                          <img
                            src={sideImage || "/placeholder.svg"}
                            alt="Side view"
                            className="h-14 w-14 md:h-16 md:w-16 rounded-[5px] object-cover border"
                          />
                          <span className="text-xs md:text-sm text-muted-foreground">Side view added</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card> */}

                <Card className="p-5 bg-gradient-to-br from-[#c9fa5f]/5 to-transparent border-[#c9fa5f]/10 rounded-2xl">
  <div className="flex items-start space-x-3">
    <div className="w-10 h-10 rounded-xl bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0">
      <span className="text-lg">💡</span>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-2">Pro Tips</h4>
      <ul className="text-sm text-muted-foreground space-y-1.5 leading-relaxed">
        <li className="flex items-start gap-2">
          <span className="text-[#c9fa5f] mt-0.5">•</span>
          <span>Ensure good lighting for better analysis</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#c9fa5f] mt-0.5">•</span>
          <span>Include the entire meal in the frame</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#c9fa5f] mt-0.5">•</span>
          <span>Avoid shadows and reflections</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#c9fa5f] mt-0.5">•</span>
          <span>Add a reference object for better results</span>
        </li>
      </ul>
    </div>
  </div>
</Card>

                {/* Hidden file inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={sideCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSideUpload}
                  className="hidden"
                />
                <input ref={sideFileRef} type="file" accept="image/*" onChange={handleSideUpload} className="hidden" />
              </div>
            ) : (
              <div className="space-y-5 md:space-y-6 animate-slide-up pb-20">
                <Card className="overflow-hidden shadow-xl rounded-3xl border-0">
                  <div className="aspect-square relative">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Food to analyze"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </Card>

                {/* Meal Categorization */}
                {!nutritionData && <MealCategorization selectedMeal={mealType} onMealSelect={setMealType} />}

                {!nutritionData && mealType && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={!canAnalyzeFood || isAnalyzing}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-[5px] mb-20"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Analyzing...
                      </>
                    ) : (
                      <span>✨ Analyze Nutrition</span>
                    )}
                  </Button>
                )}

                {/* Results */}
                {nutritionData && (
                  <NutritionResults data={nutritionData} mealType={mealType!} selectedImage={selectedImage} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav activePage={activePage as any} onNavigate={handleNavigation as unknown as (page: any) => void} />

        {/* Food Name Selector Modal */}
{nutritionData && (
  <FoodNameSelector
    suggestedNames={nutritionData.suggestedNames || []}
    onSelect={handleFoodNameSelect}
    isOpen={showFoodNameSelector}
    onClose={() => setShowFoodNameSelector(false)}
  />
)}
    </div>
  )
}
