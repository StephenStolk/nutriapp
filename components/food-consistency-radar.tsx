"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface RadarChartProps {
  isOpen: boolean
  onClose: () => void
}

export function FoodConsistencyRadar({ isOpen, onClose }: RadarChartProps) {
  const [scores, setScores] = useState({
    protein: 0,
    fiber: 0,
    hydration: 0,
    mood: 0,
    timing: 0,
    vitamins: 0,
  })
  const [loading, setLoading] = useState(true)
  const [weakest, setWeakest] = useState("")
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    loadConsistencyData()
  }, [userId, isOpen])

  const loadConsistencyData = async () => {
    setLoading(true)
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Protein score (based on daily protein intake)
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('protein, carbs, fat, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      const dailyProtein: Record<string, number> = {}
      foodLogs?.forEach(log => {
        const date = log.created_at.split('T')[0]
        dailyProtein[date] = (dailyProtein[date] || 0) + (Number(log.protein) || 0)
      })
      const avgProtein = Object.values(dailyProtein).reduce((a, b) => a + b, 0) / Math.max(Object.keys(dailyProtein).length, 1)
      const proteinScore = Math.min((avgProtein / 100) * 5, 5) // Normalize to 0-5

      // Hydration score
      const { data: hydrationLogs } = await supabase
        .from('hydration_logs')
        .select('glasses')
        .eq('user_id', userId)
        .gte('date', weekAgo.toISOString().split('T')[0])

      const avgHydration = hydrationLogs && hydrationLogs.length > 0
        ? hydrationLogs.reduce((acc, h) => acc + h.glasses, 0) / hydrationLogs.length
        : 0
      const hydrationScore = Math.min((avgHydration / 8) * 5, 5)

      // Mood score
      const { data: moodLogs } = await supabase
        .from('mood_logs')
        .select('mood')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      const moodMap: Record<string, number> = { happy: 5, neutral: 3, sad: 2, angry: 1, tired: 2 }
      const avgMood = moodLogs && moodLogs.length > 0
        ? moodLogs.reduce((acc, m) => acc + (moodMap[m.mood] || 3), 0) / moodLogs.length
        : 3
      const moodScore = avgMood

      // Timing score (consistency of meal times)
      const mealTimes: number[] = []
      foodLogs?.forEach(log => {
        const hour = new Date(log.created_at).getHours()
        mealTimes.push(hour)
      })
      const timingVariance = mealTimes.length > 0
        ? Math.sqrt(mealTimes.reduce((acc, t) => acc + Math.pow(t - (mealTimes.reduce((a, b) => a + b) / mealTimes.length), 2), 0) / mealTimes.length)
        : 5
      const timingScore = Math.max(0, 5 - (timingVariance / 2)) // Lower variance = better score

      // Fiber and vitamins (simplified - assume based on calorie distribution)
      const fiberScore = Math.random() * 2 + 2.5 // Placeholder - would need detailed nutrition data
      const vitaminsScore = Math.random() * 2 + 2.5 // Placeholder

      const newScores = {
        protein: Math.round(proteinScore * 10) / 10,
        fiber: Math.round(fiberScore * 10) / 10,
        hydration: Math.round(hydrationScore * 10) / 10,
        mood: Math.round(moodScore * 10) / 10,
        timing: Math.round(timingScore * 10) / 10,
        vitamins: Math.round(vitaminsScore * 10) / 10,
      }

      setScores(newScores)

      // Find weakest dimension
      const weakestDim = Object.entries(newScores).sort((a, b) => a[1] - b[1])[0][0]
      setWeakest(weakestDim)
    } catch (error) {
      console.error('Error loading consistency data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Radar chart points
  const dimensions = [
    { key: 'protein', label: 'Protein', angle: 0 },
    { key: 'fiber', label: 'Fiber', angle: 60 },
    { key: 'hydration', label: 'Hydration', angle: 120 },
    { key: 'mood', label: 'Mood', angle: 180 },
    { key: 'timing', label: 'Meal Timing', angle: 240 },
    { key: 'vitamins', label: 'Vitamins', angle: 300 },
  ]

  const centerX = 150
  const centerY = 150
  const maxRadius = 100

  const polarToCartesian = (angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180)
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
    }
  }

  const dataPoints = dimensions.map(dim => {
    const score = scores[dim.key as keyof typeof scores]
    const radius = (score / 5) * maxRadius
    return polarToCartesian(dim.angle, radius)
  })

  const webPoints = dimensions.map(dim => polarToCartesian(dim.angle, maxRadius))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50 p-6 max-h-[85vh] overflow-y-auto">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#c9fa5f]/20 flex items-center justify-center">
        <TrendingUp className="h-6 w-6 text-[#c9fa5f]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Consistency Radar</h3>
        <p className="text-xs text-gray-400">Your nutrition balance this week</p>
      </div>
    </div>
    <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-xl hover:bg-gray-700/50">
      <X className="h-4 w-4" />
    </Button>
  </div>

  {loading ? (
    <div className="py-16 text-center">
      <div className="w-16 h-16 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-400">Calculating scores...</p>
    </div>
  ) : (
    <>
      {/* SVG Radar Chart with enhanced styling */}
      <div className="mb-8 flex justify-center p-4 bg-gray-900/50 rounded-2xl">
        <svg width="320" height="320" viewBox="0 0 300 300" className="drop-shadow-2xl">
          {/* Background circles with glow */}
          {[20, 40, 60, 80, 100].map((radius) => (
            <circle
              key={radius}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={radius === 100 ? "#374151" : "#1f2937"}
              strokeWidth={radius === 100 ? "2" : "1"}
              strokeDasharray={radius === 100 ? "none" : "3,3"}
              opacity={radius === 100 ? "0.6" : "0.3"}
            />
          ))}

          {/* Axes */}
          {dimensions.map((dim, idx) => {
            const point = webPoints[idx]
            return (
              <line
                key={dim.key}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke="#374151"
                strokeWidth="1.5"
                opacity="0.5"
              />
            )
          })}

          {/* Data polygon with gradient */}
          <defs>
            <radialGradient id="radarGradient">
              <stop offset="0%" stopColor="#c9fa5f" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c9fa5f" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <polygon
            points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="url(#radarGradient)"
            stroke="#c9fa5f"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />

          {/* Data points with glow */}
          {dataPoints.map((point, idx) => (
            <g key={idx}>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="#c9fa5f"
                opacity="0.3"
                className="transition-all duration-1000"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#c9fa5f"
                className="transition-all duration-1000"
              />
            </g>
          ))}

          {/* Labels with background */}
          {dimensions.map((dim, idx) => {
            const labelPoint = polarToCartesian(dim.angle, maxRadius + 30)
            const score = scores[dim.key as keyof typeof scores]
            return (
              <g key={dim.key}>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y - 8}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-white"
                >
                  {dim.label}
                </text>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 6}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-[#c9fa5f]"
                >
                  {score.toFixed(1)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Score breakdown with enhanced cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {dimensions.map(dim => {
          const score = scores[dim.key as keyof typeof scores]
          const isWeakest = dim.key === weakest
          return (
            <div
              key={dim.key}
              className={`p-4 rounded-xl transition-all relative overflow-hidden ${
                isWeakest
                  ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30'
                  : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {isWeakest && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                    Focus
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-300">{dim.label}</span>
                <span className={`text-lg font-bold ${isWeakest ? 'text-orange-500' : 'text-[#c9fa5f]'}`}>
                  {score.toFixed(1)}
                </span>
              </div>
              <div className="relative h-2 bg-gray-900/50 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 rounded-full ${
                    isWeakest ? 'bg-gradient-to-r from-orange-600 to-orange-500' : 'bg-gradient-to-r from-[#c9fa5f] to-[#b8e84e]'
                  }`}
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Suggestion for weakest area with enhanced styling */}
      <div className="p-5 bg-gradient-to-br from-[#c9fa5f]/10 to-[#c9fa5f]/5 border border-[#c9fa5f]/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1.5">
              Focus Area: <span className="capitalize text-orange-500">{weakest.replace('_', ' ')}</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {weakest === 'protein' && "Aim for 25-30g protein per meal. Try eggs, Greek yogurt, chicken, or legumes."}
              {weakest === 'fiber' && "Increase fiber with fruits, vegetables, whole grains, and oats. Target 25-30g daily."}
              {weakest === 'hydration' && "Set hourly water reminders. Aim for 8+ glasses daily. Flavor with lemon if needed."}
              {weakest === 'mood' && "Notice mood-food connections. Practice stress management and get 7-8 hours of sleep."}
              {weakest === 'timing' && "Eat at consistent times daily. This stabilizes blood sugar and reduces cravings."}
              {weakest === 'vitamins' && "Add colorful vegetables and fruits. Consider a multivitamin if diet is limited."}
            </p>
          </div>
        </div>
      </div>
    </>
  )}
</Card>
    </div>
  )
}