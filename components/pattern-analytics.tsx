"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Calendar, BarChart3, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface PatternAnalyticsProps {
  isOpen: boolean
  onClose: () => void
}

export function PatternAnalytics({ isOpen, onClose }: PatternAnalyticsProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    consistency: 0,
    trend: 'stable',
  })
  const [loading, setLoading] = useState(true)
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    loadPatternData()
  }, [userId, isOpen, period])

  const loadPatternData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate = new Date()
      let groupByFormat = 'day'

      if (period === 'daily') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'weekly') {
        startDate.setDate(now.getDate() - 28)
        groupByFormat = 'week'
      } else {
        startDate.setMonth(now.getMonth() - 6)
        groupByFormat = 'month'
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

      setData(dataArray)

      // Calculate stats
      const avgCal = dataArray.reduce((sum, d) => sum + d.avgCalories, 0) / dataArray.length || 0
      const avgPro = dataArray.reduce((sum, d) => sum + d.protein, 0) / dataArray.length || 0
      
      // Calculate consistency (lower variance = higher consistency)
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
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const maxCalories = Math.max(...data.map(d => d.avgCalories), 2500)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-md mt-3 font-semibold text-foreground">Pattern Analytics</h3>
              <p className="text-xs text-muted-foreground">Your nutrition trends over time</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mb-6">
  <TabsList className="grid w-full grid-cols-3 bg-muted/30 rounded-[5px] border border-border/50">
    
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


        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No data available for this period</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-3 bg-muted/30 border-border/50 rounded-[5px]">
                <div className="text-xs text-muted-foreground mb-1">Avg Calories</div>
                <div className="text-xl font-bold text-foreground">{stats.avgCalories}</div>
              </Card>
              <Card className="p-3 bg-muted/30 border-border/50 rounded-[5px]">
                <div className="text-xs text-muted-foreground mb-1">Avg Protein</div>
                <div className="text-xl font-bold text-[#c9fa5f]">{stats.avgProtein}g</div>
              </Card>
              <Card className="p-3 bg-muted/30 border-border/50 rounded-[5px]">
                <div className="text-xs text-muted-foreground mb-1">Consistency</div>
                <div className="text-xl font-bold text-foreground">{stats.consistency}%</div>
              </Card>
              <Card className="p-3 bg-muted/30 border-border/50 rounded-[5px]">
                <div className="text-xs text-muted-foreground mb-1">Trend</div>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`h-4 w-4 ${
                    stats.trend === 'increasing' ? 'text-orange-500 rotate-0' :
                    stats.trend === 'decreasing' ? 'text-green-500 rotate-180' :
                    'text-muted-foreground rotate-90'
                  }`} />
                  <span className="text-sm font-semibold text-foreground capitalize">{stats.trend}</span>
                </div>
              </Card>
            </div>

            {/* Bar Chart */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">Calorie Intake</h4>
              <div className="bg-muted/20 rounded-xl p-4 min-h-[300px]">
                <div className="flex items-end justify-between gap-1 h-[250px]">
                  {data.map((item, idx) => {
                    const heightPercent = (item.avgCalories / maxCalories) * 100
                    const isAboveTarget = item.avgCalories > 2200
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                            isAboveTarget ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#c9fa5f] hover:bg-[#b8e954]'
                          }`}
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#c9fa5f]/30 z-10">
                            <div className="font-semibold">{item.avgCalories} cal</div>
                            <div className="text-muted-foreground">Protein: {item.protein}g</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium transform -rotate-45 origin-top-left whitespace-nowrap">
                          {period === 'daily' ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                           period === 'weekly' ? `Week ${idx + 1}` :
                           new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Macros Distribution */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Macronutrient Distribution</h4>
              <div className="space-y-3">
                {data.slice(-7).map((item, idx) => {
                  const total = item.protein + item.carbs + item.fat
                  const proteinPercent = (item.protein / total) * 100 || 0
                  const carbsPercent = (item.carbs / total) * 100 || 0
                  const fatPercent = (item.fat / total) * 100 || 0

                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[#c9fa5f]">P: {item.protein}g</span>
                          <span className="text-blue-500">C: {item.carbs}g</span>
                          <span className="text-orange-500">F: {item.fat}g</span>
                        </div>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                        <div className="bg-[#c9fa5f]" style={{ width: `${proteinPercent}%` }} />
                        <div className="bg-blue-500" style={{ width: `${carbsPercent}%` }} />
                        <div className="bg-orange-500" style={{ width: `${fatPercent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-[#c9fa5f]/10 rounded-[5px] mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">Insights</h4>
              <div className="space-y-2">
                {stats.consistency >= 80 && (
                  <p className="text-xs text-foreground">
                    ✨ Excellent consistency! Your eating patterns are very stable.
                  </p>
                )}
                {stats.consistency < 60 && (
                  <p className="text-xs text-foreground">
                    💡 Your calorie intake varies significantly. Try establishing more consistent meal patterns.
                  </p>
                )}
                {stats.trend === 'increasing' && (
                  <p className="text-xs text-foreground">
                    📈 Your calorie intake is trending upward. Monitor this if weight management is your goal.
                  </p>
                )}
                {stats.trend === 'decreasing' && (
                  <p className="text-xs text-foreground">
                    📉 Your calorie intake is trending downward. Ensure you're meeting your nutritional needs.
                  </p>
                )}
                {stats.avgProtein < 80 && (
                  <p className="text-xs text-foreground">
                    🥩 Consider increasing protein intake. Aim for 0.8-1g per kg of body weight.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}