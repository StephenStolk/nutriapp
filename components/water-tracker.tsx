"use client"

import { useState, useEffect } from "react"
import { Droplets, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

const CUP_SIZES = [
  { label: "Small (200ml)", value: 200 },
  { label: "Medium (250ml)", value: 250 },
  { label: "Large (350ml)", value: 350 },
  { label: "XL (500ml)", value: 500 },
]

export function WaterTracker() {
  const [todayWater, setTodayWater] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [selectedCupSize, setSelectedCupSize] = useState(250)
  const [weeklyData, setWeeklyData] = useState<{ day: string; water: number }[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { userId } = useUser()

  useEffect(() => {
    if (!userId) return
    fetchWaterData()
  }, [userId])

  const fetchWaterData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Fetch today's water intake
      const { data: todayData } = await supabase
        .from("water_tracker")
        .select("water_ml")
        .eq("user_id", userId)
        .eq("date", today)
        .single()

      if (todayData) {
        setTodayWater(todayData.water_ml)
      }

      // Fetch last 7 days
      const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const { data: weekData } = await supabase
        .from("water_tracker")
        .select("water_ml, date")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo)
        .order("date", { ascending: true })

      if (weekData) {
        const formatted = weekData.map((item: any) => ({
          day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
          water: item.water_ml,
        }))
        setWeeklyData(formatted)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching water data:", error)
      setLoading(false)
    }
  }

  const addWater = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const newTotal = todayWater + selectedCupSize

      const { error } = await supabase.from("water_tracker").upsert(
        {
          user_id: userId,
          date: today,
          water_ml: newTotal,
        },
        { onConflict: "user_id,date" },
      )

      if (!error) {
        setTodayWater(newTotal)
        fetchWaterData()
      }
    } catch (error) {
      console.error("Error adding water:", error)
    }
  }

  const progressPercent = Math.min((todayWater / dailyGoal) * 100, 100)
  const cupsRemaining = Math.ceil((dailyGoal - todayWater) / selectedCupSize)

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Water Level Visualizer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-40 border-4 border-[#c9fa5f] rounded-3xl overflow-hidden bg-background">
          <div
            className="absolute bottom-0 w-full transition-all duration-500 bg-gradient-to-t from-[#c9fa5f] to-blue-400"
            style={{ height: `${progressPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-foreground bg-background/80 px-2 py-1 rounded-lg">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{todayWater}ml</div>
          <div className="text-sm text-muted-foreground">Goal: {dailyGoal}ml</div>
          <div className="text-xs text-[#c9fa5f] mt-1">
            {cupsRemaining > 0 ? `${cupsRemaining} cups to go` : "Goal reached!"}
          </div>
        </div>
      </div>

      {/* Cup Size Selection */}
      <div className="bg-card/50 rounded-2xl p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">Cup Size</label>
        <div className="grid grid-cols-2 gap-2">
          {CUP_SIZES.map((cup) => (
            <button
              key={cup.value}
              onClick={() => setSelectedCupSize(cup.value)}
              className={`p-2 rounded-xl text-xs font-medium transition-all ${
                selectedCupSize === cup.value
                  ? "bg-[#c9fa5f] text-black"
                  : "bg-background border border-border text-foreground hover:border-[#c9fa5f]"
              }`}
            >
              {cup.label}
            </button>
          ))}
        </div>
        <Button
          onClick={addWater}
          className="w-full rounded-xl bg-[#c9fa5f] text-black hover:bg-[#b8e94d] font-semibold"
        >
          <Droplets className="h-4 w-4 mr-2" />
          Add Water
        </Button>
      </div>

      {/* Weekly Stats */}
      {weeklyData.length > 0 && (
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#c9fa5f]" />
            <h3 className="font-semibold text-foreground">Weekly Intake</h3>
          </div>
          <div className="flex items-end justify-between gap-1 h-32">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-muted rounded-t-lg relative">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max((item.water / dailyGoal) * 100, 5)}%`,
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
          <option value={1500}>1,500ml</option>
          <option value={2000}>2,000ml</option>
          <option value={2500}>2,500ml</option>
          <option value={3000}>3,000ml</option>
          <option value={3500}>3,500ml</option>
        </select>
      </div>
    </div>
  )
}
