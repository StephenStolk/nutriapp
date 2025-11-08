"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MeditationTimer } from "@/components/meditation-timer"
import CalorieCalculatorModal from "./calorie-calculator-modal"
import {
  Plus,
  Coffee,
  Utensils,
  Cookie,
  Target,
  TrendingUp,
  Apple,
  Settings,
  CheckCircle2,
  Circle,
  Dumbbell,
  Bed,
  Clock,
  Heart,
  X,
  Brain,
  Droplets,
  BookOpen,
  Smile,
  Sun,
} from "lucide-react"
import { useState, useEffect } from "react"
import { createContext, useContext
 } from "react"
import type { Session, User, SupabaseClient} from '@supabase/supabase-js';
import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { useSubscription } from "@/hooks/use-subscription"
import { useRouter } from "next/navigation"

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
  id: string;
  name: string;
  icon?: string;
  color?: string | null;
  // createdAt?: Date | string | null;
  created_at?: string | null;
}

interface HabitLog {
  id?: string;
  // habitId?: string;
  habit_id?: string;
  date: string;
  completed: boolean;
  created_at?: string | null;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  habits: Habit[];
  habitLogs: HabitLog[];
  fatchHabitsAndLogs: () => Promise<void>;
  addHabit: (payload: { name: string; icon?: string; color?: string}) => Promise<Habit | null>;
  deleteHabit: (habitId: string) => Promise<boolean>;
  syncLocalToDb: () => Promise<void>;
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
  const router = useRouter();
  const { user, userId, loading } = useUser();
  const { plan } = useSubscription();


  const supabase = createClient();
  useEffect(() => {
    if (!userId || loading) return;

    const fetchData = async () => {
      try {
        const { data: habitsData, error: habitsErr } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        const { data: logsData, error: logsErr } = await supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: true });

        if (habitsErr) {
          console.error("fetch habits error", habitsErr);
        } else if (habitsData) {
          setHabits(habitsData);

          try {
            localStorage.setItem("habits", JSON.stringify(habitsData));
          } catch {}

        }

        if (logsErr) {
          console.error("fetch logs error", logsErr);
        } else if (logsData) {
          
          const normalized = (logsData as HabitLog[]).map((l) => ({
            ...l,
            date: l.date && typeof l.date === "string" ? l.date : String(l.date),
          }));

          setHabitLogs(normalized);
          try {

            localStorage.setItem("habit-logs", JSON.stringify(normalized));
          } catch {}
        }
      } catch (err) {
        console.error("fetchData unexpected", err);
      }
    };

    fetchData();
  }, [userId, loading]);
  


  useEffect(() => {
    const saved = localStorage.getItem("logged-foods");

    if (saved) {
      try {
        const foods = JSON.parse(saved).map((food: any) => ({
          ...food,
          timestamp: new Date(food.timestamp),
        }));
        setLoggedFoods(foods);
      } catch {}
    }

    // const savedGoal = localStorage.getItem("daily-calorie-goal");
    // if (savedGoal) setDailyGoal(Number.parseInt(savedGoal));

    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      try {
        const habitsData = JSON.parse(savedHabits).map((habit: any) => ({
          ...habit,
         
          created_at: habit.created_at ?? habit.createdAt ?? null,
        }));
        setHabits(habitsData);
      } catch {}

    } else {
      const initialHabits = builtInHabits.map((habit, index) => ({
        id: `builtin-${index}`,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        created_at: new Date().toISOString(),
      }));

      setHabits(initialHabits);

      try {
        localStorage.setItem("habits", JSON.stringify(initialHabits));
      } catch {}
    }

     const savedHabitLogs = localStorage.getItem("habit-logs");
    if (savedHabitLogs) {
      try {
        
        const parsed = JSON.parse(savedHabitLogs) as any[];
        const normalized = parsed.map((l) => {
          
          const d = String(l.date || l.dateString || "");
          if (/\d{4}-\d{2}-\d{2}/.test(d)) {
            return { ...l, date: d };
          }
          const parsedDate = new Date(d);
          return { ...l, date: isNaN(parsedDate.getTime()) ? d : parsedDate.toISOString().slice(0, 10) };

        });
        setHabitLogs(normalized);

      } catch {}
    }
  
  }, []);

  useEffect(() => {
    if(!userId) return;
    const fetchGoal = async () => {
      
      const { data: goalRows, error} = await supabase.from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .order("effective_from", { ascending: false})
      .limit(1);

      if(error) {
        console.error("Error fetching goal:", error);
        return;
      }

      const currentGoal = goalRows?.[0]?.daily_goal ?? 2000;
      setDailyGoal(currentGoal);
    };
    
    fetchGoal();
  }, [userId]);

  const today = new Date()
  const todayString = today.toDateString();
  const todayISO = new Date().toISOString().slice(0, 10);

  const todaysFoods = loggedFoods.filter((food) => {

    const foodDate = new Date(food.timestamp)
    return foodDate.toDateString() === todayString
  })

  const todaysHabitLogs = habitLogs.filter((log) => log.date === todayISO);
  const completedHabitsToday = todaysHabitLogs.filter((log) => log.completed).length
  const totalHabitsToday = habits.length

  // Calculate totals
  const totalCalories = todaysFoods.reduce((sum, food) => sum + food.calories, 0)

  const totalProtein = todaysFoods.reduce((sum, food) => sum + food.protein, 0)

  const totalCarbs = todaysFoods.reduce((sum, food) => sum + food.carbs, 0)

  const totalFat = todaysFoods.reduce((sum, food) => sum + food.fat, 0)

  const remaining = Math.max(0, dailyGoal - totalCalories)
  const progressPercentage = Math.min((totalCalories / dailyGoal) * 100, 100)

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
    if(!userId || !newHabitName.trim()) return;
    
    const payload = {
      user_id: userId,
      name: newHabitName.trim(),
      icon: "dumbbell",
      color: "bg-primary",
    };

    try {
      const { data, error} = await supabase.from("habits").insert([payload]).select().single();

      if (error) {
        console.error("addHabit error", error);
        
        const newHabitLocal: Habit = {
          id: Date.now().toString(),
          name: newHabitName.trim(),
          icon: "dumbbell",
          color: "bg-primary",
          created_at: new Date().toISOString(),
        };

        const updatedHabitsLocal = [...habits, newHabitLocal];
        setHabits(updatedHabitsLocal);

        try {
          localStorage.setItem("habits", JSON.stringify(updatedHabitsLocal));

        } catch {}
      } else if (data) {
         const added: Habit = {
          id: (data as any).id,
          name: (data as any).name,
          icon: (data as any).icon,
          color: (data as any).color,
          created_at: (data as any).created_at,
        };

         const updatedHabits = [...habits.filter(h => !h.id.startsWith("builtin-")), added, ...habits.filter(h=>h.id.startsWith("builtin-"))];
          setHabits(updatedHabits);

           try {
          localStorage.setItem("habits", JSON.stringify(updatedHabits));
        } catch {}
      }
    } catch (err) {
      console.error("addHabit unexpected", err);
    } finally {
      setNewHabitName("");
      setIsAddingHabit(false);
    }
  }

 const toggleHabit = async (habitId: string) => {
  console.log("toggleHabit called for", { habitId, userId });
  const isLocalBuiltIn = typeof habitId === "string" && habitId.startsWith("builtin-");

  try {
    let dbHabitId = habitId;

    if (isLocalBuiltIn && userId) {
      let local = null;
      try {

        const raw = localStorage.getItem("habits");
        if (raw) {
          const arr = JSON.parse(raw);

          local = arr.find((h: any) => h.id === habitId);
        }
      } catch (e) { console.warn("couldn't read local habit", e); }

      const payloadHabit = {
        user_id: userId,
        name: local?.name ?? "Habit",
        icon: local?.icon ?? "dumbbell",
        color: local?.color ?? "bg-primary",
      };

      console.log("creating DB habit for builtin:", payloadHabit);

      const { data: created, error: createErr } = await supabase
        .from("habits")
        .insert([payloadHabit])
        .select()
        .single();

      console.log("create habit result:", { created, createErr });
      if (createErr) {
       
        return toggleHabitLocalFallback(habitId);
      }
      dbHabitId = (created as any).id;
      
      const updatedHabits = habits.map((h) =>
        h.id === habitId
          ? { id: dbHabitId, name: (created as any).name, icon: (created as any).icon, color: (created as any).color, created_at: (created as any).created_at }
          : h
      );

      setHabits(updatedHabits);

      try { localStorage.setItem("habits", JSON.stringify(updatedHabits)); } 
      catch {}
    }

   
    if (!userId) {
      console.log("no userId — using local fallback");
      return toggleHabitLocalFallback(habitId);
    }

    const theDate = todayISO;

 
    const { data: existingArr, error: selectErr } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_id", dbHabitId)
      .eq("date", theDate)
      .limit(1);

    console.log("select habit_log result:", { existingArr, selectErr });

    if (selectErr) {
      
      console.error("select habit_logs error", selectErr);
      return toggleHabitLocalFallback(habitId);
    }

    const existing = Array.isArray(existingArr) && existingArr.length ? (existingArr[0] as HabitLog) : null;

    if (existing && existing.id) {
     
      const { data: updatedData, error: updateErr } = await supabase
        .from("habit_logs")
        .update({ completed: !existing.completed })
        .eq("id", existing.id)
        .select()
        .single();

      console.log("update result:", { updatedData, updateErr });

      if (updateErr) {
        console.error("update habit_log err", updateErr);
        return;
      }

    
      const updatedLogs = habitLogs.map((l) => (l.id === existing.id ? (updatedData as any) : l));

      setHabitLogs(updatedLogs);
      try { localStorage.setItem("habit-logs", JSON.stringify(updatedLogs)); } 
      catch {}
      return;
    }


    const payload = {
      user_id: userId,
      habit_id: dbHabitId,
      date: theDate,
      completed: true,
    };

    const { data: authData } = await supabase.auth.getUser();
console.log("auth.uid() =", authData?.user?.id);
console.log("payload.user_id =", userId);


    console.log("inserting habit_log payload:", payload);
    const { data: inserted, error: insertErr } = await supabase
      .from("habit_logs")
      .insert([payload])
      .select()
     
      ;

    console.log("insert result:", { inserted, insertErr });

    if (insertErr) {
      
      console.warn("insertErr — trying upsert", insertErr);
      const { data: upserted, error: upsertErr } = await supabase
        .from("habit_logs")
        .upsert([payload])
        .select();

      console.log("upsert result:", { upserted, upsertErr });
      if (upsertErr) {
        console.error("upsert also failed", upsertErr);
        return;
      }
      
      const newLog = Array.isArray(upserted) ? upserted[0] : upserted;
      const updatedLogs = [...habitLogs, newLog as HabitLog];
      setHabitLogs(updatedLogs);
      try { localStorage.setItem("habit-logs", JSON.stringify(updatedLogs)); } catch {}
      return;
    }

 
    const newInserted = Array.isArray(inserted) ? inserted[0] : inserted;
    const newLog = newInserted as HabitLog;
    const updatedLogs = [...habitLogs, newLog];

    setHabitLogs(updatedLogs);
    try { localStorage.setItem("habit-logs", JSON.stringify(updatedLogs)); } 
    catch {}

  } catch (err) {
    console.error("toggleHabit unexpected", err);
 
    try { toggleHabitLocalFallback(habitId); } catch {}
  }
};

const toggleHabitLocalFallback = (habitId: string) => {
  try {
    const savedRaw = localStorage.getItem("habit-logs") || "[]";
    const saved = JSON.parse(savedRaw);
    const legacyDate = new Date().toDateString();

    const existing = saved.find((l: any) => l.habitId === habitId && l.date === legacyDate);

    let updated;
    if (existing) {
      updated = saved.map((l: any) => (l.habitId === habitId && l.date === legacyDate ? { ...l, completed: !l.completed } : l));
    } else {
      updated = [...saved, { habitId, date: legacyDate, completed: true }];
    }

    localStorage.setItem("habit-logs", JSON.stringify(updated));


    const normalized = updated.map((l: any) => ({
      id: l.id,
      habit_id: l.habitId ?? l.habit_id,
      date: typeof l.date === "string" && /\d{4}-\d{2}-\d{2}/.test(l.date) ? l.date : new Date(l.date).toISOString().slice(0, 10),
      completed: !!l.completed,
      created_at: l.created_at ?? null,
    }));

    setHabitLogs(normalized);
  } catch (e) {
    console.error("local toggle fallback error", e);
  }
};

  const isHabitCompleted = (habitId: string) => {
    const dblog = habitLogs.find((log) => log.habit_id === habitId && log.date === todayISO);

    if(dblog) return !!dblog.completed;

    try {
      const saved = JSON.parse(localStorage.getItem("habit-logs") || "[]");

      const legacy = saved.find((l: any) => (l.habitId === habitId || l.habit_id === habitId) && (l.date === new Date(l.toDateString() || l.date === todayISO)));
      return !!legacy?.completed;
    } catch {
      return false;
    }
  }

  const deleteHabit = async (habitId: string) => {
    if(userId) {
      try {

        const { error: deleteHabitErr} = await supabase.from("habits").delete().eq("id", habitId).eq("user_id", userId);
        if(deleteHabitErr) console.error("delete habit err", deleteHabitErr);

        const { error: delLogsErr} = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", userId);

        if(delLogsErr) console.error("delete logs err", delLogsErr);

        const updatedHabits = habits.filter((h) => h.id !== habitId);
        const updatedLogs = habitLogs.filter((l) => l.habit_id !== habitId);

        setHabitLogs(updatedLogs);
        setHabits(updatedHabits);
        try {
            localStorage.setItem("habits", JSON.stringify(updatedHabits));
          localStorage.setItem("habit-logs", JSON.stringify(updatedLogs));
        } catch(err) {

        }
      } catch (err) {
        console.error("deleteHabit unexpected", err);
      }
    } else {
      try {
        const savedHabits = JSON.parse(localStorage.getItem("habits") || "[]");
        const nextHabits = savedHabits.filter((h: any) => h.id !== habitId);

        localStorage.setItem("habits", JSON.stringify(nextHabits));

        setHabits(nextHabits);

        const savedLogs = JSON.parse(localStorage.getItem("habit-logs") || "[]");
        const nextLogs = savedLogs.filter((h: any) => h.habitId !== habitId && h.habit_id !== habitId);
        localStorage.setItem("habit-logs", JSON.stringify(nextLogs));

        setHabitLogs(nextLogs);
      } catch(err) {
        console.error("delete local habit err", err);
      }
    }
  }

  const handleGoalSave = async () => {
    const newGoal = Number.parseInt(tempGoal);

    if (newGoal > 0) {
      setDailyGoal(newGoal)

      localStorage.setItem("daily-calorie-goal", newGoal.toString());

      if(user) {
        await supabase.from("user_goals").insert({
          user_id: userId,
          daily_goal: newGoal,
          effective_from: new Date().toISOString().slice(0,10),
        });
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
    router.push('/pricestructure')
  }

  return (
    <div className="space-y-2 animate-slide-up">
      <div className="text-start">
  <div className="flex items-center justify-between">
    <div className="leading-tight"> {/* 👈 reduces vertical spacing */}
      <h1 className="text-lg font-bold text-foreground">Today</h1>
      <p className="text-xs text-muted-foreground -mt-1"> {/* 👈 pulls date closer */}
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
      className="w-8 h-8 p-0 rounded-full bg-gray-200 hover:bg-black hover:text-white text-purple-600"
    >
      <Brain className="h-4 w-4 text-black" />
    </Button>
  </div>
</div>


      <Card className="p-3 bg-card shadow-sm rounded-[5px] pb-7">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground mb-1">{totalCalories.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-medium">Eaten</div>
          </div>

          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="6"
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
          <div className="flex items-center space-x-2">
            <Target className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-foreground">Daily Goal</span>
          </div>
          {isEditingGoal ? (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-16 h-6 text-xs"
                placeholder="2000"
              />
              <Button size="sm" onClick={handleGoalSave} className="h-6 px-2 text-xs">
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingGoal(false)} className="h-6 px-2 text-xs">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-foreground">{dailyGoal} cal</span>
              <Button size="sm" variant="ghost" onClick={startEditingGoal} className="h-6 w-6 p-0">
                <Settings className="h-2.5 w-2.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="text-center py-2">
          <button
            onClick={() => setIsCalorieCalculatorOpen(true)}
            className="text-xs text-primary hover:text-primary/80 underline underline-offset-2"
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
              className="absolute top-0 left-0 h-full bg-chart-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min((totalCarbs / ((dailyGoal * 0.5) / 4)) * 100, 100)}%` }}
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
              className="absolute top-0 left-0 h-full bg-chart-4 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min((totalProtein / ((dailyGoal * 0.25) / 4)) * 100, 100)}%` }}
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
              className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min((totalFat / ((dailyGoal * 0.25) / 9)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-3 shadow-sm border-0 rounded-[5px] bg-card mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground mt-3">Daily Habits</h3>
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20 rounded-[5px]">
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
                    className={`p-2 cursor-pointer transition-all duration-300 border-0 rounded-lg ${
                      completed ? "bg-primary/10 border-primary/20" : "bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-center text-foreground leading-tight">
                        {habit.name}
                      </span>
                      <div className="flex items-center justify-center">
                        {completed ? (
                          <CheckCircle2 className="h-3 w-3 text-primary" />
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
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive/20 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteHabit(habit.id)
                      }}
                    >
                      <X className="h-2.5 w-2.5 text-destructive" />
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
                <Button variant="outline" className="p-0 px-6 rounded-[5px]" onClick={() => setIsAddingHabit(false)}>
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

      <div className="space-y-2 dark:border dark:border-white/30 dark:rounded-[5px]">
        {Object.entries(mealGroups).map(([mealType, foods]) => {
          const Icon = getMealIcon(mealType)
          const mealCalories = getMealCalories(mealType as keyof typeof mealGroups)
          const mealGoal = getMealGoal(mealType)

          return (
            <Card
              key={mealType}
              className="p-3 hover:shadow-md transition-all duration-300 border-0 rounded-[5px] bg-card"
            >
              {/* Make header clickable to open history */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setHistoryFor(mealType as any)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setHistoryFor(mealType as any)}
                aria-label={`Open ${mealType} history`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
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
                <div className="mt-3 space-y-1">
                  {foods.map((food) => (
                    <div key={food.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
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
              const isToday = index === today.getDay() - 1
              const height = isToday ? "h-12" : "h-6"
              const color = isToday ? "bg-primary" : "bg-muted"

              return (
                <div key={day} className="flex flex-col items-center space-y-2 flex-1">
                  <div className={`w-full ${height} rounded-lg ${color} transition-all duration-500`} />
                  <span className="text-xs text-muted-foreground font-medium">{day}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {(todaysFoods.length > 0 || habits.length > 0) && (
        <div className="flex flex-col sm:flex-row justify-center gap-2 px-2">
          {todaysFoods.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm px-3 py-2 bg-primary/10 text-primary border-primary/20 font-semibold rounded-xl text-center"
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
              className="text-xs sm:text-sm px-3 py-2 bg-primary/10 text-primary border-primary/20 font-semibold rounded-xl text-center"
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
            🌟 You’re on the <span className="font-semibold text-primary">Pro Plan</span>.
          </>
        ) : (
          <>
            You’re on the Free Plan. <br/>
            You have 1 trial for all service.
          </>
        )}
      </p>

      <div className="flex justify-center gap-3 mt-3">
        {plan?.plan_name === "Free" ? (
          <Button
            onClick={handleManageSubscription}
            className="rounded-none h-9 text-sm"
          >
            Upgrade Subscription
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => window.location.href = "/manage-subscription"}
            className="rounded-none h-9 text-sm"
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
    </div>
  )
}
