"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, CheckCircle2 } from "lucide-react";
import { Circle } from "lucide-react";
import {
  Coffee,
  Utensils,
  Cookie,
  Calendar,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  Cell,
} from "recharts";

interface LoggedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  timestamp: Date;
}

// REPLACE the InsightsTrackerProps interface (lines 28-31) with:

interface Habit {
  id: string;
  name: string;
  icon?: string;
  color?: string | null;
  created_at?: string | null;
}

interface HabitLog {
  id?: string;
  habit_id?: string;
  date: string;
  completed: boolean;
  created_at?: string | null;
}

interface HabitDataPoint {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface InsightsTrackerProps {
  loggedFoods: LoggedFood[];
  dailyGoal: number;
  habits: Habit[];
  habitLogs: HabitLog[];
  weeklyHabitData: HabitDataPoint[];
  monthlyHabitData: HabitDataPoint[];
}

export function InsightsTracker({
  loggedFoods,
  dailyGoal,
  habits,
  habitLogs,
  weeklyHabitData,
  monthlyHabitData,
}: InsightsTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dataView, setDataView] = useState<"calories" | "habits">("calories");

  const handleOpen = () => {
    setIsAnimating(true);
    setIsOpen(true);

    document.body.style.overflow = "hidden";
  };

  const handleClose = () => {
    setIsAnimating(false);
    document.body.style.overflow = "unset";

    setTimeout(() => setIsOpen(false), 300);
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getWeekData = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1 + offset * 7);

    const weekData = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toDateString();

      const dayFoods = loggedFoods.filter(
        (food) => new Date(food.timestamp).toDateString() === dateString
      );

      const breakfast = dayFoods
        .filter((f) => f.mealType === "breakfast")
        .reduce((sum, f) => sum + f.calories, 0);
      const lunch = dayFoods
        .filter((f) => f.mealType === "lunch")
        .reduce((sum, f) => sum + f.calories, 0);
      const dinner = dayFoods
        .filter((f) => f.mealType === "dinner")
        .reduce((sum, f) => sum + f.calories, 0);
      const snacks = dayFoods
        .filter((f) => f.mealType === "snacks")
        .reduce((sum, f) => sum + f.calories, 0);
      const total = breakfast + lunch + dinner + snacks;

      weekData.push({
        day: days[i],
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        breakfast,
        lunch,
        dinner,
        snacks,
        total,
        protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
        carbs: dayFoods.reduce((sum, f) => sum + f.carbs, 0),
        fat: dayFoods.reduce((sum, f) => sum + f.fat, 0),
      });
    }

    return weekData;
  };

  const getMonthData = (offset: number = 0) => {
    const today = new Date();
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();

    const monthData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), i);
      const dateString = date.toDateString();

      const dayFoods = loggedFoods.filter(
        (food) => new Date(food.timestamp).toDateString() === dateString
      );

      const breakfast = dayFoods
        .filter((f) => f.mealType === "breakfast")
        .reduce((sum, f) => sum + f.calories, 0);
      const lunch = dayFoods
        .filter((f) => f.mealType === "lunch")
        .reduce((sum, f) => sum + f.calories, 0);
      const dinner = dayFoods
        .filter((f) => f.mealType === "dinner")
        .reduce((sum, f) => sum + f.calories, 0);
      const snacks = dayFoods
        .filter((f) => f.mealType === "snacks")
        .reduce((sum, f) => sum + f.calories, 0);
      const total = breakfast + lunch + dinner + snacks;

      monthData.push({
        day: i,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        breakfast,
        lunch,
        dinner,
        snacks,
        total,
        protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
        carbs: dayFoods.reduce((sum, f) => sum + f.carbs, 0),
        fat: dayFoods.reduce((sum, f) => sum + f.fat, 0),
      });
    }

    return monthData;
  };

  // ADD these functions AFTER getMonthData() function (around line 125):

  const getWeekHabitData = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1 + offset * 7);

    const weekData = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);

      const dayLogs = habitLogs.filter((log) => log.date === dateString);
      const completed = dayLogs.filter((log) => log.completed).length;
      const total = habits.length;

      weekData.push({
        day: days[i],
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return weekData;
  };

  const getMonthHabitData = (offset: number = 0) => {
    const today = new Date();
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();

    const monthData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), i);
      const dateString = date.toISOString().slice(0, 10);

      const dayLogs = habitLogs.filter((log) => log.date === dateString);
      const completed = dayLogs.filter((log) => log.completed).length;
      const total = habits.length;

      monthData.push({
        day: i,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return monthData;
  };

  // REPLACE the existing data variables (around line 127-132) with:

  const weekData = getWeekData(currentWeekOffset);
  const monthData = getMonthData(currentMonthOffset);
  const weekHabitData = getWeekHabitData(currentWeekOffset);
  const monthHabitData = getMonthHabitData(currentMonthOffset);

  const currentCalorieData = viewMode === "weekly" ? weekData : monthData;
  const currentHabitData =
    viewMode === "weekly" ? weekHabitData : monthHabitData;

  // Calorie stats
  const totalCalories = currentCalorieData.reduce(
    (sum, day) => sum + day.total,
    0
  );
  const totalProtein = currentCalorieData.reduce(
    (sum, day) => sum + day.protein,
    0
  );
  const totalCarbs = currentCalorieData.reduce(
    (sum, day) => sum + day.carbs,
    0
  );
  const totalFat = currentCalorieData.reduce((sum, day) => sum + day.fat, 0);
  const averageCalories =
    totalCalories / (currentCalorieData.filter((d) => d.total > 0).length || 1);

  // Habit stats
  const totalCompletedHabits = currentHabitData.reduce(
    (sum, day) => sum + day.completed,
    0
  );
  const totalPossibleHabits = currentHabitData.reduce(
    (sum, day) => sum + day.total,
    0
  );
  const averageHabitCompletion =
    totalPossibleHabits > 0
      ? Math.round((totalCompletedHabits / totalPossibleHabits) * 100)
      : 0;
  const averageHabitsPerDay =
    totalCompletedHabits /
    (currentHabitData.filter((d) => d.total > 0).length || 1);

  const currentData = viewMode === "weekly" ? weekData : monthData;

  const average =
    totalCalories / (currentData.filter((d) => d.total > 0).length || 1);

  const getCurrentPeriod = () => {
    if (viewMode === "weekly") {
      const startDate = new Date();
      startDate.setDate(
        startDate.getDate() - startDate.getDay() + 1 + currentWeekOffset * 7
      );
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      const month = new Date();
      month.setMonth(month.getMonth() + currentMonthOffset);
      return month.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };

  // REPLACE the CustomTooltip function (around line 150) with:

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-950 border-2 border-[#c9fa5f]/30 rounded-xl p-4 shadow-2xl backdrop-blur-md">
          <p className="text-sm font-bold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-xs text-gray-300 flex items-center justify-between gap-4"
            >
              <span className="capitalize font-medium">{entry.name}:</span>
              <span className="font-bold text-[#c9fa5f]">
                {entry.value}{" "}
                {entry.name === "percentage"
                  ? "%"
                  : entry.unit || (dataView === "calories" ? "cal" : "habits")}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Trigger Card */}
      <Card
        className="p-2 cursor-pointer transition-all duration-300 border-8 border-[#c9fa5f]/30 rounded-[5px] bg-gradient-to-br from-black/40 via-[#c9fa5f]/5 to-black/40 backdrop-blur-sm group hover:border-[#c9fa5f]"
        onClick={handleOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <BarChart3 className="h-4 w-3.7 text-black" />
            </div>
            <div className="mt-4">
              <h3 className="text-base text-foreground">Progress Insights</h3>
              <p className="text-xs text-muted-foreground">
                Detailed analytics & trends
              </p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-[#c9fa5f]/60 group-hover:text-[#c9fa5f] group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </Card>

      {/* Full Screen Modal */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-xl transition-opacity duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`w-full h-full flex flex-col overflow-hidden transition-transform duration-300 ${
              isAnimating ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Fixed Header */}
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-[#c9fa5f]/20">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-11 w-11 p-0 rounded-full hover:bg-[#c9fa5f]/20 transition-all"
                  >
                    <ChevronLeft className="h-4 w-3.7 text-white" />
                  </Button>
                  <div className="mt-4 text-center flex-1">
                    <h2 className="text-md md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#c9fa5f] via-[#b8e954] to-[#c9fa5f] animate-gradient">
                      Nutrition Insights
                    </h2>
                    <p className="text-sm text-gray-400">
                      Your health analytics dashboard
                    </p>
                  </div>
                  <div className="w-11" /> {/* Spacer for centering */}
                </div>

                {/* Period Navigation */}
                <div className="flex items-center justify-between rounded-[5px] p-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (viewMode === "weekly")
                        setCurrentWeekOffset(currentWeekOffset - 1);
                      else setCurrentMonthOffset(currentMonthOffset - 1);
                    }}
                    className="h-10 w-10 p-0 rounded-full hover:bg-[#c9fa5f]/20"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </Button>
                  <span className="text-sm md:text-base font-bold text-white px-2 text-center">
                    {getCurrentPeriod()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (viewMode === "weekly")
                        setCurrentWeekOffset(currentWeekOffset + 1);
                      else setCurrentMonthOffset(currentMonthOffset + 1);
                    }}
                    disabled={
                      viewMode === "weekly"
                        ? currentWeekOffset >= 0
                        : currentMonthOffset >= 0
                    }
                    className="h-10 w-10 p-0 rounded-full hover:bg-[#c9fa5f]/20 disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5 text-[#c9fa5f]" />
                  </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 p-1.5 rounded-[5px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("weekly")}
                    className={`flex-1 rounded-[5px] transition-all duration-200 font-semibold ${
                      viewMode === "weekly"
                        ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm shadow-[#c9fa5f]/50"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("monthly")}
                    className={`flex-1 rounded-[5px] transition-all duration-200 font-semibold ${
                      viewMode === "monthly"
                        ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm shadow-[#c9fa5f]/50"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Monthly
                  </Button>
                </div>
              </div>
            </div>
            // ADD this AFTER the Weekly/Monthly toggle buttons (after line
            281):
            {/* Data View Toggle - Calories vs Habits */}
            <div className="flex items-center gap-2 p-1.5 rounded-[5px] mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDataView("calories")}
                className={`flex-1 rounded-[5px] transition-all duration-200 font-semibold ${
                  dataView === "calories"
                    ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm shadow-[#c9fa5f]/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Apple className="h-4 w-4 mr-2" />
                Calories
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDataView("habits")}
                className={`flex-1 rounded-[5px] transition-all duration-200 font-semibold ${
                  dataView === "habits"
                    ? "bg-[#c9fa5f] text-black hover:bg-[#b8e954] shadow-sm shadow-[#c9fa5f]/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Habits
              </Button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 space-y-6">
                {/* Stats Overview Cards - Dynamic based on dataView */}
                {dataView === "calories" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Total Calories
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {totalCalories.toLocaleString()}
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        ⌀ {Math.round(averageCalories)} cal/day
                      </div>
                    </div>
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Protein
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {Math.round(totalProtein)}g
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        ⌀{" "}
                        {Math.round(
                          totalProtein /
                            (currentCalorieData.filter((d) => d.total > 0)
                              .length || 1)
                        )}
                        g/day
                      </div>
                    </div>
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Carbs
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {Math.round(totalCarbs)}g
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        ⌀{" "}
                        {Math.round(
                          totalCarbs /
                            (currentCalorieData.filter((d) => d.total > 0)
                              .length || 1)
                        )}
                        g/day
                      </div>
                    </div>
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Fat
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {Math.round(totalFat)}g
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        ⌀{" "}
                        {Math.round(
                          totalFat /
                            (currentCalorieData.filter((d) => d.total > 0)
                              .length || 1)
                        )}
                        g/day
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Completed
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {totalCompletedHabits}
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        Out of {totalPossibleHabits} total
                      </div>
                    </div>
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Success Rate
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {averageHabitCompletion}%
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        Overall completion
                      </div>
                    </div>
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Daily Average
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {averageHabitsPerDay.toFixed(1)}
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        Habits per day
                      </div>
                    </div>
                    <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                        Best Day
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {Math.max(...currentHabitData.map((d) => d.completed))}
                      </div>
                      <div className="text-xs text-[#c9fa5f] font-bold">
                        Max in period
                      </div>
                    </div>
                  </div>
                )}
                {/* Calorie Trend Area Chart */}
                {dataView === "calories" && (
                  <div className="w-full mx-auto p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-md text-white">
                            Daily Calorie Intake
                          </h3>
                          <p className="text-xs text-gray-400">
                            Track your energy consumption
                          </p>
                        </div>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={currentData}>
                        <defs>
                          <linearGradient
                            id="colorTotal"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#c9fa5f"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor="#c9fa5f"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey={viewMode === "weekly" ? "day" : "date"}
                          stroke="#9CA3AF"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#c9fa5f"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                        />
                        <Line
                          type="monotone"
                          dataKey={() => dailyGoal}
                          stroke="#6B7280"
                          strokeDasharray="8 8"
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Meal Distribution Stacked Bar Chart */}
                {dataView === "calories" && (
                  <div className="w-full flex flex-col mx-auto justify-center p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-12 h-12">
                          <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-md text-white">
                            Meal Distribution
                          </h3>
                          <p className="text-xs text-gray-400">
                            Breakdown by meal type
                          </p>
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={currentData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey={viewMode === "weekly" ? "day" : "date"}
                          stroke="#9CA3AF"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-gray-300 font-semibold text-xs">
                              {value}
                            </span>
                          )}
                        />
                        <Bar
                          dataKey="breakfast"
                          stackId="a"
                          fill="#FFB84D"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="lunch"
                          stackId="a"
                          fill="#c9fa5f"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="dinner"
                          stackId="a"
                          fill="#FF6B9D"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="snacks"
                          stackId="a"
                          fill="#A78BFA"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Macronutrient Trends Line Chart */}
                {dataView === "calories" && (
                  <div className="w-full flex flex-col mx-auto justify-center p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-md text-white">
                            Macronutrient Trends
                          </h3>
                          <p className="text-xs text-gray-400">
                            Protein, carbs, and fat over time
                          </p>
                        </div>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={currentData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey={viewMode === "weekly" ? "day" : "date"}
                          stroke="#9CA3AF"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-gray-300 font-semibold text-xs">
                              {value}
                            </span>
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="protein"
                          stroke="#60A5FA"
                          strokeWidth={4}
                          dot={{
                            fill: "#60A5FA",
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#1E3A8A",
                          }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="carbs"
                          stroke="#FB923C"
                          strokeWidth={4}
                          dot={{
                            fill: "#FB923C",
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#7C2D12",
                          }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="fat"
                          stroke="#C084FC"
                          strokeWidth={4}
                          dot={{
                            fill: "#C084FC",
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#581C87",
                          }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              {/* Habit Completion Trend Chart - Only show when dataView is "habits" */}
              {dataView === "habits" && (
                <div className="w-full mx-auto p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-md text-white">
                          Habit Completion Rate
                        </h3>
                        <p className="text-xs text-gray-400">
                          Track your consistency
                        </p>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={currentHabitData}>
                      <defs>
                        <linearGradient
                          id="colorHabits"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#c9fa5f"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#c9fa5f"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey={viewMode === "weekly" ? "day" : "date"}
                        stroke="#9CA3AF"
                        fontSize={11}
                        fontWeight={600}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={11} fontWeight={600} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Completed Habits"
                        stroke="#c9fa5f"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHabits)"
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total Habits"
                        stroke="#6B7280"
                        strokeDasharray="8 8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Habit Progress Bars */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-bold text-white mb-3">
                      Individual Habit Progress
                    </h4>
                    {habits.map((habit) => {
                      const habitCompletions = habitLogs.filter(
                        (log) =>
                          log.habit_id === habit.id &&
                          log.completed &&
                          (viewMode === "weekly"
                            ? currentHabitData.some(
                                (d) =>
                                  d.date ===
                                  new Date(log.date).toLocaleDateString(
                                    "en-US",
                                    { weekday: "short" }
                                  )
                              )
                            : true)
                      ).length;
                      const totalDays =
                        viewMode === "weekly" ? 7 : currentHabitData.length;
                      const percentage = (habitCompletions / totalDays) * 100;

                      return (
                        <div key={habit.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300 font-medium">
                              {habit.name}
                            </span>
                            <span className="text-[#c9fa5f] font-bold">
                              {habitCompletions}/{totalDays} (
                              {Math.round(percentage)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#c9fa5f] rounded-full transition-all duration-700"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              // ADD this AFTER the habit trend chart section:
              {dataView === "habits" && viewMode === "monthly" && (
                <div className="w-full mx-auto p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-12 h-12">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-md text-white">Habit Heatmap</h3>
                      <p className="text-xs text-gray-400">
                        Visual consistency tracker
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {currentHabitData.map((day, index) => {
                      const intensity =
                        day.total > 0 ? (day.completed / day.total) * 100 : 0;
                      const getColor = () => {
                        if (intensity === 0) return "bg-gray-800";
                        if (intensity < 25) return "bg-[#c9fa5f]/20";
                        if (intensity < 50) return "bg-[#c9fa5f]/40";
                        if (intensity < 75) return "bg-[#c9fa5f]/60";
                        return "bg-[#c9fa5f]";
                      };

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-lg ${getColor()} flex items-center justify-center text-xs font-bold transition-all hover:scale-110 hover:ring-2 hover:ring-[#c9fa5f] cursor-pointer group relative`}
                        >
                          <span
                            className={
                              intensity > 50 ? "text-black" : "text-white"
                            }
                          >
                            {day.day}
                          </span>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black border border-[#c9fa5f]/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="text-xs text-white font-bold">
                              {day.date}
                            </div>
                            <div className="text-xs text-gray-400">
                              {day.completed}/{day.total} habits (
                              {Math.round(intensity)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <span className="text-xs text-gray-400">Less</span>
                    <div className="w-4 h-4 rounded bg-gray-800"></div>
                    <div className="w-4 h-4 rounded bg-[#c9fa5f]/20"></div>
                    <div className="w-4 h-4 rounded bg-[#c9fa5f]/40"></div>
                    <div className="w-4 h-4 rounded bg-[#c9fa5f]/60"></div>
                    <div className="w-4 h-4 rounded bg-[#c9fa5f]"></div>
                    <span className="text-xs text-gray-400">More</span>
                  </div>
                </div>
              )}
              // ADD this section BEFORE the Daily Breakdown section (around
              line 480):
              {dataView === "calories" && (
                <div className="w-full mx-auto p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-12 h-12">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-md text-white">
                        Macronutrient Distribution
                      </h3>
                      <p className="text-xs text-gray-400">
                        Average daily breakdown
                      </p>
                    </div>
                  </div>

                  {/* Macronutrient Ratio Visualization */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Protein */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#374151"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#60A5FA"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${
                              (totalProtein /
                                (totalProtein + totalCarbs + totalFat)) *
                              251.2
                            } 251.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-white">
                            {Math.round(
                              (totalProtein /
                                (totalProtein + totalCarbs + totalFat)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-semibold mb-1">
                        Protein
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#60A5FA" }}
                      >
                        {Math.round(totalProtein)}g
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#374151"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#FB923C"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${
                              (totalCarbs /
                                (totalProtein + totalCarbs + totalFat)) *
                              251.2
                            } 251.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-white">
                            {Math.round(
                              (totalCarbs /
                                (totalProtein + totalCarbs + totalFat)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-semibold mb-1">
                        Carbs
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#FB923C" }}
                      >
                        {Math.round(totalCarbs)}g
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#374151"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#C084FC"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${
                              (totalFat /
                                (totalProtein + totalCarbs + totalFat)) *
                              251.2
                            } 251.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-white">
                            {Math.round(
                              (totalFat /
                                (totalProtein + totalCarbs + totalFat)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-semibold mb-1">
                        Fat
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#C084FC" }}
                      >
                        {Math.round(totalFat)}g
                      </div>
                    </div>
                  </div>

                  {/* Recommended vs Actual */}
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-bold text-white mb-3">
                      Recommended Balance
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Protein (25-30%)</span>
                        <span
                          className={`font-bold ${
                            (totalProtein /
                              (totalProtein + totalCarbs + totalFat)) *
                              100 >=
                              25 &&
                            (totalProtein /
                              (totalProtein + totalCarbs + totalFat)) *
                              100 <=
                              30
                              ? "text-[#c9fa5f]"
                              : "text-yellow-500"
                          }`}
                        >
                          {Math.round(
                            (totalProtein /
                              (totalProtein + totalCarbs + totalFat)) *
                              100
                          )}
                          %
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Carbs (45-55%)</span>
                        <span
                          className={`font-bold ${
                            (totalCarbs /
                              (totalProtein + totalCarbs + totalFat)) *
                              100 >=
                              45 &&
                            (totalCarbs /
                              (totalProtein + totalCarbs + totalFat)) *
                              100 <=
                              55
                              ? "text-[#c9fa5f]"
                              : "text-yellow-500"
                          }`}
                        >
                          {Math.round(
                            (totalCarbs /
                              (totalProtein + totalCarbs + totalFat)) *
                              100
                          )}
                          %
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Fat (20-30%)</span>
                        <span
                          className={`font-bold ${
                            (totalFat /
                              (totalProtein + totalCarbs + totalFat)) *
                              100 >=
                              20 &&
                            (totalFat /
                              (totalProtein + totalCarbs + totalFat)) *
                              100 <=
                              30
                              ? "text-[#c9fa5f]"
                              : "text-yellow-500"
                          }`}
                        >
                          {Math.round(
                            (totalFat /
                              (totalProtein + totalCarbs + totalFat)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Daily Breakdown - Separate Section */}
              <div className="mt-12">
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-12 h-12 ml-1">
                      <PieChart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-md text-white">Daily Breakdown</h3>
                      <p className="text-xs text-gray-400">
                        {dataView === "calories"
                          ? "Detailed nutrition analysis"
                          : "Habit completion details"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pb-20">
                    {dataView === "calories"
                      ? /* EXISTING CALORIE BREAKDOWN - Keep as is */
                        currentCalorieData.map((day, index) => (
                          <div
                            key={index}
                            className="p-5 m-1 border border-dotted border-white/10 rounded-[5px]"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-base font-black text-white">
                                  {viewMode === "weekly" ? day.day : day.date}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5 font-semibold">
                                  {day.total.toLocaleString()} cal total
                                </div>
                              </div>
                              <Badge
                                className={`px-4 py-1.5 font-bold text-xs ${
                                  day.total >= dailyGoal * 0.8 &&
                                  day.total <= dailyGoal * 1.2
                                    ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f]"
                                    : "bg-transparent text-white"
                                }`}
                              >
                                {day.total >= dailyGoal * 0.8 &&
                                day.total <= dailyGoal * 1.2
                                  ? "✓ On Track"
                                  : day.total < dailyGoal * 0.8
                                  ? "↓ Below"
                                  : "↑ Above"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex items-center space-x-3 rounded-[5px] p-3">
                                <Coffee className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-400 font-semibold">
                                    Breakfast
                                  </div>
                                  <div className="text-sm font-bold text-white">
                                    {day.breakfast} cal
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 rounded-[5px] p-3">
                                <Utensils className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-400 font-semibold">
                                    Lunch
                                  </div>
                                  <div className="text-sm font-bold text-white">
                                    {day.lunch} cal
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 rounded-[5px] p-3">
                                <Utensils className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-400 font-semibold">
                                    Dinner
                                  </div>
                                  <div className="text-sm font-bold text-white">
                                    {day.dinner} cal
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 rounded-[5px] p-3">
                                <Cookie className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-400 font-semibold">
                                    Snacks
                                  </div>
                                  <div className="text-sm font-bold text-white">
                                    {day.snacks} cal
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      : /* NEW HABIT BREAKDOWN */
                        currentHabitData.map((day, index) => {
                          const dateString =
                            viewMode === "weekly"
                              ? new Date(
                                  new Date().setDate(
                                    new Date().getDate() -
                                      new Date().getDay() +
                                      1 +
                                      index +
                                      currentWeekOffset * 7
                                  )
                                )
                                  .toISOString()
                                  .slice(0, 10)
                              : new Date(
                                  new Date().getFullYear(),
                                  new Date().getMonth() + currentMonthOffset,
                                  +day.day
                                )
                                  .toISOString()
                                  .slice(0, 10);

                          const dayHabitLogs = habitLogs.filter(
                            (log) => log.date === dateString
                          );

                          return (
                            <div
                              key={index}
                              className="p-5 m-1 border border-dotted border-white/10 rounded-[5px]"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className="text-base font-black text-white">
                                    {viewMode === "weekly" ? day.day : day.date}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5 font-semibold">
                                    {day.completed}/{day.total} habits completed
                                  </div>
                                </div>
                                <Badge
                                  className={`px-4 py-1.5 font-bold text-xs ${
                                    day.completed === day.total && day.total > 0
                                      ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f]"
                                      : "bg-transparent text-white"
                                  }`}
                                >
                                  {day.completed === day.total && day.total > 0
                                    ? "✓ Perfect"
                                    : `${day.percentage}%`}
                                </Badge>
                              </div>

                              {/* Individual Habits */}
                              <div className="space-y-2">
                                {habits.map((habit) => {
                                  const habitLog = dayHabitLogs.find(
                                    (log) => log.habit_id === habit.id
                                  );
                                  const isCompleted =
                                    habitLog?.completed || false;

                                  return (
                                    <div
                                      key={habit.id}
                                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                        isCompleted
                                          ? "bg-[#c9fa5f]/10 border border-[#c9fa5f]/30"
                                          : "bg-gray-800/30"
                                      }`}
                                    >
                                      <span
                                        className={`text-sm font-medium ${
                                          isCompleted
                                            ? "text-[#c9fa5f]"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {habit.name}
                                      </span>
                                      {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-[#c9fa5f]" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-gray-600" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
