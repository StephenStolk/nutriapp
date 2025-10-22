"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, Sparkles, Clock, ChefHat, Heart, Zap, AlertCircle, Settings } from "lucide-react"

type FoodPreference = "healthy" | "comfort" | "cheat"
type Recipe = {
  name: string
  cookTime: string
  difficulty: string
  ingredients: string[]
  instructions: string[]
  tips: string
}

export function QuickMeals() {
  const [images, setImages] = useState<string[]>([])
  const [ingredients, setIngredients] = useState("")
  const [preference, setPreference] = useState<FoodPreference | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImages((prev) => [...prev, result].slice(0, 3)) // Max 3 images
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateRecipes = async () => {
    if (!ingredients.trim() && images.length === 0) return
    if (!preference) return

    setIsGenerating(true)
    setApiError(null)

    try {
      const response = await fetch("/api/quick-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredients.trim(),
          images: images,
          preference: preference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error && data.error.includes("API key not configured")) {
          setApiError(
            "OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables in Project Settings.",
          )
          return
        }
        throw new Error(data.error || "Failed to generate recipes")
      }

      setRecipes(data.recipes || [])
    } catch (error) {
      console.error("Recipe generation error:", error)
      if (!apiError) {
        setApiError("Unable to generate recipes at the moment. Using fallback recipes instead.")
      }

      // Fallback recipes
      setRecipes([
        {
          name: "Quick Veggie Stir-Fry",
          cookTime: "8 mins",
          difficulty: "Easy",
          ingredients: ["Mixed vegetables", "Soy sauce", "Garlic", "Oil"],
          instructions: [
            "Heat oil in a pan",
            "Add garlic and vegetables",
            "Stir-fry for 5-6 minutes",
            "Add soy sauce and serve",
          ],
          tips: "Use high heat for best results! 🔥",
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const preferences = [
    {
      id: "healthy" as FoodPreference,
      label: "Healthy",
      icon: Heart,
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: "comfort" as FoodPreference,
      label: "Comfort",
      icon: ChefHat,
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    { id: "cheat" as FoodPreference, label: "Cheat Meal", icon: Zap, color: "bg-red-100 text-red-700 border-red-200" },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Meals
        </h2>
        <p className="text-xs text-muted-foreground px-2">Show us what you have and get instant recipe ideas!</p>
      </div>

      {apiError && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-xs text-orange-800">
            <div className="space-y-2">
              <p>{apiError}</p>
              {apiError.includes("API key") && (
                <div className="flex items-center gap-2 text-xs">
                  <Settings className="h-3 w-3" />
                  <span>Go to Project Settings → Environment Variables to add OPENROUTER_API_KEY</span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Image Upload Section */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Show Your Ingredients</span>
          <Badge variant="secondary" className="text-xs">
            Optional
          </Badge>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Ingredient ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  onClick={() => removeImage(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={images.length >= 3}
            className="flex-1 h-8"
          >
            <Camera className="h-3 w-3 mr-1" />
            <span className="text-xs">Camera</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 3}
            className="flex-1 h-8"
          >
            <Upload className="h-3 w-3 mr-1" />
            <span className="text-xs">Upload</span>
          </Button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </Card>

      {/* Text Input Section */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">List Your Ingredients</span>
        </div>
        <Textarea
          placeholder="e.g., chicken, broccoli, rice, garlic, soy sauce..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="min-h-[60px] text-sm resize-none"
        />
      </Card>

      {/* Preference Selection */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Food Vibe</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {preferences.map((pref) => {
            const Icon = pref.icon
            return (
              <Button
                key={pref.id}
                variant={preference === pref.id ? "default" : "outline"}
                size="sm"
                onClick={() => setPreference(pref.id)}
                className={`h-12 flex-col gap-1 ${preference === pref.id ? "" : pref.color}`}
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs">{pref.label}</span>
              </Button>
            )
          })}
        </div>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerateRecipes}
        disabled={isGenerating || (!ingredients.trim() && images.length === 0) || !preference}
        className="w-full h-10"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="text-sm">{isGenerating ? "Cooking up ideas..." : "Get Recipe Ideas"}</span>
      </Button>

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Your Quick Recipes
          </h3>
          {recipes.map((recipe, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-foreground">{recipe.name}</h4>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-2 w-2 mr-1" />
                    {recipe.cookTime}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.map((ingredient, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Instructions:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 pl-3">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="list-decimal">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {recipe.tips && (
                  <div className="bg-primary/5 rounded-md p-2">
                    <p className="text-xs text-primary font-medium">💡 Pro Tip: {recipe.tips}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
