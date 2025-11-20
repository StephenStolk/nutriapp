"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MeditationTimer } from "@/components/meditation-timer"
import CalorieCalculatorModal from "./calorie-calculator-modal"
import { Plus, Coffee, Utensils, Cookie, Target, TrendingUp, Apple, Settings, CheckCircle2, Circle, Dumbbell, Bed, Clock, Heart, X, Brain, Droplets, BookOpen, Smile, Sun, Battery, Cloud, AlertTriangle, MinusCircle } from 'lucide-react'
import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { useSubscription } from "@/hooks/use-subscription"
import { useRouter } from 'next/navigation'
import { InsightsTracker } from "./insights-tracker"
import { PlantStreak } from "./plant-streak"
import { MoodPicker } from "@/components/mood-picker"
import { CravingTracker } from "@/components/craving-tracker"
import { HungerCheck } from "@/components/hunger-check"
import { HelpCircle } from 'lucide-react'
import { PsychologyInsights } from "@/components/psychology-insights"
import { BodyBattery } from "@/components/body-battery"
import { NutritionPersonalityQuiz } from "@/components/nutrition-personality-quiz"
import { WordCloud } from "@/components/word-cloud"
import { FoodConsistencyRadar } from "@/components/food-consistency-radar"
import { MicroWinsTracker } from "@/components/micro-wins-tracker"
import { BarChart3, Users } from "lucide-react"
import { FutureSelfMirror } from "@/components/future-self-mirror"
import { CravingParasite } from "@/components/craving-parasite"
import { ShadowDay } from "@/components/shadow-day"
import { DisciplineDebt } from "@/components/discipline-debt"
import { PatternAnalytics } from "@/components/pattern-analytics"
import { MicroChoiceFork } from "@/components/micro-choice-fork"
import { GitBranch } from "lucide-react"

interface LoggedFood {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: "breakfast" | "lunch" | "dinner" | "snacks"
  timestamp: Date
}

interface Habit {
  id: string
  name: string
  icon?: string
  color?: string | null
  // createdAt?: Date | string | null;
  created_at?: string | null
}

interface HabitLog {
  id?: string
  // habitId?: string;
  habit_id?: string
  date: string
  completed: boolean
  created_at?: string | null
}

interface UserContextType {
  user: User | null
  userId: string | null
  loading: boolean
  habits: Habit[]
  habitLogs: HabitLog[]
  fatchHabitsAndLogs: () => Promise<void>
  addHabit: (payload: { name: string; icon?: string; color?: string }) => Promise<Habit | null>
  deleteHabit: (habitId: string) => Promise<boolean>
  syncLocalToDb: () => Promise<void>
}

interface DashboardProps {
  onAddFood?: (mealType: "breakfast" | "lunch" | "dinner" | "snacks") => void
}

const builtInHabits = [
  { name: "Workout", icon: "dumbbell", color: "bg-orange-500" },
  { name: "Drink Water", icon: "droplets", color: "bg-blue-500" },
  { name: "Read Book", icon: "book", color: "bg-green-500" },
  { name: "Meditate", icon: "brain", color: "bg-purple-500" },
  { name: "Early Rise", icon: "sun", color: "bg-yellow-500" },
]

export function Dashboard({ onAddFood }: DashboardProps) {
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState("")
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [isMeditationOpen, setIsMeditationOpen] = useState(false)
  const [isCalorieCalculatorOpen, setIsCalorieCalculatorOpen] = useState(false)
  const [historyFor, setHistoryFor] = useState<"breakfast" | "lunch" | "dinner" | "snacks" | null>(null)
  const [weeklyConsumption, setWeeklyConsumption] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [weeklyHabitCount, setWeeklyHabitCount] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  const [showMoodPicker, setShowMoodPicker] = useState(false)
const [showCravingTracker, setShowCravingTracker] = useState(false)
const [showHungerCheck, setShowHungerCheck] = useState(false)
const [lastFoodLogId, setLastFoodLogId] = useState<string | null>(null)
const [todayStressLevel, setTodayStressLevel] = useState<string | null>(null)


const [showPsychologyInsights, setShowPsychologyInsights] = useState(false)
const [showBodyBattery, setShowBodyBattery] = useState(false)
const [showPersonalityQuiz, setShowPersonalityQuiz] = useState(false)
const [showWordCloud, setShowWordCloud] = useState(false)
const [showConsistencyRadar, setShowConsistencyRadar] = useState(false)


const [showFutureSelfMirror, setShowFutureSelfMirror] = useState(false)
const [showCravingParasite, setShowCravingParasite] = useState(false)
const [showShadowDay, setShowShadowDay] = useState(false)
const [showDisciplineDebt, setShowDisciplineDebt] = useState(false)
const [showPatternAnalytics, setShowPatternAnalytics] = useState(false)
const [showMicroChoiceFork, setShowMicroChoiceFork] = useState(false)
const [choiceForkFood, setChoiceForkFood] = useState<any>(null)


  const router = useRouter()
  const { user, userId, loading } = useUser()
  const { hasSubscription, plan } = useSubscription()

  
useEffect(() => {
  // Prevent back button after entering dashboard with active plan
  if (hasSubscription) {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, '', window.location.href);
    };
  }

  return () => {
    window.onpopstate = null;
  };
}, [hasSubscription]);

  const supabase = createClient()


  const addMicroWin = async (type: string, description: string) => {
  if (!userId) return
  try {
    await supabase.from('micro_wins').insert({
      user_id: userId,
      win_type: type,
      description,
      points: 1,
    })
    // Optional: Show toast notification
  } catch (error) {
    console.error('Error adding micro-win:', error)
  }
}


const checkMicroChoiceFork = (mealType: string, calories: number) => {
  // Trigger fork for high-calorie meals or junk food patterns
  if (calories > 600 || mealType === 'snacks') {
    setChoiceForkFood({ name: `${mealType} (${calories} cal)`, calories })
    setShowMicroChoiceFork(true)
    return true
  }
  return false
}



const updateIdentityAlignment = async (foodLogId: string, calories: number) => {
  if (!userId) return
  
  try {
    // Get active identity
    const { data: identity } = await supabase
      .from('user_identities_future')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!identity) return

    // Calculate impact (simplified)
    const isHealthy = calories < 600 && calories > 200
    const impactPercentage = isHealthy ? (Math.random() * 2 + 1) : -(Math.random() * 2 + 0.5)
    const direction = isHealthy ? 'positive' : 'negative'

    // Save impact
    await supabase.from('identity_meal_impacts').insert({
      user_id: userId,
      identity_id: identity.id,
      food_log_id: foodLogId,
      impact_percentage: impactPercentage,
      impact_direction: direction,
    })

    // Update alignment score
    const newScore = Math.max(0, Math.min(100, identity.alignment_score + impactPercentage))
    await supabase
      .from('user_identities_future')
      .update({ alignment_score: newScore })
      .eq('id', identity.id)
  } catch (error) {
    console.error('Error updating identity alignment:', error)
  }
}


const feedParasite = async (foodName: string, calories: number) => {
  if (!userId) return
  
  const isJunkFood = calories > 500 || foodName.toLowerCase().includes('fries') || 
                     foodName.toLowerCase().includes('pizza') || 
                     foodName.toLowerCase().includes('burger')
  
  if (!isJunkFood) return

  try {
    let { data: parasite } = await supabase
      .from('craving_parasite')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!parasite) {
      await supabase.from('craving_parasite').insert({
        user_id: userId,
        health_points: 50,
      })
      parasite = { health_points: 50 }
    }

    const growth = Math.min(15, Math.floor(calories / 50))
    const newHealth = Math.min(100, parasite.health_points + growth)

    await supabase
      .from('craving_parasite')
      .update({ health_points: newHealth, last_updated: new Date().toISOString() })
      .eq('user_id', userId)

    await supabase.from('parasite_events').insert({
      user_id: userId,
      event_type: 'grew',
      change_amount: growth,
      trigger_food: foodName,
    })
  } catch (error) {
    console.error('Error feeding parasite:', error)
  }
}


const addDisciplineDebt = async (reason: string, amount: number) => {
  if (!userId) return

  try {
    let { data: debt } = await supabase
      .from('discipline_debt')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!debt) {
      await supabase.from('discipline_debt').insert({
        user_id: userId,
        current_debt: 0,
      })
      debt = { current_debt: 0, total_accumulated: 0 }
    }

    const newDebt = debt.current_debt + amount
    const newTotal = debt.total_accumulated + amount

    await supabase
      .from('discipline_debt')
      .update({
        current_debt: newDebt,
        total_accumulated: newTotal,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId)

    await supabase.from('debt_transactions').insert({
      user_id: userId,
      transaction_type: 'debt_added',
      amount,
      reason,
    })
  } catch (error) {
    console.error('Error adding debt:', error)
  }
}

  useEffect(() => {
    if (!userId || loading) return

    const fetchData = async () => {
      try {
        const { data: habitsData, error: habitsErr } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })

        const { data: logsData, error: logsErr } = await supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: true })

        if (habitsErr) {
          console.error("fetch habits error", habitsErr)
        } else if (habitsData) {
          setHabits(habitsData)

          try {
            localStorage.setItem("habits", JSON.stringify(habitsData))
          } catch {}
        }

        if (logsErr) {
          console.error("fetch logs error", logsErr)
        } else if (logsData) {
          const normalized = (logsData as HabitLog[]).map((l) => ({
            ...l,
            date: l.date && typeof l.date === "string" ? l.date : String(l.date),
          }))

          setHabitLogs(normalized)
          try {
            localStorage.setItem("habit-logs", JSON.stringify(normalized))
          } catch {}
        }
      } catch (err) {
        console.error("fetchData unexpected", err)
      }
    }

    fetchData()
  }, [userId, loading])

  useEffect(() => {
    // const saved = localStorage.getItem("logged-foods");

    // if (saved) {
    //   try {
    //     const foods = JSON.parse(saved).map((food: any) => ({
    //       ...food,
    //       timestamp: new Date(food.timestamp),
    //     }));
    //     setLoggedFoods(foods);
    //   } catch {}
    // }

    // const savedGoal = localStorage.getItem("daily-calorie-goal");
    // if (savedGoal) setDailyGoal(Number.parseInt(savedGoal));

    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      try {
        const habitsData = JSON.parse(savedHabits).map((habit: any) => ({
          ...habit,

          created_at: habit.created_at ?? habit.createdAt ?? null,
        }))
        setHabits(habitsData)
      } catch {}
    } else {
      const initialHabits = builtInHabits.map((habit, index) => ({
        id: `builtin-${index}`,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        created_at: new Date().toISOString(),
      }))

      setHabits(initialHabits)

      try {
        localStorage.setItem("habits", JSON.stringify(initialHabits))
      } catch {}
    }

    const savedHabitLogs = localStorage.getItem("habit-logs")
    if (savedHabitLogs) {
      try {
        const parsed = JSON.parse(savedHabitLogs) as any[]
        const normalized = parsed.map((l) => {
          const d = String(l.date || l.dateString || "")
          if (/\d{4}-\d{2}-\d{2}/.test(d)) {
            return { ...l, date: d }
          }
          const parsedDate = new Date(d)
          return { ...l, date: isNaN(parsedDate.getTime()) ? d : parsedDate.toISOString().slice(0, 10) }
        })
        setHabitLogs(normalized)
      } catch {}
    }
  }, [])

  useEffect(() => {
  const fetchFoodLogs = async () => {
    if (!userId) return
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("food_logs")
        .select("id, meal_type, calories, protein, carbs, fat, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching food logs:", error)
        return
      }

      if (data) {
        const formatted = data.map((item) => ({
          id: item.id,
          name: `${item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1)} meal`,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          mealType: item.meal_type as "breakfast" | "lunch" | "dinner" | "snacks",
          timestamp: new Date(item.created_at),
        })) as LoggedFood[]

        setLoggedFoods(formatted)

        // Micro-win detection for today's meals
        const todayString = new Date().toDateString()
        const todayMeals = formatted.filter(f => new Date(f.timestamp).toDateString() === todayString)

// Check if user overate today
const todayTotal = todayMeals.reduce((sum, m) => sum + m.calories, 0)

if (todayTotal > dailyGoal * 1.3) {
  const excess = todayTotal - dailyGoal
  await addDisciplineDebt(`Overate by ${Math.round(excess)} cal`, Math.floor(excess / 50))
}

// Update identity alignment for latest meal
if (formatted.length > 0) {
  const latestMeal = formatted[0]
  await updateIdentityAlignment(latestMeal.id, latestMeal.calories)
  await feedParasite(latestMeal.name, latestMeal.calories)
}
        
        // Check for 3 balanced meals
        const uniqueMealTypes = new Set(todayMeals.map(m => m.mealType).filter(type => type !== 'snacks'))
        if (uniqueMealTypes.size === 3) {
          // Check if we already awarded this win today
          const { data: existingWin } = await supabase
            .from('micro_wins')
            .select('id')
            .eq('user_id', userId)
            .eq('win_type', 'balanced_meals')
            .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00`)
            .single()

          if (!existingWin) {
            await addMicroWin('balanced_meals', 'Logged 3 balanced meals today!')
          }
        }

        // Check for high protein intake
        const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0)
        if (totalProtein >= 100) {
          const { data: existingWin } = await supabase
            .from('micro_wins')
            .select('id')
            .eq('user_id', userId)
            .eq('win_type', 'high_protein')
            .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00`)
            .single()

          if (!existingWin) {
            await addMicroWin('high_protein', 'Hit 100g+ protein today!')
          }
        }

        // Check for staying within calorie goal
        const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0)
        if (totalCalories >= dailyGoal * 0.8 && totalCalories <= dailyGoal * 1.2) {
          const { data: existingWin } = await supabase
            .from('micro_wins')
            .select('id')
            .eq('user_id', userId)
            .eq('win_type', 'calorie_target')
            .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00`)
            .single()

          if (!existingWin) {
            await addMicroWin('calorie_target', 'Stayed within calorie goal!')
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching food logs:", err)
    }
  }

  fetchFoodLogs()
}, [userId, dailyGoal])


  useEffect(() => {
    if (!userId) return
    const fetchGoal = async () => {
      const { data: goalRows, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", userId)
        .order("effective_from", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching goal:", error)
        return
      }

      const currentGoal = goalRows?.[0]?.daily_goal ?? 2000
      setDailyGoal(currentGoal)
    }

    fetchGoal()
  }, [userId])

  useEffect(() => {
    if (loggedFoods.length > 0) {
      const weeklyData = [0, 0, 0, 0, 0, 0, 0]
      const habitData = [0, 0, 0, 0, 0, 0, 0]
      const today = new Date()

      loggedFoods.forEach((food) => {
        const foodDate = new Date(food.timestamp)
        const daysDiff = Math.floor((today.getTime() - foodDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff >= 0 && daysDiff < 7) {
          weeklyData[6 - daysDiff] += food.calories
        }
      })

      habitLogs.forEach((log) => {
        const logDate = new Date(log.date)
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff >= 0 && daysDiff < 7 && log.completed) {
          habitData[6 - daysDiff] += 1
        }
      })

      setWeeklyConsumption(weeklyData)
      setWeeklyHabitCount(habitData)
    }
  }, [loggedFoods, habitLogs])



  const today = new Date()
  const todayString = today.toDateString()
  const todayISO = new Date().toISOString().slice(0, 10)

  const todaysFoods = loggedFoods.filter((food) => {
    const foodDate = new Date(food.timestamp)
    return foodDate.toDateString() === todayString
  })

  const todaysHabitLogs = habitLogs.filter((log) => log.date === todayISO)
  const completedHabitsToday = todaysHabitLogs.filter((log) => log.completed).length
  const totalHabitsToday = habits.length

  // Calculate totals
  const totalCalories = todaysFoods.reduce((sum, food) => sum + food.calories, 0)

  const totalProtein = todaysFoods.reduce((sum, food) => sum + food.protein, 0)

  const totalCarbs = todaysFoods.reduce((sum, food) => sum + food.carbs, 0)

  const totalFat = todaysFoods.reduce((sum, food) => sum + food.fat, 0)

  const remaining = Math.max(0, dailyGoal - totalCalories)
  const progressPercentage = Math.min((totalCalories / dailyGoal) * 100, 100)


  // Check if user is on target today
const isCaloriesOnTarget = totalCalories >= dailyGoal * 0.8 && totalCalories <= dailyGoal * 1.2
const areHabitsComplete = totalHabitsToday > 0 && completedHabitsToday === totalHabitsToday

  // Group foods by meal type
  const mealGroups = {
    breakfast: todaysFoods.filter((food) => food.mealType === "breakfast"),
    lunch: todaysFoods.filter((food) => food.mealType === "lunch"),
    dinner: todaysFoods.filter((food) => food.mealType === "dinner"),
    snacks: todaysFoods.filter((food) => food.mealType === "snacks"),
  }

  const getMealCalories = (mealType: keyof typeof mealGroups) => {
    return mealGroups[mealType].reduce((sum, food) => sum + food.calories, 0)
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return Coffee
      case "lunch":
        return Utensils
      case "dinner":
        return Utensils
      case "snacks":
        return Cookie
      default:
        return Apple
    }
  }

  const getMealGoal = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return Math.round(dailyGoal * 0.25)
      case "lunch":
        return Math.round(dailyGoal * 0.35)
      case "dinner":
        return Math.round(dailyGoal * 0.3)
      case "snacks":
        return Math.round(dailyGoal * 0.1)
      default:
        return 0
    }
  }

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case "dumbbell":
        return Dumbbell
      case "bed":
        return Bed
      case "clock":
        return Clock
      case "heart":
        return Heart
      case "user":
        return CheckCircle2
      case "brain":
        return Brain
      case "droplets":
        return Droplets
      case "book":
        return BookOpen
      case "smile":
        return Smile
      case "sun":
        return Sun
      default:
        return CheckCircle2
    }
  }

  const addHabit = async () => {
    if (!userId || !newHabitName.trim()) return

    const payload = {
      user_id: userId,
      name: newHabitName.trim(),
      icon: "dumbbell",
      color: "bg-primary",
    }

    try {
      const { data, error } = await supabase.from("habits").insert([payload]).select().single()

      if (error) {
        console.error("addHabit error", error)

        const newHabitLocal: Habit = {
          id: Date.now().toString(),
          name: newHabitName.trim(),
          icon: "dumbbell",
          color: "bg-primary",
          created_at: new Date().toISOString(),
        }

        const updatedHabitsLocal = [...habits, newHabitLocal]
        setHabits(updatedHabitsLocal)

        try {
          localStorage.setItem("habits", JSON.stringify(updatedHabitsLocal))
        } catch {}
      } else if (data) {
        const added: Habit = {
          id: (data as any).id,
          name: (data as any).name,
          icon: (data as any).icon,
          color: (data as any).color,
          created_at: (data as any).created_at,
        }

        const updatedHabits = [
          ...habits.filter((h) => !h.id.startsWith("builtin-")),
          added,
          ...habits.filter((h) => h.id.startsWith("builtin-")),
        ]
        setHabits(updatedHabits)

        try {
          localStorage.setItem("habits", JSON.stringify(updatedHabits))
        } catch {}
      }
    } catch (err) {
      console.error("addHabit unexpected", err)
    } finally {
      setNewHabitName("")
      setIsAddingHabit(false)
    }
  }

  const toggleHabit = async (habitId: string) => {
    // console.log("toggleHabit called for", { habitId, userId })
    const isLocalBuiltIn = typeof habitId === "string" && habitId.startsWith("builtin-")

    try {
      let dbHabitId = habitId

      if (isLocalBuiltIn && userId) {
        let local = null
        try {
          const raw = localStorage.getItem("habits")
          if (raw) {
            const arr = JSON.parse(raw)

            local = arr.find((h: any) => h.id === habitId)
          }
        } catch (e) {
          console.warn("couldn't read local habit", e)
        }

        const payloadHabit = {
          user_id: userId,
          name: local?.name ?? "Habit",
          icon: local?.icon ?? "dumbbell",
          color: local?.color ?? "bg-primary",
        }

        // console.log("creating DB habit for builtin:", payloadHabit)

        const { data: created, error: createErr } = await supabase
          .from("habits")
          .insert([payloadHabit])
          .select()
          .single()

        // console.log("create habit result:", { created, createErr })
        if (createErr) {
          return toggleHabitLocalFallback(habitId)
        }
        dbHabitId = (created as any).id

        const updatedHabits = habits.map((h) =>
          h.id === habitId
            ? {
                id: dbHabitId,
                name: (created as any).name,
                icon: (created as any).icon,
                color: (created as any).color,
                created_at: (created as any).created_at,
              }
            : h,
        )

        setHabits(updatedHabits)


        try {
          localStorage.setItem("habits", JSON.stringify(updatedHabits))
        } catch {}
      }

      if (!userId) {
        // console.log("no userId — using local fallback")
        return toggleHabitLocalFallback(habitId)
      }

      const theDate = todayISO

      const { data: existingArr, error: selectErr } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("habit_id", dbHabitId)
        .eq("date", theDate)
        .limit(1)

      // console.log("select habit_log result:", { existingArr, selectErr })

      if (selectErr) {
        console.error("select habit_logs error", selectErr)
        return toggleHabitLocalFallback(habitId)
      }

      const existing = Array.isArray(existingArr) && existingArr.length ? (existingArr[0] as HabitLog) : null

      if (existing && existing.id) {
        const { data: updatedData, error: updateErr } = await supabase
          .from("habit_logs")
          .update({ completed: !existing.completed })
          .eq("id", existing.id)
          .select()
          .single()

        console.log("update result:", { updatedData, updateErr })

        if (updateErr) {
          console.error("update habit_log err", updateErr)
          return
        }

        const updatedLogs = habitLogs.map((l) => (l.id === existing.id ? (updatedData as any) : l))

        setHabitLogs(updatedLogs)
        try {
          localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
        } catch {}
        return
      }

      const payload = {
        user_id: userId,
        habit_id: dbHabitId,
        date: theDate,
        completed: true,
      }

      const { data: authData } = await supabase.auth.getUser()
      // console.log("auth.uid() =", authData?.user?.id)
      // console.log("payload.user_id =", userId)

      // console.log("inserting habit_log payload:", payload)
      const { data: inserted, error: insertErr } = await supabase.from("habit_logs").insert([payload]).select()

      // console.log("insert result:", { inserted, insertErr })

      if (insertErr) {
        console.warn("insertErr — trying upsert", insertErr)
        const { data: upserted, error: upsertErr } = await supabase.from("habit_logs").upsert([payload]).select()

        // console.log("upsert result:", { upserted, upsertErr })
        if (upsertErr) {
          console.error("upsert also failed", upsertErr)
          return
        }

        const newLog = Array.isArray(upserted) ? upserted[0] : upserted
        const updatedLogs = [...habitLogs, newLog as HabitLog]
        setHabitLogs(updatedLogs)
        try {
          localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
        } catch {}
        return
      }

      const newInserted = Array.isArray(inserted) ? inserted[0] : inserted
      const newLog = newInserted as HabitLog
      const updatedLogs = [...habitLogs, newLog]

      setHabitLogs(updatedLogs)
      try {
        localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
      } catch {}
    } catch (err) {
      console.error("toggleHabit unexpected", err)

      try {
        toggleHabitLocalFallback(habitId)
      } catch {}
    }


     // At the very end of the function, after all the habit toggling logic:
  try {
    // Check if all habits are now completed
    const updatedTodayLogs = habitLogs.filter((log) => log.date === todayISO)
    const completedCount = updatedTodayLogs.filter((log) => log.completed).length
    
    if (completedCount === habits.length && habits.length > 0) {
      // Check if we already awarded this win today
      const { data: existingWin } = await supabase
        .from('micro_wins')
        .select('id')
        .eq('user_id', userId)
        .eq('win_type', 'all_habits')
        .gte('created_at', `${todayISO}T00:00:00`)
        .single()

      if (!existingWin) {
        await addMicroWin('all_habits', 'Completed all habits today!')
      }
    }
  } catch (e) {
    // Silently fail - micro-win is bonus, not critical
  }
  }

  const toggleHabitLocalFallback = (habitId: string) => {
    try {
      const savedRaw = localStorage.getItem("habit-logs") || "[]"
      const saved = JSON.parse(savedRaw)
      const legacyDate = new Date().toDateString()

      const existing = saved.find((l: any) => l.habitId === habitId && l.date === legacyDate)

      let updated
      if (existing) {
        updated = saved.map((l: any) =>
          l.habitId === habitId && l.date === legacyDate ? { ...l, completed: !l.completed } : l,
        )
      } else {
        updated = [...saved, { habitId, date: legacyDate, completed: true }]
      }

      localStorage.setItem("habit-logs", JSON.stringify(updated))

      const normalized = updated.map((l: any) => ({
        id: l.id,
        habit_id: l.habitId ?? l.habit_id,
        date:
          typeof l.date === "string" && /\d{4}-\d{2}-\d{2}/.test(l.date)
            ? l.date
            : new Date(l.date).toISOString().slice(0, 10),
        completed: !!l.completed,
        created_at: l.created_at ?? null,
      }))

      setHabitLogs(normalized)
    } catch (e) {
      console.error("local toggle fallback error", e)
    }
  }

  const isHabitCompleted = (habitId: string) => {
    const dblog = habitLogs.find((log) => log.habit_id === habitId && log.date === todayISO)

    if (dblog) return !!dblog.completed

    try {
      const saved = JSON.parse(localStorage.getItem("habit-logs") || "[]")

      const legacy = saved.find(
        (l: any) =>
          (l.habitId === habitId || l.habit_id === habitId) &&
          l.date === new Date(l.toDateString() || l.date === todayISO),
      )
      return !!legacy?.completed
    } catch {
      return false
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (userId) {
      try {
        const { error: deleteHabitErr } = await supabase.from("habits").delete().eq("id", habitId).eq("user_id", userId)
        if (deleteHabitErr) console.error("delete habit err", deleteHabitErr)

        const { error: delLogsErr } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("user_id", userId)

        if (delLogsErr) console.error("delete logs err", delLogsErr)

        const updatedHabits = habits.filter((h) => h.id !== habitId)
        const updatedLogs = habitLogs.filter((l) => l.habit_id !== habitId)

        setHabitLogs(updatedLogs)
        setHabits(updatedHabits)
        try {
          localStorage.setItem("habits", JSON.stringify(updatedHabits))
          localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
        } catch (err) {}
      } catch (err) {
        console.error("deleteHabit unexpected", err)
      }
    } else {
      try {
        const savedHabits = JSON.parse(localStorage.getItem("habits") || "[]")
        const nextHabits = savedHabits.filter((h: any) => h.id !== habitId)

        localStorage.setItem("habits", JSON.stringify(nextHabits))

        setHabits(nextHabits)

        const savedLogs = JSON.parse(localStorage.getItem("habit-logs") || "[]")
        const nextLogs = savedLogs.filter((h: any) => h.habitId !== habitId && h.habit_id !== habitId)
        localStorage.setItem("habit-logs", JSON.stringify(nextLogs))

        setHabitLogs(nextLogs)
      } catch (err) {
        console.error("delete local habit err", err)
      }
    }
  }

  const handleGoalSave = async () => {
    const newGoal = Number.parseInt(tempGoal)

    if (newGoal > 0) {
      setDailyGoal(newGoal)

      localStorage.setItem("daily-calorie-goal", newGoal.toString())

      if (user) {
        await supabase.from("user_goals").insert({
          user_id: userId,
          daily_goal: newGoal,
          effective_from: new Date().toISOString().slice(0, 10),
        })
      }
    }
    setIsEditingGoal(false)
    setTempGoal("")
  }

  const startEditingGoal = () => {
    setTempGoal(dailyGoal.toString())
    setIsEditingGoal(true)
  }

  const handleCalorieCalculatorSave = (calories: number) => {
    setDailyGoal(calories)
    localStorage.setItem("daily-calorie-goal", calories.toString())
  }

  

  const handleManageSubscription = () => {
  router.push("/pricestructure?upgrade=true")
}

  return (
    <div className="space-y-2 animate-slide-up px-1">
      <div className="text-start">
        <div className="flex items-center justify-between">
          <div className="leading-tight">
            {" "}
            {/* 👈 reduces vertical spacing */}
            <h1 className="text-lg font-bold text-foreground">Today</h1>
            <p className="text-xs text-muted-foreground -mt-1">
              {" "}
              {/* 👈 pulls date closer */}
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMeditationOpen(true)}
            className="w-8 h-8 p-0 rounded-full hover:bg-black hover:text-white"
            style={{ backgroundColor: "#c9fa5f" }}
          >
            <Brain className="h-4 w-4" style={{ color: "#000" }} />
          </Button>
        </div>
      </div>

      <Card className="p-1 pb-7">
        <div className="p-2 rounded-[5px] flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground mb-1">{totalCalories.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-medium">Eaten</div>
          </div>

          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#c9fa5f"
                strokeWidth="7"
                fill="none"
                strokeDasharray={`${(progressPercentage / 100) * 314.16} 314.16`}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold text-foreground">{remaining.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground font-medium">Remaining</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-foreground mb-1">{completedHabitsToday}</div>
            <div className="text-xs text-muted-foreground font-medium">Habits</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 p-2 bg-muted/30 rounded-[5px]">

  {/* Left Section */}
  <div className="flex items-center space-x-2">
    <Target className="h-4 w-4 text-[#c9fa5f]" />
    <span className="text-sm font-medium text-foreground">Daily Goal</span>
  </div>

  {/* Right Section */}
  {isEditingGoal ? (
    <div className="flex items-center space-x-1">

      <Input
        type="number"
        value={tempGoal}
        onChange={(e) => setTempGoal(e.target.value)}
        className="w-20 h-7 text-sm text-center font-semibold text-foreground flex items-center justify-center !py-0 mb-2"
        placeholder="2000"
      />

      <Button
        size="sm"
        onClick={handleGoalSave}
        className="h-6.5 px-3 text-xs rounded-[5px] flex items-center"
      >
        Save
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditingGoal(false)}
        className="h-6.5 px-3 text-xs rounded-[5px] flex items-center"
      >
        Cancel
      </Button>

    </div>
  ) : (
    <div className="flex items-center space-x-2">

      <span className="text-sm font-semibold text-foreground">{dailyGoal} cal</span>

      <Button
        size="sm"
        variant="ghost"
        onClick={startEditingGoal}
        className="h-7 w-7 p-0 flex items-center justify-center"
      >
        <Settings className="h-4 w-4 text-[#c9fa5f]" />
      </Button>

    </div>
  )}
</div>


        <div className="text-center py-2 bg-[#c9fa5f]/10 rounded-[5px] mb-4">
          <button
            onClick={() => setIsCalorieCalculatorOpen(true)}
            className="text-xs text-primary hover:text-primary/80"
          >
            Check your daily calorie goal!
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground font-medium">Carbs</span>
            <span className="text-xs text-foreground font-semibold">
              {totalCarbs} / {Math.round((dailyGoal * 0.5) / 4)} g
            </span>
          </div>
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min((totalCarbs / ((dailyGoal * 0.5) / 4)) * 100, 100)}%`,
                backgroundColor: "#c9fa5f",
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground font-medium">Protein</span>
            <span className="text-xs text-foreground font-semibold">
              {totalProtein} / {Math.round((dailyGoal * 0.25) / 4)} g
            </span>
          </div>
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min((totalProtein / ((dailyGoal * 0.25) / 4)) * 100, 100)}%`,
                backgroundColor: "#c9fa5f",
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground font-medium">Fat</span>
            <span className="text-xs text-foreground font-semibold">
              {totalFat} / {Math.round((dailyGoal * 0.25) / 9)} g
            </span>
          </div>
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min((totalFat / ((dailyGoal * 0.25) / 9)) * 100, 100)}%`,
                backgroundColor: "#c9fa5f",
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-3 shadow-sm border-0 rounded-[5px] bg-card mb-12">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle2 className="h-4 w-3.7 text-primary" />
            <h3 className="text-md text-foreground mt-4">Daily Habits</h3>
          </div>
          <Badge
            variant="secondary"
            className="text-xs px-2 bg-transparent py-0.5 text-primary border-primary/20 rounded-[5px]"
          >
            {completedHabitsToday}/{totalHabitsToday} completed
          </Badge>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Habits</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Build better habits by tracking daily activities like workouts, reading, or meditation.
            </p>
            <Button
              onClick={() => setIsAddingHabit(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-[5px] font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {habits.map((habit) => {
              const Icon = getHabitIcon(habit.icon ?? "dumbbell")
              const completed = isHabitCompleted(habit.id)

              return (
                <div key={habit.id} className="relative group">
                  <Card
                    className={`p-2 cursor-pointer transition-all duration-300 border-0 rounded-sm ${
                      completed ? "bg-[#c9fa5f] text-black" 
        : "bg-muted/30 hover:bg-muted/50 text-foreground"

                    }`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          completed ? "bg-black/20 text-black" 
            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-xs font-medium text-center ${completed ? "text-black" : ""} leading-tight`}>
                        {habit.name}
                      </span>
                      <div className="flex items-center justify-center">
                        {completed ? (
                          <CheckCircle2 className="h-3 w-3 text-black" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </Card>
                  {!habit.id.startsWith("builtin-") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-1 -right-1 w-4 h-4 p-0 rounded-full
        opacity-0 group-hover:opacity-100 transition-opacity
        bg-black/20 hover:bg-black/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteHabit(habit.id)
                      }}
                    >
                      <X className="h-2 w-2 text-white" />
                    </Button>
                  )}
                </div>
              )
            })}

            <Card
              className="p-2 cursor-pointer transition-all duration-300 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-lg bg-muted/20 hover:bg-muted/30"
              onClick={() => setIsAddingHabit(true)}
            >
              <div className="flex flex-col items-center justify-center space-y-1 h-full min-h-[60px]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-center text-muted-foreground">Add Habit</span>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {isAddingHabit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Add New Habit</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingHabit(false)} className="mb-4">
                <X className="w-2 h-2 mr-1" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Enter habit name (e.g., Workout, Made bed, Read book)"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
                className="text-sm"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  className="p-0 px-6 rounded-[5px] bg-transparent"
                  onClick={() => setIsAddingHabit(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addHabit} className="p-0 px-4 rounded-[5px]" disabled={!newHabitName.trim()}>
                  Add Habit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-2 dark:rounded-[5px]">
        {Object.entries(mealGroups).map(([mealType, foods]) => {
          const Icon = getMealIcon(mealType)
          const mealCalories = getMealCalories(mealType as keyof typeof mealGroups)
          const mealGoal = getMealGoal(mealType)

          return (
            <Card
              key={mealType}
              className="p-1 hover:shadow-md transition-all duration-300 border-0 rounded-[5px] bg-card"
            >
              {/* Make header clickable to open history */}
              <div
  className="
    flex items-center justify-between cursor-pointer py-1 px-2
    rounded-[5px]
    bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent
    backdrop-blur-sm
    transition-all
    hover:border-[#c9fa5f]/60 hover:shadow-lg
  "
  onClick={() => setHistoryFor(mealType as any)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && setHistoryFor(mealType as any)}
  aria-label={`Open ${mealType} history`}
>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
                    <Icon className="h-4 w-4 text-black" />
                  </div>
                  <div className="px-2 pt-2">
                    <h3 className="text-sm font-semibold text-foreground capitalize">{mealType}</h3>
                    <p className="text-xs text-muted-foreground">
                      {mealCalories} / {mealGoal} Cal
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation() // prevent opening history when pressing +
                    onAddFood?.(mealType as any)
                  }}
                  className="w-8 h-8 rounded-xl p-0 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {foods.length > 0 && (
                <div className="space-y-1">
                  {foods.map((food) => (
                    <div key={food.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-[5px]">
                      <span className="text-xs text-foreground font-medium">{food.name}</span>
                      <span className="text-xs text-muted-foreground font-semibold">{food.calories} cal</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Bottom sheet: meal history */}
      {historyFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold capitalize">{historyFor} history</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setHistoryFor(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {/* Group by date (most recent first) */}
              {(() => {
                const entries = loggedFoods
                  .filter((f) => f.mealType === historyFor)
                  .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))

                if (entries.length === 0) {
                  return (
                    <div className="py-10 text-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">No entries yet. Log a meal to see it here.</p>
                    </div>
                  )
                }

                const groups: Record<string, typeof entries> = {}
                for (const e of entries) {
                  const key = new Date(e.timestamp).toDateString()
                  groups[key] = groups[key] || []
                  groups[key].push(e)
                }

                return Object.entries(groups).map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <div className="text-xs text-muted-foreground font-medium mb-2">{date}</div>
                    <div className="space-y-2">
                      {items.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(f.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-foreground">{f.calories} cal</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </Card>
        </div>
      )}

      {todaysFoods.length > 0 && (
        <Card className="p-4 shadow-sm border-0 rounded-xl bg-card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">This Week</h3>
          </div>
          <div className="flex justify-between items-end space-x-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
              const maxCalories = Math.max(...weeklyConsumption, dailyGoal)
              const heightPercent = (weeklyConsumption[index] / maxCalories) * 100
              return (
                <div key={day} className="flex flex-col items-center space-y-2 flex-1">
                  <div
                    className="w-full rounded-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPercent, 8)}px`,
                      backgroundColor: "#c9fa5f",
                    }}
                    title={`${weeklyConsumption[index]} cal`}
                  />
                  <span className="text-xs text-muted-foreground font-medium">{day}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

              {/* After the main Card with progress circle */}
<PlantStreak 
  habitsCompleted={areHabitsComplete}
  caloriesOnTarget={isCaloriesOnTarget}
  totalHabits={totalHabitsToday}
  completedHabits={completedHabitsToday}
/>

{/* Psychology Dashboard Card */}
<Card className="p-4">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
        <Brain className="h-4 w-4 text-black" />
      </div>
      <div>
        <h3 className="text-md font-semibold text-foreground mt-2">Psychology Tools</h3>
        <p className="text-sm text-muted-foreground">Understand your patterns</p>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-2 rounded-[5px]">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowPsychologyInsights(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <BarChart3 className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Insights</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowBodyBattery(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <Battery className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Body Battery</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowPersonalityQuiz(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <Users className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Personality</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowWordCloud(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <Cloud className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Triggers</span>
    </Button>
  </div>

  <Button
    variant="ghost"
    size="sm"
    onClick={() => setShowConsistencyRadar(true)}
    className="w-full mt-2 text-xs hover:bg-[#c9fa5f]/10"
  >
    <TrendingUp className="h-3 w-3 mr-1" />
    View Consistency Radar
  </Button>
</Card>


{/* Mind Rewire Features */}
<Card className="p-4 mt-8 mb-8">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#c9fa5f] flex items-center justify-center">
        <GitBranch className="h-5 w-5 text-black" />
      </div>
      <div>
        <h3 className="text-md font-semibold text-foreground mt-2">Mind Rewire</h3>
        <p className="text-xs text-muted-foreground">Transform your mindset</p>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-2 mb-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowFutureSelfMirror(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <Target className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Future Self</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowCravingParasite(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <span className="text-lg">👹</span>
      <span className="text-xs">Parasite</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowShadowDay(true)}
      className="h-auto py-4 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <AlertTriangle className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Shadow Day</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowDisciplineDebt(true)}
      className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 rounded-[5px]"
    >
      <MinusCircle className="h-4 w-4 text-[#c9fa5f]" />
      <span className="text-xs">Debt</span>
    </Button>
  </div>

  <Button
    variant="ghost"
    size="sm"
    onClick={() => setShowPatternAnalytics(true)}
    className="w-full text-xs hover:bg-[#c9fa5f]/10"
  >
    <BarChart3 className="h-3 w-3 mr-1" />
    View Pattern Analytics
  </Button>
</Card>

{/* Micro Wins Tracker */}
<MicroWinsTracker />


      {habits.length > 0 && (
  <Card className="p-4 shadow-sm border-0 rounded-xl bg-card">
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-4 w-3.7 text-primary" />
            </div>
            <h3 className="mt-4 text-md text-foreground">Habits This Week</h3>
    </div>
    <div className="flex justify-between items-end space-x-2">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
        const maxHabits = Math.max(...weeklyHabitCount, totalHabitsToday, 1)
        const heightPercent = (weeklyHabitCount[index] / maxHabits) * 100
        const isToday = index === today.getDay() - 1
        return (
          <div key={day} className="flex flex-col items-center space-y-2 flex-1 group relative">
            <div
              className="w-full rounded-lg transition-all duration-500 relative"
              style={{
                height: `${Math.max(heightPercent * 0.8, 8)}px`,
                backgroundColor: "#c9fa5f",
                opacity: isToday ? 1 : 0.7,
              }}
            >
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#c9fa5f]/30">
                {weeklyHabitCount[index]} habit{weeklyHabitCount[index] !== 1 ? 's' : ''}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
              </div>
            </div>
            <span className={`text-xs font-medium ${isToday ? 'text-[#c9fa5f]' : 'text-muted-foreground'}`}>
              {day}
            </span>
          </div>
        )
      })}
    </div>
    <div className="mt-1 pt-3 border-t border-border/50 flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Weekly Average</span>
      <span className="text-sm font-semibold text-foreground">
        {(weeklyHabitCount.reduce((a, b) => a + b, 0) / 7).toFixed(1)} habits/day
      </span>
    </div>
  </Card>
)}

      
      {loggedFoods.length > 0 && (
  <Card className="p-4 mb-4 shadow-sm border-0 rounded-xl bg-card">
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-3.7 text-primary" />
            </div>
            <h3 className="mt-4 text-md text-foreground">Calories This Week</h3>
    </div>
    <div className="flex justify-between items-end space-x-2">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
        const maxCalories = Math.max(...weeklyConsumption, dailyGoal, 1)
        const heightPercent = (weeklyConsumption[index] / maxCalories) * 100
        const isToday = index === today.getDay() - 1
        return (
          <div key={day} className="flex flex-col items-center space-y-2 flex-1 group relative">
            <div
              className="w-full rounded-lg transition-all duration-500 relative"
              style={{
                height: `${Math.max(heightPercent * 0.8, 8)}px`,
                backgroundColor: "#c9fa5f",
                opacity: isToday ? 1 : 0.7,
              }}
            >
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#c9fa5f]/30 z-10">
                {weeklyConsumption[index].toLocaleString()} cal
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
              </div>
            </div>
            <span className={`text-xs font-medium ${isToday ? 'text-[#c9fa5f]' : 'text-muted-foreground'}`}>
              {day}
            </span>
          </div>
        )
      })}
    </div>
    <div className="mt-1 pt-3 border-t border-border/50 flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Weekly Average</span>
      <span className="text-sm font-bold text-foreground">
        {Math.round(weeklyConsumption.reduce((a, b) => a + b, 0) / 7).toLocaleString()} cal/day
      </span>
    </div>
  </Card>
)}
      <InsightsTracker loggedFoods={loggedFoods} dailyGoal={dailyGoal} />



      {(todaysFoods.length > 0 || habits.length > 0) && (
        <div className="flex flex-col sm:flex-row justify-center gap-2 px-2">
          {todaysFoods.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm px-3 py-2 bg-primary/10 text-primary font-semibold rounded-[5px] text-center"
            >
              <Apple className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">
                Nutrition:{" "}
                {totalCalories < dailyGoal * 0.8
                  ? "Below Target"
                  : totalCalories > dailyGoal * 1.2
                    ? "Above Target"
                    : "On Target"}
              </span>
            </Badge>
          )}
          {habits.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm px-3 py-2 bg-primary/10 text-primary font-semibold rounded-[5px] text-center"
            >
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">
                Habits: {Math.round((completedHabitsToday / totalHabitsToday) * 100)}% Complete
              </span>
            </Badge>
          )}
        </div>
      )}

      <div className="mt-8 border-t border-border/50 pt-4 pb-20 text-center">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your plan...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mt-8">
              {plan?.plan_name === "Pro Plan" ? (
                <>
                  You’re on the <span className="font-semibold text-primary">Pro Plan</span>.
                </>
              ) : (
                <>
                  You’re on the Free Plan. <br />
                  You have 1 trial for all service.
                </>
              )}
            </p>

            <div className="flex justify-center gap-3 mt-3">
              {plan?.plan_name === "Free" ? (
                <Button onClick={handleManageSubscription} className="rounded-[5px] h-9 text-sm">
                  Upgrade Subscription
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/manage-subscription")}
                  className="bg-white text-black rounded-[5px] h-9 text-sm"
                >
                  Manage Subscription
                </Button>
              )}
            </div>

            {plan?.valid_till && (
              <p className="text-xs text-muted-foreground mt-2">
                Valid till: {new Date(plan.valid_till).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </div>

      <MeditationTimer isOpen={isMeditationOpen} onClose={() => setIsMeditationOpen(false)} />
      <CalorieCalculatorModal
        isOpen={isCalorieCalculatorOpen}
        onClose={() => setIsCalorieCalculatorOpen(false)}
        onSave={handleCalorieCalculatorSave}
      />

      {/* Floating Action Buttons */}
<div className="fixed bottom-24 right-4 flex flex-col gap-3 z-40">
  <Button
    onClick={() => setShowHungerCheck(true)}
    className="w-10 h-10 rounded-full bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-lg"
    title="Am I Hungry?"
  >
    <HelpCircle className="h-8 w-8" />
  </Button>
  <Button
    onClick={() => setShowCravingTracker(true)}
    className="w-10 h-10 rounded-full bg-card border-2 border-[#c9fa5f]/30 hover:bg-muted shadow-lg"
    title="Log Craving"
  >
    <Cookie className="h-8 w-8 text-[#c9fa5f]" />
  </Button>
</div>

{/* Modals */}
<MoodPicker
  isOpen={showMoodPicker}
  onClose={() => setShowMoodPicker(false)}
  onSelect={async (mood) => {
    if (userId && lastFoodLogId) {
      await supabase.from("mood_logs").insert({
        user_id: userId,
        food_log_id: lastFoodLogId,
        mood,
      })
    }
  }}
/>
<CravingTracker isOpen={showCravingTracker} onClose={() => setShowCravingTracker(false)} />
<HungerCheck isOpen={showHungerCheck} onClose={() => setShowHungerCheck(false)} />


  <PsychologyInsights 
  isOpen={showPsychologyInsights} 
  onClose={() => setShowPsychologyInsights(false)} 
/>
<BodyBattery 
  isOpen={showBodyBattery} 
  onClose={() => setShowBodyBattery(false)} 
/>
<NutritionPersonalityQuiz 
  isOpen={showPersonalityQuiz} 
  onClose={() => setShowPersonalityQuiz(false)} 
/>
<WordCloud 
  isOpen={showWordCloud} 
  onClose={() => setShowWordCloud(false)} 
/>
<FoodConsistencyRadar 
  isOpen={showConsistencyRadar} 
  onClose={() => setShowConsistencyRadar(false)} 
/>


<FutureSelfMirror 
  isOpen={showFutureSelfMirror} 
  onClose={() => setShowFutureSelfMirror(false)} 
/>
<CravingParasite 
  isOpen={showCravingParasite} 
  onClose={() => setShowCravingParasite(false)} 
/>
<ShadowDay 
  isOpen={showShadowDay} 
  onClose={() => setShowShadowDay(false)} 
/>
<DisciplineDebt 
  isOpen={showDisciplineDebt} 
  onClose={() => setShowDisciplineDebt(false)} 
/>
<PatternAnalytics 
  isOpen={showPatternAnalytics} 
  onClose={() => setShowPatternAnalytics(false)} 
/>
<MicroChoiceFork 
  isOpen={showMicroChoiceFork}
  onClose={() => setShowMicroChoiceFork(false)}
  foodItem={choiceForkFood || { name: '', calories: 0 }}
  onChoice={(choice) => {
    if (choice === 'shift') {
      addMicroWin('healthy_choice', 'Chose healthier option!')
    }
  }}
/>
    </div>
  )
}
