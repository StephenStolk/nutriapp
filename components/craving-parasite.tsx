"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingDown, TrendingUp, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface CravingParasiteProps {
  isOpen: boolean
  onClose: () => void
}

export function CravingParasite({ isOpen, onClose }: CravingParasiteProps) {
  const [parasite, setParasite] = useState({ health_points: 50, parasite_name: 'Suggo' })
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    loadParasiteData()
  }, [userId, isOpen])

  const loadParasiteData = async () => {
    setLoading(true)
    try {
      // Get or create parasite
      let { data: parasiteData } = await supabase
        .from('craving_parasite')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!parasiteData) {
        const { data: newParasite } = await supabase
          .from('craving_parasite')
          .insert({ user_id: userId, health_points: 50, parasite_name: 'Suggo' })
          .select()
          .single()
        parasiteData = newParasite
      }

      setParasite(parasiteData || { health_points: 50, parasite_name: 'Suggo' })

      // Load recent events
      const { data: events } = await supabase
        .from('parasite_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentEvents(events || [])
    } catch (error) {
      console.error('Error loading parasite:', error)
    } finally {
      setLoading(false)
    }
  }

  const resistCraving = async () => {
    if (!userId) return
    try {
      const newHealth = Math.max(0, parasite.health_points - 10)

      await supabase
        .from('craving_parasite')
        .update({ health_points: newHealth, last_updated: new Date().toISOString() })
        .eq('user_id', userId)

      await supabase.from('parasite_events').insert({
        user_id: userId,
        event_type: 'resisted',
        change_amount: -10,
        trigger_food: 'willpower',
      })

      setParasite({ ...parasite, health_points: newHealth })
      await loadParasiteData()
    } catch (error) {
      console.error('Error resisting craving:', error)
    }
  }

  if (!isOpen) return null

  const getParasiteSize = () => {
    if (parasite.health_points >= 70) return 'text-8xl'
    if (parasite.health_points >= 40) return 'text-6xl'
    if (parasite.health_points >= 20) return 'text-4xl'
    return 'text-2xl'
  }

  const getParasiteColor = () => {
    if (parasite.health_points >= 70) return 'text-red-500'
    if (parasite.health_points >= 40) return 'text-orange-500'
    return 'text-green-500'
  }

  const getParasiteEmoji = () => {
    if (parasite.health_points >= 70) return '👹'
    if (parasite.health_points >= 40) return '😈'
    if (parasite.health_points >= 20) return '👿'
    return '😇'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Craving Parasite</h3>
            <p className="text-xs text-muted-foreground">Your cravings as a creature</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Parasite Visual */}
            <div className="mb-6 text-center">
              <div className={`${getParasiteSize()} ${getParasiteColor()} transition-all duration-500 mb-3`}>
                {getParasiteEmoji()}
              </div>
              <h4 className="text-xl font-bold text-foreground mb-1">{parasite.parasite_name}</h4>
              <p className="text-sm text-muted-foreground">
                {parasite.health_points >= 70 ? 'Dominating your mind' :
                 parasite.health_points >= 40 ? 'Growing stronger' :
                 parasite.health_points >= 20 ? 'Getting weaker' :
                 'Almost defeated!'}
              </p>
            </div>

            {/* Health Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Parasite Strength</span>
                <span className="text-sm font-bold text-foreground">{parasite.health_points}/100</span>
              </div>
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 rounded-full ${
                    parasite.health_points >= 70 ? 'bg-red-500' :
                    parasite.health_points >= 40 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${parasite.health_points}%` }}
                />
              </div>
            </div>

            {/* Resist Button */}
            <Button
              onClick={resistCraving}
              className="w-full mb-6 bg-[#c9fa5f] text-black rounded-[5px] hover:bg-[#b8e954] font-semibold"
              disabled={parasite.health_points === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Resist Craving (-10 strength)
            </Button>

            {/* Recent Events */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Recent Battles</h4>
              <div className="space-y-2">
                {recentEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events yet</p>
                ) : (
                  recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-[5px] ${
                        event.event_type === 'resisted' || event.event_type === 'shrunk'
                          ? 'bg-[#c9fa5f]/10'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.event_type === 'resisted' || event.event_type === 'shrunk' ? (
                            <TrendingDown className="h-4 w-4 text-white" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-white" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground capitalize ml-4 text-center">
                              {event.event_type === 'resisted' ? 'Resisted!' :
                               event.event_type === 'shrunk' ? 'Weakened' :
                               event.event_type === 'grew' ? 'Grew Stronger' :
                               'Fed'}
                            </p>
                            {event.trigger_food && event.trigger_food !== 'willpower' && (
                              <p className="text-xs text-muted-foreground">{event.trigger_food}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${
                          event.change_amount < 0 ? 'text-[#c9fa5f]' : 'text-red-500'
                        }`}>
                          {event.change_amount > 0 ? '+' : ''}{event.change_amount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {parasite.health_points === 0 && (
              <div className="mt-4 p-4 bg-[#c9fa5f]/10 border border-[#c9fa5f]/20 rounded-lg text-center">
                <p className="text-sm font-semibold text-[#c9fa5f]">
                  🎉 You've defeated {parasite.parasite_name}! Stay vigilant—it can return.
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}