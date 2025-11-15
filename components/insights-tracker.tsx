"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { useState, useEffect } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Cell } from "recharts"

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

interface InsightsTrackerProps {
  loggedFoods: LoggedFood[]
  dailyGoal: number
}

export function InsightsTracker({ loggedFoods, dailyGoal }: InsightsTrackerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly")
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleOpen = () => {
    setIsAnimating(true)
    setIsOpen(true)

    document.body.style.overflow = 'hidden'
  }

  const handleClose = () => {
    setIsAnimating(false)
    document.body.style.overflow = 'unset'

    setTimeout(() => setIsOpen(false), 300)
  }

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getWeekData = (offset: number = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay + 1 + (offset * 7))
    
    const weekData = []
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateString = date.toDateString()
      
      const dayFoods = loggedFoods.filter(food => 
        new Date(food.timestamp).toDateString() === dateString
      )
      
      const breakfast = dayFoods.filter(f => f.mealType === "breakfast").reduce((sum, f) => sum + f.calories, 0)
      const lunch = dayFoods.filter(f => f.mealType === "lunch").reduce((sum, f) => sum + f.calories, 0)
      const dinner = dayFoods.filter(f => f.mealType === "dinner").reduce((sum, f) => sum + f.calories, 0)
      const snacks = dayFoods.filter(f => f.mealType === "snacks").reduce((sum, f) => sum + f.calories, 0)
      const total = breakfast + lunch + dinner + snacks
      
      weekData.push({
        day: days[i],
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        breakfast,
        lunch,
        dinner,
        snacks,
        total,
        protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
        carbs: dayFoods.reduce((sum, f) => sum + f.carbs, 0),
        fat: dayFoods.reduce((sum, f) => sum + f.fat, 0),
      })
    }
    
    return weekData
  }

  const getMonthData = (offset: number = 0) => {
    const today = new Date()
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    
    const monthData = []
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), i)
      const dateString = date.toDateString()
      
      const dayFoods = loggedFoods.filter(food => 
        new Date(food.timestamp).toDateString() === dateString
      )
      
      const breakfast = dayFoods.filter(f => f.mealType === "breakfast").reduce((sum, f) => sum + f.calories, 0)
      const lunch = dayFoods.filter(f => f.mealType === "lunch").reduce((sum, f) => sum + f.calories, 0)
      const dinner = dayFoods.filter(f => f.mealType === "dinner").reduce((sum, f) => sum + f.calories, 0)
      const snacks = dayFoods.filter(f => f.mealType === "snacks").reduce((sum, f) => sum + f.calories, 0)
      const total = breakfast + lunch + dinner + snacks
      
      monthData.push({
        day: i,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        breakfast,
        lunch,
        dinner,
        snacks,
        total,
        protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
        carbs: dayFoods.reduce((sum, f) => sum + f.carbs, 0),
        fat: dayFoods.reduce((sum, f) => sum + f.fat, 0),
      })
    }
    
    return monthData
  }

  const weekData = getWeekData(currentWeekOffset)
  const monthData = getMonthData(currentMonthOffset)
  const currentData = viewMode === "weekly" ? weekData : monthData

  const totalCalories = currentData.reduce((sum, day) => sum + day.total, 0)
  const totalProtein = currentData.reduce((sum, day) => sum + day.protein, 0)
  const totalCarbs = currentData.reduce((sum, day) => sum + day.carbs, 0)
  const totalFat = currentData.reduce((sum, day) => sum + day.fat, 0)
  const average = totalCalories / (currentData.filter(d => d.total > 0).length || 1)

  const getCurrentPeriod = () => {
    if (viewMode === "weekly") {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1 + (currentWeekOffset * 7))
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    } else {
      const month = new Date()
      month.setMonth(month.getMonth() + currentMonthOffset)
      return month.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-950 border-2 border-[#c9fa5f]/30 rounded-xl p-4 shadow-2xl backdrop-blur-md">
          <p className="text-sm font-bold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-gray-300 flex items-center justify-between gap-4">
              <span className="capitalize font-medium">{entry.name}:</span>
              <span className="font-bold text-[#c9fa5f]">{entry.value} {entry.unit || 'cal'}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

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
              <p className="text-xs text-muted-foreground">Detailed analytics & trends</p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-[#c9fa5f]/60 group-hover:text-[#c9fa5f] group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </Card>

      {/* Full Screen Modal */}
      {isOpen && (
        <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-xl transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`w-full h-full flex flex-col overflow-hidden transition-transform duration-300 ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}>
            
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
                    <p className="text-sm text-gray-400">Your health analytics dashboard</p>
                  </div>

                  <div className="w-11" /> {/* Spacer for centering */}
                </div>

                {/* Period Navigation */}
                <div className="flex items-center justify-between rounded-[5px] p-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (viewMode === "weekly") setCurrentWeekOffset(currentWeekOffset - 1)
                      else setCurrentMonthOffset(currentMonthOffset - 1)
                    }}
                    className="h-10 w-10 p-0 rounded-full hover:bg-[#c9fa5f]/20"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </Button>
                  <span className="text-sm md:text-base font-bold text-white px-2 text-center">{getCurrentPeriod()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (viewMode === "weekly") setCurrentWeekOffset(currentWeekOffset + 1)
                      else setCurrentMonthOffset(currentMonthOffset + 1)
                    }}
                    disabled={viewMode === "weekly" ? currentWeekOffset >= 0 : currentMonthOffset >= 0}
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 space-y-6">
                
                {/* Stats Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all">
                    <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Total Calories</div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-1">{totalCalories.toLocaleString()}</div>
                    <div className="text-xs text-[#c9fa5f] font-bold">
                      ⌀ {Math.round(average)} cal/day
                    </div>
                  </div>
                  <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                    <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Protein</div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-1">{Math.round(totalProtein)}g</div>
                    <div className="text-xs text-[#c9fa5f] font-bold">
                      ⌀ {Math.round(totalProtein / (currentData.filter(d => d.total > 0).length || 1))}g/day
                    </div>
                  </div>
                  <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                    <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Carbs</div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-1">{Math.round(totalCarbs)}g</div>
                    <div className="text-xs text-[#c9fa5f] font-bold">
                      ⌀ {Math.round(totalCarbs / (currentData.filter(d => d.total > 0).length || 1))}g/day
                    </div>
                  </div>
                  <div className="p-5 rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-2 border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all backdrop-blur-sm">
                    <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Fat</div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-1">{Math.round(totalFat)}g</div>
                    <div className="text-xs text-[#c9fa5f] font-bold">
                      ⌀ {Math.round(totalFat / (currentData.filter(d => d.total > 0).length || 1))}g/day
                    </div>
                  </div>
                </div>

                {/* Calorie Trend Area Chart */}
                <div className="w-full mx-auto p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-md text-white">Daily Calorie Intake</h3>
                        <p className="text-xs text-gray-400">Track your energy consumption</p>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={currentData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c9fa5f" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#c9fa5f" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
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


                {/* Meal Distribution Stacked Bar Chart */}
                <div className="w-full flex flex-col mx-auto justify-center p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-12 h-12">
                        <Utensils className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-md text-white">Meal Distribution</h3>
                        <p className="text-xs text-gray-400">Breakdown by meal type</p>
                      </div>
                    </div>
                    
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey={viewMode === "weekly" ? "day" : "date"} 
                        stroke="#9CA3AF"
                        fontSize={11}
                        fontWeight={600}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={11} fontWeight={600} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: "20px" }} 
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-300 font-semibold text-xs">{value}</span>}
                      />
                      <Bar dataKey="breakfast" stackId="a" fill="#FFB84D" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="lunch" stackId="a" fill="#c9fa5f" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="dinner" stackId="a" fill="#FF6B9D" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="snacks" stackId="a" fill="#A78BFA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Macronutrient Trends Line Chart */}
                <div className="w-full flex flex-col mx-auto justify-center p-2 rounded-[5px] border-[#c9fa5f]/20 mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-md text-white">Macronutrient Trends</h3>
                        <p className="text-xs text-gray-400">Protein, carbs, and fat over time</p>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey={viewMode === "weekly" ? "day" : "date"} 
                        stroke="#9CA3AF"
                        fontSize={11}
                        fontWeight={600}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={11} fontWeight={600} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: "20px" }} 
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-300 font-semibold text-xs">{value}</span>}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="protein" 
                        stroke="#60A5FA" 
                        strokeWidth={4}
                        dot={{ fill: "#60A5FA", r: 6, strokeWidth: 2, stroke: "#1E3A8A" }}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="carbs" 
                        stroke="#FB923C" 
                        strokeWidth={4}
                        dot={{ fill: "#FB923C", r: 6, strokeWidth: 2, stroke: "#7C2D12" }}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fat" 
                        stroke="#C084FC" 
                        strokeWidth={4}
                        dot={{ fill: "#C084FC", r: 6, strokeWidth: 2, stroke: "#581C87" }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

            </div>

              {/* Daily Breakdown - Separate Section */}
              <div className="mt-12">
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-12 h-12 ml-1">
                      <PieChart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-md text-white">Daily Breakdown</h3>
                      <p className="text-xs text-gray-400">Detailed day-by-day analysis</p>
                    </div>
                  </div>

                  <div className="space-y-3 pb-20">
                    {currentData.map((day, index) => (
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
                              day.total >= dailyGoal * 0.8 && day.total <= dailyGoal * 1.2
                                ? "bg-[#c9fa5f] text-black border-2 border-[#c9fa5f]"
                                : "bg-transparent text-white"
                            }`}
                          >
                            {day.total >= dailyGoal * 0.8 && day.total <= dailyGoal * 1.2
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
                              <div className="text-xs text-gray-400 font-semibold">Breakfast</div>
                              <div className="text-sm font-bold text-white">{day.breakfast} cal</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 rounded-[5px] p-3">
                            <Utensils className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-gray-400 font-semibold">Lunch</div>
                              <div className="text-sm font-bold text-white">{day.lunch} cal</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 rounded-[5px] p-3">
                            <Utensils className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-gray-400 font-semibold">Dinner</div>
                              <div className="text-sm font-bold text-white">{day.dinner} cal</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 rounded-[5px] p-3">
                            <Cookie className="h-5 w-5 text-[#c9fa5f] flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-gray-400 font-semibold">Snacks</div>
                              <div className="text-sm font-bold text-white">{day.snacks} cal</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}