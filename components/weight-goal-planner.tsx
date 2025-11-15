"use client"

import { useState, useEffect } from "react"
import { TrendingDown, Target, Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

export function WeightGoalPlanner() {
  const [height, setHeight] = useState("")
  const [currentWeight, setCurrentWeight] = useState("")
  const [targetWeight, setTargetWeight] = useState("")
  const [timelineWeeks, setTimelineWeeks] = useState("12")
  const [profile, setProfile] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [weightHistory, setWeightHistory] = useState<any[]>([])
  const [newWeight, setNewWeight] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const supabase = createClient()
  const { userId } = useUser()

  useEffect(() => {
    if (!userId) return
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from("weight_goal_profile").select("*").eq("user_id", userId).single()

      if (data) {
        setProfile(data)
        setHeight(data.height_cm.toString())
        setCurrentWeight(data.current_weight_kg.toString())
        setTargetWeight(data.target_weight_kg.toString())
        setTimelineWeeks(data.target_weeks.toString())
        generatePlan(data)
      }

      // Fetch weight history
      const { data: history } = await supabase
        .from("weight_history")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .limit(12)

      if (history) {
        setWeightHistory(history)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setLoading(false)
      setShowForm(true)
    }
  }

  const generatePlan = (data: any) => {
    const weightToLose = data.current_weight_kg - data.target_weight_kg
    const weeklyTarget = (weightToLose / data.target_weeks).toFixed(2)
    const bmi = (data.current_weight_kg / (data.height_cm / 100) ** 2).toFixed(1)
    const dailyDeficit = (weightToLose * 7700) / (data.target_weeks * 7)

    setPlan({
      weightToLose: weightToLose.toFixed(1),
      weeklyTarget,
      dailyDeficit: Math.round(dailyDeficit),
      bmi,
      startDate: new Date(),
      endDate: new Date(Date.now() + data.target_weeks * 7 * 24 * 60 * 60 * 1000),
    })
  }

  const savePlanHandler = async () => {
    const h = Number.parseFloat(height)
    const cw = Number.parseFloat(currentWeight)
    const tw = Number.parseFloat(targetWeight)
    const weeks = Number.parseInt(timelineWeeks)

    if (!h || !cw || !tw || !weeks) return

    try {
      const { error } = await supabase.from("weight_goal_profile").upsert(
        {
          user_id: userId,
          height_cm: h,
          current_weight_kg: cw,
          target_weight_kg: tw,
          target_weeks: weeks,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (!error) {
        const data = {
          height_cm: h,
          current_weight_kg: cw,
          target_weight_kg: tw,
          target_weeks: weeks,
        }
        setProfile(data)
        generatePlan(data)
        setShowForm(false)

        // Add to history
        await supabase.from("weight_history").insert({
          user_id: userId,
          date: new Date().toISOString().split("T")[0],
          weight_kg: cw,
        })
      }
    } catch (error) {
      console.error("Error saving plan:", error)
    }
  }

  const logWeight = async () => {
    const w = Number.parseFloat(newWeight)
    if (isNaN(w)) return

    try {
      await supabase.from("weight_history").insert({
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        weight_kg: w,
      })

      setNewWeight("")
      fetchProfile()
    } catch (error) {
      console.error("Error logging weight:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!profile || showForm) {
    return (
      <div className="space-y-6 pb-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Create Your Weight Goal Plan</h2>
          <p className="text-sm text-muted-foreground">
            Enter your details to get a personalized nutrition and fitness plan
          </p>
        </div>

        <div className="bg-card/50 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className="w-full rounded-xl bg-background border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Current Weight (kg)</label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="75"
              className="w-full rounded-xl bg-background border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Target Weight (kg)</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="65"
              className="w-full rounded-xl bg-background border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Timeline (weeks)</label>
            <select
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              className="w-full rounded-xl bg-background border border-border px-3 py-2"
            >
              <option value="8">8 weeks</option>
              <option value="12">12 weeks</option>
              <option value="16">16 weeks</option>
              <option value="20">20 weeks</option>
              <option value="24">24 weeks</option>
            </select>
          </div>

          <Button
            onClick={savePlanHandler}
            className="w-full rounded-xl bg-[#c9fa5f] text-black hover:bg-[#b8e94d] font-semibold"
          >
            Create Plan
          </Button>
        </div>
      </div>
    )
  }

  const progress =
    ((profile.current_weight_kg - weightHistory[weightHistory.length - 1]?.weight_kg || currentWeight) /
      (profile.current_weight_kg - profile.target_weight_kg)) *
    100

  return (
    <div className="space-y-6 pb-20">
      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-card/50 to-card rounded-2xl p-5 border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-[#c9fa5f]" />
            Weight Goal Progress
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className="text-lg font-bold text-foreground">
              {weightHistory[weightHistory.length - 1]?.weight_kg || currentWeight}kg
            </div>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Target</div>
            <div className="text-lg font-bold text-[#c9fa5f]">{profile.target_weight_kg}kg</div>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">To Lose</div>
            <div className="text-lg font-bold text-foreground">{plan?.weightToLose}kg</div>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Timeline</div>
            <div className="text-lg font-bold text-foreground">{profile.target_weeks} weeks</div>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-[#c9fa5f] h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center">{Math.min(progress, 100).toFixed(0)}% complete</div>
      </div>

      {/* Plan Recommendations */}
      <div className="bg-card/50 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#c9fa5f]" />
          Daily Targets
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between p-3 bg-background rounded-xl">
            <span className="text-sm text-muted-foreground">Weekly Weight Loss</span>
            <span className="font-semibold text-foreground">{plan?.weeklyTarget}kg</span>
          </div>
          <div className="flex justify-between p-3 bg-background rounded-xl">
            <span className="text-sm text-muted-foreground">Daily Calorie Deficit</span>
            <span className="font-semibold text-[#c9fa5f]">~{plan?.dailyDeficit} cal</span>
          </div>
          <div className="flex justify-between p-3 bg-background rounded-xl">
            <span className="text-sm text-muted-foreground">Your BMI</span>
            <span className="font-semibold text-foreground">{plan?.bmi}</span>
          </div>
        </div>
      </div>

      {/* Log Weight */}
      <div className="bg-card/50 rounded-2xl p-4 space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#c9fa5f]" />
          Log Today's Weight
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Weight in kg"
            className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-sm"
          />
          <Button onClick={logWeight} className="rounded-xl bg-[#c9fa5f] text-black hover:bg-[#b8e94d]">
            Log
          </Button>
        </div>
      </div>

      {/* Weight History Chart */}
      {weightHistory.length > 0 && (
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-[#c9fa5f]" />
            <h3 className="font-semibold text-foreground">Weight Progress</h3>
          </div>
          <div className="h-40 relative">
            <svg viewBox="0 0 300 150" className="w-full">
              {/* Grid */}
              <line
                x1="0"
                y1="30"
                x2="300"
                y2="30"
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />
              <line
                x1="0"
                y1="60"
                x2="300"
                y2="60"
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />
              <line
                x1="0"
                y1="90"
                x2="300"
                y2="90"
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />

              {/* Line chart */}
              <polyline
                points={weightHistory
                  .map(
                    (w, i) =>
                      `${(i / (weightHistory.length - 1 || 1)) * 300},${
                        120 -
                        (
                          (w.weight_kg - Math.min(...weightHistory.map((h) => h.weight_kg))) /
                            (Math.max(...weightHistory.map((h) => h.weight_kg)) -
                              Math.min(...weightHistory.map((h) => h.weight_kg)) || 1)
                        ) *
                          100
                      }`,
                  )
                  .join(" ")}
                fill="none"
                stroke="#c9fa5f"
                strokeWidth="2"
              />

              {/* Points */}
              {weightHistory.map((w, i) => (
                <circle
                  key={i}
                  cx={(i / (weightHistory.length - 1 || 1)) * 300}
                  cy={
                    120 -
                    ((w.weight_kg - Math.min(...weightHistory.map((h) => h.weight_kg))) /
                      (Math.max(...weightHistory.map((h) => h.weight_kg)) -
                        Math.min(...weightHistory.map((h) => h.weight_kg)) || 1)) *
                      100
                  }
                  r="3"
                  fill="#c9fa5f"
                />
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
