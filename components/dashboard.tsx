"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MeditationTimer } from "@/components/meditation-timer"
import CalorieCalculatorModal from "./calorie-calculator-modal"
import { DailyQuoteModal } from "@/components/daily-quote-modal"
import { UserProfile } from "@/components/user-profile"
import { Plus, Coffee, Utensils, Cookie, Target, TrendingUp, Apple, Settings, CheckCircle2, Circle, Dumbbell, Bed, Clock, Heart, X, Brain, Droplets, BookOpen, Smile, Sun, Battery, Cloud, AlertTriangle, MinusCircle, Pencil, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react'
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
import { SubscriptionExpiryWarning } from "@/components/subscription-expiry-warning"
// import { AddToHomeScreen } from "./add-to-home-screen"
// import { EmotionalWordCloud } from "@/components/emotional-word-cloud"
// import { TriggerHeatmap } from "@/components/trigger-heatmap"
// import { CravingPatternAnalyzer } from "@/components/craving-pattern-analyzer"
// import { WeeklySummaryCard } from "@/components/weekly-summary-card"

type ActivePage =
  | "landing"
  | "home"
  | "dashboard"
  | "meal-planner"
  | "profile"
  | "quick-meals"
  | "todos"
  | "journal"

interface LoggedFood {
  id: string
  food_name?: string
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
  const [nutrientInputMode, setNutrientInputMode] = useState<{
  mealType: "breakfast" | "lunch" | "dinner" | "snacks" | null;
  isOpen: boolean;
}>({ mealType: null, isOpen: false })
const [nutrientValues, setNutrientValues] = useState({
  protein: "",
  carbs: "",
  fat: "",
})

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
const [expandedMeals, setExpandedMeals] = useState<{[key: string]: boolean}>({
  breakfast: false,
  lunch: false,
  dinner: false,
  snacks: false
})
const [choiceForkFood, setChoiceForkFood] = useState<any>(null)

// const [showEmotionalWordCloud, setShowEmotionalWordCloud] = useState(false)

// const [showTriggerHeatmap, setShowTriggerHeatmap] = useState(false)
// const [showCravingAnalyzer, setShowCravingAnalyzer] = useState(false)

const [activePage, setActivePage] = useState<ActivePage>("landing")
const [activeStatView, setActiveStatView] = useState<'calories' | 'habits'>('calories')

const [sleepHours, setSleepHours] = useState<null | number>(null);
const [glasses, setGlasses] = useState<null | number>(null);

const [weeklyHabitData, setWeeklyHabitData] = useState<{
  date: string
  completed: number
  total: number
  percentage: number
}[]>([])

const [monthlyHabitData, setMonthlyHabitData] = useState<{
  date: string
  completed: number
  total: number
  percentage: number
}[]>([])


  const router = useRouter()
  const { user, userId, loading } = useUser()
  const { hasSubscription, plan } = useSubscription()

  
   const checkGlasses = async () => {
  if(!userId) return;

  const supabase = createClient();
  try {
    const {data, error} = await supabase.from('hydration_logs').select('*')
    .eq('user_id', userId)
    

    if (error) {
      console.error('Error fetching sleep logs:', error)
    } else {
      setGlasses(data && data.length > 0 ? data[0].glasses : null)
    }

  } catch (error) {
    console.error('Error fetching sleep logs:', error)
  }
}

  const checkSleepHours = async () => {
  if(!userId) return;

  const supabase = createClient();
  try {
    const {data, error} = await supabase.from('sleep_logs').select('*')
    .eq('user_id', userId)
    

    if (error) {
      console.error('Error fetching sleep logs:', error)
    } else {
      setSleepHours(data && data.length > 0 ? data[0].hours : null)
    }

  } catch (error) {
    console.error('Error fetching sleep logs:', error)
  }
}

  
// useEffect(() => {
//   // Prevent back button after entering dashboard with active plan
//   if (hasSubscription) {
//     window.history.pushState(null, '', window.location.href);
//     window.onpopstate = function () {
//       window.history.pushState(null, '', window.location.href);
//     };
//   }

//   return () => {
//     window.onpopstate = null;
//   };
// }, [hasSubscription]);

  


  const addMicroWin = async (type: string, description: string) => {
  if (!userId) return
  const supabase = createClient()
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
  const supabase = createClient()
  
  try {
    // Get active identity
  const { data: identity, error: identityError } = await supabase
  .from('user_identities_future')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true)
  .maybeSingle()

if (!identity || identityError) return

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
  const supabase = createClient()
  
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
  const supabase = createClient()

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
     let isMounted = true;
    const supabase = createClient()

    const fetchData = async () => {
      if (!isMounted) return;
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
    checkSleepHours();
    checkGlasses();
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
      let isMounted = true;
  const fetchFoodLogs = async () => {
    if (!userId) return
    if (!isMounted) return;
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("food_logs")
        .select("id, meal_type, food_name, calories, protein, carbs, fat, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching food logs:", error)
        return
      }

      if (data) {
        const formatted = data.map((item) => ({
          id: item.id,
          food_name: item.food_name,
          name: item.food_name || `${item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1)} meal`,
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
      let isMounted = true;

    const supabase = createClient()
    const fetchGoal = async () => {
      if (!isMounted) return;
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


  // Add this useEffect AFTER your existing habit data calculations (around line 450):

useEffect(() => {
  if (habits.length === 0) return

  // Calculate Weekly Habit Data
  const weeklyData = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateString = date.toISOString().slice(0, 10)
    
    const dayLogs = habitLogs.filter(log => log.date === dateString)
    const completed = dayLogs.filter(log => log.completed).length
    const total = habits.length
    
    weeklyData.push({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    })
  }
  setWeeklyHabitData(weeklyData)

  // Calculate Monthly Habit Data
  const monthlyData = []
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i)
    const dateString = date.toISOString().slice(0, 10)
    
    const dayLogs = habitLogs.filter(log => log.date === dateString)
    const completed = dayLogs.filter(log => log.completed).length
    const total = habits.length
    
    monthlyData.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    })
  }
  setMonthlyHabitData(monthlyData)
}, [habits, habitLogs])



const deleteFood = async (foodId: string) => {
  if (!userId) return
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("id", foodId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error deleting food:", error)
      return
    }

    // Update local state
    setLoggedFoods(loggedFoods.filter(food => food.id !== foodId))
  } catch (err) {
    console.error("Error deleting food:", err)
  }
}



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
    const supabase = createClient()

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
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()

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

  const handleNutrientLog = async () => {
  if (!nutrientInputMode.mealType || !userId) return
  
  const protein = Number(nutrientValues.protein) || 0
  const carbs = Number(nutrientValues.carbs) || 0
  const fat = Number(nutrientValues.fat) || 0
  
  // Calculate calories: Protein=4cal/g, Carbs=4cal/g, Fat=9cal/g
  const calories = (protein * 4) + (carbs * 4) + (fat * 9)
  
  if (calories === 0) return
  
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.from("food_logs").insert({
      user_id: userId,
      meal_type: nutrientInputMode.mealType,
      calories,
      protein,
      carbs,
      fat,
    }).select().single()
    
    if (!error && data) {
      const newFood: LoggedFood = {
        id: data.id,
        name: `${nutrientInputMode.mealType.charAt(0).toUpperCase() + nutrientInputMode.mealType.slice(1)} nutrients`,
        calories,
        protein,
        carbs,
        fat,
        mealType: nutrientInputMode.mealType,
        timestamp: new Date(),
      }
      
      setLoggedFoods([newFood, ...loggedFoods])
      
      // Trigger micro-win checks
      await updateIdentityAlignment(data.id, calories)
      await feedParasite(newFood.name, calories)
    }
  } catch (err) {
    console.error("Error logging nutrients:", err)
  }
  
  // Reset
  setNutrientValues({ protein: "", carbs: "", fat: "" })
  setNutrientInputMode({ mealType: null, isOpen: false })
}

  

  const handleManageSubscription = () => {
  if (plan?.plan_name === "Free") {
    router.push("/pricestructure?upgrade=true");
  } else {
    router.push("/manage-subscription");
  }
};

const handleNavigation = (page: ActivePage) => {
  if (page === "profile") {
    router.push(`/${userId}/profile`)
  } else {
    setActivePage(page)
  }
}


  return (
    <div className="space-y-2 animate-slide-up px-1">
       <SubscriptionExpiryWarning 
      validTill={plan?.valid_till || null} 
      planName={plan?.plan_name || "Free"} 
    />

     <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#c9fa5f]/5 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-[#c9fa5f]/5 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
  </div>

<div className="flex items-center justify-between mb-6 px-3 mt-14 bg-[#161616] rounded-sm">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9fa5f] to-[#b8e954] flex items-center justify-center shadow-lg" onClick={() => handleNavigation("profile")}>
      <span className="text-lg font-bold text-black">
        {user?.user_metadata?.name?.charAt(0) || "U"}
      </span>
    </div>
    <div className="leading-tight">
      <h1 className="text-lg font-bold text-foreground mt-4">
        Hello, {user?.user_metadata?.name || "User"}
      </h1>
      <p className="text-xs text-muted-foreground">
        Today {today.toLocaleDateString("en-US", { day: "numeric", month: "short" })}
      </p>
    </div>
  </div>



  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsMeditationOpen(true)}
      className="w-12 h-12 p-0 rounded-full hover:bg-[#c9fa5f]/10"
    >
      <Brain className="h-12 w-12 text-[#c9fa5f]" />
    </Button>
    {/* <Button
      variant="ghost"
      size="sm"
      className="w-10 h-10 p-0 rounded-full hover:bg-[#c9fa5f]/10"
    >
      <Settings className="h-5 w-5 text-muted-foreground" />
    </Button> */}
  </div>
</div>

      <Card className="p-1 pb-7">

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9fa5f]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  </div>
        <div className="p-2 rounded-[5px] flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground mb-1">{totalCalories.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-medium">Eaten</div>
          </div>
{/* #373837 */}
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#292b29"
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

<div className="grid grid-cols-2 gap-3 mb-4">
  {/* Calories Card */}
<Card className="p-3 bg-[#161616] rounded-sm">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 flex items-center justify-center">
      <Apple className="h-5 w-5 text-[#c9fa5f]" />
    </div>
  </div>

  <div className="text-2xl font-bold text-white">
    {totalCalories}
  </div>

  <div className="text-xs text-gray-400 font-medium mb-0">
    Calories Consumed
  </div>

  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">
      Goal: {dailyGoal}
    </span>
    <span className="text-xs font-semibold text-white">
      {Math.round(progressPercentage)}%
    </span>
  </div>
</Card>


  {/* Habits Card */}
  <Card className="p-3 bg-[#161616] rounded-sm border border-gray-800">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 flex items-center justify-center">
        <Target className="h-5 w-5 text-[#c9fa5f]" />
      </div>
    </div>
    <div className="text-2xl font-bold text-white">
      {completedHabitsToday}
    </div>
    <div className="text-xs text-gray-400 font-medium mb-0">Habits Completed</div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Goal: {totalHabitsToday}</span>
      <span className="text-xs font-semibold text-white">
        {totalHabitsToday > 0 ? Math.round((completedHabitsToday / totalHabitsToday) * 100) : 0}%
      </span>
    </div>
  </Card>

  {/* Sleep Card */}
  <Card className="p-3 bg-[#161616] rounded-sm border border-gray-800">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 flex items-center justify-center">
        <Bed className="h-5 w-5 text-[#c9fa5f]" />
      </div>
    </div>
    <div className="text-2xl font-bold text-white">
      {sleepHours || "Not Set"}
    </div>
    <div className="text-xs text-gray-400 font-medium">Sleep Hours</div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Goal: 7-8h</span>
      <span className="text-xs font-semibold text-white">94%</span>
    </div>
  </Card>

  {/* Water Card */}
  <Card className="p-3 bg-[#161616] rounded-sm border border-gray-800">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 flex items-center justify-center">
        <Droplets className="h-5 w-5 text-[#c9fa5f]" />
      </div>
    </div>
    <div className="text-2xl font-bold text-white">
      {glasses || "Not Set"}
    </div>
    <div className="text-xs text-gray-400 font-medium">Water Glasses</div>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Goal: 8</span>
      <span className="text-xs font-semibold text-white">38%</span>
    </div>
  </Card>
</div>


<div className="space-y-3 mb-4">
  <div className="flex items-center justify-between px-1 mb-3">
    <h3 className="text-base font-bold text-foreground">Daily Food</h3>
  </div>

  {Object.entries(mealGroups).map(([mealType, foods]) => {
    const Icon = getMealIcon(mealType)
    const mealCalories = getMealCalories(mealType as keyof typeof mealGroups)
    const mealGoal = getMealGoal(mealType)
    const progress = mealGoal > 0 ? (mealCalories / mealGoal) * 100 : 0
    const isExpanded = expandedMeals[mealType]

    return (
      <Card
        key={mealType}
        className="border-0 rounded-sm bg-[#161616] overflow-hidden transition-all duration-300"
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
                <Icon className="h-4 w-4 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground capitalize">
                    {mealType}
                  </h4>
                  {foods.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {foods.length} {foods.length === 1 ? 'item' : 'items'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mealCalories} / {mealGoal} cal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setNutrientInputMode({ mealType: mealType as any, isOpen: true })
                }}
                className="h-9 w-9 rounded-full hover:bg-muted"
                title="Add nutrients manually"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddFood?.(mealType as any)
                }}
                className="h-9 w-9 rounded-full bg-[#c9fa5f] hover:bg-[#c9fa5f]/90"
                title="Add food"
              >
                <Plus className="h-4 w-4 text-black" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="h-2 bg-black rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c9fa5f] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Food Items - Collapsible */}
        {foods.length > 0 && (
          <>
            <button
              onClick={() => setExpandedMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }))}
              className="w-full px-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {isExpanded ? 'Hide' : 'View'} items
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className="group flex items-center justify-between p-3 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#c9fa5f] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {food.food_name || food.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            P: {food.protein}g
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            C: {food.carbs}g
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            F: {food.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {food.calories} cal
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFood(food.id)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {foods.length === 0 && (
          <div className="px-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground">No items logged yet</p>
          </div>
        )}
      </Card>
    )
  })}
</div>


        <div className="text-center py-2 bg-[#161616] rounded-sm mb-4">
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

      {/* Nutrient Input Modal */}
{nutrientInputMode.isOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 mb-16">
    <Card className="w-full max-w-md bg-card rounded-t-[5px] sm:rounded-[5px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold capitalize">
          Add {nutrientInputMode.mealType} Nutrients
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            setNutrientInputMode({ mealType: null, isOpen: false })
            setNutrientValues({ protein: "", carbs: "", fat: "" })
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Protein (g)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={nutrientValues.protein}
            onChange={(e) => setNutrientValues({ ...nutrientValues, protein: e.target.value })}
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Carbs (g)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={nutrientValues.carbs}
            onChange={(e) => setNutrientValues({ ...nutrientValues, carbs: e.target.value })}
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Fat (g)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={nutrientValues.fat}
            onChange={(e) => setNutrientValues({ ...nutrientValues, fat: e.target.value })}
            className="text-sm"
          />
        </div>

        {(nutrientValues.protein || nutrientValues.carbs || nutrientValues.fat) && (
          <div className="p-3 bg-muted/30 rounded-[5px]">
            <p className="text-xs text-muted-foreground mb-1">Estimated Calories</p>
            <p className="text-lg font-bold text-foreground">
              {(Number(nutrientValues.protein || 0) * 4 + 
                Number(nutrientValues.carbs || 0) * 4 + 
                Number(nutrientValues.fat || 0) * 9).toFixed(0)} cal
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-[5px]"
            onClick={() => {
              setNutrientInputMode({ mealType: null, isOpen: false })
              setNutrientValues({ protein: "", carbs: "", fat: "" })
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-[5px]"
            onClick={handleNutrientLog}
            disabled={!nutrientValues.protein && !nutrientValues.carbs && !nutrientValues.fat}
          >
            Log Nutrients
          </Button>
        </div>
      </div>
    </Card>
  </div>
)}


<Card className="mx-1.5 mb-4 border-0 rounded-sm bg-card">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-base font-bold text-foreground">My Statistics</h3>
      <p className="text-xs text-muted-foreground">Weekly overview</p>
    </div>
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={activeStatView === 'calories' ? 'default' : 'outline'}
        onClick={() => setActiveStatView('calories')}
        className="h-7 text-xs rounded-full px-3"
      >
        <Apple className="h-3 w-3 mr-1" />
        Calories
      </Button>
      <Button
        size="sm"
        variant={activeStatView === 'habits' ? 'default' : 'outline'}
        onClick={() => setActiveStatView('habits')}
        className="h-7 text-xs rounded-full px-3"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Habits
      </Button>
    </div>
  </div>

  {/* Chart */}
  <div className="relative h-48">
    <div className="flex items-end justify-between h-full gap-2 px-2">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
        const data = activeStatView === 'calories' ? weeklyConsumption : weeklyHabitCount;
        const maxValue = activeStatView === 'calories' 
          ? Math.max(...weeklyConsumption, dailyGoal)
          : Math.max(...weeklyHabitCount, totalHabitsToday, 1);
        
        const heightPercent = (data[index] / maxValue) * 100;
        const isToday = index === new Date().getDay() - 1;
        
        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full">
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {activeStatView === 'calories' 
                  ? `${data[index]} cal` 
                  : `${data[index]} habits`}
              </div>
              
              {/* Bar */}
              <div 
                className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
                style={{
                  height: `${Math.max(heightPercent, 8)}px`,
                  backgroundColor: isToday ? '#c9fa5f' : '#c9fa5f',
                  opacity: isToday ? 1 : 0.4,
                }}
              >
                {isToday && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                )}
              </div>
            </div>
            
            {/* Day Label */}
            <span className={`text-[10px] font-medium ${
              isToday ? 'text-[#c9fa5f]' : 'text-muted-foreground'
            }`}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  </div>

  {/* Summary Stats */}
  <div className="mt-4 py-3 bg-[#161616] grid grid-cols-3 gap-3 rounded-sm">
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">Average</div>
      <div className="text-sm font-bold text-foreground">
        {activeStatView === 'calories'
          ? `${Math.round(weeklyConsumption.reduce((a, b) => a + b, 0) / 7)} cal`
          : `${(weeklyHabitCount.reduce((a, b) => a + b, 0) / 7).toFixed(1)} habits`}
      </div>
    </div>
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">Best Day</div>
      <div className="text-sm font-bold text-[#c9fa5f]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
          activeStatView === 'calories'
            ? weeklyConsumption.indexOf(Math.max(...weeklyConsumption))
            : weeklyHabitCount.indexOf(Math.max(...weeklyHabitCount))
        ]}
      </div>
    </div>
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">Streak</div>
      <div className="text-sm font-bold text-foreground">5 days</div>
    </div>
  </div>
</Card>


   <Card className="p-3 shadow-sm border-0 rounded-[5px] bg-card mb-12">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-base text-foreground mt-4">Daily Habits</h3>
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

      

      {todaysFoods.length > 0 && (
        <Card className="p-4 shadow-sm border-0 rounded-xl bg-card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mt-2">This Week</h3>
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


{/* Horizontal Scrollable Feature Cards */}
<div className="relative px-1 mt-3">
  <div className="flex gap-3 overflow-x-auto mb-1 snap-x snap-mandatory scrollbar-hide">

    
    {/* ===================== Psychology Tools Card ===================== */}
    <div
      onClick={() => router.push(`/${userId}/psychology-tools`)}
      className="min-w-[280px] snap-start cursor-pointer group"
    >
      <Card
  className="min-w-[280px] h-[360px] overflow-hidden rounded-2xl cursor-pointer bg-[#161616] transition p-0"
  onClick={() => router.push(`/${userId}/psychology-tools`)}
>
  {/* Image (Top Half) */}
  <div
    className="h-1/2 w-full bg-cover bg-center"
    style={{ backgroundImage: "url('/images/dashboard/psychology-tools.png')" }}
  />

  {/* Content (Bottom Half) */}
  <div className="h-1/2 p-5 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
        <Brain className="h-6 w-6 text-black" />
      </div>
      <ArrowUpRight className="h-5 w-5 text-gray-500" />
    </div>

    <div>
      <h4 className="text-base font-semibold text-foreground mb-1">
        Psychology Tools
      </h4>
      <p className="text-xs text-muted-foreground">
        Understand your patterns and behaviors
      </p>
    </div>
  </div>
</Card>

    </div>

    {/* ===================== Mind Rewire Card ===================== */}
    <div
      onClick={() => router.push(`/${userId}/mind-rewire`)}
      className="min-w-[280px] snap-start cursor-pointer group rounded-sm"
    >
      <Card
  className="min-w-[280px] h-[360px] overflow-hidden rounded-2xl cursor-pointer bg-[#161616] transition p-0"
  onClick={() => router.push(`/${userId}/mind-rewire`)}
>
  {/* Image (Top Half) */}
  <div
    className="h-1/2 w-full bg-cover bg-center"
    style={{ backgroundImage: "url('/images/dashboard/mind-rewire.png')" }}
  />

  {/* Content (Bottom Half) */}
  <div className="h-1/2 p-5 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
        <GitBranch className="h-6 w-6 text-black" />
      </div>
      <ArrowUpRight className="h-5 w-5 text-gray-500" />
    </div>

    <div>
      <h4 className="text-base font-semibold text-foreground mb-1">
        Mind Rewire
      </h4>
      <p className="text-xs text-muted-foreground">
        Transform your mindset with behavioral psychology
      </p>
    </div>
  </div>
</Card>

    </div>

    {/* Add more cards here */}
  </div>
</div>


{/* Add CSS for hiding scrollbar */}
<style jsx global>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>

{/* <WeeklySummaryCard /> */}

{/* Psychology Dashboard Card */}



{/* Mind Rewire Features */}
{/* <Card className="p-4 mt-8 mb-8">
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
</Card> */}

{/* Micro Wins Tracker */}
<MicroWinsTracker />


      {habits.length > 0 && (
  <Card className="p-4 shadow-sm border-0 rounded-xl bg-card">
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="mt-4 text-base text-foreground">Habits This Week</h3>
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
      <span className="text-xs text-muted-foreground">Weekly Average</span>
      <span className="text-xs font-semibold text-foreground">
        {(weeklyHabitCount.reduce((a, b) => a + b, 0) / 7).toFixed(1)} habits/day
      </span>
    </div>
  </Card>
)}

      
      {loggedFoods.length > 0 && (
  <Card className="p-4 mb-4 shadow-sm border-0 rounded-xl bg-card">
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="mt-4 text-base text-foreground">Calories This Week</h3>
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
      <span className="text-xs text-muted-foreground">Weekly Average</span>
      <span className="text-xs font-bold text-foreground">
        {Math.round(weeklyConsumption.reduce((a, b) => a + b, 0) / 7).toLocaleString()} cal/day
      </span>
    </div>
  </Card>
)}
      {/* // REPLACE the existing InsightsTracker component call (around line 1550) with: */}

<InsightsTracker 
  loggedFoods={loggedFoods} 
  dailyGoal={dailyGoal}
  habits={habits}
  habitLogs={habitLogs}
  weeklyHabitData={weeklyHabitData}
  monthlyHabitData={monthlyHabitData}
/>



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

      {/* Mind Rewire Panel */}
{/* Psychology Tools Panel */}


      <div className="mt-8 border-t border-border/50 pt-4 pb-20 text-center">
  {loading ? (
    <p className="text-sm text-muted-foreground">Loading your plan...</p>
  ) : (
    <>
      <p className="text-sm text-muted-foreground mt-8">
        {plan?.plan_name === "Pro Plan" ? (
          <>
            You're on the <span className="font-semibold text-[#c9fa5f]">Pro Plan</span>.
          </>
        ) : (
          <>
            You're on the Free Plan. <br />
            You have 1 trial for all services.
          </>
        )}
      </p>

      <div className="flex justify-center gap-3 mt-3">
        {plan?.plan_name === "Free" ? (
          <Button 
            onClick={() => router.push("/pricestructure?upgrade=true")} 
            className="rounded-[5px] h-9 text-sm"
          >
            Upgrade Subscription
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => router.push("/manage-subscription")}
            className="bg-white text-black rounded-[5px] h-9 text-sm"
          >
            Manage Subscription
          </Button>
        )}
      </div>

      {plan?.valid_till && plan?.plan_name !== "Free" && (
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
      const supabase = createClient()
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

{/* <EmotionalWordCloud
  isOpen={showEmotionalWordCloud}
  onClose={() => setShowEmotionalWordCloud(false)}
/> */}

{/* <TriggerHeatmap 
  isOpen={showTriggerHeatmap} 
  onClose={() => setShowTriggerHeatmap(false)} 
/>
<CravingPatternAnalyzer 
  isOpen={showCravingAnalyzer} 
  onClose={() => setShowCravingAnalyzer(false)} 
/> */}

  <DailyQuoteModal />

{/* <AddToHomeScreen /> */}
    </div>
  )
}
