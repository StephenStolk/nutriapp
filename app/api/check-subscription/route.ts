import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = createClient();
    const { data: {user}} = await supabase.auth.getUser();

    if (!user) {
    return NextResponse.json({ plan: "Free", is_active: false });
  }
   const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

    if (error || !data) {
    return NextResponse.json({ plan: "Free", is_active: false, remaining_uses: 1,
      used_meal_planner: false,
      used_analyze_food: false,
      used_get_recipe: false,
     });
  }

   const now = new Date();
    const valid = data.is_active && (!data.valid_till || new Date(data.valid_till) > now);

   return NextResponse.json({
    plan: valid ? data.plan_name : "Free",
    is_active: valid,
    remaining_uses: data.remaining_uses ?? (data.plan_name === "Free" ? 1 : null),
    used_meal_planner: data.used_meal_planner ?? false,
    used_analyze_food: data.used_analyze_food ?? false,
    used_get_recipe: data.used_get_recipe ?? false,
  });
}