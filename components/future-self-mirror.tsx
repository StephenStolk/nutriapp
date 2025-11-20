"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Target, TrendingUp, Sparkles, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface FutureSelfMirrorProps {
  isOpen: boolean
  onClose: () => void
}

const IDENTITY_TYPES = [
  {
    id: 'fit_me',
    name: 'Fit Me',
    icon: '💪',
    description: 'Strong, energetic, and athletic',
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 'disciplined_me',
    name: 'Disciplined Me',
    icon: '🎯',
    description: 'Consistent, focused, and in control',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'healthy_me',
    name: 'Healthy Me',
    icon: '🌱',
    description: 'Vibrant, balanced, and nourished',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    id: 'strong_me',
    name: 'Strong Me',
    icon: '🦾',
    description: 'Powerful, capable, and resilient',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    id: 'balanced_me',
    name: 'Balanced Me',
    icon: '⚖️',
    description: 'Harmonious, mindful, and centered',
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/30',
  },
]

export function FutureSelfMirror({ isOpen, onClose }: FutureSelfMirrorProps) {
  const [step, setStep] = useState<'select' | 'dashboard'>('select')
  const [selectedIdentity, setSelectedIdentity] = useState<any>(null)
  const [alignmentScore, setAlignmentScore] = useState(0)
  const [todayImpacts, setTodayImpacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    loadIdentityData()
  }, [userId, isOpen])

  const loadIdentityData = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Check if user has active identity
      const { data: activeIdentity } = await supabase
        .from('user_identities_future')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (activeIdentity) {
        const identityType = IDENTITY_TYPES.find(t => t.id === activeIdentity.identity_type)
        setSelectedIdentity({ ...activeIdentity, ...identityType })
        setAlignmentScore(activeIdentity.alignment_score || 0)
        setStep('dashboard')

        // Load today's impacts
        const { data: impacts } = await supabase
          .from('identity_meal_impacts')
          .select('*, food_logs(meal_type, calories, created_at)')
          .eq('user_id', userId)
          .eq('identity_id', activeIdentity.id)
          .gte('created_at', `${today}T00:00:00`)
          .order('created_at', { ascending: false })

        setTodayImpacts(impacts || [])
      } else {
        setStep('select')
      }
    } catch (error) {
      console.error('Error loading identity:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectIdentity = async (identityType: any) => {
    if (!userId) return
    try {
      const today = new Date().toISOString().split('T')[0]

      // Deactivate previous identities
      await supabase
        .from('user_identities_future')
        .update({ is_active: false })
        .eq('user_id', userId)

      // Create new identity
      const { data } = await supabase
        .from('user_identities_future')
        .insert({
          user_id: userId,
          identity_name: identityType.name,
          identity_type: identityType.id,
          alignment_score: 0,
          selected_date: today,
          is_active: true,
        })
        .select()
        .single()

      setSelectedIdentity({ ...data, ...identityType })
      setAlignmentScore(0)
      setStep('dashboard')
    } catch (error) {
      console.error('Error selecting identity:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <Target className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-foreground mt-3">Future-Self Mirror</h3>
              <p className="text-xs text-muted-foreground">Become who you want to be</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto" />
          </div>
        ) : step === 'select' ? (
          <>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Choose your future identity. Every meal will bring you closer or further from this version of yourself.
            </p>

            <div className="space-y-3 mb-8">
              {IDENTITY_TYPES.map((identity) => (
                <button
                  key={identity.id}
                  onClick={() => selectIdentity(identity)}
                  className={`w-full p-1 border-1 group rounded-[5px] bg-gradient-to-br from-[#c9fa5f]/10 via-[#c9fa5f]/5 to-transparent border-[#c9fa5f]/10 hover:border-[#c9fa5f]/60 transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{identity.icon}</div>
                    <div className="flex-1 text-left">
                      <h4 className="text-base font-bold text-foreground mb-1">{identity.name}</h4>
                      <p className="text-xs text-muted-foreground">{identity.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#c9fa5f] transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Identity Dashboard */}
            <div className={`mb-6 p-3 rounded-[5px] bg-[#c9fa5f]/10`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedIdentity.icon}</div>
                  <div>
                    <h4 className="text-base font-bold text-foreground mt-2">{selectedIdentity.name}</h4>
                    <p className="text-xs text-muted-foreground">Your chosen identity</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('select')}
                  className="text-xs"
                >
                  Change
                </Button>
              </div>

              {/* Alignment Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">Identity Alignment</span>
                  <span className="text-sm font-bold text-[#c9fa5f]">{alignmentScore.toFixed(1)}%</span>
                </div>
                <div className="relative h-3 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#c9fa5f] transition-all duration-1000 rounded-full"
                    style={{ width: `${alignmentScore}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-foreground/80">
                {alignmentScore >= 70 ? "You're living as your future self! Keep it up." :
                 alignmentScore >= 40 ? "You're making progress. Stay consistent." :
                 "Every choice matters. You're building your future self."}
              </p>
            </div>

            {/* Today's Impacts */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#c9fa5f]" />
                <h4 className="text-sm font-semibold text-foreground">Today's Impact</h4>
              </div>

              {todayImpacts.length === 0 ? (
                <div className="text-center py-6 bg-muted/20 rounded-[5px]">
                  <p className="text-sm text-muted-foreground">No meals logged yet today</p>
                  <p className="text-xs text-muted-foreground mt-1">Log a meal to see your impact</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayImpacts.map((impact) => (
                    <div
                      key={impact.id}
                      className={`p-3 rounded-lg border ${
                        impact.impact_direction === 'positive'
                          ? 'bg-[#c9fa5f]/10 border-[#c9fa5f]/30'
                          : impact.impact_direction === 'negative'
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : 'bg-muted/30 border-border/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {impact.food_logs?.meal_type || 'Meal'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(impact.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            impact.impact_direction === 'positive' ? 'text-[#c9fa5f]' : 'text-orange-500'
                          }`}>
                            {impact.impact_direction === 'positive' ? '+' : ''}{impact.impact_percentage.toFixed(1)}%
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className={`h-3 w-3 ${
                              impact.impact_direction === 'positive' ? 'text-[#c9fa5f]' : 'text-orange-500 rotate-180'
                            }`} />
                            <span className="text-xs text-muted-foreground">
                              {impact.impact_direction === 'positive' ? 'Aligned' : 'Off track'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#c9fa5f]/10 rounded-[5px]">
              <p className="text-xs text-foreground leading-relaxed">
                <strong className="text-[#c9fa5f]">Remember:</strong> You're not tracking calories—you're building your future self. Every meal is a vote for who you want to become.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}