"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, DollarSign, MapPin, ChefHat, Target, BookOpen, X, Salad, Clock2Icon } from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { useSubscription } from "@/hooks/use-subscription"

interface MealPlan {
  day: string
  breakfast: { name: string; calories: number; description: string }
  lunch: { name: string; calories: number; description: string }
  dinner: { name: string; calories: number; description: string }
}

const parseMarkdownToJSX = (markdown: string) => {
  const lines = markdown.split("\n")
  const elements: JSX.Element[] = []
  let currentList: string[] = []
  let listType: "ul" | "ol" | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside space-y-1 mb-4 ml-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>,
      )
      currentList = []
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      flushList()
      return
    }

    // Headers
    if (trimmedLine.startsWith("# ")) {
      flushList()
      elements.push(
        <h1 key={index} className="text-xl font-bold text-foreground mb-3">
          {trimmedLine.substring(2)}
        </h1>,
      )
    } else if (trimmedLine.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={index} className="text-lg font-semibold text-foreground mb-2">
          {trimmedLine.substring(3)}
        </h2>,
      )
    } else if (trimmedLine.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={index} className="text-base font-medium text-foreground mb-2">
          {trimmedLine.substring(4)}
        </h3>,
      )
    }
    // List items
    else if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      const item = trimmedLine.substring(2)
      currentList.push(item)
      listType = "ul"
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmedLine)) {
      flushList()
      const item = trimmedLine.replace(/^\d+\.\s/, "")
      currentList.push(item)
      listType = "ol"
    }
    // Bold text
    else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      flushList()
      elements.push(
        <p key={index} className="font-semibold text-foreground mb-2">
          {trimmedLine.slice(2, -2)}
        </p>,
      )
    }
    // Regular paragraphs
    else {
      flushList()
      // Handle inline bold formatting
      const parts = trimmedLine.split(/(\*\*.*?\*\*)/g)
      const formattedParts = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={partIndex}>{part.slice(2, -2)}</strong>
        }
        return part
      })

      elements.push(
        <p key={index} className="text-sm text-foreground mb-2 leading-relaxed">
          {formattedParts}
        </p>,
      )
    }
  })

  flushList()
  return elements
}

export function MealPlanner() {
  const [plannerData, setPlannerData] = useState({
    state: "",
    budget: "",
    cookingTime: "",
    lifestyleInfo: "",
    availableIngredients: "",
    cuisinePreferences: "",
    // NEW: dietary lifestyle preference
    dietLifestyle: "", // e.g., "keto" | "vegan" | "vegetarian" | "high-protein" | "balanced" | "mediterranean" | "low-carb" | "gluten-free"
    healthGoal: "",
    planDuration: "",
  })

  const [mealPlan, setMealPlan] = useState<MealPlan[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<{ meal: string; day: string } | null>(null)
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)
  const [recipeDetails, setRecipeDetails] = useState<string>("")
  const { plan, loading, refreshSubscription } = useSubscription()
  console.log(plan)

  const canUseMealPlanner = plan?.plan_name === "Pro Plan" || (plan?.plan_name === "Free" && !plan?.used_meal_planner)

  console.log(plan?.plan_name)
  console.log(plan?.used_meal_planner)

  const generateMealPlan = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(plannerData),
      })

      if (response.ok) {
        const data = await response.json()
        setMealPlan(data.mealPlan)
      } else {
        const days = Number.parseInt(plannerData.planDuration) || 3
        const samplePlan = generateIntelligentFallbackPlan(days)
        setMealPlan(samplePlan)
      }

      if (plan?.plan_name === "Free") {
        await fetch("/api/mark-feature-used", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feature: "used_meal_planner",
          }),
        })
        await refreshSubscription()
      }
    } catch (error) {
      console.error("Meal plan generation error:", error)
      const days = Number.parseInt(plannerData.planDuration) || 3
      const samplePlan = generateIntelligentFallbackPlan(days)
      setMealPlan(samplePlan)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateIntelligentFallbackPlan = (days: number): MealPlan[] => {
    const cuisineType = plannerData.cuisinePreferences.toLowerCase()
    const diet = (plannerData.dietLifestyle || "").toLowerCase()

    const isIndian = cuisineType.includes("indian")
    const isMediterranean = cuisineType.includes("mediterranean")
    const isMexican = cuisineType.includes("mexican")

    const ensureDiet = (name: string) => {
      if (diet === "vegan") return `${name} (vegan)`
      if (diet === "vegetarian") return `${name} (veg)`
      if (diet === "gluten-free") return `${name} (gluten-free)`
      if (diet === "keto") return `${name} (keto-friendly)`
      if (diet === "low-carb") return `${name} (low-carb)`
      if (diet === "high-protein") return `${name} (high-protein)`
      return name
    }

    const plan: MealPlan[] = []

    for (let i = 1; i <= days; i++) {
      let dayPlan: MealPlan

      if (isIndian) {
        const indianBreakfast =
          diet === "keto"
            ? "Masala Omelette with Paneer"
            : diet === "vegan"
              ? "Veg Poha (no ghee)"
              : diet === "vegetarian"
                ? "Paneer Bhurji with Roti"
                : "Idli Sambar"

        const indianLunch =
          diet === "keto"
            ? "Paneer Tikka Salad"
            : diet === "vegan"
              ? "Chana Masala with Brown Rice"
              : diet === "gluten-free"
                ? "Dal with Steamed Rice"
                : "Rajma Chawal"

        const indianDinner =
          diet === "keto"
            ? "Tandoori Chicken with Salad"
            : diet === "vegan"
              ? "Vegetable Pulao with Cucumber Raita (vegan raita)"
              : "Roti with Mixed Veg Curry"

        dayPlan = {
          day: `Day ${i}`,
          breakfast: {
            name: ensureDiet(indianBreakfast),
            calories: 300,
            description: "Culturally authentic and simple",
          },
          lunch: { name: ensureDiet(indianLunch), calories: 430, description: "Balanced and budget-friendly" },
          dinner: { name: ensureDiet(indianDinner), calories: 380, description: "Light dinner with good macros" },
        }
      } else if (isMediterranean) {
        const b = diet === "high-protein" ? "Greek Yogurt with Nuts" : "Overnight Oats with Berries"
        const l = diet === "keto" ? "Halloumi Salad with Olives" : "Mediterranean Quinoa Bowl"
        const d = diet === "vegan" ? "Chickpea Tomato Stew" : "Grilled Fish with Vegetables"
        dayPlan = {
          day: `Day ${i}`,
          breakfast: { name: ensureDiet(b), calories: 280, description: "Fresh, seasonal ingredients" },
          lunch: { name: ensureDiet(l), calories: 420, description: "Olive oil, herbs, whole foods" },
          dinner: { name: ensureDiet(d), calories: 360, description: "Satiating yet light" },
        }
      } else {
        const b =
          diet === "keto"
            ? "Scrambled Eggs with Avocado"
            : diet === "vegan"
              ? "Tofu Scramble with Veggies"
              : "Oatmeal with Fruits"
        const l =
          diet === "high-protein"
            ? "Chicken Breast Salad"
            : diet === "vegan"
              ? "Lentil Salad Bowl"
              : "Grilled Chicken Salad"
        const d =
          diet === "gluten-free"
            ? "Stir-fry with Rice (GF Tamari)"
            : diet === "vegan"
              ? "Veggie Stir-fry with Brown Rice"
              : "Vegetable Stir-fry with Rice"
        dayPlan = {
          day: `Day ${i}`,
          breakfast: { name: ensureDiet(b), calories: 300, description: "Smart start for steady energy" },
          lunch: { name: ensureDiet(l), calories: 400, description: "Lean protein + colorful veggies" },
          dinner: { name: ensureDiet(d), calories: 360, description: "Balanced carbs, fats, and fiber" },
        }
      }

      plan.push(dayPlan)
    }

    return plan
  }

  const getRecipe = async (mealName: string, day: string) => {
    setSelectedRecipe({ meal: mealName, day })
    setIsLoadingRecipe(true)

    try {
      const response = await fetch("/api/get-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealName,
          cuisinePreferences: plannerData.cuisinePreferences,
          cookingTime: plannerData.cookingTime,
          dietLifestyle: plannerData.dietLifestyle,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecipeDetails(data.recipe)
      } else {
        setRecipeDetails(generateDetailedRecipe(mealName))
      }
    } catch (error) {
      console.error("Recipe generation error:", error)
      setRecipeDetails(generateDetailedRecipe(mealName))
    } finally {
      setIsLoadingRecipe(false)
    }
  }

  const generateDetailedRecipe = (mealName: string): string => {
    return `**${mealName} Recipe**

**Cooking Time:** 25-30 minutes
**Servings:** 2

**Ingredients:**
• 1 cup main ingredient (rice/quinoa/pasta)
• 2 tbsp cooking oil
• 1 medium onion, chopped
• 2 cloves garlic, minced
• 1 cup vegetables (seasonal)
• Salt and spices to taste
• Fresh herbs for garnish

**Instructions:**
1. Heat oil in a pan over medium heat
2. Add onions and cook until golden (3-4 minutes)
3. Add garlic and cook for 1 minute
4. Add vegetables and cook for 5-7 minutes
5. Season with salt and spices
6. Add main ingredient and cook as required
7. Garnish with fresh herbs and serve hot

**Nutritional Benefits:**
Rich in fiber, vitamins, and minerals. Provides sustained energy and supports overall health.`
  }

  return (
    <div className="space-y-4 px-2">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-md font-semibold text-foreground">Meal Planner</h2>
        <p className="text-sm text-muted-foreground px-2">Get personalized meal plans based on your preferences</p>
      </div>

      {!mealPlan.length ? (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <Label htmlFor="state" className="text-sm font-medium flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                State/Region
              </Label>
              <Input
                id="state"
                value={plannerData.state}
                onChange={(e) => setPlannerData({ ...plannerData, state: e.target.value })}
                placeholder="e.g., Maharashtra, California"
                className="text-sm h-8"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="budget" className="text-sm font-medium flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Budget (per day)
              </Label>
              <Select onValueChange={(value) => setPlannerData({ ...plannerData, budget: value })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">
                    ₹100-200 ($1-3)
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs">
                    ₹200-400 ($3-5)
                  </SelectItem>
                  <SelectItem value="high" className="text-xs">
                    ₹400+ ($5+)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cookingTime" className="text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Available Cooking Time
              </Label>
              <Select onValueChange={(value) => setPlannerData({ ...plannerData, cookingTime: value })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="How much time can you spend cooking?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min" className="text-xs">
                    15 minutes or less
                  </SelectItem>
                  <SelectItem value="30min" className="text-xs">
                    30 minutes
                  </SelectItem>
                  <SelectItem value="1hour" className="text-xs">
                    1 hour
                  </SelectItem>
                  <SelectItem value="flexible" className="text-xs">
                    Flexible
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="lifestyleInfo" className="text-sm font-medium">
                Lifestyle Information
              </Label>
              <Textarea
                id="lifestyleInfo"
                value={plannerData.lifestyleInfo}
                onChange={(e) => setPlannerData({ ...plannerData, lifestyleInfo: e.target.value })}
                placeholder="e.g., Very busy schedule, work from home, active lifestyle"
                className="text-xs min-h-[50px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="availableIngredients" className="text-sm font-medium">
                Available Ingredients
              </Label>
              <Textarea
                id="availableIngredients"
                value={plannerData.availableIngredients}
                onChange={(e) => setPlannerData({ ...plannerData, availableIngredients: e.target.value })}
                placeholder="e.g., Rice, lentils, vegetables, chicken, spices commonly available"
                className="text-xs min-h-[50px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cuisinePreferences" className="text-sm font-medium flex items-center">
                <ChefHat className="h-3 w-3 mr-1" />
                Cuisine Preferences
              </Label>
              <Textarea
                id="cuisinePreferences"
                value={plannerData.cuisinePreferences}
                onChange={(e) => setPlannerData({ ...plannerData, cuisinePreferences: e.target.value })}
                placeholder="e.g., South Indian, North Indian, Mexican, Italian"
                className="text-xs min-h-[60px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dietLifestyle" className="text-sm font-medium flex items-center">
                <Salad className="h-3 w-3 mr-1" />
                Dietary Lifestyle/Preference
              </Label>
              <Select onValueChange={(value) => setPlannerData({ ...plannerData, dietLifestyle: value })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select a lifestyle (e.g., Keto, Vegan, Mediterranean)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced" className="text-xs">
                    Balanced
                  </SelectItem>
                  <SelectItem value="high-protein" className="text-xs">
                    High-protein
                  </SelectItem>
                  <SelectItem value="keto" className="text-xs">
                    Keto
                  </SelectItem>
                  <SelectItem value="low-carb" className="text-xs">
                    Low-carb
                  </SelectItem>
                  <SelectItem value="mediterranean" className="text-xs">
                    Mediterranean
                  </SelectItem>
                  <SelectItem value="vegetarian" className="text-xs">
                    Vegetarian
                  </SelectItem>
                  <SelectItem value="vegan" className="text-xs">
                    Vegan
                  </SelectItem>
                  <SelectItem value="gluten-free" className="text-xs">
                    Gluten-free
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground leading-snug text-start pl-2 mt-2">
                This helps tailor recipes, ingredients, and macros to your nutritional approach.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="healthGoal" className="text-sm font-medium flex items-center">
                <Target className="h-3 w-3 mr-1" />
                Health Goal
              </Label>
              <Select onValueChange={(value) => setPlannerData({ ...plannerData, healthGoal: value })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss" className="text-xs">
                    Weight Loss
                  </SelectItem>
                  <SelectItem value="muscle-gain" className="text-xs">
                    Muscle Gain
                  </SelectItem>
                  <SelectItem value="healthy-living" className="text-xs">
                    Healthy Living
                  </SelectItem>
                  <SelectItem value="active-lifestyle" className="text-xs">
                    Active Lifestyle
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="planDuration" className="text-sm font-medium">
                <Clock2Icon className="h-3 w-3 mr-1" />
                Meal Plan Duration
              </Label>
              <Select onValueChange={(value) => setPlannerData({ ...plannerData, planDuration: value })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="How many days?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-xs">
                    1 Day
                  </SelectItem>
                  <SelectItem value="2" className="text-xs">
                    2 Days
                  </SelectItem>
                  <SelectItem value="7" className="text-xs">
                    7 Days
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateMealPlan}
            disabled={
              !canUseMealPlanner || isGenerating || !plannerData.cuisinePreferences || !plannerData.planDuration
            }
            className="w-1/2 h-10 mb-20 bg-[#c9fa5f] text-black hover:bg-[#b8e954] font-semibold rounded-[5px] flex mx-auto text-sm"
            size="sm"
          >
            <span className="text-sm">{isGenerating ? "Generating Plan..." : "Generate Meal Plan"}</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3 pb-20">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Your Personalized Meal Plan</h3>
            <Button variant="outline" size="sm" onClick={() => setMealPlan([])} className="h-7 text-xs">
              New Plan
            </Button>
          </div>

          {mealPlan.map((day, index) => (
            <Card key={index} className="p-3">
              <h4 className="font-semibold text-sm text-foreground mb-2">{day.day}</h4>
              <div className="space-y-2">
                {[
                  { label: "Breakfast", meal: day.breakfast },
                  { label: "Lunch", meal: day.lunch },
                  { label: "Dinner", meal: day.dinner },
                ].map(({ label, meal }) => (
                  <div key={label} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h5 className="font-medium text-xs text-foreground">{meal.name}</h5>
                        <span className="text-xs text-muted-foreground">~{meal.calories} cal</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{meal.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => getRecipe(meal.name, day.day)}
                      className="ml-2 text-primary hover:text-primary/80 p-1 h-6 w-6"
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {selectedRecipe && (
            <Card className="p-3 pb-20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-foreground">Recipe Details</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)} className="p-1 h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {isLoadingRecipe ? (
                <p className="text-xs text-muted-foreground">Loading detailed recipe...</p>
              ) : (
                <div className="space-y-1 text-xs">{parseMarkdownToJSX(recipeDetails)}</div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
