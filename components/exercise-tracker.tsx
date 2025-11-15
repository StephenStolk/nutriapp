"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

const EXERCISES = [
  { name: "Running", icon: "🏃", caloriesBurned: 10 },
  { name: "Walking", icon: "🚶", caloriesBurned: 4 },
  { name: "Cycling", icon: "🚴", caloriesBurned: 8 },
  { name: "Swimming", icon: "🏊", caloriesBurned: 11 },
  { name: "Yoga", icon: "🧘", caloriesBurned: 3 },
  { name: "Gym", icon: "🏋️", caloriesBurned: 9 },
  { name: "Hiking", icon: "⛰️", caloriesBurned: 7 },
  { name: "Dancing", icon: "💃", caloriesBurned: 6 },
  { name: "Pilates", icon: "🤸", caloriesBurned: 5 },
  { name: "Rope Jumping", icon: "🪢", caloriesBurned: 12 },
]

export function ExerciseTracker() {
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedExercise, setSelectedExercise] = useState<any>(EXERCISES[0])
  const [duration, setDuration] = useState("")
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number }[]>([])
  const [todayCalories, setTodayCalories] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { userId } = useUser()

  useEffect(() => {
    if (!userId) return
    fetchExerciseData()
  }, [userId])

  const fetchExerciseData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Fetch today's exercises
      const { data: todayData } = await supabase
        .from("exercise_tracker")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .order("created_at", { ascending: false })

      if (todayData) {
        setExercises(todayData)
        const totalCalories = todayData.reduce((sum: number, ex: any) => sum + ex.calories_burned, 0)
        setTodayCalories(totalCalories)
      }

      // Fetch last 7 days summary
      const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const { data: weekData } = await supabase
        .from("exercise_tracker")
        .select("date, calories_burned")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo)
        .order("date", { ascending: true })

      if (weekData) {
        const dailyTotals: { [key: string]: number } = {}
        weekData.forEach((item: any) => {
          const day = new Date(item.date).toLocaleDateString("en-US", { weekday: "short" })
          dailyTotals[day] = (dailyTotals[day] || 0) + item.calories_burned
        })

        const formatted = Object.entries(dailyTotals).map(([day, calories]) => ({
          day,
          calories: calories as number,
        }))
        setWeeklyData(formatted)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching exercise data:", error)
      setLoading(false)
    }
  }

  const addExercise = async () => {
    const durationNum = Number.parseInt(duration)
    if (isNaN(durationNum) || durationNum <= 0 || !selectedExercise) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const caloriesBurned = Math.round(selectedExercise.caloriesBurned * durationNum)

      const { error } = await supabase.from("exercise_tracker").insert({
        user_id: userId,
        date: today,
        exercise_name: selectedExercise.name,
        duration_minutes: durationNum,
        calories_burned: caloriesBurned,
      })

      if (!error) {
        setDuration("")
        fetchExerciseData()
      }
    } catch (error) {
      console.error("Error adding exercise:", error)
    }
  }

  const deleteExercise = async (id: string) => {
    try {
      await supabase.from("exercise_tracker").delete().eq("id", id)
      fetchExerciseData()
    } catch (error) {
      console.error("Error deleting exercise:", error)
    }
  }

  const maxCalories = Math.max(...weeklyData.map((d) => d.calories), 500)

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Today's Summary */}
      <div className="bg-gradient-to-br from-card/50 to-card rounded-2xl p-5 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#c9fa5f]" />
            Today's Activity
          </h3>
          <div className="text-2xl font-bold text-[#c9fa5f]">{todayCalories}</div>
        </div>
        <p className="text-sm text-muted-foreground">calories burned</p>
      </div>

      {/* Exercise Selection */}
      <div className="bg-card/50 rounded-2xl p-4 space-y-4">
        <label className="text-sm font-medium text-foreground block">Select Exercise</label>
        <div className="grid grid-cols-3 gap-2">
          {EXERCISES.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => setSelectedExercise(exercise)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                selectedExercise?.name === exercise.name
                  ? "bg-[#c9fa5f] text-black ring-2 ring-[#c9fa5f]/50"
                  : "bg-background border border-border hover:border-[#c9fa5f]"
              }`}
            >
              <span className="text-2xl">{exercise.icon}</span>
              <span className="text-xs font-medium text-center">{exercise.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Input */}
      <div className="bg-card/50 rounded-2xl p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter minutes"
            className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-sm"
          />
          <Button onClick={addExercise} className="rounded-xl bg-[#c9fa5f] text-black hover:bg-[#b8e94d] font-semibold">
            Add
          </Button>
        </div>
        {selectedExercise && duration && (
          <div className="text-sm text-muted-foreground pt-2">
            Est. calories burned:{" "}
            <span className="text-[#c9fa5f] font-semibold">
              {Math.round(selectedExercise.caloriesBurned * Number.parseInt(duration))}
            </span>
          </div>
        )}
      </div>

      {/* Today's Exercises */}
      {exercises.length > 0 && (
        <div className="bg-card/50 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground mb-3">Today's Exercises</h3>
          <div className="space-y-2">
            {exercises.map((exercise, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-background rounded-xl border border-border"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{exercise.exercise_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {exercise.duration_minutes} min · {exercise.calories_burned} cal
                  </div>
                </div>
                <button
                  onClick={() => deleteExercise(exercise.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      {weeklyData.length > 0 && (
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#c9fa5f]" />
            <h3 className="font-semibold text-foreground">Weekly Calories</h3>
          </div>
          <div className="flex items-end justify-between gap-1 h-32">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-muted rounded-t-lg">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max((item.calories / maxCalories) * 100, 5)}%`,
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
    </div>
  )
}
