"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, TrendingDown, Brain, Clock, Zap, 
  Heart, Award, AlertCircle, ChevronRight, X 
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface PsychologyInsightsProps {
  isOpen: boolean
  onClose: () => void
}

interface CravingPattern {
  type: string
  trigger: string
  count: number
}

interface InsightsState {
  guiltFreeScore: number
  guiltTrend: number
  emotionalHungerRate: number
  cravingPatterns: CravingPattern[]
  stressEatingDays: number
  microWins: number
}

export function PsychologyInsights({ isOpen, onClose }: PsychologyInsightsProps) {
  const { userId } = useUser()
  const supabase = createClient()
  
  const [insights, setInsights] = useState<InsightsState>({
    guiltFreeScore: 0,
    guiltTrend: 0,
    emotionalHungerRate: 0,
    cravingPatterns: [],
    stressEatingDays: 0,
    microWins: 0,
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !isOpen) return
    loadInsights()
  }, [userId, isOpen])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      // Guilt-free score calculation
      const { data: guiltLogs } = await supabase
        .from('guilt_free_logs')
        .select('sentiment_score, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      let guiltScore = 100
      if (guiltLogs && guiltLogs.length > 0) {
        const avgSentiment = guiltLogs.reduce((acc, log) => acc + (log.sentiment_score || 0), 0) / guiltLogs.length
        guiltScore = Math.round(50 + (avgSentiment * 50))
      }

      // Emotional hunger rate
      const { data: hungerChecks } = await supabase
        .from('emotional_hunger_checks')
        .select('is_emotional')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      const emotionalRate = hungerChecks && hungerChecks.length > 0
        ? Math.round((hungerChecks.filter(h => h.is_emotional).length / hungerChecks.length) * 100)
        : 0

      // Craving patterns
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

      // Stress eating days
      const { data: stressLogs } = await supabase
        .from('stress_logs')
        .select('stress_level, date')
        .eq('user_id', userId)
        .eq('stress_level', 'high')
        .gte('date', weekAgoStr)

      // Micro wins
      const { data: wins } = await supabase
        .from('micro_wins')
        .select('points')
        .eq('user_id', userId)
        .gte('created_at', weekAgoStr)

      const totalWins = wins?.reduce((acc, w) => acc + (w.points || 1), 0) || 0

      setInsights({
        guiltFreeScore: guiltScore,
        guiltTrend: guiltScore >= 70 ? 1 : guiltScore >= 50 ? 0 : -1,
        emotionalHungerRate: emotionalRate,
        cravingPatterns: topPatterns,
        stressEatingDays: stressLogs?.length || 0,
        microWins: totalWins,
      })
    } catch (error) {
      console.error('Error loading psychology insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card border border-border/50 rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border/50 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <Brain className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-foreground mt-2">Psychology Insights</h3>
              <p className="text-xs text-muted-foreground">Your behavioral patterns this week</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing your patterns...</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Guilt-Free Score */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Guilt-Free Score</h4>
                  <p className="text-xs text-muted-foreground">Healthy relationship with food</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{insights.guiltFreeScore}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {insights.guiltTrend > 0 && (
                      <>
                        <TrendingUp className="h-3 w-3 text-[#c9fa5f]" />
                        <span className="text-[#c9fa5f]">Improving</span>
                      </>
                    )}
                    {insights.guiltTrend === 0 && (
                      <span className="text-muted-foreground">Stable</span>
                    )}
                    {insights.guiltTrend < 0 && (
                      <>
                        <TrendingDown className="h-3 w-3 text-orange-500" />
                        <span className="text-orange-500">Needs attention</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[#c9fa5f] transition-all duration-1000 rounded-full"
                  style={{ width: `${insights.guiltFreeScore}%` }}
                />
              </div>

              {insights.guiltFreeScore >= 70 && (
                <p className="text-xs text-[#c9fa5f] mt-2">
                  You're maintaining a healthy mindset around food!
                </p>
              )}
              {insights.guiltFreeScore < 70 && insights.guiltFreeScore >= 50 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Try reframing "cheat meals" as "treat meals" — food is fuel, not failure.
                </p>
              )}
              {insights.guiltFreeScore < 50 && (
                <p className="text-xs text-orange-500 mt-2">
                  Notice guilt-based language? Practice self-compassion. Progress, not perfection.
                </p>
              )}
            </Card>

            {/* Emotional Hunger Rate */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#c9fa5f]/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-[#c9fa5f]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mt-4">Emotional Hunger</h4>
                    <p className="text-xs text-muted-foreground">Non-physical hunger events</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">{insights.emotionalHungerRate}%</div>
                </div>
              </div>

              {insights.emotionalHungerRate > 40 && (
                <div className="mt-3 p-2 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-foreground">
                    <strong>Tip:</strong> Try the 5-minute rule: drink water and wait before eating.
                  </p>
                </div>
              )}
            </Card>

            {/* Craving Patterns */}
            {insights.cravingPatterns.length > 0 && (
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[#c9fa5f]" />
                  <h4 className="text-sm font-semibold text-foreground">Top Craving Triggers</h4>
                </div>
                <div className="space-y-2">
                  {insights.cravingPatterns.map((pattern: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-[5px]">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-[#c9fa5f]/20 text-foreground border-[#c9fa5f]/30 rounded-[5px]">
                          {pattern.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-xs text-foreground capitalize">{pattern.trigger.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{pattern.count}x</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Stress Eating Days */}
            {insights.stressEatingDays > 0 && (
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">High Stress Days</h4>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">{insights.stressEatingDays}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Consider meditation, walks, or talking to someone during stressful moments.
                </p>
              </Card>
            )}

            {/* Micro Wins */}
            <Card className="p-4 bg-[#c9fa5f]/5 border-[#c9fa5f]/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#c9fa5f]/20 flex items-center justify-center mb-4">
                    <Award className="h-5 w-5 text-[#c9fa5f]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Micro-Wins This Week</h4>
                    <p className="text-xs text-muted-foreground">Small victories add up!</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#c9fa5f]">{insights.microWins}</div>
              </div>
              {insights.microWins > 10 && (
                <p className="text-xs text-[#c9fa5f] mt-2">
                  🎉 Amazing consistency! You're building lasting habits.
                </p>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  )
}