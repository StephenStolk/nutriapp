import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if(!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { feature } = await req.json();

    const allowed = ["used_meal_planner", "used_analyze_food", "used_get_recipe"];
    if(!allowed.includes(feature)) {
         return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
    }

    const { error } = await supabase
    .from("user_subscriptions")
    .update({ [feature]: true })
    .eq("user_id", user.id);

    if (error) {
    console.error("[error] Error updating feature usage:", error);
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({ success: true });
}