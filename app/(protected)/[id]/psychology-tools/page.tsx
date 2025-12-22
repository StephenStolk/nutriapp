"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, Battery, Users, Cloud, ArrowLeft, TrendingUp,
  Heart, Award, AlertCircle, Clock, Zap, Moon, Droplets, Apple, Bell, ArrowUpRight
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { BodyBattery } from "@/components/body-battery"
import { NutritionPersonalityQuiz } from "@/components/nutrition-personality-quiz"
import { WordCloud } from "@/components/word-cloud"
import { FoodConsistencyRadar } from "@/components/food-consistency-radar"
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Label } from "recharts"
import { set } from "date-fns"

type ActivePage =
  | "landing"
  | "home"
  | "dashboard"
  | "meal-planner"
  | "profile"
  | "quick-meals"
  | "todos"
  | "journal"

interface InsightsState {
  guiltFreeScore: number
  guiltTrend: number
  emotionalHungerRate: number
  cravingPatterns: Array<{ type: string; trigger: string; count: number }>
  stressEatingDays: number
  microWins: number
  batteryScore: number
  factors: {
    sleep: number
    stress: number
    calories: number
    hydration: number
  }
}

export default function PsychologyToolsPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const supabase = createClient()

  const [showBodyBattery, setShowBodyBattery] = useState(false)
  const [showPersonalityQuiz, setShowPersonalityQuiz] = useState(false)
  const [showWordCloud, setShowWordCloud] = useState(false)
  const [showConsistencyRadar, setShowConsistencyRadar] = useState(false)

  const [activePage, setActivePage] = useState<ActivePage>("landing")
  const [shortName, setShortName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [profilename, setProfilename] = useState<string>("")
  

  const [insights, setInsights] = useState<InsightsState>({
    guiltFreeScore: 0,
    guiltTrend: 0,
    emotionalHungerRate: 0,
    cravingPatterns: [],
    stressEatingDays: 0,
    microWins: 0,
    batteryScore: 0,
    factors: {
      sleep: 0,
      stress: 0,
      calories: 0,
      hydration: 0
    }
  })

  useEffect(() => {
  const fetchUserName = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    let displayName: string
    
    if (data?.username) {
      // Priority 1: If username exists in profiles table, use it
      displayName = data.username.slice(0, 2).toUpperCase()
      setProfilename(data.username)
    } else if (user.user_metadata?.name) {
      // Priority 2: Use display name from user metadata
      displayName = user.user_metadata.name.slice(0, 2).toUpperCase()
      setProfilename(user.user_metadata.name)
    } else {
      // Priority 3: Fall back to email prefix
      displayName = user.email?.split("@")[0].slice(0, 2).toUpperCase() ?? "U"
    }

    setShortName(displayName)
  }

  fetchUserName()
  loadAllInsights()
}, [])

  const loadAllInsights = async () => {
    setLoading(true)
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]

      // Load Psychology Insights
      const { data: guiltLogs } = await supabase
        .from('guilt_free_logs')
        .select('sentiment_score')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      let guiltScore = 100
      if (guiltLogs && guiltLogs.length > 0) {
        const avgSentiment = guiltLogs.reduce((acc, log) => acc + (log.sentiment_score || 0), 0) / guiltLogs.length
        guiltScore = Math.round(50 + (avgSentiment * 50))
      }

      const { data: hungerChecks } = await supabase
        .from('emotional_hunger_checks')
        .select('is_emotional')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      const emotionalRate = hungerChecks && hungerChecks.length > 0
        ? Math.round((hungerChecks.filter(h => h.is_emotional).length / hungerChecks.length) * 100)
        : 0

      const { data: cravings } = await supabase
        .from('craving_logs')
        .select('craving_type, trigger')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      const patternMap: Record<string, number> = {}
      cravings?.forEach(c => {
        const key = `${c.craving_type}-${c.trigger}`
        patternMap[key] = (patternMap[key] || 0) + 1
      })

      const topPatterns = Object.entries(patternMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pattern, count]) => {
          const [type, trigger] = pattern.split('-')
          return { type, trigger, count }
        })

      const { data: stressLogs } = await supabase
        .from('stress_logs')
        .select('stress_level')
        .eq('user_id', userId)
        .eq('stress_level', 'high')
        .gte('date', weekAgoStr)

      const { data: wins } = await supabase
        .from('micro_wins')
        .select('points')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      const totalWins = wins?.reduce((acc, w) => acc + (w.points || 1), 0) || 0

      // Load Body Battery
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('hours')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      const { data: stressData } = await supabase
        .from('stress_logs')
        .select('stress_level')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      const { data: foodData } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      const totalCals = foodData?.reduce((sum, f) => sum + (Number(f.calories) || 0), 0) || 0

      const { data: hydrationData } = await supabase
        .from('hydration_logs')
        .select('glasses')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      const sleepScore = Math.min(((sleepData?.hours || 7) / 8) * 100, 100)
      const stressScore = stressData?.stress_level === 'low' ? 100 : stressData?.stress_level === 'medium' ? 60 : 30
      const calorieScore = totalCals >= 1500 && totalCals <= 2500 ? 100 : totalCals < 1500 ? 50 : 70
      const hydrationScore = Math.min(((hydrationData?.glasses || 8) / 8) * 100, 100)

      const battery = Math.round(
        sleepScore * 0.4 + stressScore * 0.3 + calorieScore * 0.2 + hydrationScore * 0.1
      )

      setInsights({
        guiltFreeScore: guiltScore,
        guiltTrend: guiltScore >= 70 ? 1 : guiltScore >= 50 ? 0 : -1,
        emotionalHungerRate: emotionalRate,
        cravingPatterns: topPatterns,
        stressEatingDays: stressLogs?.length || 0,
        microWins: totalWins,
        batteryScore: battery,
        factors: {
          sleep: Math.round(sleepScore),
          stress: Math.round(stressScore),
          calories: Math.round(calorieScore),
          hydration: Math.round(hydrationScore)
        }
      })
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigation = (page: ActivePage) => {
    setActivePage(page)
    if (page === "home" || page === "dashboard") {
      router.push(`/${userId}/nutrition`)
    }
    if (page === "profile") {
      router.push(`/${userId}/profile`)
    }
  }


  const getBatteryColor = () => {
    if (insights.batteryScore >= 70) return "text-[#c9fa5f]"
    if (insights.batteryScore >= 40) return "text-yellow-500"
    return "text-orange-500"
  }

  const getBatteryFill = () => {
    if (insights.batteryScore >= 70) return "#c9fa5f"
    if (insights.batteryScore >= 40) return "#eab308"
    return "#f97316"
  }

  return (
    <>
      {/* Single Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 pt-8">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Kalnut.</h1>

            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Appearance</Label>
                <ThemeToggle />
              </div> */}

              <button
                onClick={() => handleNavigation("profile")}
                className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Open profile"
              >
                <Avatar className="h-8 w-8 bg-[#c9fa5f] rounded-full flex items-center justify-center">
                  <AvatarFallback className="text-sm font-semibold text-black">
                    {shortName}
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Wrapper */}
      <div className="min-h-screen bg-background">
        {/* Hero Section - Redesigned */}
        <div className="relative bg-black pt-6 pb-0">
  <div className="container mx-auto px-4 max-w-5xl">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push(`/${userId}/nutrition`)}
      className="mb-6 ml-2 text-gray-400 hover:text-white hover:bg-gray-900"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>

    <div className="flex items-center gap-4 mb-2 mx-3 bg-[#161616] rounded-sm px-4 py-6">
      <div className="w-10 h-10 rounded-2xl bg-[#c9fa5f] flex items-center justify-center">
        <Brain className="h-5 w-5 text-black" />
      </div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Hello {profilename}</p>
        <h1 className="text-md font-bold text-white">Psychology Hub</h1>
      </div>
    </div>
    <p className="text-gray-400 text-sm flex mx-auto justify-center">
      Your behavioral patterns & mental insights
    </p>
  </div>
</div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 max-w-5xl space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              
{/* Psychology Metrics Grid */}
<div>
  <h3 className="text-lg font-semibold text-white mb-4 mx-3">
    Health Metrics
  </h3>

  <div className="grid grid-cols-2 gap-3 mx-3">

    {/* Guilt-Free Score */}
    {/* #1E201E
    
    #282D28 */}
    <Card className="p-4 bg-[#161616] rounded-2xl border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Guilt-Free</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <Brain className="h-5 w-5 text-[#c9fa5f]" />
        </div>
      </div>

      <div className="flex items-end gap-2 mb-1">
        <div className="text-3xl font-bold text-white">{insights.guiltFreeScore}</div>
        {insights.guiltTrend > 0 && (
          <TrendingUp className="h-4 w-4 text-[#c9fa5f] mb-1" />
        )}
      </div>

      <div className="text-xs text-gray-500">Score</div>
    </Card>

    {/* Emotional Hunger */}
    
    {/* #090909 */}
    
    {/* bg-[#708090]/20 */}
    <Card className="p-4 bg-[#161616] rounded-2xl border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Emotional</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <Heart className="h-5 w-5 text-[#c9fa5f]" />
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-1">
        {insights.emotionalHungerRate}
      </div>

      <div className="text-xs text-gray-500">Hunger Rate %</div>
    </Card>

    {/* Body Battery */}
    <Card
      className="p-4 bg-[#161616] rounded-2xl border border-gray-800 cursor-pointer"
      onClick={() => setShowBodyBattery(true)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Body Battery</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <Battery className="h-5 w-5 text-[#c9fa5f]" />
        </div>
      </div>

      <div className={`text-3xl font-bold mb-1 ${getBatteryColor()}`}>
        {insights.batteryScore}
      </div>

      <div className="flex items-end justify-between gap-3">
  <div className="text-xs text-gray-500 whitespace-nowrap">
    Energy Level
  </div>

  {/* Mini sparkline */}
  <div className="flex items-end gap-1 h-10 flex-1">
    {[
      { val: insights.factors.sleep, color: "bg-[#c9fa5f]" },
      { val: insights.factors.stress, color: "bg-[#c9fa5f]" },
      { val: insights.factors.calories, color: "bg-[#c9fa5f]" },
      { val: insights.factors.hydration, color: "bg-[#c9fa5f]" }
    ].map((item, i) => (
      <div
        key={i}
        className={`flex-1 ${item.color} rounded-t`}
        style={{
          height: `${Math.max((item.val / 100) * 100, 5)}%`
        }}
      />
    ))}
  </div>
</div>

    </Card>

    {/* Micro Wins */}
    <Card className="p-4 bg-[#161616] rounded-2xl border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Micro Wins</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <Award className="h-5 w-5 text-[#c9fa5f]" />
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-1">
        {insights.microWins}
      </div>

      <div className="flex items-end justify-between gap-3">
       <div className="text-xs text-gray-500">This Week</div>

      {/* Wavy line */}
      <svg className="mt-1 w-full h-10" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d="M0,20 Q20,5 35,18 T70,15 T100,10"
          fill="none"
          stroke="#c9fa5f"
          strokeWidth="2"
          opacity="0.6"
        />
      </svg>
</div>

    </Card>
  </div>
</div>

{/* Psychology Grade - Hero Card */}
<Card className="relative overflow-hidden bg-[#161616] p-6 border border-gray-800 mx-3 rounded-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Mental Health Grade</h3>
                    <p className="text-sm text-gray-400 max-w-xs">
                      Perfect progress! Keep going with your psychology insights
                    </p>
                  </div>
                  <div className="relative">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#c9fa5f"
                        strokeWidth="8"
                        strokeDasharray={`${(insights.guiltFreeScore / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#c9fa5f] mb-2">{insights.guiltFreeScore}</span>
                    </div>
                  </div>
                </div>
              </Card>

  {/* Recent Activity - Stress Pattern */}
<div>
  <h3 className="text-lg font-semibold text-white mt-8 mb-4 mx-3">Stress Pattern</h3>
  <Card className="p-5 mx-3 bg-[#161616] border border-gray-800 rounded-sm">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-[#c9fa5f]" />
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">High Stress Days</div>
          <div className="text-3xl font-bold text-white">{insights.stressEatingDays}</div>
        </div>
      </div>
      <div className="px-3 py-1 bg-gray-800 rounded-lg">
        <span className="text-xs text-gray-400">This Week</span>
      </div>
    </div>
    
    {/* Bar chart */}
    <div className="flex items-end justify-between h-32 gap-2">
      {[65, 45, 80, 55, 90, 70, 50].map((height, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div 
            className={`w-full rounded-t-lg transition-all ${
              height > 70 ? 'bg-[#c9fa5f]' : 'bg-gray-700'
            }`}
            style={{ height: `${height}%` }}
          />
          <span className="text-xs text-gray-500 font-medium">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
          </span>
        </div>
      ))}
    </div>
  </Card>
</div>

              {/* Craving Triggers */}
              {/* Craving Triggers */}
{insights.cravingPatterns.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">Top Craving Triggers</h3>
    <div className="space-y-3">
      {insights.cravingPatterns.map((pattern, idx) => (
        <Card key={idx} className="p-4 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#c9fa5f]/10 flex items-center justify-center">
                <Apple className="h-6 w-6 text-[#c9fa5f]" />
              </div>
              <div>
                <div className="text-base font-semibold text-white capitalize mb-1">{pattern.type}</div>
                <div className="text-sm text-gray-500 capitalize">{pattern.trigger.replace('_', ' ')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#c9fa5f]">{pattern.count}</div>
              <div className="text-xs text-gray-500">times</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)}

             <div className="pt-4">
  <h3 className="text-lg font-semibold text-foreground mb-4 mx-3">
    Psychology Tools
  </h3>

  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide mx-3 mb-8">

    {/* Trigger Word Cloud */}
    <Card
      className="min-w-[280px] h-[340px] overflow-hidden rounded-2xl cursor-pointer bg-[#161616] transition p-0"
      onClick={() => setShowWordCloud(true)}
    >
      <div
        className="h-1/2 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/psychology/word-cloud.png')" }}
      />

      <div className="h-1/2 p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
            <Cloud className="h-6 w-6 text-black" />
          </div>
          <ArrowUpRight className="h-5 w-5 text-gray-500" />
        </div>

        <div>
          <h4 className="text-base font-semibold text-foreground mb-1">
            Trigger Word Cloud
          </h4>
          <p className="text-xs text-muted-foreground">
            Visual map of your emotional eating triggers
          </p>
        </div>
      </div>
    </Card>

    {/* Body Battery */}
    <Card
      className="min-w-[280px] h-[340px] bg-[#161616] overflow-hidden rounded-2xl cursor-pointer transition p-0"
      onClick={() => setShowBodyBattery(true)}
    >
      <div
        className="h-1/2 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/psychology/body-battery.png')" }}
      />

      <div className="h-1/2 p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
            <Battery className="h-6 w-6 text-black" />
          </div>
          <ArrowUpRight className="h-5 w-5 text-gray-500" />
        </div>

        <div>
          <h4 className="text-base font-semibold text-white mb-1">
            Body Battery
          </h4>
          <p className="text-xs text-gray-400">
            Track your daily energy levels
          </p>
        </div>
      </div>
    </Card>

    {/* Nutrition Personality */}
    <Card
      className="min-w-[280px] h-[340px] overflow-hidden rounded-2xl cursor-pointer transition p-0 bg-[#161616]"
      onClick={() => setShowPersonalityQuiz(true)}
    >
      {/* Image – flush to top */}
      <div
        className="h-1/2 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/psychology/nutrition.png')" }}
      />

      {/* Content */}
      <div className="h-1/2 p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
            <Users className="h-6 w-6 text-black" />
          </div>
          <ArrowUpRight className="h-5 w-5 text-gray-500" />
        </div>

        <div>
          <h4 className="text-base font-semibold text-foreground mb-1 mt-4">
            Nutrition Personality
          </h4>
          <p className="text-xs text-muted-foreground">
            Discover your eating identity & get personalized strategies
          </p>
        </div>
      </div>
    </Card>

  </div>
</div>


            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <BodyBattery isOpen={showBodyBattery} onClose={() => setShowBodyBattery(false)} />
      <NutritionPersonalityQuiz isOpen={showPersonalityQuiz} onClose={() => setShowPersonalityQuiz(false)} />
      <WordCloud isOpen={showWordCloud} onClose={() => setShowWordCloud(false)} />
      <FoodConsistencyRadar isOpen={showConsistencyRadar} onClose={() => setShowConsistencyRadar(false)} />
    </>
  )
}