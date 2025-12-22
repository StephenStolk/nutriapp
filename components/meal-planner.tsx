"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// ADD these new imports after existing ones:
import { Award, TrendingUp, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "./ui/badge";
import {
  Target,
  TrendingDown,
  Dumbbell,
  Wind,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Salad,
  ChefHat,
  BookOpen,
  Flame,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useSubscription } from "@/hooks/use-subscription";

type IconProps = {
  className?: string;
};

const WeightLossIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className="w-5 h-5"
  >
    <path d="M12 3v18M21 12H3" />
  </svg>
);

const MuscleGainIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className="w-5 h-5"
  >
    <path d="M6 14V10m12 4V10M4 12h16" />
  </svg>
);

const ActiveLifestyleIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className="w-5 h-5"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const PollutionDefenseIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className="w-5 h-5"
  >
    <path d="M3 12h18M4 6h16M5 18h14" />
  </svg>
);

const HairLossIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className="w-5 h-5"
  >
    <path d="M12 2c4 2 6 6 6 10s-2 8-6 8-6-4-6-8 2-8 6-10z" />
  </svg>
);

const HairHealthIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className="w-5 h-5"
  >
    <path d="M12 2s4 4 4 10-2 10-4 10-4-4-4-10 4-10 4-10z" />
  </svg>
);

const PLANNER_CATEGORIES = [
  {
    id: "weight-loss",
    name: "Weight Loss",
    icon: WeightLossIcon,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    description: "Sustainable calorie deficit with balanced nutrition",
    image: "/images/meal-planner/weight-loss.png",
  },
  {
    id: "muscle-gain",
    name: "Muscle Gain",
    icon: MuscleGainIcon,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    description: "High-protein meals for muscle building",
    image: "/images/meal-planner/muscle-gain.png",
  },
  {
    id: "active-lifestyle",
    name: "Active Lifestyle",
    icon: ActiveLifestyleIcon,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    description: "Energy-optimized meals for active days",
    image: "/images/meal-planner/active-lifestyle.png",
  },
  {
    id: "pollution-defense",
    name: "Pollution Defense",
    icon: PollutionDefenseIcon,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    description: "Antioxidant-rich foods for urban living",
    image: "/images/meal-planner/pollution-defense.png",
  },
  {
    id: "hair-loss",
    name: "Hair Loss Prevention",
    icon: HairLossIcon,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    description: "Biotin & protein-rich meals for hair strength",
    image: "/images/meal-planner/hair-loss.png",
  },
  {
    id: "hair-health",
    name: "Hair Growth & Shine",
    icon: HairHealthIcon,
    gradient: "from-card to-card",
    borderColor: "border-[#c9fa5f]/20",
    description: "Nutrient-dense meals for healthy, shiny hair",
    image: "/images/meal-planner/hair-health.png",
  },
];

const QUESTIONS = [
  {
    id: "state",
    label: "Where are you located?",
    type: "input",
    icon: MapPin,
    placeholder: "e.g., Maharashtra, California",
    description: "Helps us suggest local, seasonal ingredients",
  },
  {
    id: "budget",
    label: "What's your daily food budget?",
    type: "select",
    icon: DollarSign,
    options: [
      { value: "low", label: "₹100-200 ($1-3) - Budget-friendly" },
      { value: "medium", label: "₹200-400 ($3-5) - Moderate" },
      { value: "high", label: "₹400+ ($5+) - Premium" },
    ],
    description: "We'll optimize meals within your budget",
  },
  {
    id: "cookingTime",
    label: "How much time can you spend cooking?",
    type: "select",
    icon: Clock,
    options: [
      { value: "15min", label: "15 minutes or less" },
      { value: "30min", label: "30 minutes" },
      { value: "1hour", label: "1 hour" },
      { value: "flexible", label: "Flexible" },
    ],
    description: "Recipes matched to your schedule",
  },
  {
    id: "lifestyleInfo",
    label: "Tell us about your daily routine",
    type: "textarea",
    icon: Users,
    placeholder: "e.g., Work from home, gym 3x/week, busy schedule...",
    description: "Helps tailor meal timing and energy needs",
  },
  {
    id: "availableIngredients",
    label: "What ingredients do you usually have?",
    type: "textarea",
    icon: ChefHat,
    placeholder: "e.g., Rice, lentils, vegetables, chicken, spices...",
    description: "We'll prioritize these in your recipes",
  },
  {
    id: "cuisinePreferences",
    label: "What cuisines do you enjoy?",
    type: "textarea",
    icon: Salad,
    placeholder: "e.g., South Indian, Italian, Mexican...",
    description: "Mix of your favorite flavors",
  },
  {
    id: "dietLifestyle",
    label: "Any dietary preferences?",
    type: "select",
    icon: Heart,
    options: [
      { value: "balanced", label: "Balanced" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "keto", label: "Keto" },
      { value: "low-carb", label: "Low-Carb" },
      { value: "high-protein", label: "High-Protein" },
      { value: "gluten-free", label: "Gluten-Free" },
      { value: "mediterranean", label: "Mediterranean" },
    ],
    description: "Aligned with your nutritional approach",
  },
  {
    id: "planDuration",
    label: "How many days should we plan?",
    type: "select",
    icon: Calendar,
    options: [
      { value: "1", label: "1 Day" },
      { value: "3", label: "3 Days" },
      { value: "7", label: "7 Days" },
      { value: "14", label: "14 Days" },
    ],
    description: "Your personalized meal roadmap",
  },
];

interface MealPlanData {
  category: string;
  state: string;
  budget: string;
  cookingTime: string;
  lifestyleInfo: string;
  availableIngredients: string;
  cuisinePreferences: string;
  dietLifestyle: string;
  planDuration: string;
}

function DailyChallengeTracker({ activePlan, selectedDate, userId, updateStreak }: any) {
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadCompletedMeals();
  }, [selectedDate]);

  const loadCompletedMeals = async () => {
    try {
      const { data } = await supabase
        .from('daily_challenges')
        .select('completed_meals')
        .eq('user_id', userId)
        .eq('date', selectedDate.toISOString().split('T')[0])
        .single();
      
      if (data) {
        setCompletedMeals(data.completed_meals || []);
      } else {
        setCompletedMeals([]);
      }
    } catch (err) {
      setCompletedMeals([]);
    }
  };

  const toggleMeal = async (mealType: string) => {
  const newCompleted = completedMeals.includes(mealType)
    ? completedMeals.filter(m => m !== mealType)
    : [...completedMeals, mealType];
  
  setCompletedMeals(newCompleted);

  await supabase
    .from('daily_challenges')
    .upsert({
      user_id: userId,
      date: selectedDate.toISOString().split('T')[0],
      completed_meals: newCompleted,
    });
  
  // Check for streak update
  if (newCompleted.length === 3) {
    // Call parent's updateStreak function
    if (typeof window !== 'undefined') {
      (window as any).updateStreakCallback?.();
    }
  }
};


useEffect(() => {
  (window as any).updateStreakCallback = updateStreak;
  return () => {
    delete (window as any).updateStreakCallback;
  };
}, []);


  // Calculate which day of the plan this date represents
const planStartDate = new Date(activePlan.created_at);
planStartDate.setHours(0, 0, 0, 0);

const selectedDateNormalized = new Date(selectedDate);
selectedDateNormalized.setHours(0, 0, 0, 0);

const dayIndex = Math.floor(
  (selectedDateNormalized.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)
);

// Check if the selected date is within the plan range
if (dayIndex < 0 || dayIndex >= activePlan.plans.length) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-black/70">No meal plan for this date</p>
    </div>
  );
}

const todaysPlan = activePlan.plans[dayIndex];

if (!todaysPlan) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-black/70">Meal plan data unavailable</p>
    </div>
  );
}

  const meals = [
    { type: 'breakfast', label: 'Breakfast', icon: '🌅', data: todaysPlan.breakfast },
    { type: 'lunch', label: 'Lunch', icon: '☀️', data: todaysPlan.lunch },
    { type: 'dinner', label: 'Dinner', icon: '🌙', data: todaysPlan.dinner },
  ];

  const completionRate = (completedMeals.length / 3) * 100;

  return (
  <div className="space-y-4">
    {/* Progress Summary */}
    {/* Progress Summary */}
<div className="flex items-center justify-between mb-4">
  <div>
    <p className="text-sm font-bold text-black">
      {selectedDate.toDateString() === new Date().toDateString() 
        ? "Today's Progress" 
        : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </p>
    <p className="text-xs text-black/70">
      Day {dayIndex + 1} of {activePlan.plans.length} • {completedMeals.length} of 3 meals completed
    </p>
  </div>
  <div className="text-right">
    <p className="text-2xl font-bold text-black">{Math.round(completionRate)}%</p>
  </div>
</div>

    {/* Progress Bar */}
    <div className="bg-black/10 rounded-full h-3 overflow-hidden shadow-inner">
      <div 
        className="h-full bg-black rounded-full transition-all duration-500 ease-out"
        style={{ width: `${completionRate}%` }}
      />
    </div>

    {/* Meals Checklist */}
    <div className="space-y-2 mt-4">
      {meals.map(({ type, label, icon, data }) => (
        <button
          key={type}
          onClick={() => toggleMeal(type)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
            completedMeals.includes(type)
              ? 'bg-black/20 border-2 border-black shadow-md'
              : 'bg-black/10 border-2 border-transparent hover:bg-black/15 hover:border-black/20'
          }`}
        >
          {/* Checkbox */}
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            completedMeals.includes(type) 
              ? 'bg-black border-black scale-110' 
              : 'border-black/30 hover:border-black/50'
          }`}>
            {completedMeals.includes(type) && (
              <svg className="w-4 h-4 text-[#c9fa5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Meal Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>

          {/* Meal Info */}
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-black">{label}</p>
            <p className="text-xs text-black/70 truncate">{data.name}</p>
          </div>

          {/* Calories */}
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-bold text-black">{data.calories}</p>
            <p className="text-xs text-black/60">cal</p>
          </div>
        </button>
      ))}
    </div>

    {/* Completion Message */}
    {completionRate === 100 && (
      <div className="text-center py-3 bg-black/10 rounded-xl border-2 border-black/20 mt-4">
        <p className="text-sm font-bold text-black flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          Challenge Complete! +10 XP
          <Sparkles className="h-5 w-5" />
        </p>
      </div>
    )}
  </div>
);
}

export function MealPlannerEnhanced() {
  const { userId } = useUser();
  const { plan, refreshSubscription } = useSubscription();
  // const supabase = createClient()

  const [view, setView] = useState<"categories" | "questions" | "generated">(
    "categories"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSaved, setShowSaved] = useState(false);

  const [formData, setFormData] = useState<MealPlanData>({
    category: "",
    state: "",
    budget: "",
    cookingTime: "",
    lifestyleInfo: "",
    availableIngredients: "",
    cuisinePreferences: "",
    dietLifestyle: "",
    planDuration: "",
  });

  const [generatedPlan, setGeneratedPlan] = useState<any[]>([]);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [ongoingPlans, setOngoingPlans] = useState<any[]>([]);
  const [showOngoing, setShowOngoing] = useState<boolean>(false);
  const [showOngoingScreen, setShowOngoingScreen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
const [activePlan, setActivePlan] = useState<any>(null);
const [dateRange, setDateRange] = useState<Date[]>([]);

const [viewSelectedDate, setViewSelectedDate] = useState<Date>(new Date());
const [viewDateRange, setViewDateRange] = useState<Date[]>([]);

// ADD after const [viewDateRange, setViewDateRange] = useState<Date[]>([]);
const [streakData, setStreakData] = useState<{
  currentStreak: number;
  highestStreak: number;
  xp: number;
}>({
  currentStreak: 0,
  highestStreak: 0,
  xp: 0,
});
const [completionStats, setCompletionStats] = useState<{
  thisWeek: number;
  thisMonth: number;
}>({
  thisWeek: 0,
  thisMonth: 0,
});


const [showOnboarding, setShowOnboarding] = useState(false);
const [hasActivePlan, setHasActivePlan] = useState(false);
const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);

const [showDailyChallenge, setShowDailyChallenge] = useState(false);
const [showStatsCard, setShowStatsCard] = useState(false);
const [showMealPlan, setShowMealPlan] = useState(false);

  const canUseMealPlanner =
    plan?.plan_name === "Pro Plan" ||
    (plan?.plan_name === "Free" && !plan?.used_meal_planner);

  const loadOngoingPlans = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("generated_meal_plans")
      .select("*, user_meal_planner_inputs(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Group by input_id
      const grouped = data.reduce((acc: any, plan: any) => {
        const key = plan.input_id;
        if (!acc[key]) {
          acc[key] = {
            plans: [],
            inputData: plan.user_meal_planner_inputs,
            created_at: plan.created_at,
          };
        }
        acc[key].plans.push(plan);
        return acc;
      }, {});

      // Convert to array and check if active
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ongoingArray = Object.entries(grouped)
  .map(([inputId, data]: any) => {
    const totalDays = parseInt(data.inputData.plan_duration);
    const startDate = new Date(data.created_at);
    startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + totalDays);
          
          const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const currentDay = Math.max(0, Math.min(daysPassed, totalDays));
          
          return {
            inputId,
            plans: data.plans,
            inputData: data.inputData,
            created_at: data.created_at,
            totalDays,
            currentDay: currentDay + 1, // Display as 1-indexed
            isActive: today >= startDate && today < endDate,
          };
        })
        .filter((plan) => plan.isActive)
.filter((plan, index, self) => 
  index === self.findIndex((p) => p.inputId === plan.inputId)
);

      // Remove duplicates by inputId
      const uniquePlans = ongoingArray.filter(
        (plan, index, self) => 
          index === self.findIndex((p) => p.inputId === plan.inputId)
      );
      
      setOngoingPlans(ongoingArray);
      setHasActivePlan(uniquePlans.length > 0);
    }
  } catch (err) {
    console.error("Error loading ongoing plans:", err);
  }
};


const deleteActivePlan = async (inputId: string) => {
  const supabase = createClient();
  try {
    // Delete the meal plans
    await supabase
      .from("generated_meal_plans")
      .delete()
      .eq("input_id", inputId);
    
    // Delete the input
    await supabase
      .from("user_meal_planner_inputs")
      .delete()
      .eq("id", inputId);
    
    // Reload plans
    await loadOngoingPlans();
    await loadSavedPlans();
    
    setHasActivePlan(false);
    setActivePlan(null);
    setShowChangePlanDialog(false);
  } catch (err) {
    console.error("Error deleting active plan:", err);
  }
};

  const loadSavedPlans = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("user_meal_planner_inputs")
        .select(
          `
    *,
    generated_meal_plans(*)
  `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const savedArray = data
  .filter(
    (input: any) =>
      input.generated_meal_plans &&
      input.generated_meal_plans.length > 0
  )
  .reduce((acc: any[], input: any) => {
    // Only add if not already in array (dedup by id)
    if (!acc.find(item => item.inputId === input.id)) {
      acc.push({
        inputId: input.id,
        plans: input.generated_meal_plans,
        inputData: input,
        created_at: input.created_at,
      });
    }
    return acc;
  }, []);

        setSavedPlans(savedArray);
      }
    } catch (err) {
      console.error("Error loading saved plans:", err);
    }
  };

  // ADD this new function after loadSavedPlans():
const loadStreakData = async () => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setStreakData({
        currentStreak: data.current_streak || 0,
        highestStreak: data.highest_streak || 0,
        xp: data.xp_points || 0,
      });
    }
  } catch (err) {
    console.error("Error loading streak data:", err);
  }
};

const loadCompletionStats = async () => {
  const supabase = createClient();
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: weekData } = await supabase
      .from('daily_challenges')
      .select('completed_meals')
      .eq('user_id', userId)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .lte('date', now.toISOString().split('T')[0]);
    
    const { data: monthData } = await supabase
      .from('daily_challenges')
      .select('completed_meals')
      .eq('user_id', userId)
      .gte('date', monthAgo.toISOString().split('T')[0])
      .lte('date', now.toISOString().split('T')[0]);
    
    const weekComplete = weekData?.filter(d => d.completed_meals?.length === 3).length || 0;
    const monthComplete = monthData?.filter(d => d.completed_meals?.length === 3).length || 0;
    
    setCompletionStats({
      thisWeek: weekComplete,
      thisMonth: monthComplete,
    });
  } catch (err) {
    console.error("Error loading completion stats:", err);
  }
};

const updateStreak = async () => {
  const supabase = createClient();
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayChallenge } = await supabase
      .from('daily_challenges')
      .select('completed_meals')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (todayChallenge?.completed_meals?.length === 3) {
      const { data: currentStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const lastCompleted = currentStreak?.last_completed_date;
      
      let newStreak = 1;
      if (lastCompleted === yesterday) {
        newStreak = (currentStreak.current_streak || 0) + 1;
      } else if (lastCompleted !== today) {
        newStreak = 1;
      } else {
        return; // Already counted today
      }
      
      const newHighest = Math.max(newStreak, currentStreak?.highest_streak || 0);
      const xpGain = 10; // 10 XP per completed day
      
      await supabase
        .from('user_streaks')
        .upsert({
          user_id: userId,
          current_streak: newStreak,
          highest_streak: newHighest,
          last_completed_date: today,
          xp_points: (currentStreak?.xp_points || 0) + xpGain,
        });
      
      await loadStreakData();
    }
  } catch (err) {
    console.error("Error updating streak:", err);
  }
};

  const calculateActivePlan = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find active plan for today's date
  for (const planGroup of ongoingPlans) {
    const startDate = new Date(planGroup.created_at);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planGroup.totalDays);
    
    if (today >= startDate && today < endDate) {
      setActivePlan(planGroup);
      
      // Generate date range for this plan
      const dates = [];
      for (let i = 0; i < planGroup.totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
      setDateRange(dates);
      return;
    }
  }
  
  setActivePlan(null);
  setDateRange([]);
};

const checkFirstTimeUser = async () => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("user_meal_planner_inputs")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    
    if (!data || data.length === 0) {
      setShowOnboarding(true);
    }
  } catch (err) {
    console.error("Error checking first-time user:", err);
  }
};

useEffect(() => {
  if (userId) {
    loadOngoingPlans();
    loadSavedPlans();
    checkFirstTimeUser();
    loadStreakData();
    loadCompletionStats();
  }
}, [userId]);

  useEffect(() => {
  calculateActivePlan();
}, [ongoingPlans]);

useEffect(() => {
  if (view === "generated" && generatedPlan.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate date range for this plan
    const dates = [];
    for (let i = 0; i < generatedPlan.length; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    setViewDateRange(dates);
    setViewSelectedDate(today);
  }
}, [view, generatedPlan]);

  const removePlan = async (inputId: string) => {
    const supabase = createClient();
    try {
      await supabase
        .from("generated_meal_plans")
        .delete()
        .eq("input_id", inputId);

      await loadOngoingPlans();
      await loadSavedPlans();
    } catch (err) {
      console.error("Error removing plan:", err);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
  if (hasActivePlan) {
    setShowChangePlanDialog(true);
    setSelectedCategory(categoryId);
    return;
  }
  
  setSelectedCategory(categoryId);
  setFormData({ ...formData, category: categoryId });
  setView("questions");
  setCurrentStep(0);
};

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setView("categories");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isStepComplete = () => {
    const currentQuestion = QUESTIONS[currentStep];
    const value = formData[currentQuestion.id as keyof MealPlanData];
    return value && value.trim() !== "";
  };

  const generateMealPlan = async () => {
    if (!canUseMealPlanner) return;

    setIsGenerating(true);
    const supabase = createClient();
    try {
      // Convert camelCase to snake_case for database
      const dbFormData = {
        user_id: userId,
        state: formData.state,
        budget: formData.budget,
        cooking_time: formData.cookingTime,
        lifestyle_info: formData.lifestyleInfo,
        available_ingredients: formData.availableIngredients,
        cuisine_preferences: formData.cuisinePreferences,
        diet_lifestyle: formData.dietLifestyle,
        health_goal: formData.category,
        plan_duration: formData.planDuration,
      };

      const { data: inputData, error: inputError } = await supabase
        .from("user_meal_planner_inputs")
        .insert([dbFormData])
        .select()
        .single();

      if (inputError) throw inputError;

      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let mealPlan = [];
      if (response.ok) {
        const data = await response.json();
        mealPlan = data.mealPlan;
      } else {
        mealPlan = generateFallbackPlan();
      }

      const planRecords = mealPlan.map((day: any) => ({
        user_id: userId,
        input_id: inputData.id,
        day: day.day,
        breakfast: day.breakfast,
        lunch: day.lunch,
        dinner: day.dinner,
      }));

      await supabase.from("generated_meal_plans").insert(planRecords);

      setGeneratedPlan(mealPlan);
      setView("generated");

      await loadOngoingPlans();

      if (plan?.plan_name === "Free") {
        await fetch("/api/mark-feature-used", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature: "used_meal_planner" }),
        });
        await refreshSubscription();
      }
    } catch (err) {
      console.error("Error generating meal plan:", err);
      setGeneratedPlan(generateFallbackPlan());
      setView("generated");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackPlan = () => {
    const days = parseInt(formData.planDuration) || 3;
    return Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      breakfast: {
        name: "Healthy Breakfast",
        calories: 300,
        description: "Balanced start",
      },
      lunch: {
        name: "Nutritious Lunch",
        calories: 450,
        description: "Energy-packed",
      },
      dinner: {
        name: "Light Dinner",
        calories: 400,
        description: "Perfect end",
      },
    }));
  };

  const currentQuestion = QUESTIONS[currentStep];
  const Icon = currentQuestion?.icon;
  const category = PLANNER_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-black space-y-6 pb-28 mt-8">
  {/* Header - Only show on main categories view */}
  {view === "categories" && !showOngoingScreen && !showSaved && (
  <div data-categories>
      <div className="flex items-center justify-between mb-4 ml-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 mt-3">Meal Planner</h1>
          <p className="text-sm text-gray-400">Personalized nutrition for your goals</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center mr-2">
          <Calendar className="h-5 w-5 text-black" />
        </div>
      </div>
    </div>
  )}

{/* Week Date Navigation - Show for all users */}
{view === "categories" && !showOngoingScreen && !showSaved && (
  <div className="px-1.5 mb-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-white">This Week</h3>
      <span className="text-xs text-gray-400">
        {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </span>
    </div>
    
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      {(() => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - currentDay); // Start from Sunday
        
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          return date;
        });
        
        return weekDates.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          
          // Check if there's a plan for this date
          const hasPlan = activePlan && dateRange.some(d => d.toDateString() === date.toDateString());
          
          return (
            <button
              key={index}
              onClick={() => {
  setSelectedDate(date);
  // If there's a plan for this date, auto-expand both drawers
  if (hasPlan) {
    setShowMealPlan(true);
    setShowDailyChallenge(true);
  }
}}
              disabled={!hasPlan && !isToday}
              className={`flex-shrink-0 flex flex-col items-center gap-4 py-3 rounded-[0.75rem] min-w-[60px] transition-all ${
                isSelected 
                  ? "bg-[#c9fa5f] text-black" 
                  : hasPlan
                  ? "bg-[#1a1a1a] border border-[#c9fa5f]/30 hover:border-[#c9fa5f]/60 cursor-pointer"
                  : isPast
                  ? "bg-[#1a1a1a]/50 border border-[#333333]/50 opacity-60 cursor-not-allowed"
                  : "bg-[#1a1a1a] border border-[#333333] opacity-60 cursor-not-allowed"
              }`}
            >
              <span className={`text-xs font-semibold ${isSelected ? "text-black" : hasPlan ? "text-gray-300" : "text-gray-500"}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-lg font-bold ${isSelected ? "text-black" : hasPlan ? "text-white" : "text-gray-600"}`}>
                {date.getDate()}
              </span>
              {isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9fa5f]" />
              )}
              {hasPlan && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-[#c9fa5f]" />
              )}
            </button>
          );
        });
      })()}
    </div>
    
    {/* Show message if no plan for selected date */}
    {activePlan && !dateRange.some(d => d.toDateString() === selectedDate.toDateString()) ? (
      <div className="mt-4 p-4 rounded-sm bg-[#1a1a1a] border border-[#333333] text-center">
        <p className="text-sm text-gray-400">No meal plan scheduled for this day</p>
        <p className="text-xs text-gray-500 mt-1">
          Your plan runs from {dateRange[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {dateRange[dateRange.length - 1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    ) : !activePlan ? (
      <div className="mt-4 p-4 rounded-sm bg-[#161616] text-center">
        <p className="text-sm text-gray-400">No active meal plan</p>
        <p className="text-xs text-gray-500 mt-1">Create a plan to get started</p>
      </div>
    ) : null}
  </div>
)}

  {view === "categories" && !showSaved && !showOngoingScreen && (
  <div className="px-1.5">
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => setShowOngoingScreen(true)}
        disabled={ongoingPlans.length === 0}
        className="relative h-36 rounded-sm bg-[#161616] p-4 text-left transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
            <Flame className="h-5 w-5 text-black" />
          </div>
          <span className="text-2xl font-bold text-[#c9fa5f]">{ongoingPlans.length > 0 ? ongoingPlans.length - 1 : 0}</span>
        </div>
        <p className="text-sm font-semibold text-white">Ongoing Plans</p>
        <p className="text-xs text-gray-400 mt-0.5">Active meal plans</p>
      </button>
      
      <button
        onClick={() => setShowSaved(true)}
        disabled={savedPlans.length === 0}
        className="relative h-36 bg-[#161616] rounded-sm p-4 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-black" />
          </div>
          <span className="text-2xl font-bold text-white">{savedPlans.length -1}</span>
        </div>
        <p className="text-sm font-semibold text-white">Saved Plans</p>
        <p className="text-xs text-gray-400 mt-0.5">Your history</p>
      </button>
    </div>
  </div>
)}

{/* ADD this new section after the grid with Ongoing/Saved buttons */}
{/* Stats Card with Inline Drawer */}
{view === "categories" && !showSaved && !showOngoingScreen && activePlan && (
  <div className="mx-1.5 mb-4">
    <div className="rounded-sm bg-[#161616] overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setShowStatsCard(!showStatsCard)}
        className="w-full p-5 flex items-center justify-between hover:bg-[#1a1a1a]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
            <Flame className="h-5 w-5 text-black" />
          </div>
          <div className="text-left ml-2">
            <h3 className="text-lg font-bold text-white pt-2">Your Progress</h3>
            <p className="text-xs text-gray-400">
              {streakData.currentStreak} day streak • {streakData.xp} XP
            </p>
          </div>
        </div>
        <ChevronRight 
          className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
            showStatsCard ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Expandable Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showStatsCard ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-5 pb-5 space-y-4 border-t border-[#333333]/50">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 text-center">
              <Award className="h-5 w-5 text-[#c9fa5f] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{streakData.currentStreak}</p>
              <p className="text-xs text-gray-400 mt-1">Day Streak</p>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 text-center">
              <TrendingUp className="h-5 w-5 text-[#c9fa5f] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{streakData.highestStreak}</p>
              <p className="text-xs text-gray-400 mt-1">Best Streak</p>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3 text-center">
              <Sparkles className="h-5 w-5 text-[#c9fa5f] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{streakData.xp}</p>
              <p className="text-xs text-gray-400 mt-1">XP Points</p>
            </div>
          </div>

          {/* This Week/Month Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3">
              <p className="text-xs text-gray-400 ml-2">This Week</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#c9fa5f]" />
                <span className="text-lg font-bold text-white">{completionStats.thisWeek}/7</span>
              </div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">This Month</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#c9fa5f]" />
                <span className="text-lg font-bold text-white">{completionStats.thisMonth}/30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      

      {/* Dedicated Ongoing Plans Screen */}
      {showOngoingScreen && (
  <div className="mx-2 py-6 space-y-6 animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex items-center gap-4">
      <button
        onClick={() => setShowOngoingScreen(false)}
        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">Ongoing Plans</h2>
        <p className="text-sm text-gray-400">Your active meal journeys</p>
      </div>
    </div>

    {/* Plans List */}
    <div className="space-y-4">
      {ongoingPlans.length === 0 ? (
  <div className="text-center py-16">
    <div className="w-20 h-20 rounded-2xl bg-[#c9fa5f]/10 flex items-center justify-center mx-auto mb-4">
      <Flame className="h-10 w-10 text-[#c9fa5f]" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">No Ongoing Plans</h3>
    <p className="text-sm text-gray-400 mb-6">Start a new meal plan to track your progress</p>
    <Button
      onClick={() => setShowOngoingScreen(false)}
      className="bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-semibold h-11 px-6 rounded-xl"
    >
      Create New Plan
    </Button>
  </div>
) : (
  ongoingPlans
    .filter((planGroup: any) => {
      const category = PLANNER_CATEGORIES.find(c => c.id === planGroup.inputData?.health_goal);
      return category !== undefined; // Only show plans with valid categories
    })
    .map((planGroup: any, index: number) => {
    const category = PLANNER_CATEGORIES.find(c => c.id === planGroup.inputData.health_goal)!;
    const progress = (planGroup.currentDay / planGroup.totalDays) * 100;
    
    return (
      <div key={index} className="rounded-sm bg-[#161616] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9fa5f]/10 flex items-center justify-center">
              {category.icon ? <category.icon className="h-5 w-5" /> : "🍽️"}
            </div>
            <div>
              <h3 className="font-bold text-base text-white mb-0.5 mt-4">
                {category?.name}
              </h3>
              <p className="text-xs text-gray-400">
                Started {new Date(planGroup.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm('Remove this plan?')) {
                await removePlan(planGroup.inputId)
              }
            }}
            className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="bg-[#0a0a0a] rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Progress</span>
            <span className="text-sm font-bold text-[#c9fa5f]">
              Day {planGroup.currentDay} / {planGroup.totalDays}
            </span>
          </div>
          <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#c9fa5f] to-[#a8d94f] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Day Indicators */}
          <div className="flex gap-1 mt-3">
            {Array.from({ length: planGroup.totalDays }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx < planGroup.currentDay 
                    ? 'bg-[#c9fa5f]' 
                    : 'bg-[#1a1a1a]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 bg-[#0a0a0a] rounded-sm">
            <DollarSign className="h-4 w-4 text-[#c9fa5f]" />
            <div>
              <p className="text-xs text-gray-400">Budget</p>
              <p className="text-sm font-semibold text-white">{planGroup.inputData.budget}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#0a0a0a] rounded-sm">
            <Clock className="h-4 w-4 text-[#c9fa5f]" />
            <div>
              <p className="text-xs text-gray-400">Cook Time</p>
              <p className="text-sm font-semibold text-white">{planGroup.inputData.cooking_time}</p>
            </div>
          </div>
        </div>

        {/* View Full Plan Button */}
        <button
          onClick={() => {
            setGeneratedPlan(planGroup.plans)
            setSelectedCategory(planGroup.inputData.health_goal)
            setView("generated")
            setShowOngoingScreen(false)
          }}
          className="w-full h-12 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-semibold rounded-sm transition-all flex items-center justify-center gap-2"
        >
          View Full Plan
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  })
)}
    </div>
  </div>
)}

      {view === "categories" && !showOngoingScreen && !showSaved && (
        <>
          {/* Weekly Stats Overview */}
{/* Date Navigation - Show only if there's an active plan */}
{/* Your Active Plan with Inline Drawer */}
{activePlan && dateRange.length > 0 && (
  <div className="mb-4 mx-1.5">
    <div className="rounded-sm bg-[#161616] overflow-hidden">
      
      {/* Header - Always Visible */}
      <button
        onClick={() => setShowMealPlan(!showMealPlan)}
        className="w-full p-5 flex items-center justify-between hover:bg-[#1a1a1a]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
            <Calendar className="h-5 w-5 text-black" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white pt-2">Your Active Plan</h3>
            <p className="text-xs text-gray-400">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} • Day {Math.floor((selectedDate.getTime() - new Date(activePlan.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1} of {activePlan.totalDays}
            </p>
          </div>
        </div>
        <ChevronRight 
          className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
            showMealPlan ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Expandable Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showMealPlan ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-0 mx-3 pb-5 space-y-4 rounded-sm">
          
          {/* Date Range Selector */}
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-white mb-3">Select Date</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {dateRange.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-sm min-w-[70px] transition-all ${
                      isSelected 
                        ? "bg-[#c9fa5f] text-black" 
                        : isPast
                        ? "bg-[#0a0a0a] opacity-60"
                        : "bg-[#0a0a0a]"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isSelected ? "text-black" : "text-gray-400"}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-lg font-bold ${isSelected ? "text-black" : "text-white"}`}>
                      {date.getDate()}
                    </span>
                    <span className={`text-xs ${isSelected ? "text-black/70" : "text-gray-500"}`}>
                      Day {index + 1}
                    </span>
                    {isToday && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c9fa5f]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Info */}
          <div className="p-4 rounded-sm bg-[#0a0a0a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Selected Date</p>
                <p className="text-sm font-semibold text-white">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Total Calories</p>
                <p className="text-sm font-semibold text-[#c9fa5f]">
                  {(() => {
                    const planStartDate = new Date(activePlan.created_at);
                    planStartDate.setHours(0, 0, 0, 0);
                    const selectedDateNormalized = new Date(selectedDate);
                    selectedDateNormalized.setHours(0, 0, 0, 0);
                    const dayIndex = Math.floor(
                      (selectedDateNormalized.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const dayPlan = activePlan.plans[dayIndex];
                    if (!dayPlan) return 0;
                    return dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.dinner.calories;
                  })()} cal
                </p>
              </div>
            </div>
          </div>

          {/* Meals for Selected Date */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Today's Meals</h4>
            <div className="space-y-3">
              {(() => {
                const planStartDate = new Date(activePlan.created_at);
                planStartDate.setHours(0, 0, 0, 0);
                const selectedDateNormalized = new Date(selectedDate);
                selectedDateNormalized.setHours(0, 0, 0, 0);
                const dayIndex = Math.floor(
                  (selectedDateNormalized.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                const dayPlan = activePlan.plans[dayIndex];
                
                if (!dayPlan) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No meal plan data for this day</p>
                    </div>
                  );
                }

                return [
                  { label: "Breakfast", meal: dayPlan.breakfast, icon: "🌅", time: "07:00 AM" },
                  { label: "Lunch", meal: dayPlan.lunch, icon: "☀️", time: "12:30 PM" },
                  { label: "Dinner", meal: dayPlan.dinner, icon: "🌙", time: "07:00 PM" },
                ].map(({ label, meal, icon, time }) => (
                  <div 
                    key={label} 
                    className="group relative rounded-sm bg-[#0a0a0a] p-4 transition-all cursor-pointer"
                    onClick={() => setSelectedRecipe({ 
                      meal: meal.name, 
                      day: `Day ${dayIndex + 1}`,
                      calories: meal.calories,
                      description: meal.description,
                      time: time,
                      mealType: label,
                      fullMealData: meal
                    })}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                        <span className="w-6 h-6 m-auto text-center">{icon}</span>
                      </div>

                      {/* Meal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-[#c9fa5f] uppercase tracking-wider px-2 py-1 bg-[#c9fa5f]/10 rounded-md">
                            {label}
                          </span>
                          <span className="text-xs text-gray-500">{time}</span>
                        </div>
                        <h5 className="font-bold text-base text-white mb-2 line-clamp-2">
                          {meal.name}
                        </h5>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {meal.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#c9fa5f]/10 rounded-md">
                            <Flame className="h-3 w-3 text-[#c9fa5f]" />
                            <span className="text-xs font-bold text-[#c9fa5f]">{meal.calories}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] border border-[#333333] rounded-md">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">30 min</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#c9fa5f] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
)}
       
        </>
      )}      

      {/* Hero Section - only show on categories view */}
      {view === "categories" && !showOngoingScreen && !showSaved && (
        <div className="relative h-[400px] rounded-sm overflow-hidden mb-6 mx-1.5">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-black">
            {/* ADD YOUR HERO IMAGE HERE: <img src="/hero-meal-planner.jpg" className="w-full h-full object-cover opacity-60" /> */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col justify-end p-8 pb-12">
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
              Care for
              <br />
              Your Health
              <br />
              Companion
            </h1>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed max-w-[280px]">
              Your health is your greatest asset—nurture it with mindful
              choices, regular activity, and balanced habits.
            </p>
            <Button 
  onClick={() => {
    setShowOnboarding(false);
    const categoriesSection = document.querySelector('[data-categories]');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }}
  className="w-full h-14 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-bold text-base rounded-2xl shadow-xl"
>
  Get Started
</Button>
          </div>
        </div>
      )}

      
      {/* Categories View */}
      {view === "categories" && !showOngoingScreen && !showSaved && (
        <div>
          <div className="flex items-center justify-between px-2 mb-0">
            <h3 className="text-lg font-bold text-white pt-4">Choose Your Goal</h3>
            <button className="text-xs text-[#c9fa5f] font-semibold">
              See All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 px-2 hide-scrollbar">
            {PLANNER_CATEGORIES.map((cat) => {
              const CategoryIcon = cat.icon;
              return (
                <div
  key={cat.id}
  onClick={() => handleCategorySelect(cat.id)}
  className={`relative flex-shrink-0 w-[280px] h-[160px] rounded-sm overflow-hidden cursor-pointer group ${
    hasActivePlan ? 'opacity-60' : ''
  }`}
>
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {cat.icon && (
                        <cat.icon className="h-5 w-5 text-[#c9fa5f]" />
                      )}
                      <h4 className="text-white font-bold text-base">
                        {cat.name}
                      </h4>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {hasActivePlan && (
  <div className="mt-2 px-2 py-1 bg-[#c9fa5f]/20 border border-[#c9fa5f]/40 rounded-md inline-block">
    <p className="text-xs font-semibold text-[#c9fa5f]">
      ⚠️ Will replace active plan
    </p>
  </div>
)}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#c9fa5f] rounded-2xl transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <style jsx global>{`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Smooth drawer transitions */
  [class*="max-h-"] {
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`}</style>


      {/* Questions View */}
      {view === "questions" && category && (
        <div className="space-y-4 animate-in fade-in duration-300 mt-24 mx-2">
          {/* Progress Bar */}
          <Card className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#c9fa5f]/20 rounded-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">
                    {category.icon ? (
                      <category.icon className="h-6 w-6" />
                    ) : null}
                  </span>

                  {category.name}
                </span>
                <span className="text-gray-400 text-xs">
                  Step {currentStep + 1} / {QUESTIONS.length}
                </span>
              </div>

              {/* Decorative Background Image Placeholder */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-[#c9fa5f] to-transparent rounded-full blur-3xl" />
                {/* ADD YOUR DECORATIVE IMAGE HERE */}
              </div>
              <div className="relative h-2.5 bg-[#2a2a2a] rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#c9fa5f] to-[#a8d94f] rounded-full shadow-lg"
                  style={{
                    width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Question Card */}
          <Card className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#c9fa5f]/20 rounded-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#c9fa5f] flex items-center justify-center flex-shrink-0">
                  {Icon && <Icon className="h-6 w-6 text-black" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {currentQuestion.label}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {currentQuestion.description}
                  </p>
                </div>
              </div>

              {currentQuestion.type === "input" && (
                <Input
                  value={formData[currentQuestion.id as keyof MealPlanData]}
                  onChange={(e) =>
                    handleInputChange(currentQuestion.id, e.target.value)
                  }
                  placeholder={currentQuestion.placeholder}
                  className="h-11 bg-[#1a1a1a] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#c9fa5f] focus:ring-1 focus:ring-[#c9fa5f]"
                />
              )}

              {currentQuestion.type === "textarea" && (
                <Textarea
                  value={formData[currentQuestion.id as keyof MealPlanData]}
                  onChange={(e) =>
                    handleInputChange(currentQuestion.id, e.target.value)
                  }
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[100px] resize-none bg-[#1a1a1a] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#c9fa5f] focus:ring-1 focus:ring-[#c9fa5f]"
                />
              )}

              {currentQuestion.type === "select" && (
                <Select
                  value={formData[currentQuestion.id as keyof MealPlanData]}
                  onValueChange={(value) =>
                    handleInputChange(currentQuestion.id, value)
                  }
                >
                  <SelectTrigger className="h-11 bg-background border-[#333333]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1 h-11 border-[#333333]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < QUESTIONS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="flex-1 h-11 bg-gradient-to-r from-[#c9fa5f] to-[#b8e954] text-black hover:from-[#b8e954] hover:to-[#a8d94f] font-semibold shadow-lg hover:shadow-[#c9fa5f]/50 transition-all font-semibold disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generateMealPlan}
                disabled={
                  !isStepComplete() || !canUseMealPlanner || isGenerating
                }
                className="flex-1 h-11 bg-gradient-to-r from-[#c9fa5f] to-[#b8e954] text-black hover:from-[#b8e954] hover:to-[#a8d94f] font-semibold shadow-lg hover:shadow-[#c9fa5f]/50 transition-all font-semibold disabled:opacity-50"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Plan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Generated Plan View */}
      {view === "generated" && !showSaved && generatedPlan.length > 0 && (
  <div className="space-y-3 animate-in fade-in duration-300 mt-8">
    {/* Back Button Header */}
    <div className="flex items-center gap-4 px-4 pt-4">
      <button
        onClick={() => {
          setView("categories");
          setGeneratedPlan([]);
          setSelectedCategory(null);
        }}
        className="w-10 h-10 rounded-sm flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white mt-2">
          Your {category?.name} Plan
        </h3>
        <p className="text-sm text-gray-400">
          {generatedPlan.length} day meal plan
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setView("categories");
          setGeneratedPlan([]);
          setFormData({
            category: "",
            state: "",
            budget: "",
            cookingTime: "",
            lifestyleInfo: "",
            availableIngredients: "",
            cuisinePreferences: "",
            dietLifestyle: "",
            planDuration: "",
          });
        }}
        className="h-9 px-4 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-semibold rounded-xl border-none"
      >
        New Plan
      </Button>
    </div>

   {/* Display all days */}
<div className="space-y-3">
  {generatedPlan.map((dayPlan: any, dayIndex: number) => (
    <div key={dayIndex} className="mx-1.5">
      <div className="rounded-sm bg-[#161616] p-4 space-y-4">
        {/* Day Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#333333]/50">
          <div>
            <h4 className="font-bold text-xl text-white mb-1">
              {dayPlan.day}
            </h4>
            <p className="text-xs text-gray-400">
              {parseInt(formData.planDuration)} day meal plan
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
            <p className="text-2xl font-bold text-[#c9fa5f]">
              {dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.dinner.calories}
              <span className="text-sm font-normal text-gray-400 ml-1">cal</span>
            </p>
          </div>
        </div>
        
        {/* Meals */}
        <div className="space-y-3">
          {[
            { label: "Breakfast", meal: dayPlan.breakfast, icon: "🌅", time: "07:00 AM" },
            { label: "Lunch", meal: dayPlan.lunch, icon: "☀️", time: "12:30 PM" },
            { label: "Dinner", meal: dayPlan.dinner, icon: "🌙", time: "07:00 PM" },
          ].map(({ label, meal, icon, time }) => (
            <div 
              key={label} 
              className="group relative rounded-sm bg-[#0a0a0a] py-4 px-3 hover:border-[#c9fa5f]/30 transition-all cursor-pointer"
              onClick={() => setSelectedRecipe({ 
                meal: meal.name, 
                day: dayPlan.day,
                calories: meal.calories,
                description: meal.description,
                time: time,
                mealType: label,
                fullMealData: meal
              })}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center">
                  <span className="text-lg">{icon}</span>
                </div>

                {/* Meal Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#c9fa5f] uppercase tracking-wider px-2 py-1 bg-[#c9fa5f]/10 rounded-md">
                      {label}
                    </span>
                    <span className="text-xs text-gray-500">{time}</span>
                  </div>
                  <h5 className="font-bold text-base text-white mb-2 line-clamp-2">
                    {meal.name}
                  </h5>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {meal.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#c9fa5f]">{meal.calories} cal</span>
                    <span className="text-xs text-gray-500">• ~15 min</span>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#c9fa5f] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ))}
</div>
  </div>
)}

      {/* Saved Plans View */}
      {view === "categories" && showSaved && !showOngoingScreen && (
  <div className="mx-1.5 py-6 space-y-6 animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex items-center gap-4">
      <button
        onClick={() => setShowSaved(false)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">Saved Plans</h2>
        <p className="text-sm text-gray-400">Your meal plan history</p>
      </div>
    </div>

    {/* Plans List */}
    <div className="space-y-3">
      {savedPlans.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-[#c9fa5f]/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-[#c9fa5f]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Saved Plans</h3>
          <p className="text-sm text-gray-400 mb-6">Generate your first meal plan to get started</p>
          <Button
            onClick={() => setShowSaved(false)}
            className="bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-semibold h-11 px-6 rounded-xl"
          >
            Create New Plan
          </Button>
        </div>
      ) : (
        savedPlans
  .filter((planGroup: any) => {
    const category = PLANNER_CATEGORIES.find(c => c.id === planGroup.inputData?.health_goal);
    return category !== undefined; // Only show plans with valid categories
  })
  .map((planGroup: any, index: number) => {
  const category = PLANNER_CATEGORIES.find(c => c.id === planGroup.inputData?.health_goal)!;
          
          return (
            <div key={index} className="rounded-sm bg-[#161616] p-3 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#c9fa5f]/20 border border-[#c9fa5f]/30 flex items-center justify-center">
                    {category?.icon ? <category.icon className="h-6 w-6 text-[#c9fa5f]" /> : "🍽️"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white mb-0.5">
  {category.name}
</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(planGroup.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="px-2 py-0.5 bg-[#c9fa5f]/10 border border-[#c9fa5f]/30 rounded-full text-xs font-semibold text-[#c9fa5f]">
                        {planGroup.plans.length} days
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setGeneratedPlan(planGroup.plans)
                    setSelectedCategory(planGroup.inputData?.health_goal)
                    setView("generated")
                    setShowSaved(false)
                  }}
                  className="h-9 px-4 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-semibold rounded-lg text-xs transition-colors"
                >
                  View
                </button>
              </div>
              
              {/* Preview Days */}
              <div className="space-y-2">
                {planGroup.plans.slice(0, 2).map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="pl-4 border-l-2 border-[#c9fa5f]/30 space-y-1">
                    <h4 className="font-semibold text-xs text-white mb-1.5">{day.day}</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="w-16">Breakfast:</span>
                        <span className="truncate text-white">{day.breakfast.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="w-16">Lunch:</span>
                        <span className="truncate text-white">{day.lunch.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="w-16">Dinner:</span>
                        <span className="truncate text-white">{day.dinner.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {planGroup.plans.length > 2 && (
                  <div className="text-xs text-center text-gray-400 pt-2 border-t border-[#333333]/50">
                    +{planGroup.plans.length - 2} more days
                  </div>
                )}
              </div>

              
            </div>
          )
        })
      )}
    </div>
  </div>
)}

{/* Onboarding Full Screen */}
{showOnboarding && view === "categories" && !showOngoingScreen && !showSaved && (
  <div className="fixed inset-0 z-50 bg-black">
    <div className="relative h-full rounded-3xl overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-black">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 pb-12">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#c9fa5f]/20 border-2 border-[#c9fa5f]/40 flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-[#c9fa5f]" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Care for
            <br />
            Your Health
            <br />
            Companion
          </h1>
          <p className="text-gray-300 text-base mb-8 leading-relaxed max-w-[320px]">
            Your health is your greatest asset—nurture it with mindful
            choices, regular activity, and balanced habits.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => {
              setShowOnboarding(false);
              // Scroll to categories
              setTimeout(() => {
                const categoriesSection = document.querySelector('[data-categories]');
                if (categoriesSection) {
                  categoriesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="w-full h-14 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-bold text-base rounded-2xl shadow-xl"
          >
            Get Started
          </Button>
          <button
            onClick={() => setShowOnboarding(false)}
            className="w-full h-12 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Change Plan Dialog */}
{showChangePlanDialog && (
  <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-md bg-[#0a0a0a] rounded-2xl border-2 border-[#c9fa5f]/30 p-6 space-y-4 animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-2xl bg-[#c9fa5f]/20 border-2 border-[#c9fa5f]/40 flex items-center justify-center mx-auto mb-4">
        <Target className="h-8 w-8 text-[#c9fa5f]" />
      </div>
      
      <h3 className="text-xl font-bold text-white text-center">
        Change Active Plan?
      </h3>
      
      <p className="text-sm text-gray-400 text-center leading-relaxed">
        You already have an active meal plan. Starting a new plan will delete your current progress and meal history.
      </p>
      
      <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-2">Current Active Plan:</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#c9fa5f]/20 flex items-center justify-center">
            {activePlan && PLANNER_CATEGORIES.find(c => c.id === activePlan.inputData?.health_goal)?.icon 
              ? (() => {
                  const Icon = PLANNER_CATEGORIES.find(c => c.id === activePlan.inputData?.health_goal)?.icon;
                  return Icon ? <Icon className="h-5 w-5 text-[#c9fa5f]" /> : "🍽️";
                })()
              : "🍽️"
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {activePlan && PLANNER_CATEGORIES.find(c => c.id === activePlan.inputData?.health_goal)?.name || "Meal Plan"}
            </p>
            <p className="text-xs text-gray-400">
              Day {activePlan?.currentDay || 1} of {activePlan?.totalDays || 0}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => {
            setShowChangePlanDialog(false);
            setSelectedCategory(null);
          }}
          className="flex-1 h-12 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#333333] rounded-xl font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (activePlan) {
              await deleteActivePlan(activePlan.inputId);
              setFormData({ ...formData, category: selectedCategory || "" });
              setView("questions");
              setCurrentStep(0);
            }
          }}
          className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
        >
          Change Plan
        </Button>
      </div>
    </div>
  </div>
)}


      {/* Recipe Modal */}
{selectedRecipe && (
  <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center animate-in fade-in duration-200">
    <div className="w-full sm:max-w-lg max-h-[85vh] bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl overflow-hidden border-t-2 sm:border-2 border-[#c9fa5f]/30 animate-in slide-in-from-bottom duration-300 sm:animate-none">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-[#c9fa5f]/20 to-[#a8d94f]/20 border-b border-[#c9fa5f]/30 p-6">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm hover:bg-black/50 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#c9fa5f] uppercase tracking-wide">
              {selectedRecipe.mealType}
            </p>
            <p className="text-xs text-gray-400">{selectedRecipe.day} • {selectedRecipe.time}</p>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white leading-tight">
          {selectedRecipe.meal}
        </h3>
      </div>

      {/* Content */}
<div className="overflow-y-auto max-h-[calc(85vh-140px)]">
  {/* Hero Image Placeholder */}
  <div className="relative h-48 bg-gradient-to-br from-[#c9fa5f]/20 to-[#a8d94f]/20">
    <div className="absolute inset-0 flex items-center justify-center">
      <ChefHat className="h-20 w-20 text-black" />
    </div>
  </div>

  <div className="p-6 space-y-6">
    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#c9fa5f] flex items-center justify-center">
          <Flame className="h-6 w-6 text-black" />
        </div>
        <p className="text-2xl font-bold text-white">{selectedRecipe.calories}</p>
        <p className="text-xs text-gray-400 mt-1">Calories</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#c9fa5f] flex items-center justify-center">
          <Clock className="h-6 w-6 text-black" />
        </div>
        <p className="text-2xl font-bold text-white">30</p>
        <p className="text-xs text-gray-400 mt-1">Minutes</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#c9fa5f] flex items-center justify-center">
          <Users className="h-6 w-6 text-black" />
        </div>
        <p className="text-2xl font-bold text-white">1</p>
        <p className="text-xs text-gray-400 mt-1">Serving</p>
      </div>
    </div>

    {/* Ingredients Section */}
    <div className="bg-[#0a0a0a] rounded-sm p-5 border border-[#333333]">
      <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <Salad className="h-5 w-5 text-[#c9fa5f]" />
        Ingredients
      </h4>
      <div className="space-y-2">
        {(() => {
          // Parse ingredients from description or use dummy data
          const dummyIngredients = [
            "2 cups rice",
            "1 cup lentils",
            "1 onion, chopped",
            "2 tomatoes, diced",
            "Spices to taste"
          ];
          
          return dummyIngredients.map((ingredient, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-[#c9fa5f]" />
              <span className="text-gray-300">{ingredient}</span>
            </div>
          ));
        })()}
      </div>
    </div>

    {/* Instructions with Steps */}
    <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-[#333333]">
      <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-[#c9fa5f]" />
        Preparation Steps
      </h4>
      <div className="space-y-4">
        {(() => {
          // Split description into steps or create structured steps
          const steps = selectedRecipe.description
            ? selectedRecipe.description.split(/\d+\.|Step \d+:?/).filter(s => s.trim())
            : [
                "Prepare all ingredients by washing and chopping as needed.",
                "Heat oil in a pan over medium heat.",
                "Add the main ingredients and cook until tender.",
                "Season with spices and salt to taste.",
                "Serve hot and enjoy your meal!"
              ];
          
          return steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9fa5f] to-[#a8d94f] flex items-center justify-center">
                  <span className="text-sm font-bold text-black">{idx + 1}</span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-300 leading-relaxed">{step.trim()}</p>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>

    {/* Nutrition Info */}
   

    {/* Action Buttons */}
    <div className="flex gap-3 pt-2">
      <Button
        onClick={() => setSelectedRecipe(null)}
        className="flex-1 h-12 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#333333] rounded-xl font-semibold"
      >
        Close
      </Button>
      <Button
        className="flex-1 h-12 bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-bold rounded-xl shadow-lg"
      >
        <Heart className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  </div>
</div>
    </div>
  </div>
)}

{/* Daily Challenge Card */}
{view === "categories" && !showSaved && !showOngoingScreen && (
  <div className="mx-1.5 mb-6">
    <div className="rounded-sm bg-gradient-to-br from-[#c9fa5f] to-[#a8d94f] overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => activePlan && setShowDailyChallenge(!showDailyChallenge)}
        className={`w-full p-5 flex items-center justify-between ${
          activePlan ? 'cursor-pointer hover:bg-black/5' : 'cursor-default'
        } transition-colors relative`}
        disabled={!activePlan}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full -ml-12 -mb-12" />
        </div>

        <div className="relative z-10 text-left flex-1">
          <h3 className="text-2xl font-bold text-black mb-1">
            {activePlan ? "Daily Challenge" : "Set Your Challenge"}
          </h3>
          <p className="text-sm text-black/80">
  {activePlan ? (
    <>
      {selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })}
      {selectedDate.toDateString() !== new Date().toDateString() && (
        <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-md text-xs font-semibold">
          {selectedDate < new Date() ? "Past" : "Upcoming"}
        </span>
      )}
    </>
  ) : (
    "Create a plan to begin tracking"
  )}
</p>
          
          {activePlan && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChangePlanDialog(true);
              }}
              className="mt-2 text-xs text-black/80 hover:text-black font-semibold underline"
            >
              Change Plan
            </button>
          )}
        </div>

        {activePlan && (
          <ChevronRight 
            className={`h-6 w-6 text-black/60 transition-transform duration-300 ${
              showDailyChallenge ? 'rotate-90' : ''
            } relative z-10`}
          />
        )}

        {/* Character Image Placeholder */}
        <div className="absolute right-4 bottom-0 w-20 h-20 pointer-events-none">
          <div className="w-full h-full bg-black/10 rounded-t-full" />
        </div>
      </button>

      {/* Expandable Content - Meal Tracker */}
      {activePlan && (
        <div 
          className={`transition-all duration-300 ease-in-out ${
            showDailyChallenge ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden bg-gradient-to-br from-[#b8e954] to-[#a8d94f]`}
        >
          <div className="p-5 border-t-2 border-black/10">
            <DailyChallengeTracker
              activePlan={activePlan}
              selectedDate={selectedDate}
              userId={userId}
              updateStreak={updateStreak}
            />
          </div>
        </div>
      )}
    </div>
  </div>
)}


    </div>
  );
}
