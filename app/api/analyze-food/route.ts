import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"


export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {

      
    const fallbackData = {
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 8,
      fiber: 4,
      sugar: 3,
      sodium: 400,
      ingredients: [],
      analysis:
        "Analysis temporarily unavailable. These estimated values are based on typical meal portions. For accurate nutrition tracking, please try again or consult a nutritionist.",
      recommendations: [
        "Include a variety of colorful vegetables in your meals",
        "Choose whole grains over refined carbohydrates when possible",
        "Maintain consistent meal timing for better metabolism",
        "Consider portion control to meet your daily calorie goals",
      ],
    }

    const fallbackdata_supabase = {
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 8,
      fiber: 4,
      sugar: 3,
      sodium: 400,
      ingredients: [],
      analysis:
        "Analysis temporarily unavailable. These estimated values are based on typical meal portions. For accurate nutrition tracking, please try again or consult a nutritionist.",
    }

    const supabase = createClient();

    const { data: {user}, error: userError} = await supabase.auth.getUser();
    if(userError || !user) {
       console.error("[error] No authenticated user:", userError);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    
    const { error: insertError} = await supabase.from("food_logs").insert({
      user_id: user.id,
      meal_type: "breakfast",
      ...fallbackdata_supabase,
    });

    if(insertError) {
      console.error("[error] Supabase insert error", insertError);
    } else {
      console.log("[v0] Inserted food log successfully");
    }

    return NextResponse.json(fallbackData);
      // return NextResponse.json(
      //   {
      //     error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.",
      //     fallback: true,
      //   },
      //   { status: 400 },
      // )
    }

    const { image, sideImage, mealType, notes } = await request.json()

    if (!image || !mealType) {
      return NextResponse.json({ error: "Image and meal type are required" }, { status: 400 })
    }

    console.log("[v0] Starting food analysis for meal type:", mealType)
    console.log("[v0] Image data length:", image.length)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "NutriScan - Food Nutrition Analysis",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-32b-instruct:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a professional nutritionist. Analyze the provided ${mealType} meal using the available images.

Use this decision process:
1) Identify foods (top-view for footprint, side-view for height if provided). Split mixed dishes into components where possible.
2) Reference realistic macro ranges per food before calculating anything. For example, know typical protein, fat, carb ranges for that food (e.g., cake has ~2 to 6g protein per 100g).
3) Estimate portions and grams using plate/utensil/hand reference heuristics. Adjust for visible volume and density.
4) Calculate macros using math: multiply portion size by realistic macro ranges to get calories, protein, carbs, fat, fiber, sugar, sodium. Ensure values remain plausible for the food.
5) Cross-check calories/macros with a known nutrition database (approximate) to validate calculations.
6) Adjust for cooking methods and added ingredients if detectable (e.g., oils, sauces, frying, butter).
7) Validate outputs against common sense: ensure no values are absurd for that food type or meal size. Flag extreme results.
8) When uncertain, pick conservative estimates or provide plausible ranges instead of a single precise number.


Return STRICT JSON with keys ONLY:
- calories, protein, carbs, fat, fiber, sugar, sodium (numbers)
- ingredients (array of short names)
- analysis (markdown allowed, use headings and bullet lists where useful)
- recommendations (array of 3-4 markdown strings)

If you include markdown, do NOT use tables. No extra commentary outside JSON.`,
              },
              { type: "image_url", image_url: { url: image } },
              ...(sideImage ? [{ type: "image_url", image_url: { url: sideImage } }] : []),
              ...(notes
                ? [
                    {
                      type: "text",
                      text: `User notes (optional, may refine items/quantities): ${notes}`,
                    },
                  ]
                : []),
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    })

    console.log("[v0] OpenRouter response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] OpenRouter error response:", errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] OpenRouter response data:", data)

    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("No response from AI model")

    let nutritionData: any

    try {
     
      const jsonMatch = content.match(/```json([\s\S]*?)```/i)?.[1] || content.match(/\{[\s\S]*\}/)?.[0]

      if (!jsonMatch) throw new Error("No JSON found in response")
      nutritionData = JSON.parse(jsonMatch)

    } catch (parseError) {
      console.log("[v0] JSON parse error, using fallback:", parseError)

      nutritionData = {
        calories: 200,
        protein: 8,
        carbs: 25,
        fat: 6,
        fiber: 3,
        sugar: 2,
        sodium: 300,
        ingredients: [],
        analysis:
          "Unable to analyze the image precisely. These are estimated values based on typical meal portions. For accurate nutrition information, please try uploading a clearer image or consult a nutritionist.",
        recommendations: [
          "Ensure balanced meals with vegetables, protein, and whole grains",
          "Monitor portion sizes to maintain healthy calorie intake",
          "Stay hydrated and include fiber-rich foods in your diet",
          "Consider consulting a nutritionist for personalized advice",
        ],
      }
    };

    const supabase = createClient();

    const { data: {user}, error: userError} = await supabase.auth.getUser();
    if(userError || !user) {
       console.error("[error] No authenticated user:", userError);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!Array.isArray(nutritionData.ingredients)) {
      const analysis: string = typeof nutritionData.analysis === "string" ? nutritionData.analysis : ""
      const extracted = extractIngredientsFromAnalysis(analysis)
      nutritionData.ingredients = extracted
    }
    
    const { error: insertError} = await supabase.from("food_logs").insert({
      user_id: user.id,
      meal_type: mealType,
      calories: nutritionData.calories || 0,
      protein: nutritionData.protein || 0,
      carbs: nutritionData.carbs || 0,
      fat: nutritionData.fat || 0,
      fiber: nutritionData.fiber || 0,
      sugar: nutritionData.sugar || 0,
      sodium: nutritionData.sodium || 0,
      ingredients: nutritionData.ingredients || [],
      analysis: nutritionData.analysis || "",
      notes,
    });

    if(insertError) {
      console.error("[error] Supabase insert error", insertError);
    } else {
      console.log("[v0] Inserted food log successfully");
    }

    console.log("[v0] Final nutrition data:", nutritionData)
    return NextResponse.json(nutritionData)
  } catch (error) {
    //console.error("[v0] Food analysis error:", error)

    const fallbackData = {
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 8,
      fiber: 4,
      sugar: 3,
      sodium: 400,
      ingredients: [],
      analysis:
        "Analysis temporarily unavailable. These estimated values are based on typical meal portions. For accurate nutrition tracking, please try again or consult a nutritionist.",
      recommendations: [
        "Include a variety of colorful vegetables in your meals",
        "Choose whole grains over refined carbohydrates when possible",
        "Maintain consistent meal timing for better metabolism",
        "Consider portion control to meet your daily calorie goals",
      ],
    }

    const supabase = createClient();

    const { data: {user}, error: userError} = await supabase.auth.getUser();
    if(userError || !user) {
       console.error("[error] No authenticated user:", userError);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    
    const { error: insertError} = await supabase.from("food_logs").insert({
      user_id: user.id,
      meal_type: "breakfast",
      ...fallbackData,
    });

    if(insertError) {
      console.error("[error] Supabase insert error", insertError);
    } else {
      console.log("[v0] Inserted food log successfully");
    }

    return NextResponse.json(fallbackData);
  }
}

function extractIngredientsFromAnalysis(analysis: string): string[] {
  if (!analysis) return []
  const lines = analysis.split("\n")
 
  const start = lines.findIndex((l) => /(ingredients|foods? (identified|seen|included))/i.test(l))
  if (start === -1) return []
  const out: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    const t = lines[i].trim()
    if (!t) break

    if (t.startsWith("- ") || t.startsWith("* ") || t.startsWith("• ") || /^\d+\.\s/.test(t)) {
      const cleaned = t
        .replace(/^\d+\.\s/, "")
        .replace(/^[-*•]\s/, "")
        .trim()

      if (cleaned) out.push(cleaned)

    } else {
      break
    }
  }
  return out.slice(0, 12)
}
