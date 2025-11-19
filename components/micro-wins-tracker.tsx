"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Award, Droplets, Apple, CheckCircle2, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

export function MicroWinsTracker() {
  const [todayWins, setTodayWins] = useState(0)
  const [weeklyWins, setWeeklyWins] = useState(0)
  const [recentWins, setRecentWins] = useState<Array<{ type: string; description: string; time: string }>>([])
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    loadWins()
  }, [userId])

  const loadWins = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: allWins } = await supabase
        .from('micro_wins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })

      if (allWins) {
        const todayCount = allWins.filter(w => w.created_at.startsWith(today)).reduce((acc, w) => acc + (w.points || 1), 0)
        const weekCount = allWins.reduce((acc, w) => acc + (w.points || 1), 0)

        setTodayWins(todayCount)
        setWeeklyWins(weekCount)
        setRecentWins(
          allWins.slice(0, 5).map(w => ({
            type: w.win_type,
            description: w.description,
            time: new Date(w.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          }))
        )
      }
    } catch (error) {
      console.error('Error loading micro wins:', error)
    }
  }

  const getWinIcon = (type: string) => {
    if (type.includes('water')) return <Droplets className="h-3 w-3 text-blue-500" />
    if (type.includes('meal')) return <Apple className="h-3 w-3 text-[#c9fa5f]" />
    return <CheckCircle2 className="h-3 w-3 text-[#c9fa5f]" />
  }

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#c9fa5f] flex items-center justify-center">
            <Award className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-md font-semibold text-foreground mt-2">Micro-Wins</h3>
            <p className="text-xs text-muted-foreground">Small victories matter</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#c9fa5f]">{todayWins}</div>
          <div className="text-xs text-muted-foreground">today</div>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="mb-3 p-2 bg-muted/30 rounded-[5px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">This Week</span>
          <span className="text-xs font-bold text-foreground">{weeklyWins} wins</span>
        </div>
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#c9fa5f] transition-all duration-1000 rounded-full"
            style={{ width: `${Math.min((weeklyWins / 50) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Goal: 50 wins/week</p>
      </div>

      {/* Recent wins */}
      {recentWins.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent</h4>
          {recentWins.map((win, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0">
                {getWinIcon(win.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{win.description}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{win.time}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}