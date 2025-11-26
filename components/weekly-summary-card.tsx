// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { TrendingUp, Award, AlertCircle, Sparkles } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import { useUser } from "@/hooks/use-user"

// export function WeeklySummaryCard() {
//   const [summary, setSummary] = useState<any>(null)
//   const [loading, setLoading] = useState(false)
//   const [generating, setGenerating] = useState(false)
//   const { userId } = useUser()
//   const supabase = createClient()

//   useEffect(() => {
//     if (!userId) return
//     loadWeeklySummary()
//   }, [userId])

//   const loadWeeklySummary = async () => {
//     setLoading(true)
//     try {
//       const weekStart = new Date()
//       weekStart.setDate(weekStart.getDate() - 7)
//       const weekStartStr = weekStart.toISOString().split('T')[0]

//       const { data } = await supabase
//         .from('weekly_summary')
//         .select('*')
//         .eq('user_id', userId)
//         .eq('week_start', weekStartStr)
//         .single()

//       setSummary(data)
//     } catch (error) {
//       console.error('Error loading summary:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const generateSummary = async () => {
//     if (!userId) return

//     setGenerating(true)
//     try {
//       const response = await fetch('/api/generate-weekly-summary', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId })
//       })

//       const { summary: newSummary } = await response.json()
//       setSummary(newSummary)
//     } catch (error) {
//       console.error('Error generating summary:', error)
//     } finally {
//       setGenerating(false)
//     }
//   }

//   if (loading) return null

//   return (
//     <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
//           <Sparkles className="h-4 w-4 text-purple-500" />
//         </div>
//         <div className="flex-1">
//           <h3 className="text-sm font-semibold text-foreground">Weekly Psychological Summary</h3>
//           <p className="text-xs text-muted-foreground">AI-generated insights</p>
//         </div>
//       </div>

//       {!summary ? (
//         <Button
//           onClick={generateSummary}
//           disabled={generating}
//           className="w-full bg-purple-500 hover:bg-purple-600 text-white"
//         >
//           {generating ? "Generating..." : "Generate This Week's Summary"}
//         </Button>
//       ) : (
//         <div className="space-y-3">
//           {/* Summary Text */}
//           <div className="p-3 bg-card rounded-lg border border-border/50">
//             <p className="text-sm text-foreground leading-relaxed">{summary.summary_text}</p>
//           </div>

//           {/* Top Emotions */}
//           {summary.top_emotions && summary.top_emotions.length > 0 && (
//             <div>
//               <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Top Emotions</h4>
//               <div className="flex flex-wrap gap-2">
//                 {summary.top_emotions.map((emotion: string, idx: number) => (
//                   <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs rounded-full border border-purple-500/30">
//                     {emotion}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Wins */}
//           {summary.wins && summary.wins.length > 0 && (
//             <div>
//               <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase flex items-center gap-1">
//                 <Award className="h-3 w-3" />
//                 This Week's Wins
//               </h4>
//               <div className="space-y-1">
//                 {summary.wins.map((win: string, idx: number) => (
//                   <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
//                     <span className="text-[#c9fa5f] mt-0.5">✓</span>
//                     <span>{win}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={generateSummary}
//             disabled={generating}
//             className="w-full"
//           >
//             {generating ? "Regenerating..." : "Regenerate Summary"}
//           </Button>
//         </div>
//       )}
//     </Card>
//   )
// }