"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "./ui/badge"
import { 
  Target, TrendingDown, Dumbbell, Wind, Heart, Sparkles,
  ChevronRight, ChevronLeft, Calendar,
  MapPin, DollarSign, Clock, Users, Salad, ChefHat,
  BookOpen, Flame, X
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { useSubscription } from "@/hooks/use-subscription"

const PLANNER_CATEGORIES = [
  {
    id: "weight-loss",
    name: "Weight Loss",
    icon: TrendingDown,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    iconColor: "text-orange-500",
    description: "Sustainable calorie deficit with balanced nutrition",
    emoji: "🔥",
  },
  {
    id: "muscle-gain",
    name: "Muscle Gain",
    icon: Dumbbell,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    iconColor: "text-blue-500",
    description: "High-protein meals for muscle building",
    emoji: "💪",
  },
  {
    id: "active-lifestyle",
    name: "Active Lifestyle",
    icon: Heart,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    iconColor: "text-green-500",
    description: "Energy-optimized meals for active days",
    emoji: "⚡",
  },
  {
    id: "pollution-defense",
    name: "Pollution Defense",
    icon: Wind,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    iconColor: "text-cyan-500",
    description: "Antioxidant-rich foods for urban living",
    emoji: "🌿",
  },
  {
    id: "hair-loss",
    name: "Hair Loss Prevention",
    icon: Sparkles,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    iconColor: "text-amber-500",
    description: "Biotin & protein-rich meals for hair strength",
    emoji: "💇",
  },
  {
    id: "hair-health",
    name: "Hair Growth & Shine",
    icon: Sparkles,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    iconColor: "text-pink-500",
    description: "Nutrient-dense meals for healthy, shiny hair",
    emoji: "✨",
  },
]

const QUESTIONS = [
  {
    id: "state",
    label: "Where are you located?",
    type: "input",
    icon: MapPin,
    placeholder: "e.g., Maharashtra, California",
    description: "Helps us suggest local, seasonal ingredients",
  },
  {
    id: "budget",
    label: "What's your daily food budget?",
    type: "select",
    icon: DollarSign,
    options: [
      { value: "low", label: "₹100-200 ($1-3) - Budget-friendly" },
      { value: "medium", label: "₹200-400 ($3-5) - Moderate" },
      { value: "high", label: "₹400+ ($5+) - Premium" },
    ],
    description: "We'll optimize meals within your budget",
  },
  {
    id: "cookingTime",
    label: "How much time can you spend cooking?",
    type: "select",
    icon: Clock,
    options: [
      { value: "15min", label: "15 minutes or less" },
      { value: "30min", label: "30 minutes" },
      { value: "1hour", label: "1 hour" },
      { value: "flexible", label: "Flexible" },
    ],
    description: "Recipes matched to your schedule",
  },
  {
    id: "lifestyleInfo",
    label: "Tell us about your daily routine",
    type: "textarea",
    icon: Users,
    placeholder: "e.g., Work from home, gym 3x/week, busy schedule...",
    description: "Helps tailor meal timing and energy needs",
  },
  {
    id: "availableIngredients",
    label: "What ingredients do you usually have?",
    type: "textarea",
    icon: ChefHat,
    placeholder: "e.g., Rice, lentils, vegetables, chicken, spices...",
    description: "We'll prioritize these in your recipes",
  },
  {
    id: "cuisinePreferences",
    label: "What cuisines do you enjoy?",
    type: "textarea",
    icon: Salad,
    placeholder: "e.g., South Indian, Italian, Mexican...",
    description: "Mix of your favorite flavors",
  },
  {
    id: "dietLifestyle",
    label: "Any dietary preferences?",
    type: "select",
    icon: Heart,
    options: [
      { value: "balanced", label: "Balanced" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "keto", label: "Keto" },
      { value: "low-carb", label: "Low-Carb" },
      { value: "high-protein", label: "High-Protein" },
      { value: "gluten-free", label: "Gluten-Free" },
      { value: "mediterranean", label: "Mediterranean" },
    ],
    description: "Aligned with your nutritional approach",
  },
  {
    id: "planDuration",
    label: "How many days should we plan?",
    type: "select",
    icon: Calendar,
    options: [
      { value: "1", label: "1 Day" },
      { value: "3", label: "3 Days" },
      { value: "7", label: "7 Days" },
      { value: "14", label: "14 Days" },
    ],
    description: "Your personalized meal roadmap",
  },
]

interface MealPlanData {
  category: string
  state: string
  budget: string
  cookingTime: string
  lifestyleInfo: string
  availableIngredients: string
  cuisinePreferences: string
  dietLifestyle: string
  planDuration: string
}

export function MealPlannerEnhanced() {
  const { userId } = useUser()
  const { plan, refreshSubscription } = useSubscription()
  const supabase = createClient()

  const [view, setView] = useState<"categories" | "questions" | "generated">("categories")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSaved, setShowSaved] = useState(false)
  
  const [formData, setFormData] = useState<MealPlanData>({
    category: "",
    state: "",
    budget: "",
    cookingTime: "",
    lifestyleInfo: "",
    availableIngredients: "",
    cuisinePreferences: "",
    dietLifestyle: "",
    planDuration: "",
  })

  const [generatedPlan, setGeneratedPlan] = useState<any[]>([])
  const [savedPlans, setSavedPlans] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

  const canUseMealPlanner = plan?.plan_name === "Pro Plan" || (plan?.plan_name === "Free" && !plan?.used_meal_planner)

  useEffect(() => {
    if (userId && showSaved) {
      loadSavedPlans()
    }
  }, [userId, showSaved])

  const loadSavedPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_meal_plans")
        .select("*, user_meal_planner_inputs(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const grouped = data.reduce((acc: any, plan: any) => {
          const key = plan.input_id
          if (!acc[key]) acc[key] = []
          acc[key].push(plan)
          return acc
        }, {})

        setSavedPlans(Object.values(grouped))
      }
    } catch (err) {
      console.error("Error loading saved plans:", err)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setFormData({ ...formData, category: categoryId })
    setView("questions")
    setCurrentStep(0)
  }

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      setView("categories")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const isStepComplete = () => {
    const currentQuestion = QUESTIONS[currentStep]
    const value = formData[currentQuestion.id as keyof MealPlanData]
    return value && value.trim() !== ""
  }

  const generateMealPlan = async () => {
    if (!canUseMealPlanner) return

    setIsGenerating(true)
    try {
      // Convert camelCase to snake_case for database
      const dbFormData = {
        user_id: userId,
        state: formData.state,
        budget: formData.budget,
        cooking_time: formData.cookingTime,
        lifestyle_info: formData.lifestyleInfo,
        available_ingredients: formData.availableIngredients,
        cuisine_preferences: formData.cuisinePreferences,
        diet_lifestyle: formData.dietLifestyle,
        health_goal: formData.category,
        plan_duration: formData.planDuration,
      }

      const { data: inputData, error: inputError } = await supabase
        .from("user_meal_planner_inputs")
        .insert([dbFormData])
        .select()
        .single()

      if (inputError) throw inputError

      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      let mealPlan = []
      if (response.ok) {
        const data = await response.json()
        mealPlan = data.mealPlan
      } else {
        mealPlan = generateFallbackPlan()
      }

      const planRecords = mealPlan.map((day: any) => ({
        user_id: userId,
        input_id: inputData.id,
        day: day.day,
        breakfast: day.breakfast,
        lunch: day.lunch,
        dinner: day.dinner,
      }))

      await supabase.from("generated_meal_plans").insert(planRecords)

      setGeneratedPlan(mealPlan)
      setView("generated")

      if (plan?.plan_name === "Free") {
        await fetch("/api/mark-feature-used", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature: "used_meal_planner" }),
        })
        await refreshSubscription()
      }
    } catch (err) {
      console.error("Error generating meal plan:", err)
      setGeneratedPlan(generateFallbackPlan())
      setView("generated")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackPlan = () => {
    const days = parseInt(formData.planDuration) || 3
    return Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      breakfast: { name: "Healthy Breakfast", calories: 300, description: "Balanced start" },
      lunch: { name: "Nutritious Lunch", calories: 450, description: "Energy-packed" },
      dinner: { name: "Light Dinner", calories: 400, description: "Perfect end" },
    }))
  }

  const currentQuestion = QUESTIONS[currentStep]
  const Icon = currentQuestion?.icon
  const category = PLANNER_CATEGORIES.find(c => c.id === selectedCategory)

  return (
    <div className="space-y-4 px-2 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#c9fa5f]/20 flex items-center justify-center mx-auto border-2 border-[#c9fa5f]/30">
          <Calendar className="h-7 w-7 text-[#c9fa5f]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Meal Planner</h2>
        <p className="text-sm text-muted-foreground px-4">
          Personalized nutrition plans for your goals
        </p>
      </div>

      {/* Toggle: Generated vs Saved */}
      {(generatedPlan.length > 0 || savedPlans.length > 0) && view === "generated" && (
        <div className="flex gap-2 p-1.5 bg-muted/30 rounded-xl border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaved(false)}
            className={`flex-1 h-10 rounded-lg transition-all duration-200 ${
              !showSaved
                ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Flame className="h-4 w-4 mr-2" />
            Current Plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSaved(true)
              loadSavedPlans()
            }}
            className={`flex-1 h-10 rounded-lg transition-all duration-200 ${
              showSaved
                ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Saved ({savedPlans.length})
          </Button>
        </div>
      )}

      {/* Categories View */}
      {view === "categories" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <p className="text-sm text-center text-muted-foreground px-4">
            Choose your wellness goal
          </p>
          <div className="grid grid-cols-1 gap-3">
            {PLANNER_CATEGORIES.map((cat) => {
              const CategoryIcon = cat.icon
              return (
                <Card
                  key={cat.id}
                  className={`p-4 cursor-pointer border-2 ${cat.borderColor} bg-card hover:border-[#c9fa5f] hover:shadow-lg transition-all duration-300`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{cat.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                        {cat.name}
                        <CategoryIcon className={`h-4 w-4 ${cat.iconColor}`} />
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#c9fa5f]" />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Questions View */}
      {view === "questions" && category && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Progress Bar */}
          <Card className="p-4 bg-card border-border/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">{category.emoji}</span>
                  {category.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  Step {currentStep + 1} / {QUESTIONS.length}
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[#c9fa5f] transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Question Card */}
          <Card className="p-6 bg-card border-2 border-[#c9fa5f]/20">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0">
                  {Icon && <Icon className="h-6 w-6 text-[#c9fa5f]" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {currentQuestion.label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentQuestion.description}
                  </p>
                </div>
              </div>

              {currentQuestion.type === "input" && (
                <Input
                  value={formData[currentQuestion.id as keyof MealPlanData]}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="h-11 bg-background border-border"
                />
              )}

              {currentQuestion.type === "textarea" && (
                <Textarea
                  value={formData[currentQuestion.id as keyof MealPlanData]}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[100px] resize-none bg-background border-border"
                />
              )}

              {currentQuestion.type === "select" && (
                <Select
                  value={formData[currentQuestion.id as keyof MealPlanData]}
                  onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                >
                  <SelectTrigger className="h-11 bg-background border-border">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1 h-11 border-border"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < QUESTIONS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="flex-1 h-11 bg-[#c9fa5f] text-black hover:bg-[#b8e954] font-semibold disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generateMealPlan}
                disabled={!isStepComplete() || !canUseMealPlanner || isGenerating}
                className="flex-1 h-11 bg-[#c9fa5f] text-black hover:bg-[#b8e954] font-semibold disabled:opacity-50"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Plan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Generated Plan View */}
      {view === "generated" && !showSaved && generatedPlan.length > 0 && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-semibold text-foreground">Your {category?.name} Plan</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setView("categories")
                setGeneratedPlan([])
                setFormData({
                  category: "",
                  state: "",
                  budget: "",
                  cookingTime: "",
                  lifestyleInfo: "",
                  availableIngredients: "",
                  cuisinePreferences: "",
                  dietLifestyle: "",
                  planDuration: "",
                })
              }}
              className="h-8 text-xs"
            >
              New Plan
            </Button>
          </div>

          {generatedPlan.map((day, index) => (
            <Card key={index} className="p-4 bg-card border border-[#c9fa5f]/20">
              <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#c9fa5f]" />
                {day.day}
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Breakfast", meal: day.breakfast, icon: "🌅" },
                  { label: "Lunch", meal: day.lunch, icon: "☀️" },
                  { label: "Dinner", meal: day.dinner, icon: "🌙" },
                ].map(({ label, meal, icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
                    <div className="text-2xl">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <h5 className="font-semibold text-sm text-foreground truncate">{meal.name}</h5>
                        <span className="text-xs text-muted-foreground font-bold whitespace-nowrap">{meal.calories} cal</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{meal.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRecipe({ meal: meal.name, day: day.day })}
                      className="h-8 w-8 p-0 hover:bg-[#c9fa5f]/20 flex-shrink-0"
                    >
                                            <BookOpen className="h-4 w-4 text-[#c9fa5f]" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Saved Plans View */}
      {view === "generated" && showSaved && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {savedPlans.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border/50">
              <div className="w-16 h-16 rounded-2xl bg-[#c9fa5f]/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-8 w-8 text-[#c9fa5f]" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No saved plans yet</p>
              <p className="text-xs text-muted-foreground">Generate your first meal plan to get started</p>
            </Card>
          ) : (
            savedPlans.map((planGroup, index) => (
              <Card key={index} className="p-4 bg-card border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(planGroup[0].created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <Badge className="bg-[#c9fa5f]/20 text-[#c9fa5f] border-[#c9fa5f]/30 text-xs">
                    {planGroup.length} days
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {planGroup.slice(0, 2).map((day: any, dayIndex: number) => (
                    <div key={dayIndex} className="border-l-2 border-[#c9fa5f]/30 pl-3">
                      <h4 className="font-semibold text-sm text-foreground mb-2">{day.day}</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>🌅</span>
                          <span>{day.breakfast.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>☀️</span>
                          <span>{day.lunch.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🌙</span>
                          <span>{day.dinner.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {planGroup.length > 2 && (
                    <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border/30">
                      +{planGroup.length - 2} more days
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-card border-2 border-[#c9fa5f]/20">
            <div className="sticky top-0 bg-card border-b border-border/50 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-foreground">Recipe Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecipe(null)}
                className="h-8 w-8 p-0 hover:bg-[#c9fa5f]/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-base text-foreground mb-2">{selectedRecipe.meal}</h4>
                <p className="text-sm text-muted-foreground">{selectedRecipe.day}</p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                <h5 className="font-semibold text-sm text-foreground mb-2">Cooking Time</h5>
                <p className="text-sm text-muted-foreground">25-30 minutes</p>
              </div>

              <div>
                <h5 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                  <Salad className="h-4 w-4 text-[#c9fa5f]" />
                  Ingredients
                </h5>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9fa5f] mt-0.5">•</span>
                    <span>1 cup main ingredient (rice/quinoa)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9fa5f] mt-0.5">•</span>
                    <span>2 tbsp cooking oil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9fa5f] mt-0.5">•</span>
                    <span>1 medium onion, chopped</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9fa5f] mt-0.5">•</span>
                    <span>2 cloves garlic, minced</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9fa5f] mt-0.5">•</span>
                    <span>1 cup seasonal vegetables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9fa5f] mt-0.5">•</span>
                    <span>Salt and spices to taste</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-[#c9fa5f]" />
                  Instructions
                </h5>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">1.</span>
                    <span>Heat oil in a pan over medium heat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">2.</span>
                    <span>Add onions and cook until golden (3-4 min)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">3.</span>
                    <span>Add garlic and cook for 1 minute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">4.</span>
                    <span>Add vegetables and cook for 5-7 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">5.</span>
                    <span>Season with salt and spices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">6.</span>
                    <span>Add main ingredient and cook as required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#c9fa5f] flex-shrink-0">7.</span>
                    <span>Garnish and serve hot</span>
                  </li>
                </ol>
              </div>

              <div className="bg-[#c9fa5f]/10 rounded-xl p-4 border border-[#c9fa5f]/20">
                <h5 className="font-semibold text-sm text-foreground mb-2">Nutritional Benefits</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rich in fiber, vitamins, and minerals. Provides sustained energy and supports overall health.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}