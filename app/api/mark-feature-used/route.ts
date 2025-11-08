import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { feature, lastUsedColumn } = await req.json()

  const allowedFeatures = ["used_meal_planner", "used_analyze_food", "used_get_recipe"]
  const allowedLastUsed = ["last_used_analyze_food"]

  if (!allowedFeatures.includes(feature)) {
    return NextResponse.json({ error: "Invalid feature" }, { status: 400 })
  }

  const updateData: Record<string, any> = { [feature]: true }

  if (lastUsedColumn && allowedLastUsed.includes(lastUsedColumn)) {
    updateData[lastUsedColumn] = new Date().toISOString()
  }

  const { error } = await supabase
    .from("user_subscriptions")
    .update(updateData)
    .eq("user_id", user.id)

  if (error) {
    console.error("[error] Error updating feature usage:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
