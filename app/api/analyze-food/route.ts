// import { type NextRequest, NextResponse } from "next/server"
// import { createClient } from "@/lib/supabase/server"


// export async function POST(request: NextRequest) {
//   try {
//     if (!process.env.OPENROUTER_API_KEY) {

      
//     const fallbackData = {
//       calories: 250,
//       protein: 12,
//       carbs: 30,
//       fat: 8,
//       fiber: 4,
//       sugar: 3,
//       sodium: 400,
//       ingredients: [],
//       analysis:
//         "Analysis temporarily unavailable. These estimated values are based on typical meal portions. For accurate nutrition tracking, please try again or consult a nutritionist.",
//       recommendations: [
//         "Include a variety of colorful vegetables in your meals",
//         "Choose whole grains over refined carbohydrates when possible",
//         "Maintain consistent meal timing for better metabolism",
//         "Consider portion control to meet your daily calorie goals",
//       ],
//     }

//     const fallbackdata_supabase = {
//   food_name: "Mixed Meal",
//   suggested_names: ["Mixed Meal", "Balanced Plate", "Home Cooked Meal"],
//   calories: 250,
//   protein: 12,
//   carbs: 30,
//   fat: 8,
//   fiber: 4,
//   sugar: 3,
//   sodium: 400,
//   servingSize: "1",
//   servingUnit: "plate",
//   vitamins: {
//     vitaminA: "200 IU",
//     vitaminC: "15 mg"
//   },
//   minerals: {
//     calcium: "50 mg",
//     iron: "2 mg"
//   },
//   ingredients: [],
//   analysis: "Analysis temporarily unavailable.",
// }

//     const supabase = createClient();

//     const { data: {user}, error: userError} = await supabase.auth.getUser();
//     if(userError || !user) {
//        console.error("[error] No authenticated user:", userError);
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

    
//     const { error: insertError} = await supabase.from("food_logs").insert({
//       user_id: user.id,
//       meal_type: "breakfast",
//       ...fallbackdata_supabase,
//     });

//     if(insertError) {
//       console.error("[error] Supabase insert error", insertError);
//     } else {
//       // console.log("[v0] Inserted food log successfully");
//     }

//     return NextResponse.json(fallbackData);
//       // return NextResponse.json(
//       //   {
//       //     error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.",
//       //     fallback: true,
//       //   },
//       //   { status: 400 },
//       // )
//     }

//     const { image, sideImage, mealType, notes } = await request.json()

//     if (!image || !mealType) {
//       return NextResponse.json({ error: "Image and meal type are required" }, { status: 400 })
//     }

//     // console.log("[v0] Starting food analysis for meal type:", mealType)
//     // console.log("[v0] Image data length:", image.length)

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
//         "X-Title": "Kalnut - Food Nutrition Analysis",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "google/gemma-3-27b-it:free",
//         messages: [
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text: `You are a professional nutritionist. Analyze the provided ${mealType} meal using the available images.

// CRITICAL: Your response MUST be valid JSON only. No markdown formatting, no code blocks, no extra text.

// Use this decision process:
// 1) Identify ALL foods visible in the image. Be specific (e.g., "Grilled Chicken Breast" not just "chicken")
// 2) Suggest 3-5 possible dish names that best describe the entire meal
// 3) Estimate portions using plate/utensil/hand reference heuristics
// 4) Calculate macros: multiply portion size by realistic macro ranges
// 5) Include micronutrients (vitamins, minerals) when identifiable
// 6) Adjust for cooking methods and added ingredients
// 7) Validate outputs against common sense

// Return ONLY this JSON structure (no markdown, no code blocks):
// {
//   "suggestedNames": ["Most likely name", "Alternative 1", "Alternative 2"],
//   "calories": number,
//   "protein": number,
//   "carbs": number,
//   "fat": number,
//   "fiber": number,
//   "sugar": number,
//   "sodium": number,
//   "servingSize": "portion description",
//   "servingUnit": "unit (e.g., 'plate', 'bowl', 'cup')",
//   "vitamins": {
//     "vitaminA": "amount with unit",
//     "vitaminC": "amount with unit",
//     "vitaminD": "amount with unit"
//   },
//   "minerals": {
//     "calcium": "amount with unit",
//     "iron": "amount with unit",
//     "potassium": "amount with unit"
//   },
//   "ingredients": ["ingredient1", "ingredient2"],
//   "analysis": "Brief analysis of the meal",
//   "recommendations": ["tip1", "tip2", "tip3"]
// }

// IMPORTANT: Return ONLY the JSON object. No`,
//               },
//               { type: "image_url", image_url: { url: image } },
//               ...(sideImage ? [{ type: "image_url", image_url: { url: sideImage } }] : []),
//               ...(notes
//                 ? [
//                     {
//                       type: "text",
//                       text: `User notes (optional, may refine items/quantities): ${notes}`,
//                     },
//                   ]
//                 : []),
//             ],
//           },
//         ],
//         max_tokens: 4000,
//         temperature: 0.1,
//       }),
//     })

//     // console.log("[v0] OpenRouter response status:", response.status)

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.log("[v0] OpenRouter error response:", errorText)
//       throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
//     }

//     const data = await response.json()
//     // console.log("[v0] OpenRouter response data:", data)

//     const content = data.choices?.[0]?.message?.content
//     if (!content) throw new Error("No response from AI model")

//     let nutritionData: any

//     // REPLACE the JSON parsing section (around line 110-145) with:

// try {
//   // Remove markdown code blocks if present
//   let cleanContent = content.trim()
//   cleanContent = cleanContent.replace(/```json\s*/gi, '')
//   cleanContent = cleanContent.replace(/```\s*/g, '')
  
//   // Try to extract JSON object
//   const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)?.[0]
//   if (!jsonMatch) throw new Error("No JSON found in response")
  
//   nutritionData = JSON.parse(jsonMatch)
  
//   // Ensure required fields exist with defaults
//   nutritionData = {
//     suggestedNames: nutritionData.suggestedNames || ["Unknown Dish"],
//     calories: nutritionData.calories || 0,
//     protein: nutritionData.protein || 0,
//     carbs: nutritionData.carbs || 0,
//     fat: nutritionData.fat || 0,
//     fiber: nutritionData.fiber || 0,
//     sugar: nutritionData.sugar || 0,
//     sodium: nutritionData.sodium || 0,
//     servingSize: nutritionData.servingSize || "1",
//     servingUnit: nutritionData.servingUnit || "serving",
//     vitamins: nutritionData.vitamins || {},
//     minerals: nutritionData.minerals || {},
//     ingredients: Array.isArray(nutritionData.ingredients) ? nutritionData.ingredients : [],
//     analysis: nutritionData.analysis || "",
//     recommendations: Array.isArray(nutritionData.recommendations) ? nutritionData.recommendations : []
//   }

// } catch (parseError) {
//   console.log("[v0] JSON parse error, using fallback:", parseError)
//   nutritionData = {
//     suggestedNames: ["Mixed Meal", "Balanced Plate"],
//     calories: 200,
//     protein: 8,
//     carbs: 25,
//     fat: 6,
//     fiber: 3,
//     sugar: 2,
//     sodium: 300,
//     servingSize: "1",
//     servingUnit: "plate",
//     vitamins: {},
//     minerals: {},
//     ingredients: [],
//     analysis: "Unable to analyze the image precisely. These are estimated values.",
//     recommendations: [
//       "Ensure balanced meals with vegetables, protein, and whole grains",
//       "Monitor portion sizes to maintain healthy calorie intake",
//     ],
//   }
// }
//     // REPLACE the Supabase insert section (around line 160-180) with:

// const supabase = createClient();

// const { data: {user}, error: userError} = await supabase.auth.getUser();
// if(userError || !user) {
//   console.error("[error] No authenticated user:", userError);
//   return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
// }

// // Ensure ingredients is an array
// if (!Array.isArray(nutritionData.ingredients)) {
//   const analysis: string = typeof nutritionData.analysis === "string" ? nutritionData.analysis : ""
//   const extracted = extractIngredientsFromAnalysis(analysis)
//   nutritionData.ingredients = extracted
// }

// // The food name will be set by the client after user selection
// // We save suggested names for reference
// const { error: insertError } = await supabase.from("food_logs").insert({
//   user_id: user.id,
//   meal_type: mealType,
//   food_name: null, // Will be updated by client after user selection
//   suggested_names: nutritionData.suggestedNames || [],
//   calories: nutritionData.calories || 0,
//   protein: nutritionData.protein || 0,
//   carbs: nutritionData.carbs || 0,
//   fat: nutritionData.fat || 0,
//   fiber: nutritionData.fiber || 0,
//   sugar: nutritionData.sugar || 0,
//   sodium: nutritionData.sodium || 0,
//   serving_size: nutritionData.servingSize || "1",
//   serving_unit: nutritionData.servingUnit || "serving",
//   vitamins: nutritionData.vitamins || {},
//   minerals: nutritionData.minerals || {},
//   ingredients: nutritionData.ingredients || [],
//   analysis: nutritionData.analysis || "",
//   notes,
// });

// if(insertError) {
//   console.error("[error] Supabase insert error", insertError);
// } else {
//   // Get the inserted record ID to return to client
//   const { data: insertedLog } = await supabase
//     .from("food_logs")
//     .select("id")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false })
//     .limit(1)
//     .single();
  
//   nutritionData.foodLogId = insertedLog?.id;
// }

//     // console.log("[v0] Final nutrition data:", nutritionData)
//     return NextResponse.json(nutritionData)
//   } catch (error) {
//     //console.error("[v0] Food analysis error:", error)

//     const fallbackData = {
//   suggestedNames: ["Mixed Meal", "Balanced Plate", "Home Cooked Meal"],
//   calories: 250,
//   protein: 12,
//   carbs: 30,
//   fat: 8,
//   fiber: 4,
//   sugar: 3,
//   sodium: 400,
//   servingSize: "1",
//   servingUnit: "plate",
//   vitamins: {
//     vitaminA: "200 IU",
//     vitaminC: "15 mg"
//   },
//   minerals: {
//     calcium: "50 mg",
//     iron: "2 mg"
//   },
//   ingredients: [],
//   analysis: "Analysis temporarily unavailable. These estimated values are based on typical meal portions.",
//   recommendations: [
//     "Include a variety of colorful vegetables in your meals",
//     "Choose whole grains over refined carbohydrates when possible",
//     "Maintain consistent meal timing for better metabolism",
//     "Consider portion control to meet your daily calorie goals",
//   ],
// }

//     const supabase = createClient();

//     const { data: {user}, error: userError} = await supabase.auth.getUser();
//     if(userError || !user) {
//        console.error("[error] No authenticated user:", userError);
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

    
//     const { error: insertError} = await supabase.from("food_logs").insert({
//       user_id: user.id,
//       meal_type: "breakfast",
//       ...fallbackData,
//     });

//     if(insertError) {
//       console.error("[error] Supabase insert error", insertError);
//     } else {
//       // console.log("[v0] Inserted food log successfully");
//     }

//     return NextResponse.json(fallbackData);
//   }
// }

// function extractIngredientsFromAnalysis(analysis: string): string[] {
//   if (!analysis) return []
//   const lines = analysis.split("\n")
 
//   const start = lines.findIndex((l) => /(ingredients|foods? (identified|seen|included))/i.test(l))
//   if (start === -1) return []
//   const out: string[] = []
//   for (let i = start + 1; i < lines.length; i++) {
//     const t = lines[i].trim()
//     if (!t) break

//     if (t.startsWith("- ") || t.startsWith("* ") || t.startsWith("• ") || /^\d+\.\s/.test(t)) {
//       const cleaned = t
//         .replace(/^\d+\.\s/, "")
//         .replace(/^[-*•]\s/, "")
//         .trim()

//       if (cleaned) out.push(cleaned)

//     } else {
//       break
//     }
//   }
//   return out.slice(0, 12)
// }




















import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(getFallbackData(), { status: 200 })
    }

    const { image, sideImage, mealType, notes, scanType } = await request.json()

    if (!image || !mealType) {
      return NextResponse.json({ error: "Image and meal type are required" }, { status: 400 })
    }

    // Handle barcode scanning
    if (scanType === 'barcode') {
      return await handleBarcodeAnalysis(image, mealType, notes)
    }

    // Handle label scanning
    if (scanType === 'label') {
      return await handleLabelAnalysis(image, mealType, notes)
    }

    // Regular food analysis with optimized model
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Kalnut - Food Nutrition Analysis",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free", // Faster model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${mealType} meal. Return ONLY valid JSON (no markdown):

{
  "suggestedNames": ["Primary name", "Alternative 1", "Alternative 2"],
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "servingSize": "1",
  "servingUnit": "plate",
  "vitamins": {"vitaminA": "amount", "vitaminC": "amount"},
  "minerals": {"calcium": "amount", "iron": "amount"},
  "ingredients": ["item1", "item2"],
  "analysis": "Brief 2-3 sentence analysis",
  "recommendations": ["tip1", "tip2", "tip3"]
}`,
              },
              { type: "image_url", image_url: { url: image } },
              ...(sideImage ? [{ type: "image_url", image_url: { url: sideImage } }] : []),
            ],
          },
        ],
        max_tokens: 2000, // Reduced for faster response
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle rate limiting gracefully
      if (response.status === 429) {
        console.log("[info] Rate limited, using fallback")
        return NextResponse.json(getFallbackData(), { status: 200 })
      }
      
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(getFallbackData(), { status: 200 })
    }

    let nutritionData = parseNutritionData(content)
    
    // Save to database (don't wait for it)
    saveFoodLog(nutritionData, mealType, notes).catch(console.error)

    return NextResponse.json(nutritionData)
  } catch (error) {
    console.error("[error] Food analysis:", error)
    return NextResponse.json(getFallbackData(), { status: 200 })
  }
}

// Barcode analysis handler
async function handleBarcodeAnalysis(image: string, mealType: string, notes?: string) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract barcode number from image. If visible, also extract product name and nutritional information from packaging. Return ONLY JSON:

{
  "barcode": "number or null",
  "suggestedNames": ["Product name if visible"],
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "servingSize": "1",
  "servingUnit": "serving",
  "ingredients": [],
  "analysis": "Brief analysis",
  "recommendations": []
}`,
              },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(getFallbackData(), { status: 200 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    let nutritionData = parseNutritionData(content)
    
    // If barcode found, try to fetch from external API
    if (nutritionData.barcode) {
      const enhancedData = await fetchBarcodeData(nutritionData.barcode)
      if (enhancedData) {
        nutritionData = { ...nutritionData, ...enhancedData }
      }
    }

    saveFoodLog(nutritionData, mealType, notes).catch(console.error)
    return NextResponse.json(nutritionData)
  } catch (error) {
    return NextResponse.json(getFallbackData(), { status: 200 })
  }
}

// Label analysis handler
async function handleLabelAnalysis(image: string, mealType: string, notes?: string) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract ALL nutrition facts from this food label. Read carefully. Return ONLY JSON:

{
  "suggestedNames": ["Product name from label"],
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "servingSize": "from label",
  "servingUnit": "from label",
  "vitamins": {"vitaminA": "amount", "vitaminC": "amount"},
  "minerals": {"calcium": "amount", "iron": "amount"},
  "ingredients": ["from label"],
  "analysis": "Brief summary",
  "recommendations": []
}`,
              },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(getFallbackData(), { status: 200 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    const nutritionData = parseNutritionData(content)
    
    saveFoodLog(nutritionData, mealType, notes).catch(console.error)
    return NextResponse.json(nutritionData)
  } catch (error) {
    return NextResponse.json(getFallbackData(), { status: 200 })
  }
}

// Fetch barcode data from Open Food Facts API
async function fetchBarcodeData(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.status !== 1) return null
    
    const product = data.product
    const nutriments = product.nutriments || {}
    
    return {
  suggestedNames: [product.product_name || "Unknown Product"],
  calories: Math.round(nutriments.energy_value || nutriments['energy-kcal'] || 0),
  protein: Math.round(nutriments.proteins || 0),
  carbs: Math.round(nutriments.carbohydrates || 0),
  fat: Math.round(nutriments.fat || 0),
  fiber: Math.round(nutriments.fiber || 0),
  sugar: Math.round(nutriments.sugars || 0),
  sodium: Math.round(nutriments.sodium || 0),
  servingSize: product.serving_size || "1",
  servingUnit: "serving",
  ingredients: product.ingredients_text ? [product.ingredients_text] : [],
  barcode: null,  // ADD THIS LINE
}
  } catch (error) {
    return null
  }
}

// Parse nutrition data from AI response
function parseNutritionData(content: string) {
  try {
    let cleanContent = content.trim()
    cleanContent = cleanContent.replace(/```json\s*/gi, '')
    cleanContent = cleanContent.replace(/```\s*/g, '')
    
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)?.[0]
    if (!jsonMatch) throw new Error("No JSON found")
    
    const parsed = JSON.parse(jsonMatch)
    
    return {
      suggestedNames: parsed.suggestedNames || ["Unknown Dish"],
      calories: parsed.calories || 0,
      protein: parsed.protein || 0,
      carbs: parsed.carbs || 0,
      fat: parsed.fat || 0,
      fiber: parsed.fiber || 0,
      sugar: parsed.sugar || 0,
      sodium: parsed.sodium || 0,
      servingSize: parsed.servingSize || "1",
      servingUnit: parsed.servingUnit || "serving",
      vitamins: parsed.vitamins || {},
      minerals: parsed.minerals || {},
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      analysis: parsed.analysis || "",
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      barcode: parsed.barcode || null,
    }
  } catch (error) {
    return getFallbackData()
  }
}

// Save food log asynchronously
async function saveFoodLog(nutritionData: any, mealType: string, notes?: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from("food_logs").insert({
    user_id: user.id,
    meal_type: mealType,
    food_name: null,
    suggested_names: nutritionData.suggestedNames || [],
    calories: nutritionData.calories || 0,
    protein: nutritionData.protein || 0,
    carbs: nutritionData.carbs || 0,
    fat: nutritionData.fat || 0,
    fiber: nutritionData.fiber || 0,
    sugar: nutritionData.sugar || 0,
    sodium: nutritionData.sodium || 0,
    serving_size: nutritionData.servingSize || "1",
    serving_unit: nutritionData.servingUnit || "serving",
    vitamins: nutritionData.vitamins || {},
    minerals: nutritionData.minerals || {},
    ingredients: nutritionData.ingredients || [],
    analysis: nutritionData.analysis || "",
    notes,
  })
}

// Fallback data
function getFallbackData() {
  return {
    suggestedNames: ["Mixed Meal", "Balanced Plate", "Home Cooked Meal"],
    calories: 250,
    protein: 12,
    carbs: 30,
    fat: 8,
    fiber: 4,
    sugar: 3,
    sodium: 400,
    servingSize: "1",
    servingUnit: "plate",
    vitamins: {},
    minerals: {},
    ingredients: [],
    analysis: "Analysis temporarily unavailable. These are estimated values based on typical portions.",
    recommendations: [
      "Include variety of colorful vegetables",
      "Choose whole grains when possible",
      "Maintain consistent meal timing",
    ],
    barcode: null,  // ADD THIS LINE
  }
}