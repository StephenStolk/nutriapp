"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChefHat, Clock, Utensils, Settings, MapPin, Heart } from "lucide-react"

type MealType = "breakfast" | "lunch" | "dinner"

interface MealRecommendationsProps {
  currentMeal: MealType
  nutritionData: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const cuisineBasedSuggestions = {
  "south indian": {
    breakfast: [
      { name: "Idli with Sambar", reason: "Light fermented food, easy to digest", calories: "~200 cal" },
      { name: "Dosa with Coconut Chutney", reason: "Protein-rich lentil crepe", calories: "~250 cal" },
      { name: "Upma with Vegetables", reason: "Semolina with fiber-rich veggies", calories: "~180 cal" },
    ],
    lunch: [
      { name: "Sambar Rice with Rasam", reason: "Complete protein with lentils", calories: "~350 cal" },
      { name: "Curd Rice with Pickle", reason: "Probiotic-rich and cooling", calories: "~280 cal" },
      { name: "Vegetable Curry with Roti", reason: "Balanced nutrients and fiber", calories: "~320 cal" },
    ],
    dinner: [
      { name: "Ragi Mudde with Sambar", reason: "High calcium and protein", calories: "~300 cal" },
      { name: "Coconut Rice with Curry", reason: "Healthy fats and easy digestion", calories: "~280 cal" },
      { name: "Bisibelebath", reason: "One-pot nutritious meal", calories: "~350 cal" },
    ],
  },
  "north indian": {
    breakfast: [
      { name: "Paratha with Curd", reason: "Whole wheat with probiotics", calories: "~300 cal" },
      { name: "Poha with Peanuts", reason: "Light carbs with protein", calories: "~220 cal" },
      { name: "Daliya Upma", reason: "High fiber broken wheat", calories: "~200 cal" },
    ],
    lunch: [
      { name: "Dal Chawal with Sabzi", reason: "Complete protein combination", calories: "~400 cal" },
      { name: "Rajma Rice", reason: "Kidney beans for protein", calories: "~380 cal" },
      { name: "Chole with Roti", reason: "Chickpeas for fiber and protein", calories: "~350 cal" },
    ],
    dinner: [
      { name: "Khichdi with Ghee", reason: "Easy to digest comfort food", calories: "~280 cal" },
      { name: "Paneer Curry with Roti", reason: "High protein cottage cheese", calories: "~320 cal" },
      { name: "Mixed Dal with Rice", reason: "Multiple lentils for nutrition", calories: "~300 cal" },
    ],
  },
  mexican: {
    breakfast: [
      { name: "Avocado Toast with Salsa", reason: "Healthy fats and fresh vegetables", calories: "~280 cal" },
      { name: "Black Bean Scramble", reason: "Plant protein with eggs", calories: "~320 cal" },
      { name: "Chia Pudding with Fruits", reason: "Omega-3 and fiber rich", calories: "~250 cal" },
    ],
    lunch: [
      { name: "Quinoa Burrito Bowl", reason: "Complete protein with vegetables", calories: "~400 cal" },
      { name: "Grilled Fish Tacos", reason: "Lean protein with fresh toppings", calories: "~350 cal" },
      { name: "Black Bean Soup", reason: "High fiber and plant protein", calories: "~300 cal" },
    ],
    dinner: [
      { name: "Vegetable Enchiladas", reason: "Fiber-rich with moderate calories", calories: "~320 cal" },
      { name: "Grilled Chicken Fajitas", reason: "Lean protein with peppers", calories: "~380 cal" },
      { name: "Lentil and Vegetable Stew", reason: "Plant-based protein and nutrients", calories: "~280 cal" },
    ],
  },
  italian: {
    breakfast: [
      { name: "Greek Yogurt with Berries", reason: "Protein and antioxidants", calories: "~200 cal" },
      { name: "Whole Grain Toast with Tomato", reason: "Fiber and lycopene", calories: "~220 cal" },
      { name: "Frittata with Vegetables", reason: "Protein-rich egg dish", calories: "~280 cal" },
    ],
    lunch: [
      { name: "Minestrone Soup", reason: "Vegetable and bean rich", calories: "~250 cal" },
      { name: "Caprese Salad with Quinoa", reason: "Fresh mozzarella and complete protein", calories: "~320 cal" },
      { name: "Whole Wheat Pasta Primavera", reason: "Fiber with seasonal vegetables", calories: "~380 cal" },
    ],
    dinner: [
      { name: "Grilled Fish with Herbs", reason: "Lean protein with Mediterranean flavors", calories: "~300 cal" },
      { name: "Vegetable Risotto", reason: "Creamy rice with nutrients", calories: "~350 cal" },
      { name: "Zucchini Noodles with Pesto", reason: "Low-carb with healthy fats", calories: "~250 cal" },
    ],
  },
}

const defaultSuggestions = {
  breakfast: [
    { name: "Greek Yogurt with Berries", reason: "Protein to start the day", calories: "~200 cal" },
    { name: "Oatmeal with Nuts", reason: "Sustained energy release", calories: "~300 cal" },
    { name: "Avocado Toast", reason: "Healthy fats and fiber", calories: "~350 cal" },
  ],
  lunch: [
    { name: "Grilled Chicken Salad", reason: "Light protein to balance morning carbs", calories: "~350 cal" },
    { name: "Quinoa Bowl", reason: "Complete protein with vegetables", calories: "~400 cal" },
    { name: "Vegetable Soup", reason: "Hydrating and nutrient-dense", calories: "~250 cal" },
  ],
  dinner: [
    { name: "Baked Salmon", reason: "Omega-3 fatty acids for evening", calories: "~450 cal" },
    { name: "Lentil Curry", reason: "Plant-based protein and fiber", calories: "~380 cal" },
    { name: "Stir-fried Vegetables", reason: "Light and easy to digest", calories: "~300 cal" },
  ],
}

export function MealRecommendations({ currentMeal, nutritionData }: MealRecommendationsProps) {
  const [showPreferences, setShowPreferences] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    cuisinePreferences: "",
    state: "",
    availableIngredients: "",
  })
  const [hasPreferences, setHasPreferences] = useState(false)

  const getNextMeal = (current: MealType): MealType => {
    if (current === "breakfast") return "lunch"
    if (current === "lunch") return "dinner"
    return "breakfast"
  }

  const nextMeal = getNextMeal(currentMeal)
  const getIcon = (meal: MealType) => {
    if (meal === "lunch") return Utensils
    if (meal === "dinner") return ChefHat
    return Clock
  }
  const Icon = getIcon(nextMeal)

  const getRecommendations = () => {
    if (!hasPreferences || !userPreferences.cuisinePreferences) {
      return defaultSuggestions[nextMeal]
    }

    const cuisineKey = userPreferences.cuisinePreferences.toLowerCase()
    const matchedCuisine = Object.keys(cuisineBasedSuggestions).find((cuisine) => cuisineKey.includes(cuisine))

    if (matchedCuisine) {
      return cuisineBasedSuggestions[matchedCuisine as keyof typeof cuisineBasedSuggestions][nextMeal]
    }

    return defaultSuggestions[nextMeal]
  }

  const getPersonalizedMessage = () => {
    if (hasPreferences && userPreferences.cuisinePreferences) {
      return `Based on your preference for ${userPreferences.cuisinePreferences} cuisine${userPreferences.state ? ` and location in ${userPreferences.state}` : ""}, here are some recommendations:`
    }

    if (nutritionData.calories > 500) {
      return "Since your current meal was calorie-dense, consider lighter options for your next meal."
    }
    if (nutritionData.protein < 15) {
      return "Your current meal was low in protein, so focus on protein-rich options next."
    }
    if (nutritionData.carbs > 40) {
      return "You had good carbs this meal, consider more vegetables and protein next."
    }
    return "Here are some balanced options for your next meal."
  }

  const handleSavePreferences = () => {
    setHasPreferences(true)
    setShowPreferences(false)
  }

  const recommendations = getRecommendations()

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Next {nextMeal.charAt(0).toUpperCase() + nextMeal.slice(1)} Ideas
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreferences(!showPreferences)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {showPreferences && (
          <Card className="p-3 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Personalize Your Recommendations</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine" className="text-xs text-muted-foreground">
                  Cuisine Preferences *
                </Label>
                <Textarea
                  id="cuisine"
                  placeholder="e.g., South Indian food, North Indian food, Mexican food, Italian food..."
                  value={userPreferences.cuisinePreferences}
                  onChange={(e) => setUserPreferences((prev) => ({ ...prev, cuisinePreferences: e.target.value }))}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs text-muted-foreground flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>State/Region</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="e.g., Karnataka, Texas"
                    value={userPreferences.state}
                    onChange={(e) => setUserPreferences((prev) => ({ ...prev, state: e.target.value }))}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ingredients" className="text-xs text-muted-foreground">
                    Available Ingredients
                  </Label>
                  <Input
                    id="ingredients"
                    placeholder="e.g., rice, lentils, chicken"
                    value={userPreferences.availableIngredients}
                    onChange={(e) => setUserPreferences((prev) => ({ ...prev, availableIngredients: e.target.value }))}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                size="sm"
                className="w-full h-8 text-xs"
                disabled={!userPreferences.cuisinePreferences.trim()}
              >
                Save Preferences
              </Button>
            </div>
          </Card>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">{getPersonalizedMessage()}</p>

        <div className="space-y-3">
          {recommendations.map((suggestion, index) => (
            <div key={index} className="flex items-start justify-between space-x-3">
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium text-foreground">{suggestion.name}</div>
                <div className="text-xs text-muted-foreground">{suggestion.reason}</div>
              </div>
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {suggestion.calories}
              </Badge>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {hasPreferences
              ? `Personalized recommendations based on your ${userPreferences.cuisinePreferences} preferences`
              : `Recommendations based on your current ${currentMeal} analysis`}
          </p>
        </div>
      </div>
    </Card>
  )
}
