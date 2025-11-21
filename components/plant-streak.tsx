"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Flame, Trophy, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface PlantStreakProps {
  habitsCompleted: boolean
  caloriesOnTarget: boolean
  totalHabits: number
  completedHabits: number
}

// Plant Stage Icon Components
const SeedIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="60" r="15" fill="none" strokeWidth="3" />
    <path d="M 50 45 Q 45 50 50 60" strokeWidth="2" />
    <ellipse cx="50" cy="60" rx="10" ry="7" fill="none" strokeWidth="2" />
  </svg>
)

const SproutIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="50" y1="70" x2="50" y2="40" strokeWidth="3" strokeLinecap="round" />
    <path d="M 50 40 Q 40 35 35 30" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 40 Q 60 35 65 30" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="50" cy="75" rx="8" ry="5" fill="none" strokeWidth="2" />
  </svg>
)

const SeedlingIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="50" y1="75" x2="50" y2="30" strokeWidth="3" strokeLinecap="round" />
    <path d="M 50 30 Q 35 25 30 20 Q 35 30 50 35" strokeWidth="2" fill="none" />
    <path d="M 50 30 Q 65 25 70 20 Q 65 30 50 35" strokeWidth="2" fill="none" />
    <path d="M 50 45 Q 40 43 35 40" strokeWidth="2" strokeLinecap="round" />
    <path d="M 50 45 Q 60 43 65 40" strokeWidth="2" strokeLinecap="round" />
    <rect x="45" y="75" width="10" height="5" rx="2" fill="none" strokeWidth="2" />
  </svg>
)

const YoungPlantIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="50" y1="80" x2="50" y2="25" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 50 25 Q 30 20 25 10 Q 30 25 50 32" strokeWidth="2.5" fill="none" />
    <path d="M 50 25 Q 70 20 75 10 Q 70 25 50 32" strokeWidth="2.5" fill="none" />
    <path d="M 50 40 Q 35 38 28 33" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 40 Q 65 38 72 33" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 55 Q 38 53 32 48" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 55 Q 62 53 68 48" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="42" y="80" width="16" height="8" rx="3" fill="none" strokeWidth="2.5" />
  </svg>
)

const MaturePlantIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="50" y1="85" x2="50" y2="20" strokeWidth="4" strokeLinecap="round" />
    <path d="M 50 20 Q 25 15 18 5 Q 25 22 50 30" strokeWidth="3" fill="none" />
    <path d="M 50 20 Q 75 15 82 5 Q 75 22 50 30" strokeWidth="3" fill="none" />
    <path d="M 50 35 Q 30 32 22 25" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 35 Q 70 32 78 25" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 48 Q 32 45 24 38" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 48 Q 68 45 76 38" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 60 Q 35 58 28 52" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 60 Q 65 58 72 52" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="40" y="85" width="20" height="10" rx="4" fill="none" strokeWidth="3" />
  </svg>
)

const StreakLightningIcon = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
  </svg>
)


const PLANT_STAGES = [
  { stage: 1, name: "Seed", icon: SeedIcon, minStreak: 0, color: "text-white" },
  { stage: 2, name: "Sprout", icon: SproutIcon, minStreak: 3, color: "text-green-400" },
  { stage: 3, name: "Seedling", icon: SeedlingIcon, minStreak: 7, color: "text-green-500" },
  { stage: 4, name: "Young Plant", icon: YoungPlantIcon, minStreak: 14, color: "text-green-600" },
  { stage: 5, name: "Mature Plant", icon: MaturePlantIcon, minStreak: 30, color: "text-green-700" },
]

export function PlantStreak({ habitsCompleted, caloriesOnTarget, totalHabits, completedHabits }: PlantStreakProps) {
  const { userId } = useUser()
  const [isExpanded, setIsExpanded] = useState(false)
  const [streak, setStreak] = useState({
    current_streak: 0,
    longest_streak: 0,
    plant_stage: 1,
    total_plants_grown: 0,
  })
  const [todayComplete, setTodayComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const getCurrentPlantStage = (streakCount: number) => {
    for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
      if (streakCount >= PLANT_STAGES[i].minStreak) {
        return PLANT_STAGES[i]
      }
    }
    return PLANT_STAGES[0]
  }

  const getNextPlantStage = (currentStage: number) => {
    return PLANT_STAGES.find(s => s.stage === currentStage + 1)
  }

  useEffect(() => {
    if (!userId) return

    const fetchStreak = async () => {
      try {
        let { data: streakData, error } = await supabase
          .from("streaks")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        if (error && error.code === 'PGRST116') {
          const { data: newStreak, error: insertError } = await supabase
            .from("streaks")
            .insert([{ user_id: userId }])
            .select()
            .single()

          if (insertError) throw insertError
          streakData = newStreak
        }

        if (streakData) {
          setStreak(streakData)
          
          const today = new Date().toISOString().split('T')[0]
          const { data: logData } = await supabase
            .from("streak_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("date", today)
            .maybeSingle()

          if (logData?.streak_maintained) {
            setTodayComplete(true)
          }
        }
      } catch (err) {
        console.error("Error fetching streak:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreak()
  }, [userId])

  useEffect(() => {
    if (!userId || todayComplete) return

    const updateStreak = async () => {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const goalsComplete = habitsCompleted && caloriesOnTarget

      if (!goalsComplete) return

      try {
        const { data: yesterdayLog } = await supabase
          .from("streak_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", yesterday)
          .maybeSingle()

        const shouldContinue = yesterdayLog?.streak_maintained || streak.current_streak === 0

        let newStreak = shouldContinue ? streak.current_streak + 1 : 1
        let newLongestStreak = Math.max(streak.longest_streak, newStreak)
        let newPlantStage = getCurrentPlantStage(newStreak).stage
        let newTotalPlants = streak.total_plants_grown

        if (newStreak === 30 && streak.current_streak < 30) {
          newTotalPlants += 1
          newStreak = 0
          newPlantStage = 1
        }

        await supabase
          .from("streaks")
          .update({
            current_streak: newStreak,
            longest_streak: newLongestStreak,
            plant_stage: newPlantStage,
            total_plants_grown: newTotalPlants,
            last_activity_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        await supabase
          .from("streak_logs")
          .upsert({
            user_id: userId,
            date: today,
            habits_completed: habitsCompleted,
            calories_on_target: caloriesOnTarget,
            streak_maintained: true,
          })

        setStreak({
          ...streak,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          plant_stage: newPlantStage,
          total_plants_grown: newTotalPlants,
        })
        setTodayComplete(true)
      } catch (err) {
        console.error("Error updating streak:", err)
      }
    }

    updateStreak()
  }, [habitsCompleted, caloriesOnTarget, userId, todayComplete])

  if (isLoading) return null

  const currentPlant = getCurrentPlantStage(streak.current_streak)
  const nextPlant = getNextPlantStage(currentPlant.stage)
  const progressToNext = nextPlant 
    ? ((streak.current_streak - currentPlant.minStreak) / (nextPlant.minStreak - currentPlant.minStreak)) * 100
    : 100

  const PlantIcon = currentPlant.icon

  return (
    <Card className="border border-[#c9fa5f]/30 rounded-[5px] bg-gradient-to-br from-card via-[#c9fa5f]/5 to-card overflow-hidden transition-all duration-300">
      {/* Collapsed Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center text-white m-auto">
  <StreakLightningIcon className="w-5 h-5 text-semibold" />
</div>

            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mt-8">
                Growth Streak
                <Badge className="bg-[#c9fa5f] text-black font-bold px-2 py-0.5 text-xs rounded-[5px]">
                  <Flame className="h-3 w-3 mr-1" />
                  {streak.current_streak}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlant.name} • Stage {currentPlant.stage}/5
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {todayComplete && (
              <Badge className="bg-[#c9fa5f]/20 text-[#c9fa5f] border-[#c9fa5f]/30 text-xs px-2 py-1">
                ✓ Complete
              </Badge>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#c9fa5f]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#c9fa5f]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-border/50">
          
          {/* Plant Display */}
          <div className="relative mt-4">
            <div className="flex flex-col items-center justify-center py-10 bg-muted/30 rounded-xl border-2 border-dashed border-[#c9fa5f]/30">
              <div className={`mb-4 animate-bounce-slow text-white`}>
                <PlantIcon className="w-32 h-32" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-foreground">{currentPlant.name}</p>
                <p className="text-sm text-muted-foreground">Stage {currentPlant.stage} of 5</p>
              </div>
            </div>
          </div>

          {/* Progress to Next Stage */}
          {nextPlant && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Next:</span>
                  <span className="font-semibold text-foreground">{nextPlant.name}</span>
                  <nextPlant.icon className={`w-5 h-5 ${nextPlant.color}`} />
                </div>
                <span className="text-foreground font-bold">
                  {streak.current_streak}/{nextPlant.minStreak} days
                </span>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[#c9fa5f] transition-all duration-500 rounded-full"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}

          {nextPlant === undefined && streak.current_streak === 30 && (
            <div className="text-center py-3 bg-[#c9fa5f]/10 rounded-xl border border-[#c9fa5f]/30">
              <p className="text-sm font-bold text-[#c9fa5f]"> Plant Mature! Keep going to grow another!</p>
            </div>
          )}

          {/* Daily Goals */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-[5px] border transition-all ${
              habitsCompleted 
                ? 'bg-[#c9fa5f]/10 border-[#c9fa5f]/30 shadow-sm' 
                : 'bg-muted/30 border-border/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  habitsCompleted ? 'bg-[#c9fa5f]' : 'bg-muted'
                }`}>
                  {habitsCompleted && <span className="text-xs text-black font-bold">✓</span>}
                </div>
                <span className="text-sm font-bold text-foreground">Habits</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {completedHabits}/{totalHabits} completed
              </p>
            </div>

            <div className={`p-4 rounded-[5px] border transition-all ${
              caloriesOnTarget 
                ? 'bg-[#c9fa5f]/10 border-[#c9fa5f]/30 shadow-sm' 
                : 'bg-muted/30 border-border/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  caloriesOnTarget ? 'bg-[#c9fa5f]' : 'bg-muted'
                }`}>
                  {caloriesOnTarget && <span className="text-xs text-black font-bold">✓</span>}
                </div>
                <span className="text-sm font-bold text-foreground">Calories</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {caloriesOnTarget ? 'On target' : 'Keep going'}
              </p>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="flex items-center justify-around pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Longest Streak</p>
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {streak.longest_streak}
              </p>
            </div>
            <div className="h-10 w-px bg-border/50" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Plants Grown</p>
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <MaturePlantIcon className="w-5 h-5 text-green-600" />
                {streak.total_plants_grown}
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center py-3 bg-muted/20 rounded-[5px]">
            <p className="text-sm text-muted-foreground italic">
              {streak.current_streak === 0 && "Start your journey today!"}
              {streak.current_streak > 0 && streak.current_streak < 7 && "Keep the momentum going!"}
              {streak.current_streak >= 7 && streak.current_streak < 14 && "You're on fire! Great progress!"}
              {streak.current_streak >= 14 && streak.current_streak < 30 && "Outstanding dedication!"}
              {streak.current_streak >= 30 && "Legendary streak! You're unstoppable!"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}