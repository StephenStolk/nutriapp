"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, TrendingDown, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface ShadowDayProps {
  isOpen: boolean
  onClose: () => void
}

export function ShadowDay({ isOpen, onClose }: ShadowDayProps) {
  const [projection, setProjection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showProjection, setShowProjection] = useState(false)
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    generateProjection()
  }, [userId, isOpen])

  const generateProjection = async () => {
    setLoading(true)
    try {
      // Analyze last 7 days patterns
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('calories, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      const { data: moodLogs } = await supabase
        .from('mood_logs')
        .select('mood')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      const { data: cravingLogs } = await supabase
        .from('craving_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      // Calculate patterns
      const dailyCalories = foodLogs?.reduce((acc: Record<string, number>, log) => {
        const date = log.created_at.split('T')[0]
        acc[date] = (acc[date] || 0) + (Number(log.calories) || 0)
        return acc
      }, {})

      const avgDailyCalories = Object.values(dailyCalories || {}).reduce((a: number, b: number) => a + b, 0) / 7
      const excessCalories = Math.max(0, avgDailyCalories - 2000)

      // Project weight change (3500 cal = 1 lb = 0.45 kg)
      const projectedWeightChange = (excessCalories * 60) / 3500 * 0.45

      // Mood decline based on negative moods
      const moodMap: Record<string, number> = { happy: 5, neutral: 3, sad: 1, angry: 1, tired: 2 }
      const avgMood = moodLogs && moodLogs.length > 0
        ? moodLogs.reduce((acc, m) => acc + (moodMap[m.mood] || 3), 0) / moodLogs.length
        : 3
      const moodDecline = Math.max(0, ((5 - avgMood) / 5) * 100)

      // Binge risk based on craving frequency
      const cravingFrequency = (cravingLogs?.length || 0) / 7
      const bingeRisk = Math.min(100, cravingFrequency * 15 + (excessCalories / 100) * 10)

      const projectionData = {
        projected_weight_change: projectedWeightChange,
        mood_decline_percentage: moodDecline,
        binge_risk_percentage: bingeRisk,
      }

      // Save projection
      await supabase.from('shadow_projections').insert({
        user_id: userId,
        projection_date: new Date().toISOString().split('T')[0],
        ...projectionData,
      })

      setProjection(projectionData)
    } catch (error) {
      console.error('Error generating shadow projection:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-card border-2 border-orange-500/30 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-foreground mt-2">Shadow Day</h3>
              <p className="text-xs text-muted-foreground">Your potential future</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Analyzing your patterns...</p>
          </div>
        ) : !showProjection ? (
          <>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#c9fa5f] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Warning</h4>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                You're about to see a realistic projection of where your current eating patterns could lead you in 60 days. This may be uncomfortable, but awareness is the first step to change.
              </p>
              <Button
                onClick={() => setShowProjection(true)}
                className="bg-[#c9fa5f] hover:bg-orange-600 text-black rounded-[5px]"
              >
                Show My Shadow Day
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 p-4 bg-[#c9fa5f]/10 rounded-[5px]">
              <p className="text-sm text-foreground font-medium text-center">
                If your current patterns continue for 60 days...
              </p>
            </div>

            {/* Weight Projection */}
            <Card className="p-4 mb-4 bg-muted/30 border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-[#c9fa5f]" />
                  <h4 className="text-sm font-semibold text-foreground">Weight Change</h4>
                </div>
                <span className="text-xl font-bold text-[#c9fa5f]">
                  +{projection.projected_weight_change.toFixed(1)} kg
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your average daily calorie intake
              </p>
            </Card>

            {/* Mood Decline */}
            <Card className="p-4 mb-4 bg-muted/30 border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#c9fa5f]" />
                  <h4 className="text-sm font-semibold text-foreground">Mood Trend</h4>
                </div>
                <span className="text-xl font-bold text-[#c9fa5f]">
                  -{projection.mood_decline_percentage.toFixed(0)}%
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 right-0 h-full bg-orange-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${projection.mood_decline_percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Poor nutrition impacts mental wellbeing
              </p>
            </Card>

            {/* Binge Risk */}
            <Card className="p-4 mb-6 bg-muted/30 border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#c9fa5f]" />
                  <h4 className="text-sm font-semibold text-foreground">Binge Risk</h4>
                </div>
                <span className="text-xl font-bold text-[#c9fa5f]">
                  {projection.binge_risk_percentage.toFixed(0)}%
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${projection.binge_risk_percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {projection.binge_risk_percentage >= 60 ? 'High risk - consider support' :
                 projection.binge_risk_percentage >= 40 ? 'Moderate risk - be mindful' :
                 'Lower risk - good patterns'}
              </p>
            </Card>

            {/* Recovery Actions */}
            <div className="p-3 bg-[#c9fa5f]/10 rounded-[5px] mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">How to Change This Path</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#c9fa5f]">1</span>
                  </div>
                  <p className="text-xs text-foreground">Set a realistic daily calorie goal (±200 from current)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#c9fa5f]">2</span>
                  </div>
                  <p className="text-xs text-foreground">Track mood with meals to identify emotional triggers</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#c9fa5f]">3</span>
                  </div>
                  <p className="text-xs text-foreground">Use the hunger check tool before eating</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#c9fa5f]">4</span>
                  </div>
                  <p className="text-xs text-foreground">Build consistent meal times and habits</p>
                </div>
              </div>
            </div>

            <div className="text-center p-3 bg-card border border-border/50 rounded-[5px] mb-6">
              <p className="text-sm font-semibold text-foreground mb-1">This is not your destiny.</p>
              <p className="text-xs text-muted-foreground">
                Every meal is a chance to change direction. Start with your next one.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}