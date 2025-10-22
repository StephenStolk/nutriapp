"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, RotateCcw } from "lucide-react"
import { MealCategorization } from "@/components/meal-categorization"
import { NutritionResults } from "@/components/nutrition-results"
import { MealPlanner } from "@/components/meal-planner"
import { UserProfile } from "@/components/user-profile"
import { QuickMeals } from "@/components/quick-meals"
import { TodoList } from "@/components/todo-list"
import { Dashboard } from "@/components/dashboard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BottomNav } from "@/components/bottom-nav"
import { Journal } from "@/components/journal"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"
type ActivePage = "home" | "dashboard" | "meal-planner" | "profile" | "quick-meals" | "todos" | "journal"

export default function NutritionApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [nutritionData, setNutritionData] = useState<any>(null)
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")
  const [sideImage, setSideImage] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const sideFileRef = useRef<HTMLInputElement>(null)
  const sideCameraRef = useRef<HTMLInputElement>(null)

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

  const handleAnalyze = async () => {
    if (!selectedImage || !mealType) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage,
          sideImage,
          mealType,
          notes: notes?.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setNutritionData(data)
    } catch (error) {
      console.error("Analysis error:", error)
      // Fallback data in case of error
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
    // Reset home state when navigating away
    if (page !== "home") {
      handleReset()
    }
  }

  const handleAddFoodFromDashboard = (mealType: "breakfast" | "lunch" | "dinner" | "snacks") => {
    setActivePage("home")
    setMealType(mealType)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">NutriScan</h1>

            <div className="flex items-center gap-2">
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

              {/* Profile avatar on the top-right */}
              <button
                onClick={() => handleNavigation("profile")}
                className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Open profile"
                title="Profile"
              >
                <Avatar className="h-8 w-8">
                  {/* Removed AvatarImage to avoid showing a placeholder wallpaper */}
                  <AvatarFallback className="text-xs font-medium bg-muted text-foreground">NS</AvatarFallback>
                </Avatar>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-md px-4 py-4 md:py-6 pb-28">
        {activePage === "profile" && <UserProfile />}
        {activePage === "dashboard" && <Dashboard onAddFood={handleAddFoodFromDashboard} />}
        {activePage === "meal-planner" && <MealPlanner />}
        {activePage === "quick-meals" && <QuickMeals />}
        {activePage === "todos" && <TodoList onOpenJournal={() => setActivePage("journal")} />}
        {activePage === "journal" && <Journal onBack={() => setActivePage("todos")} />}

        {activePage === "home" && (
          <>
            {!selectedImage ? (
              <div className="space-y-6 md:space-y-8 animate-slide-up">
                <div className="text-center space-y-2 md:space-y-3">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Analyze Your Food</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed px-1 md:px-2">
                    Take a photo or upload an image of your meal to get instant nutritional insights and track your
                    daily intake
                  </p>
                </div>

                <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <div className="relative p-6 md:p-10">
                    <div className="flex flex-col items-center space-y-5 md:space-y-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-primary flex items-center justify-center shadow-xl">
                        <Camera className="h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>

                      <div className="text-center space-y-1.5 md:space-y-2">
                        <h3 className="text-lg md:text-xl font-semibold text-foreground">Capture or Upload</h3>
                        <p className="text-sm md:text-base text-muted-foreground">
                          Get instant nutritional analysis powered by AI
                        </p>
                      </div>

                      <div className="flex flex-col w-full space-y-3 md:space-y-4 pt-2 md:pt-4">
                        <Button
                          onClick={handleCameraCapture}
                          className="w-full h-12 md:h-14 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                          size="lg"
                        >
                          <Camera className="h-5 w-5 md:h-6 md:w-6 mr-3" />
                          Take Photo
                        </Button>

                        <Button
                          onClick={handleFileSelect}
                          variant="outline"
                          className="w-full h-12 md:h-14 text-base md:text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 rounded-2xl bg-transparent"
                          size="lg"
                        >
                          <Upload className="h-5 w-5 md:h-6 md:w-6 mr-3" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 rounded-2xl">
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-sm md:text-base font-semibold text-foreground">Optional: Improve accuracy</h4>
                    <div className="grid grid-cols-1 gap-3">
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 min-w-0">
                        <Button
                          onClick={() => sideCameraRef.current?.click()}
                          variant="secondary"
                          className="w-full sm:flex-1 rounded-2xl h-10 md:h-12 text-sm md:text-base whitespace-nowrap"
                        >
                          <Camera className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          
                          <span className="md:hidden">Add Side</span>
                          <span className="hidden md:inline">Add Side View</span>
                        </Button>
                        <Button
                          onClick={() => sideFileRef.current?.click()}
                          variant="outline"
                          className="w-full sm:flex-1 rounded-2xl h-10 md:h-12 text-sm md:text-base whitespace-nowrap"
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
                        className="w-full rounded-xl bg-background border p-2.5 md:p-3 text-sm"
                        placeholder="Optional notes: e.g., 'chicken, white rice, avocado; ~1 tbsp olive oil'"
                      />
                      {sideImage && (
                        <div className="flex items-center gap-3">
                          <img
                            src={sideImage || "/placeholder.svg"}
                            alt="Side view"
                            className="h-14 w-14 md:h-16 md:w-16 rounded-xl object-cover border"
                          />
                          <span className="text-xs md:text-sm text-muted-foreground">Side view added</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 rounded-2xl">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-base md:text-lg">💡</span>
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-foreground mb-1.5 md:mb-2">Pro Tips</h4>
                      <ul className="text-sm md:text-base text-muted-foreground space-y-1 leading-relaxed">
                        <li>• Ensure good lighting for better analysis</li>
                        <li>• Include the entire meal in the frame</li>
                        <li>• Avoid shadows and reflections</li>
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
              <div className="space-y-5 md:space-y-6 animate-slide-up">
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
                    disabled={isAnalyzing}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
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

      <BottomNav activePage={activePage} onNavigate={handleNavigation} />
    </div>
  )
}
