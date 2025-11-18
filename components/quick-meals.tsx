"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, Sparkles, ChefHat, Heart, Zap, AlertCircle, Settings, BookMarked, Wand2, Trash2 } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
// import { GridBackground } from "./landing-temporary/GridBackground"
import { BentoGrid } from "./bentogrid"

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
  const [saving, setSaving] = useState<boolean>(false)
  const [showSavedRecipes, setShowSavedRecipes] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)
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

  const handleSave = async () => {
    const response = await fetch("/api/quick-meals-save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipes_arr: recipes,
      }),
    })

    if (!response.ok) {
      setApiError("[error] Error in saving. Try later")
    }

    setSaving(true)
  }

  const handleDeleteRecipe = async (index: number) => {
    // Optimistically update UI
    const updatedRecipes = savedRecipes.filter((_, i) => i !== index)
    setSavedRecipes(updatedRecipes)

    try {
      const response = await fetch("/api/quick-meals-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeIndex: index,
        }),
      })

      if (!response.ok) {
        // Revert on error
        await loadSavedRecipes()
        setApiError("Failed to delete recipe")
      }
    } catch (error) {
      console.error("Delete error:", error)
      // Revert on error
      await loadSavedRecipes()
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const { plan, loading, refreshSubscription } = useSubscription()
  // console.log(plan)

  const canUseRecipeIdea = plan?.plan_name === "Pro Plan" || (plan?.plan_name === "Free" && !plan?.used_get_recipe)

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

      if (plan?.plan_name === "Free") {
        await fetch("/api/mark-feature-used", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feature: "used_get_recipe",
          }),
        })
        await refreshSubscription()
      }
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

  const loadSavedRecipes = async () => {
    setLoadingSaved(true)
    try {
      const response = await fetch("/api/quick-meals-get-saved", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSavedRecipes(data.recipes || [])
      }
    } catch (error) {
      console.error("Error loading saved recipes:", error)
    } finally {
      setLoadingSaved(false)
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
    <BentoGrid>
      <div className="space-y-2 px-4">
        {/* Header with Title */}
        <div className="text-center space-y-1 mt-2">
          <h2 className="text-md font-semibold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Meals
          </h2>
          <p className="text-sm text-muted-foreground px-2">
            {showSavedRecipes
              ? "Your collection of saved recipes"
              : "Show us what you have and get instant recipe ideas!"}
          </p>
        </div>

        {/* Toggle Buttons - Always visible */}
        <div className="flex gap-2 p-1 bg-muted/30 rounded-[5px] border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSavedRecipes(false)}
            className={`flex-1 h-10 rounded-[5px] transition-all text-sm duration-200 ${
              !showSavedRecipes
                ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSavedRecipes(true)
              if (savedRecipes.length === 0) {
                loadSavedRecipes()
              }
            }}
            className={`flex-1 h-10 rounded-[5px] transition-all text-sm duration-200 ${
              showSavedRecipes
                ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <BookMarked className="h-4 w-4 mr-2" />
            Saved ({savedRecipes.length})
          </Button>
        </div>

        {/* Content based on toggle */}
        {!showSavedRecipes ? (
          <>
            {/* GENERATE RECIPES VIEW */}
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
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Show Your Ingredients</span>
                <Badge variant="secondary" className="text-xs bg-transparent ">
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
                  className="flex-1 h-9 rounded-[5px]"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  <span className="text-sm">Camera</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 3}
                  className="flex-1 h-9 rounded-[5px]"
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
            <Card className="p-4 space-y-1">
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
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Food Vibe</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {preferences.map((pref) => {
                  const Icon = pref.icon
                  const isSelected = preference === pref.id

                  return (
                    <Button
                      key={pref.id}
                      onClick={() => setPreference(pref.id)}
                      size="sm"
                      className={`h-20 rounded-[5px] flex-col gap-1 bg-black/70 text-white hover:bg-black/80 ${
                        isSelected ? "ring-2 ring-[#c9fa5f] bg-black" : ""
                      }`}
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
              disabled={
                !canUseRecipeIdea || isGenerating || (!ingredients.trim() && images.length === 0) || !preference
              }
              className="w-1/2 h-10 mb-20 bg-[#c9fa5f] text-black hover:bg-[#b8e954] font-semibold rounded-[5px] flex mx-auto text-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm">{isGenerating ? "Cooking up ideas..." : "Get Recipe Ideas"}</span>
            </Button>

            {/* Generated Recipes */}
            {recipes.length > 0 && (
              <div className="space-y-4 pb-20">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">Your Quick Recipes</h3>
                  {saving ? (
                    <Button
                      disabled
                      className="bg-muted text-muted-foreground border border-border text-xs h-8 px-5 rounded-xl cursor-not-allowed font-medium"
                    >
                      ✓ Saved
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="bg-card/50 text-foreground border border-border/50 text-xs h-8 px-5 rounded-xl hover:bg-[#c9fa5f]/20 hover:border-[#c9fa5f] transition-colors duration-200 font-medium"
                      onClick={handleSave}
                    >
                      Save All
                    </Button>
                  )}
                </div>

                <div className="space-y-3 pb-20">
                  {recipes.map((recipe, index) => (
                    <Card key={index} className="p-4 border-border/50 hover:border-[#c9fa5f]/30 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-4 pb-3 border-b border-border/30">
                        <h4 className="text-sm font-semibold text-foreground leading-tight pr-2">{recipe.name}</h4>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground px-2.5 py-1 rounded-lg">
                            {recipe.cookTime}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground px-2.5 py-1 rounded-lg">
                            {recipe.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            Ingredients
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recipe.ingredients.map((ingredient, i) => (
                              <span
                                key={i}
                                className="text-xs bg-background/50 text-foreground/80 px-3 py-1.5 rounded-lg border border-border/30 font-medium"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            Instructions
                          </p>
                          <ol className="text-xs text-foreground/70 space-y-2 pl-4">
                            {recipe.instructions.map((step, i) => (
                              <li key={i} className="list-decimal leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {recipe.tips && (
                          <div className="bg-[#c9fa5f]/10 border border-[#c9fa5f]/20 rounded-lg p-3 mt-2">
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              <span className="font-semibold text-foreground">Pro Tip:</span> {recipe.tips}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* SAVED RECIPES VIEW */}
            <div className="space-y-4 pb-20">
              {loadingSaved ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#c9fa5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading your saved recipes...</p>
                </div>
              ) : savedRecipes.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookMarked className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">No Saved Recipes Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Generate some delicious recipes and save them for later!
                  </p>
                  <Button
                    onClick={() => setShowSavedRecipes(false)}
                    className="bg-[#c9fa5f] text-black hover:bg-[#b8e954] text-sm font-semibold rounded-[5px]"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Recipes
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      Saved Recipes ({savedRecipes.length})
                    </h3>
                  </div>

                  <div className="space-y-3 pb-20">
                    {savedRecipes.map((recipe, index) => (
                      <Card key={index} className="p-4 border-border/50 hover:border-[#c9fa5f]/30 transition-colors duration-200 group">
                        <div className="flex items-start justify-between mb-4 pb-3 border-b border-border/30">
                          <h4 className="text-sm font-semibold text-foreground leading-tight pr-2">{recipe.name}</h4>
                          <div className="flex gap-2 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground px-2.5 py-1 rounded-lg">
                              {recipe.cookTime}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground px-2.5 py-1 rounded-lg">
                              {recipe.difficulty}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecipe(index)}
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                              Ingredients
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {recipe.ingredients.map((ingredient, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-background/50 text-foreground/80 px-3 py-1.5 rounded-lg border border-border/30 font-medium"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                              Instructions
                            </p>
                            <ol className="text-xs text-foreground/70 space-y-2 pl-4">
                              {recipe.instructions.map((step, i) => (
                                <li key={i} className="list-decimal leading-relaxed">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {recipe.tips && (
                            <div className="bg-[#c9fa5f]/10 border border-[#c9fa5f]/20 rounded-lg p-3 mt-2">
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                <span className="font-semibold text-foreground">Pro Tip:</span> {recipe.tips}
                              </p>
                            </div>
                          
                        )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </BentoGrid>
  )
}
