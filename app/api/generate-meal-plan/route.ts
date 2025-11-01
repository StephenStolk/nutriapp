import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";


export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json()
    const {
      state,
      budget,
      cookingTime,
      lifestyleInfo,
      availableIngredients,
      cuisinePreferences,
      dietLifestyle,
      healthGoal,
      planDuration,
    } = body

    console.log("[v0] Generating meal plan with preferences:", {
      cuisinePreferences,
      healthGoal,
      planDuration,
      state,
    })

    const supabase = createClient();

    const { data: { user}, error: userError,} = await supabase.auth.getUser();

    console.log("User error:", userError);
console.log("User data:", user);
    console.log("Authenticated user:", user);


    if(userError || !user) {
      console.error("[generate-meal-plan] unauthorized:", userError);
      return NextResponse.json({
        error: "Unauthorized."
      }, {status: 401});
    }

      const { data: inputData, error: inputError } = await supabase
      .from("user_meal_planner_inputs")
      .insert([
        {
          user_id: user.id,
          state,
          budget,
          cooking_time: cookingTime,
          lifestyle_info: lifestyleInfo,
          available_ingredients: availableIngredients,
          cuisine_preferences: cuisinePreferences,
          diet_lifestyle: dietLifestyle,
          health_goal: healthGoal,
          plan_duration: planDuration,
        },
      ])
      .select("id")
      .single();

    if (inputError) {
      console.error("[generate-meal-plan] failed to insert input:", inputError);
      return NextResponse.json(
        { error: "Failed to save input", details: inputError },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.",
          fallback: true,
        },
        { status: 400 },
      )
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Kalnut Meal Planner",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-small-3.2-24b-instruct:free", 
        messages: [
          {
            role: "system",
            content: `You are a professional nutritionist and meal planner specializing in Indian and global cuisines.
Create personalized, easy-to-cook meal plans that obey the user's "Dietary Lifestyle" rules.

Hard rules by lifestyle:
- vegan: no animal products (no meat, eggs, dairy, honey).
- vegetarian: no meat, fish, or eggs; dairy allowed.
- keto: very low carbs, high fat, moderate protein; avoid rice, bread, sugar.
- low-carb: reduce grains and sugar; prefer vegetables and protein.
- high-protein: target higher protein in each meal (≥20g).
- gluten-free: avoid wheat, barley, rye.
- mediterranean: favor olive oil, fish, legumes, vegetables, whole grains.
- balanced/default: overall macro balance.

Output STRICT JSON ONLY in this exact shape:
{
  "mealPlan": [
    {
      "day": "Day 1",
      "breakfast": {"name": "Dish Name", "calories": 300, "description": "Brief description"},
      "lunch": {"name": "Dish Name", "calories": 450, "description": "Brief description"},
      "dinner": {"name": "Dish Name", "calories": 400, "description": "Brief description"}
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Create a ${planDuration}-day meal plan for someone in ${state || "their region"} with these preferences:

Budget per day: ${budget || "reasonable"}
Cooking time: ${cookingTime || "flexible"}
Lifestyle notes: ${lifestyleInfo || "n/a"}
Available ingredients: ${availableIngredients || "common pantry items"}
Cuisine preferences: ${cuisinePreferences || "any"}
Dietary lifestyle: ${dietLifestyle || "balanced"}
Primary goal: ${healthGoal || "healthy-living"}

Follow the dietary rules strictly and keep dishes authentic for ${cuisinePreferences || "the region"}. Include realistic calories.`,
          },
        ],
        max_tokens: 10000,
        temperature: 0.7,
      }),
    })

    console.log("[v0] OpenRouter response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] OpenRouter API error details:", errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] OpenRouter response received successfully")

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error("No content in response")
    }

    let mealPlanData
    try {
      // Clean the content to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      mealPlanData = JSON.parse(jsonString)
    } catch (parseError) {
      console.log("[v0] JSON parse error, creating fallback meal plan")
      mealPlanData = {
        mealPlan: Array.from({ length: Number.parseInt(planDuration) || 3 }, (_, i) => {
          const diet = (dietLifestyle || "").toLowerCase()
          const isSouth = (cuisinePreferences || "").toLowerCase().includes("south indian")
          const vegB = isSouth ? "Idli Sambar" : "Aloo Paratha"
          const veganB = isSouth ? "Veg Poha (no ghee)" : "Besan Chilla (no yogurt)"
          const ketoB = "Masala Omelette with Avocado"
          const breakfast =
            diet === "vegan" ? veganB : diet === "keto" ? ketoB : diet === "vegetarian" ? `${vegB} (veg)` : vegB

          const lunch =
            diet === "keto"
              ? "Paneer/Tofu Tikka Salad"
              : diet === "vegan"
                ? "Chana Masala with Brown Rice"
                : diet === "gluten-free"
                  ? "Dal with Steamed Rice"
                  : isSouth
                    ? "Curd Rice with Pickle"
                    : "Dal Chawal"

          const dinner =
            diet === "vegan"
              ? "Veg Pulao with Cucumber Salad"
              : diet === "keto"
                ? "Tandoori Chicken with Salad"
                : diet === "vegetarian"
                  ? "Roti with Mixed Veg Curry"
                  : "Rasam Rice"

          return {
            day: `Day ${i + 1}`,
            breakfast: { name: breakfast, calories: 300, description: "Diet-aware breakfast" },
            lunch: { name: lunch, calories: 450, description: "Authentic, satisfying lunch" },
            dinner: { name: dinner, calories: 380, description: "Light and compliant dinner" },
          }
        }),
      }
    }

      if (mealPlanData?.mealPlan && Array.isArray(mealPlanData.mealPlan) && mealPlanData.mealPlan.length > 0) {
      const rows = mealPlanData.mealPlan.map((p: any) => ({
        user_id: user.id,
        input_id: inputData.id,
        day: p.day,
        breakfast: p.breakfast,
        lunch: p.lunch,
        dinner: p.dinner,
      }));

        const { error: plansError} = await supabase.from("generated_meal_plans").insert(rows);

         if (plansError) {
        console.log("Failed to save generated meal plans in table:", plansError);
        
      }
      }

    return NextResponse.json(mealPlanData,  { status: 200 });
  } catch (error) {
    console.error("Meal plan generation error:", error)
    return NextResponse.json({
      mealPlan: [
        {
          day: "Day 1",
          breakfast: { name: "Poha", calories: 250, description: "Light and nutritious breakfast" },
          lunch: { name: "Dal Rice", calories: 400, description: "Balanced protein and carbs" },
          dinner: { name: "Chapati with Vegetables", calories: 350, description: "Fiber-rich dinner" },
        },
      ],
    })
  }
}
