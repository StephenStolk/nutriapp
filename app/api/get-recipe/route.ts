import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.",
          fallback: true,
        },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { mealName, cuisinePreferences, cookingTime } = body

    // console.log("[v0] Generating recipe for:", mealName)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Kalnut Recipe Generator",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-12b-v2-vl:free", // Using more reliable model
        messages: [
          {
            role: "system",
            content: `You are a professional chef specializing in Indian cuisine. Provide detailed, authentic recipes that are:
            - Culturally appropriate and traditional
            - Nutritionally balanced
            - Practical for home cooking
            - Include precise measurements in Indian units (cups, teaspoons, etc.)
            - Explain nutritional benefits
            
            Always format your response with clear sections: Ingredients, Instructions, Cooking Time, Servings, and Nutritional Benefits.`,
          },
          {
            role: "user",
            content: `Please provide a detailed recipe for "${mealName}" in ${cuisinePreferences} style:
            
            Available cooking time: ${cookingTime}
            
            Include:
            - Complete ingredient list with exact measurements (use Indian measurements like cups, teaspoons)
            - Step-by-step cooking instructions
            - Total cooking time and prep time
            - Number of servings
            - Nutritional benefits and key nutrients
            - Any cooking tips or variations
            -Make sure recipe is fully deatiled and cooking instruction is very clear
            
            Make it authentic and practical for home cooking in India.Make sure you explain every step of cooking in depth like teacher`,
          },
        ],
        max_tokens: 10000,
        temperature: 0.7,
      }),
    })

    // console.log("[v0] Recipe API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      // console.log("[v0] OpenRouter API error details:", errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    // console.log("[v0] Recipe generated successfully")

    const recipe = data.choices[0]?.message?.content
    if (!recipe) {
      throw new Error("No recipe content in response")
    }

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error("Recipe generation error:", error)
    const fallbackRecipe = `
# Recipe

## Ingredients:
- 1 cup main ingredient
- 1/2 cup vegetables
- 1 tsp spices (turmeric, cumin, coriander)
- Salt to taste
- 2 tbsp oil

## Instructions:
1. Heat oil in a pan
2. Add spices and let them splutter
3. Add main ingredients and cook for 10-15 minutes
4. Add vegetables and cook until tender
5. Season with salt and serve hot

## Cooking Time: 20-25 minutes
## Servings: 2-3 people
## Nutritional Benefits: Rich in proteins, vitamins, and essential minerals

This is a traditional preparation that's both nutritious and delicious.
    `

    return NextResponse.json({ recipe: fallbackRecipe })
  }
}
