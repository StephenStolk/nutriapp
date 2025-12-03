"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Battery, Moon, Zap, Droplets, Apple, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface BodyBatteryProps {
  isOpen: boolean
  onClose: () => void
}

export function BodyBattery({ isOpen, onClose }: BodyBatteryProps) {
  const { userId } = useUser()
  const supabase = createClient()
  
  const [batteryScore, setBatteryScore] = useState(0)
  const [factors, setFactors] = useState({
    sleep: 0,
    stress: 0,
    calories: 0,
    hydration: 0,
  })
  const [sleepHours, setSleepHours] = useState("7")
  const [waterGlasses, setWaterGlasses] = useState("8")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !isOpen) return
    loadBatteryData()
  }, [userId, isOpen])

  const loadBatteryData = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get sleep
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('hours')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      // Get stress
      const { data: stressData } = await supabase
        .from('stress_logs')
        .select('stress_level')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      // Get calories
      const { data: foodData } = await supabase
        .from('food_logs')
        .select('calories')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      const totalCals = foodData?.reduce((sum, f) => sum + (Number(f.calories) || 0), 0) || 0

      // Get hydration
      const { data: hydrationData } = await supabase
        .from('hydration_logs')
        .select('glasses')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      // Calculate scores
      const sleepScore = Math.min(((sleepData?.hours || 7) / 8) * 100, 100)
      const stressScore = stressData?.stress_level === 'low' ? 100 : stressData?.stress_level === 'medium' ? 60 : 30
      const calorieScore = totalCals >= 1500 && totalCals <= 2500 ? 100 : totalCals < 1500 ? 50 : 70
      const hydrationScore = Math.min(((hydrationData?.glasses || 8) / 8) * 100, 100)

      const battery = Math.round(
        sleepScore * 0.4 + stressScore * 0.3 + calorieScore * 0.2 + hydrationScore * 0.1
      )

      setFactors({
        sleep: Math.round(sleepScore),
        stress: Math.round(stressScore),
        calories: Math.round(calorieScore),
        hydration: Math.round(hydrationScore),
      })
      setBatteryScore(battery)

      if (sleepData) setSleepHours(sleepData.hours.toString())
      if (hydrationData) setWaterGlasses(hydrationData.glasses.toString())
    } catch (error) {
      console.error('Error loading battery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSleep = async () => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('sleep_logs').upsert({
      user_id: userId,
      date: today,
      hours: parseFloat(sleepHours),
      quality: parseFloat(sleepHours) >= 7 ? 'good' : 'fair',
    })
    loadBatteryData()
  }

  const updateHydration = async () => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('hydration_logs').upsert({
      user_id: userId,
      date: today,
      glasses: parseInt(waterGlasses),
      ml: parseInt(waterGlasses) * 250,
    })
    loadBatteryData()
  }

  if (!isOpen) return null

  const getBatteryColor = () => {
    if (batteryScore >= 70) return "text-[#c9fa5f]"
    if (batteryScore >= 40) return "text-yellow-500"
    return "text-orange-500"
  }

  const getBatteryFill = () => {
    if (batteryScore >= 70) return "#c9fa5f"
    if (batteryScore >= 40) return "#eab308"
    return "#f97316"
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full min-w-sm bg-card border border-border/50 p-6 max-h-[90vh] overflow-y-auto mb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <Battery className="h-5 w-5 text-black" />
            </div>
            <h3 className="text-md mt-3 font-semibold text-foreground">Body Battery</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Battery Visualization */}
            <div className="mb-6 text-center">
              <div className="relative inline-block">
                <svg width="120" height="180" viewBox="0 0 120 180" className="mx-auto">
                  {/* Battery outline */}
                  <rect x="20" y="20" width="80" height="140" rx="8" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                  {/* Battery tip */}
                  <rect x="45" y="5" width="30" height="15" rx="4" fill="currentColor" className="text-border" />
                  {/* Battery fill */}
                  <rect 
                    x="25" 
                    y={165 - (batteryScore * 1.3)}
                    width="70" 
                    height={batteryScore * 1.3} 
                    rx="5" 
                    fill={getBatteryFill()}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className={`text-3xl font-bold ${getBatteryColor()} mt-2`}>
                  {batteryScore}/100
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {batteryScore >= 70 ? "Fully Charged" : batteryScore >= 40 ? "Moderate Energy" : "Need Recovery"}
                </p>
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[5px]">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-foreground">Sleep</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{factors.sleep}%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[5px]">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-foreground">Stress</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{factors.stress}%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[5px]">
                <div className="flex items-center gap-2">
                  <Apple className="h-4 w-4 text-[#c9fa5f]" />
                  <span className="text-sm text-foreground">Nutrition</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{factors.calories}%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-[5px]">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-foreground">Hydration</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{factors.hydration}%</span>
              </div>
            </div>

            {/* Quick Updates */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Input type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="flex-1 h-9 text-sm"
                  placeholder="7"
                  min="0"
                  max="12"
                  step="0.5"
                />
                <span className="text-xs text-muted-foreground w-12">hours</span>
                <Button
                  size="sm"
                  onClick={updateSleep}
                  className="bg-[#c9fa5f] hover:bg-purple-600 text-black rounded-[5px] h-9 px-4"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  Sleep
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={waterGlasses}
                  onChange={(e) => setWaterGlasses(e.target.value)}
                  className="flex-1 h-9 text-sm"
                  placeholder="8"
                  min="0"
                  max="20"
                />
                <span className="text-xs text-muted-foreground w-12">glasses</span>
                <Button
                  size="sm"
                  onClick={updateHydration}
                  className="bg-[#c9fa5f] rounded-[5px] hover:bg-blue-600 text-black h-9 px-4"
                >
                  <Droplets className="h-3 w-3 mr-1" />
                  Water
                </Button>
              </div>
            </div>

            {/* Recommendation */}
            {batteryScore < 60 && (
              <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-xs text-foreground">
                  <strong>Tip:</strong> Your battery is low. Focus on balanced meals, hydration, and 7-8 hours of sleep tonight.
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}