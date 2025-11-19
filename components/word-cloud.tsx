"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Cloud } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface WordCloudProps {
  isOpen: boolean
  onClose: () => void
}

export function WordCloud({ isOpen, onClose }: WordCloudProps) {
  const [words, setWords] = useState<Array<{ text: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    loadWordCloud()
  }, [userId, isOpen])

  const loadWordCloud = async () => {
    setLoading(true)
    try {
      // Get notes, cravings, triggers from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: notes } = await supabase
        .from('user_notes')
        .select('note_text')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { data: cravings } = await supabase
        .from('craving_logs')
        .select('craving_type, trigger')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { data: guiltLogs } = await supabase
        .from('guilt_free_logs')
        .select('guilt_keywords')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Extract and count words
      const wordMap: Record<string, number> = {}

      // From notes
      notes?.forEach(n => {
        const words = n.note_text.toLowerCase().split(/\s+/)
        words.forEach(w => {
          const cleaned = w.replace(/[^a-z]/g, '')
          if (cleaned.length > 3) {
            wordMap[cleaned] = (wordMap[cleaned] || 0) + 1
          }
        })
      })

      // From cravings
      cravings?.forEach(c => {
        wordMap[c.craving_type] = (wordMap[c.craving_type] || 0) + 2
        wordMap[c.trigger.replace('_', ' ')] = (wordMap[c.trigger.replace('_', ' ')] || 0) + 2
      })

      // From guilt keywords
      guiltLogs?.forEach(g => {
        g.guilt_keywords?.forEach((kw: string) => {
          wordMap[kw] = (wordMap[kw] || 0) + 3 // Weight guilt words higher
        })
      })

      // Convert to array and sort
      const wordArray = Object.entries(wordMap)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // Top 20 words

      setWords(wordArray)
    } catch (error) {
      console.error('Error loading word cloud:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFontSize = (count: number, maxCount: number) => {
    const minSize = 12
    const maxSize = 36
    const ratio = count / maxCount
    return minSize + (maxSize - minSize) * ratio
  }

  const getColor = (count: number, maxCount: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return "text-[#c9fa5f]"
    if (ratio > 0.4) return "text-[#c9fa5f]/70"
    return "text-muted-foreground"
  }

  if (!isOpen) return null

  const maxCount = Math.max(...words.map(w => w.count), 1)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 font-semibold rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <Cloud className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-foreground mt-4">Trigger Word Cloud</h3>
              <p className="text-xs text-muted-foreground">Your emotional patterns (last 30 days)</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing patterns...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="py-12 text-center">
            <Cloud className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Not enough data yet. Keep logging!</p>
          </div>
        ) : (
          <>
            <div className="min-h-[300px] bg-muted/20 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 mb-4">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className={`font-bold transition-all duration-300 hover:scale-110 cursor-default ${getColor(word.count, maxCount)}`}
                  style={{
                    fontSize: `${getFontSize(word.count, maxCount)}px`,
                    lineHeight: 1.2,
                  }}
                >
                  {word.text}
                </span>
              ))}
            </div>

            {/* Top trigger with suggestion */}
            {words.length > 0 && (
              <div className="p-4 bg-[#c9fa5f]/10 border border-[#c9fa5f]/20 rounded-[5px]">
                <p className="text-sm text-foreground">
                  <strong className="text-[#c9fa5f]">Your top trigger:</strong> {words[0].text}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {words[0].text.includes('stress') || words[0].text.includes('anxiety') 
                    ? "Try stress-relief techniques: deep breathing, walks, or journaling before eating."
                    : words[0].text.includes('late') || words[0].text.includes('night')
                    ? "Set a kitchen closing time and prepare satisfying dinners to prevent late-night grazing."
                    : words[0].text.includes('bored')
                    ? "Create a boredom toolkit: activities that engage you without food."
                    : "Awareness is the first step. Track when this trigger appears and plan alternatives."}
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}