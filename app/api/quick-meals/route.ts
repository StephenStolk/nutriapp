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

    const { ingredients, images, preference } = await request.json()

    // Prepare the prompt based on user input
    let prompt = `You are a Gen-Z friendly chef assistant. Create 2-3 quick and easy recipes (10-15 minutes max) that are ${preference === "healthy" ? "nutritious and balanced" : preference === "comfort" ? "comforting and satisfying" : "indulgent and fun"}.\n\n`

    if (ingredients) {
      prompt += `Available ingredients: ${ingredients}\n\n`
    }

    if (images.length > 0) {
      prompt += `The user has provided ${images.length} image(s) of their available ingredients.\n\n`
    }

    prompt += `Please provide recipes in this exact JSON format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "cookTime": "X mins",
      "difficulty": "Easy/Medium",
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2", "step3"],
      "tips": "A fun, Gen-Z style cooking tip with emoji"
    }
  ]
}

Make the recipes fun, easy to follow, and use Gen-Z language. Include cooking tips with emojis. Focus on quick, practical recipes that can be made in 10-15 minutes.Make sure the meals are good easy to cook and you give complete deatil line by line on how to cook`

    // Prepare the API call to OpenRouter
    const messages = [
      {
        role: "user",
        content:
          images.length > 0
            ? [
                {
                  type: "text",
                  text: prompt,
                },
                ...images.map((image) => ({
                  type: "image_url",
                  image_url: {
                    url: image,
                  },
                })),
              ]
            : prompt,
      },
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "NutriScan Quick Meals",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: messages,
        temperature: 0.7,
        max_tokens: 5000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenRouter API error:", errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    // Try to parse JSON response
    let recipes
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipes = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      // Fallback if AI doesn't return proper JSON
      recipes = {
        recipes: [
          {
            name: "Quick Ingredient Mix",
            cookTime: "10 mins",
            difficulty: "Easy",
            ingredients: ingredients
              ? ingredients
                  .split(",")
                  .map((i: string) => i.trim())
                  .slice(0, 4)
              : ["Available ingredients"],
            instructions: [
              "Heat a pan with some oil",
              "Add your main ingredients",
              "Season with salt, pepper, and any spices",
              "Cook for 5-8 minutes until done",
              "Serve hot and enjoy!",
            ],
            tips: "Don't be afraid to experiment! Cooking is all about having fun 🔥",
          },
        ],
      }
    }

    return NextResponse.json(recipes)
  } catch (error) {
    console.error("Quick meals API error:", error)

    // Return fallback response
    return NextResponse.json({
      recipes: [
        {
          name: "Simple Stir-Fry",
          cookTime: "12 mins",
          difficulty: "Easy",
          ingredients: ["Your ingredients", "Oil", "Salt", "Pepper"],
          instructions: [
            "Heat oil in a large pan",
            "Add your ingredients",
            "Stir-fry for 8-10 minutes",
            "Season to taste",
            "Serve immediately",
          ],
          tips: "High heat is your friend for quick cooking! 🚀",
        },
      ],
    })
  }
}
