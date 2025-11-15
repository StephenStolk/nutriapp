"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

export function StepsTracker() {
  const [todaySteps, setTodaySteps] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(10000)
  const [inputSteps, setInputSteps] = useState("")
  const [weeklyData, setWeeklyData] = useState<{ day: string; steps: number }[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { userId } = useUser()

  useEffect(() => {
    if (!userId) return
    fetchStepsData()
  }, [userId])

  const fetchStepsData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Fetch today's steps
      const { data: todayData } = await supabase
        .from("steps_tracker")
        .select("steps")
        .eq("user_id", userId)
        .eq("date", today)
        .single()

      if (todayData) {
        setTodaySteps(todayData.steps)
      }

      // Fetch last 7 days
      const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const { data: weekData } = await supabase
        .from("steps_tracker")
        .select("steps, date")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo)
        .order("date", { ascending: true })

      if (weekData) {
        const formatted = weekData.map((item: any) => ({
          day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
          steps: item.steps,
        }))
        setWeeklyData(formatted)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching steps:", error)
      setLoading(false)
    }
  }

  const addSteps = async () => {
    const stepsToAdd = Number.parseInt(inputSteps)
    if (isNaN(stepsToAdd) || stepsToAdd <= 0) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const newTotal = todaySteps + stepsToAdd

      const { error } = await supabase.from("steps_tracker").upsert(
        {
          user_id: userId,
          date: today,
          steps: newTotal,
        },
        { onConflict: "user_id,date" },
      )

      if (!error) {
        setTodaySteps(newTotal)
        setInputSteps("")
        fetchStepsData()
      }
    } catch (error) {
      console.error("Error adding steps:", error)
    }
  }

  const progressPercent = Math.min((todaySteps / dailyGoal) * 100, 100)

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Progress Circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute transform -rotate-90" width="160" height="160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.2" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#c9fa5f"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{todaySteps.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">/ {dailyGoal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-card/50 rounded-2xl p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">Add Steps</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputSteps}
            onChange={(e) => setInputSteps(e.target.value)}
            placeholder="Enter steps"
            className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-sm"
          />
          <Button onClick={addSteps} className="rounded-xl bg-[#c9fa5f] text-black hover:bg-[#b8e94d]">
            Add
          </Button>
        </div>
      </div>

      {/* Weekly Stats */}
      {weeklyData.length > 0 && (
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#c9fa5f]" />
            <h3 className="font-semibold text-foreground">Weekly Activity</h3>
          </div>
          <div className="flex items-end justify-between gap-1 h-32">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-muted rounded-t-lg relative group">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max((item.steps / dailyGoal) * 100, 5)}%`,
                      backgroundColor: "#c9fa5f",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Settings */}
      <div className="bg-card/50 rounded-2xl p-4">
        <label className="text-sm font-medium text-foreground block mb-2">Daily Goal</label>
        <select
          value={dailyGoal}
          onChange={(e) => setDailyGoal(Number.parseInt(e.target.value))}
          className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm"
        >
          <option value={5000}>5,000 steps</option>
          <option value={8000}>8,000 steps</option>
          <option value={10000}>10,000 steps</option>
          <option value={12000}>12,000 steps</option>
          <option value={15000}>15,000 steps</option>
        </select>
      </div>
    </div>
  )
}
