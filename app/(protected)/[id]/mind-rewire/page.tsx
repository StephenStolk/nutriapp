"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Calendar, PlusCircle, TrendingDown } from "lucide-react"
import { 
  GitBranch, Target, AlertTriangle, MinusCircle, BarChart3, ArrowLeft,
  TrendingUp, Award, ArrowUpRight
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { FutureSelfMirror } from "@/components/future-self-mirror"
import { CravingParasite } from "@/components/craving-parasite"
import { ShadowDay } from "@/components/shadow-day"
import { DisciplineDebt } from "@/components/discipline-debt"
import { PatternAnalytics } from "@/components/pattern-analytics"
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Label } from "recharts"

type ActivePage =
  | "landing"
  | "home"
  | "dashboard"
  | "meal-planner"
  | "profile"
  | "quick-meals"
  | "todos"
  | "journal"

interface MindRewireInsights {
  alignmentScore: number
  parasiteHealth: number
  disciplineDebt: number
  debtRepaid: number
  shadowDaysAvoided: number
  identityStreak: number
}

const REPAYMENT_ACTIONS = [
  { id: 'walk', label: 'Walk 500 steps', repays: 6, icon: '🚶' },
  { id: 'water', label: 'Drink 2 glasses water', repays: 4, icon: '💧' },
  { id: 'meditation', label: '5 min meditation', repays: 8, icon: '🧘' },
  { id: 'vegetables', label: 'Eat vegetables', repays: 7, icon: '🥗' },
  { id: 'sleep', label: 'Sleep 8 hours', repays: 10, icon: '😴' },
  { id: 'journal', label: 'Write journal', repays: 5, icon: '📝' },
]

export default function MindRewirePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const supabase = createClient()

  const [showFutureSelfMirror, setShowFutureSelfMirror] = useState(false)
  const [showCravingParasite, setShowCravingParasite] = useState(false)
  const [showShadowDay, setShowShadowDay] = useState(false)
  const [showDisciplineDebt, setShowDisciplineDebt] = useState(false)
  const [showPatternAnalytics, setShowPatternAnalytics] = useState(false)

  const [activePage, setActivePage] = useState<ActivePage>("landing")
  const [shortName, setShortName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [insights, setInsights] = useState<MindRewireInsights>({
    alignmentScore: 0,
    parasiteHealth: 0,
    disciplineDebt: 0,
    debtRepaid: 0,
    shadowDaysAvoided: 0,
    identityStreak: 0
  })

  // Discipline Debt states
const [debtData, setDebtData] = useState<any>({ current_debt: 0, total_accumulated: 0, total_repaid: 0 })
const [transactions, setTransactions] = useState<any[]>([])

// Pattern Analytics states
const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
const [patternData, setPatternData] = useState<any[]>([])
const [stats, setStats] = useState({
  avgCalories: 0,
  avgProtein: 0,
  consistency: 0,
  trend: 'stable',
})

const loadAllData = async () => {
  setLoading(true)
  try {
    await Promise.all([
      loadInsights(),
      loadDebtData(),
      loadPatternData()
    ])
  } finally {
    setLoading(false)
  }
}

const loadDebtData = async () => {
  try {
    // Get or create debt record
    let { data: debtRecord } = await supabase
      .from('discipline_debt')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!debtRecord) {
      const { data: newDebt } = await supabase
        .from('discipline_debt')
        .insert({ user_id: userId, current_debt: 0 })
        .select()
        .single()
      debtRecord = newDebt
    }

    setDebtData(debtRecord || { current_debt: 0, total_accumulated: 0, total_repaid: 0 })

    // Load recent transactions
    const { data: transData } = await supabase
      .from('debt_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    setTransactions(transData || [])
  } catch (error) {
    console.error('Error loading debt:', error)
  }
}

const loadPatternData = async () => {
  try {
    const now = new Date()
    let startDate = new Date()

    if (period === 'daily') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - 28)
    } else {
      startDate.setMonth(now.getMonth() - 6)
    }

    // Fetch food logs
    const { data: foodLogs } = await supabase
      .from('food_logs')
      .select('calories, protein, carbs, fat, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Group data by period
    const grouped: Record<string, any> = {}
    
    foodLogs?.forEach(log => {
      const date = new Date(log.created_at)
      let key = ''

      if (period === 'daily') {
        key = date.toISOString().split('T')[0]
      } else if (period === 'weekly') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          count: 0,
        }
      }

      grouped[key].calories += Number(log.calories) || 0
      grouped[key].protein += Number(log.protein) || 0
      grouped[key].carbs += Number(log.carbs) || 0
      grouped[key].fat += Number(log.fat) || 0
      grouped[key].count += 1
    })

    const dataArray = Object.values(grouped).map((item: any) => ({
      ...item,
      avgCalories: Math.round(item.calories / (item.count || 1)),
    }))

    setPatternData(dataArray)

    // Calculate stats
    const avgCal = dataArray.reduce((sum, d) => sum + d.avgCalories, 0) / dataArray.length || 0
    const avgPro = dataArray.reduce((sum, d) => sum + d.protein, 0) / dataArray.length || 0
    
    // Calculate consistency
    const variance = dataArray.reduce((sum, d) => sum + Math.pow(d.avgCalories - avgCal, 2), 0) / dataArray.length
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) / 10))

    // Determine trend
    const firstHalf = dataArray.slice(0, Math.floor(dataArray.length / 2))
    const secondHalf = dataArray.slice(Math.floor(dataArray.length / 2))
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgCalories, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgCalories, 0) / secondHalf.length
    
    const trend = secondAvg > firstAvg * 1.1 ? 'increasing' : secondAvg < firstAvg * 0.9 ? 'decreasing' : 'stable'

    setStats({
      avgCalories: Math.round(avgCal),
      avgProtein: Math.round(avgPro),
      consistency: Math.round(consistency),
      trend,
    })
  } catch (error) {
    console.error('Error loading pattern data:', error)
  }
}

useEffect(() => {
  if (userId) {
    loadPatternData()
  }
}, [period, userId])

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single()

      let displayName: string
      if (data?.username) {
        displayName = data.username.slice(0, 2).toUpperCase()
      } else {
        displayName = user.email?.split("@")[0].slice(0, 2).toUpperCase() ?? ""
      }

      setShortName(displayName)
    }

    fetchUserName()
loadAllData()
  }, [userId])

  const loadInsights = async () => {
    // setLoading(true)
    try {
      // Load Identity Alignment Score
      const { data: identity } = await supabase
        .from('user_identities_future')
        .select('alignment_score')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      // Load Parasite Health
      const { data: parasite } = await supabase
        .from('craving_parasite')
        .select('health_points')
        .eq('user_id', userId)
        .single()

      // Load Discipline Debt
      const { data: debt } = await supabase
        .from('discipline_debt')
        .select('current_debt, total_repaid')
        .eq('user_id', userId)
        .single()

      // Calculate Shadow Days Avoided (days with good choices)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: goodDays } = await supabase
        .from('food_logs')
        .select('created_at, calories')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      const dayGroups: { [key: string]: number } = {}
      goodDays?.forEach(log => {
        const day = new Date(log.created_at).toISOString().split('T')[0]
        dayGroups[day] = (dayGroups[day] || 0) + (log.calories || 0)
      })

      const shadowDaysAvoided = Object.values(dayGroups).filter(cal => cal >= 1500 && cal <= 2500).length

      // Calculate Identity Streak
      const { data: impacts } = await supabase
        .from('identity_meal_impacts')
        .select('impact_direction, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      let streak = 0
      for (const impact of impacts || []) {
        if (impact.impact_direction === 'positive') {
          streak++
        } else {
          break
        }
      }

      setInsights({
        alignmentScore: Math.round(identity?.alignment_score || 0),
        parasiteHealth: parasite?.health_points || 0,
        disciplineDebt: debt?.current_debt || 0,
        debtRepaid: debt?.total_repaid || 0,
        shadowDaysAvoided,
        identityStreak: streak
      })
    } catch (error) {
      console.error('Error loading insights:', error)
    }
  }

  const repayDebt = async (action: typeof REPAYMENT_ACTIONS[0]) => {
  if (!userId || debtData.current_debt === 0) return
  try {
    const repayAmount = Math.min(action.repays, debtData.current_debt)
    const newDebt = debtData.current_debt - repayAmount
    const newRepaid = debtData.total_repaid + repayAmount

    await supabase
      .from('discipline_debt')
      .update({
        current_debt: newDebt,
        total_repaid: newRepaid,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId)

    await supabase.from('debt_transactions').insert({
      user_id: userId,
      transaction_type: 'debt_repaid',
      amount: repayAmount,
      reason: action.label,
    })

    setDebtData({ ...debtData, current_debt: newDebt, total_repaid: newRepaid })
    await loadDebtData()
    await loadInsights()
  } catch (error) {
    console.error('Error repaying debt:', error)
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

  const getParasiteColor = () => {
    if (insights.parasiteHealth >= 70) return "text-red-500"
    if (insights.parasiteHealth >= 40) return "text-orange-500"
    return "text-[#c9fa5f]"
  }

  const debtPercentage = debtData.total_accumulated > 0
  ? (debtData.current_debt / debtData.total_accumulated) * 100
  : 0

const maxCalories = patternData.length > 0 ? Math.max(...patternData.map(d => d.avgCalories), 2500) : 2500

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
        {/* Hero Section */}
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
                <GitBranch className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Hello {shortName}</p>
                <h1 className="text-md font-bold text-white">Mind Rewire</h1>
              </div>
            </div>
            <p className="text-gray-400 text-sm flex mx-auto justify-center">
              Transform your mindset with behavioral psychology
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
              
              {/* Mind Rewire Metrics Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 mx-3">
                  Behavioral Metrics
                </h3>

                <div className="grid grid-cols-2 gap-3 mx-3">

                  {/* Identity Alignment */}
                  <Card className="p-4 bg-[#161616] rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Identity</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <Target className="h-5 w-5 text-[#c9fa5f]" />
                      </div>
                    </div>

                    <div className="flex items-end gap-2 mb-1">
                      <div className="text-3xl font-bold text-white">{insights.alignmentScore}</div>
                      {insights.alignmentScore >= 70 && (
                        <TrendingUp className="h-4 w-4 text-[#c9fa5f] mb-1" />
                      )}
                    </div>

                    <div className="text-xs text-gray-500">Alignment Score</div>
                  </Card>

                  {/* Parasite Health */}
                  <Card className="p-4 bg-[#161616] rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Parasite</span>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👹</span>
                      </div>
                    </div>

                    <div className={`text-3xl font-bold mb-1 ${getParasiteColor()}`}>
                      {insights.parasiteHealth}
                    </div>

                    <div className="text-xs text-gray-500">Health Points</div>
                  </Card>

                  {/* Discipline Debt */}
                  <Card className="p-4 bg-[#161616] rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Debt</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <MinusCircle className="h-5 w-5 text-[#c9fa5f]" />
                      </div>
                    </div>

                    <div className="text-3xl font-bold text-white mb-1">
                      {insights.disciplineDebt}
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        Current Debt
                      </div>

                      {/* Mini progress bar */}
                      <div className="flex-1 h-1 bg-[#c9fa5f] rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((insights.debtRepaid / Math.max(insights.debtRepaid + insights.disciplineDebt, 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Shadow Days Avoided */}
                  <Card className="p-4 bg-[#161616] rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Good Days</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <Award className="h-5 w-5 text-[#c9fa5f]" />
                      </div>
                    </div>

                    <div className="text-3xl font-bold text-white mb-1">
                      {insights.shadowDaysAvoided}
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

              {/* Overall Progress - Hero Card */}
              <Card className="relative overflow-hidden bg-[#161616] p-6 mx-3 rounded-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Overall Progress</h3>
                    <p className="text-sm text-gray-400 max-w-xs">
                      {insights.identityStreak > 0 
                        ? `${insights.identityStreak} positive choices in a row! Keep it up!`
                        : "Start making positive choices to build your streak"}
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
                        strokeDasharray={`${(insights.alignmentScore / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#c9fa5f] mb-2">{insights.alignmentScore}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* DISCIPLINE DEBT SECTION */}
<div>
  <h3 className="text-lg font-semibold text-white mt-8 mb-4 mx-3">Discipline Debt</h3>
  
  <div className="mx-3 space-y-4">
    {/* Debt Meter */}
    <Card className="p-4 bg-[#161616] rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Current Debt</h4>
          <p className="text-xs text-gray-400">Clear through healthy actions</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#c9fa5f]">{debtData.current_debt}</div>
          <div className="text-xs text-gray-400">points</div>
        </div>
      </div>

      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000 rounded-full"
          style={{ width: `${Math.min(debtPercentage, 100)}%` }}
        />
      </div>

      {debtData.current_debt === 0 && (
        <p className="text-xs text-[#c9fa5f] mt-2 text-center">
          Debt cleared! Keep making healthy choices!
        </p>
      )}
    </Card>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-3 bg-[#161616] border border-gray-800 rounded-sm">
        <div className="text-xs text-gray-400 mb-1">Total Accumulated</div>
        <div className="text-lg font-bold text-white">{debtData.total_accumulated}</div>
      </Card>
      <Card className="p-3 bg-[#161616] border border-gray-800 rounded-sm">
        <div className="text-xs text-gray-400 mb-1">Total Repaid</div>
        <div className="text-lg font-bold text-[#c9fa5f]">{debtData.total_repaid}</div>
      </Card>
    </div>

    {/* Repayment Actions */}
    {debtData.current_debt > 0 && (
      <Card className="p-4 bg-[#161616] border border-gray-800 rounded-sm">
        <h4 className="text-sm font-semibold text-white mb-3">Repay Debt With:</h4>
        <div className="grid grid-cols-2 gap-2">
          {REPAYMENT_ACTIONS.map((action) => (
            <Button
              key={action.id}
              onClick={() => repayDebt(action)}
              variant="outline"
              className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30 bg-gray-800 border-gray-700"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs text-center text-white">{action.label}</span>
              <span className="text-xs font-bold text-[#c9fa5f]">-{action.repays}</span>
            </Button>
          ))}
        </div>
      </Card>
    )}

    {/* Transaction History */}
    <Card className="p-4 bg-[#161616] border border-gray-800 rounded-sm">
      <h4 className="text-sm font-semibold text-white mb-3">Recent Activity</h4>
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((trans) => (
            <div
              key={trans.id}
              className={`p-3 rounded-lg border ${
                trans.transaction_type === 'debt_repaid'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {trans.transaction_type === 'debt_repaid' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <PlusCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{trans.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(trans.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  trans.transaction_type === 'debt_repaid' ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {trans.transaction_type === 'debt_repaid' ? '-' : '+'}{trans.amount}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  </div>
</div>

{/* PATTERN ANALYTICS SECTION */}
<div>
  <h3 className="text-lg font-semibold text-white mt-8 mb-4 mx-3">Pattern Analytics</h3>
  
  <div className="mx-3 space-y-4">
    {/* Period Selector */}
    <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
      <TabsList className="grid w-full grid-cols-3 bg-[#161616] rounded-sm border border-gray-800">
        <TabsTrigger
          value="daily"
          className="data-[state=active]:bg-[#c9fa5f] data-[state=active]:text-black"
        >
          Daily
        </TabsTrigger>
        <TabsTrigger
          value="weekly"
          className="data-[state=active]:bg-[#c9fa5f] data-[state=active]:text-black"
        >
          Weekly
        </TabsTrigger>
        <TabsTrigger
          value="monthly"
          className="data-[state=active]:bg-[#c9fa5f] data-[state=active]:text-black"
        >
          Monthly
        </TabsTrigger>
      </TabsList>
    </Tabs>

    {patternData.length === 0 ? (
      <Card className="p-12 bg-[#161616] border border-gray-800 rounded-sm">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No data available for this period</p>
        </div>
      </Card>
    ) : (
      <>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 bg-[#161616] border border-gray-800 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Avg Calories</div>
            <div className="text-xl font-bold text-white">{stats.avgCalories}</div>
          </Card>
          <Card className="p-3 bg-[#161616] border border-gray-800 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Avg Protein</div>
            <div className="text-xl font-bold text-[#c9fa5f]">{stats.avgProtein}g</div>
          </Card>
          <Card className="p-3 bg-[#161616] border border-gray-800 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Consistency</div>
            <div className="text-xl font-bold text-white">{stats.consistency}%</div>
          </Card>
          <Card className="p-3 bg-[#161616] border border-gray-800 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Trend</div>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 ${
                stats.trend === 'increasing' ? 'text-orange-500 rotate-0' :
                stats.trend === 'decreasing' ? 'text-green-500 rotate-180' :
                'text-gray-400 rotate-90'
              }`} />
              <span className="text-sm font-semibold text-white capitalize">{stats.trend}</span>
            </div>
          </Card>
        </div>

       {/* Bar Chart */}
<Card className="p-5 bg-[#161616] rounded-sm">
  <h4 className="text-sm font-semibold text-white mb-3">Calorie Intake</h4>
  <div className="rounded-sm p-4">
    <div className="flex items-end justify-between gap-1 h-[250px]">
      {patternData.map((item, idx) => {
        const heightPercent = (item.avgCalories / maxCalories) * 100
        const isAboveTarget = item.avgCalories > 2200
        
        return (
          <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 group relative h-full">
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#c9fa5f]/30 z-10">
              <div className="font-semibold">{item.avgCalories} cal</div>
              <div className="text-gray-400">Protein: {Math.round(item.protein)}g</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
            </div>
            
            {/* Bar */}
            <div
              className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                isAboveTarget ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#c9fa5f] hover:bg-[#b8e954]'
              }`}
              style={{ height: `${Math.max(heightPercent, 8)}%` }}
            />
            
            {/* Label */}
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              {period === 'daily' ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
               period === 'weekly' ? `W${idx + 1}` :
               new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
          </div>
        )
      })}
    </div>
  </div>
</Card>

        {/* Macros Distribution */}
<Card className="p-5 bg-[#161616] rounded-sm">
  <h4 className="text-sm font-semibold text-white mb-3">Macronutrient Distribution</h4>
  
  {/* Summary Stats */}
  <div className="grid grid-cols-3 gap-3 mb-4">
    <div className="text-center p-3 bg-gray-800 rounded-sm">
      <div className="text-xs text-gray-400 mb-1">Protein</div>
      <div className="text-lg font-bold text-[#c9fa5f]">
        {Math.round(patternData.reduce((sum, d) => sum + d.protein, 0) / patternData.length)}g
      </div>
      <div className="text-xs text-gray-500">avg/day</div>
    </div>
    <div className="text-center p-3 bg-gray-800 rounded-sm">
      <div className="text-xs text-gray-400 mb-1">Carbs</div>
      <div className="text-lg font-bold text-blue-500">
        {Math.round(patternData.reduce((sum, d) => sum + d.carbs, 0) / patternData.length)}g
      </div>
      <div className="text-xs text-gray-500">avg/day</div>
    </div>
    <div className="text-center p-3 bg-gray-800 rounded-sm">
      <div className="text-xs text-gray-400 mb-1">Fat</div>
      <div className="text-lg font-bold text-orange-500">
        {Math.round(patternData.reduce((sum, d) => sum + d.fat, 0) / patternData.length)}g
      </div>
      <div className="text-xs text-gray-500">avg/day</div>
    </div>
  </div>

  {/* Average Distribution Bar */}
  <div className="mt-4">
    <div className="text-xs text-gray-400 mb-2">Average Macronutrient Ratio</div>
    <div className="flex h-8 rounded-sm overflow-hidden bg-gray-800">
      {(() => {
        const totalProtein = patternData.reduce((sum, d) => sum + d.protein, 0) / patternData.length
        const totalCarbs = patternData.reduce((sum, d) => sum + d.carbs, 0) / patternData.length
        const totalFat = patternData.reduce((sum, d) => sum + d.fat, 0) / patternData.length
        const total = totalProtein + totalCarbs + totalFat
        
        const proteinPercent = (totalProtein / total) * 100 || 0
        const carbsPercent = (totalCarbs / total) * 100 || 0
        const fatPercent = (totalFat / total) * 100 || 0
        
        return (
          <>
            <div 
              className="bg-[#c9fa5f] flex items-center justify-center" 
              style={{ width: `${proteinPercent}%` }}
            >
              {proteinPercent > 10 && (
                <span className="text-xs font-semibold text-black">
                  {Math.round(proteinPercent)}%
                </span>
              )}
            </div>
            <div 
              className="bg-blue-500 flex items-center justify-center" 
              style={{ width: `${carbsPercent}%` }}
            >
              {carbsPercent > 10 && (
                <span className="text-xs font-semibold text-white">
                  {Math.round(carbsPercent)}%
                </span>
              )}
            </div>
            <div 
              className="bg-orange-500 flex items-center justify-center" 
              style={{ width: `${fatPercent}%` }}
            >
              {fatPercent > 10 && (
                <span className="text-xs font-semibold text-white">
                  {Math.round(fatPercent)}%
                </span>
              )}
            </div>
          </>
        )
      })()}
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-400">
      <span>Protein</span>
      <span>Carbs</span>
      <span>Fat</span>
    </div>
  </div>

  {/* Only show detailed breakdown for daily view */}
  {period === 'daily' && (
    <div className="mt-6">
      <div className="text-xs text-gray-400 mb-3">Daily Breakdown (Last 7 Days)</div>
      <div className="space-y-3">
        {patternData.slice(-7).map((item, idx) => {
          const total = item.protein + item.carbs + item.fat
          const proteinPercent = (item.protein / total) * 100 || 0
          const carbsPercent = (item.carbs / total) * 100 || 0
          const fatPercent = (item.fat / total) * 100 || 0

          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#c9fa5f]">P: {item.protein}g</span>
                  <span className="text-blue-500">C: {item.carbs}g</span>
                  <span className="text-orange-500">F: {item.fat}g</span>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
                <div className="bg-[#c9fa5f]" style={{ width: `${proteinPercent}%` }} />
                <div className="bg-blue-500" style={{ width: `${carbsPercent}%` }} />
                <div className="bg-orange-500" style={{ width: `${fatPercent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )}
</Card>

        {/* Insights */}
        <Card className="p-4 bg-[#c9fa5f]/10 rounded-sm">
          <h4 className="text-sm font-semibold text-white mb-2">Insights</h4>
          <div className="space-y-2">
            {stats.consistency >= 80 && (
              <p className="text-xs text-gray-300">
                ✨ Excellent consistency! Your eating patterns are very stable.
              </p>
            )}
            {stats.consistency < 60 && (
              <p className="text-xs text-gray-300">
                💡 Your calorie intake varies significantly. Try establishing more consistent meal patterns.
              </p>
            )}
            {stats.trend === 'increasing' && (
              <p className="text-xs text-gray-300">
                📈 Your calorie intake is trending upward. Monitor this if weight management is your goal.
              </p>
            )}
            {stats.trend === 'decreasing' && (
              <p className="text-xs text-gray-300">
                📉 Your calorie intake is trending downward. Ensure you're meeting your nutritional needs.
              </p>
            )}
            {stats.avgProtein < 80 && (
              <p className="text-xs text-gray-300">
                🥩 Consider increasing protein intake. Aim for 0.8-1g per kg of body weight.
              </p>
            )}
          </div>
        </Card>
      </>
    )}
  </div>
</div>

              {/* Mind Rewire Tools */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 mx-3">
                  Mind Rewire Tools
                </h3>

                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide mx-3 mb-8">

                  {/* Future Self Mirror */}
                  <Card
                    className="min-w-[280px] h-[340px] overflow-hidden rounded-2xl cursor-pointer bg-[#161616] transition p-0"
                    onClick={() => setShowFutureSelfMirror(true)}
                  >
                    <div
                      className="h-1/2 w-full bg-cover bg-center"
                      style={{ backgroundImage: "url('/images/mind-rewire/future-self.png')" }}
                    />

                    <div className="h-1/2 p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
                          <Target className="h-6 w-6 text-black" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-500" />
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-white mb-1">
                          Future Self Mirror
                        </h4>
                        <p className="text-xs text-gray-400">
                          Visualize your ideal self and track alignment
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Craving Parasite */}
                  <Card
                    className="min-w-[280px] h-[340px] bg-[#161616] overflow-hidden rounded-2xl cursor-pointer transition p-0"
                    onClick={() => setShowCravingParasite(true)}
                  >
                    <div
                      className="h-1/2 w-full bg-cover bg-center"
                      style={{ backgroundImage: "url('/images/mind-rewire/parasite.png')" }}
                    />

                    <div className="h-1/2 p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <span className="text-2xl">👹</span>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-500" />
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-white mb-1 mt-3">
                          Craving Parasite
                        </h4>
                        <p className="text-xs text-gray-400">
                          Gamify your battle against unhealthy cravings
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Shadow Day */}
                  <Card
                    className="min-w-[280px] h-[340px] overflow-hidden rounded-2xl cursor-pointer transition p-0 bg-[#161616]"
                    onClick={() => setShowShadowDay(true)}
                  >
                    <div
                      className="h-1/2 w-full bg-cover bg-center"
                      style={{ backgroundImage: "url('/images/mind-rewire/shadow-day.png')" }}
                    />

                    <div className="h-1/2 p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-[#c9fa5f] flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-black" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-500" />
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-white mb-1 mt-4">
                          Shadow Day
                        </h4>
                        <p className="text-xs text-gray-400">
                          See your future if you continue current habits
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
      
    </>
  )
}

