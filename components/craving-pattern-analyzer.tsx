// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { X, TrendingUp, AlertCircle } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import { useUser } from "@/hooks/use-user"

// interface CravingPatternAnalyzerProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function CravingPatternAnalyzer({ isOpen, onClose }: CravingPatternAnalyzerProps) {
//   const [patterns, setPatterns] = useState<any[]>([])
//   const [weeklyCravingScore, setWeeklyCravingScore] = useState(0)
//   const [loading, setLoading] = useState(true)
//   const { userId } = useUser()
//   const supabase = createClient()

//   useEffect(() => {
//     if (!userId || !isOpen) return
//     analyzeCravingPatterns()
//   }, [userId, isOpen])

//   const analyzeCravingPatterns = async () => {
//     setLoading(true)
//     try {
//       const weekAgo = new Date()
//       weekAgo.setDate(weekAgo.getDate() - 7)

//       const { data: cravings } = await supabase
//         .from('craving_logs')
//         .select('*')
//         .eq('user_id', userId)
//         .gte('created_at', weekAgo.toISOString())

//       if (!cravings || cravings.length === 0) {
//         setLoading(false)
//         return
//       }

//       // Analyze patterns
//       const patternMap: Record<string, any> = {}

//       cravings.forEach(craving => {
//         const key = `${craving.craving_type}_${craving.trigger}`
//         if (!patternMap[key]) {
//           patternMap[key] = {
//             cravingType: craving.craving_type,
//             trigger: craving.trigger,
//             count: 0,
//             avgIntensity: 0,
//             totalIntensity: 0,
//             sleepPattern: [],
//             stressPattern: [],
//             chain: ''
//           }
//         }

//         patternMap[key].count++
//         patternMap[key].totalIntensity += craving.intensity || 5
//         if (craving.sleep_hours) patternMap[key].sleepPattern.push(craving.sleep_hours)
//         if (craving.stress_level_at_time) patternMap[key].stressPattern.push(craving.stress_level_at_time)
//       })

//       // Calculate patterns and chains
//       const patternArray = Object.values(patternMap).map(p => {
//         const avgIntensity = p.totalIntensity / p.count
//         const avgSleep = p.sleepPattern.length > 0 
//           ? p.sleepPattern.reduce((a: number, b: number) => a + b, 0) / p.sleepPattern.length 
//           : null
//         const avgStress = p.stressPattern.length > 0
//           ? p.stressPattern.reduce((a: number, b: number) => a + b, 0) / p.stressPattern.length
//           : null

//         // Build chain
//         let chain = ''
//         if (avgSleep && avgSleep < 6) chain += 'Low sleep → '
//         if (avgStress && avgStress > 6) chain += 'High stress → '
//         chain += `${p.cravingType} craving spike`

//         return {
//           ...p,
//           avgIntensity: Math.round(avgIntensity * 10) / 10,
//           avgSleep: avgSleep ? Math.round(avgSleep * 10) / 10 : null,
//           avgStress: avgStress ? Math.round(avgStress) : null,
//           chain
//         }
//       }).sort((a, b) => b.count - a.count)

//       setPatterns(patternArray)

//       // Calculate weekly score (0-100, lower is better)
//       const totalCravings = cravings.length
//       const avgIntensity = cravings.reduce((sum, c) => sum + (c.intensity || 5), 0) / totalCravings
//       const score = Math.min(100, Math.round((totalCravings * avgIntensity) / 2))
//       setWeeklyCravingScore(score)
//     } catch (error) {
//       console.error('Error analyzing patterns:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
//       <Card className="w-full max-w-2xl bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
//               <TrendingUp className="h-5 w-5 text-purple-500" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-foreground">Craving Pattern Analyzer</h3>
//               <p className="text-xs text-muted-foreground">Understanding your craving triggers</p>
//             </div>
//           </div>
//           <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {loading ? (
//           <div className="py-12 text-center">
//             <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
//           </div>
//         ) : patterns.length === 0 ? (
//           <div className="py-12 text-center">
//             <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
//             <p className="text-sm text-muted-foreground">No craving data for this week</p>
//           </div>
//         ) : (
//           <>
//             {/* Weekly Craving Score */}
//             <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-semibold text-foreground">Weekly Craving Score</span>
//                 <span className="text-3xl font-bold text-purple-500">{weeklyCravingScore}</span>
//               </div>
//               <div className="relative h-2 bg-muted rounded-full overflow-hidden">
//                 <div
//                   className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-1000 rounded-full"
//                   style={{ width: `${weeklyCravingScore}%` }}
//                 />
//               </div>
//               <p className="text-xs text-muted-foreground mt-2">
//                 {weeklyCravingScore < 30 ? "Excellent control! Keep it up." :
//                  weeklyCravingScore < 60 ? "Good progress. Stay mindful." :
//                  "High craving activity. Focus on triggers below."}
//               </p>
//             </div>

//             {/* Top Patterns */}
//             <div className="space-y-3">
//               <h4 className="text-sm font-semibold text-foreground">Your Strongest Craving Patterns</h4>
//               {patterns.map((pattern, idx) => (
//                 <Card key={idx} className="p-4 bg-muted/30 border-border/50">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                       <h5 className="text-sm font-semibold text-foreground mb-1 capitalize">
//                         {pattern.cravingType} Cravings
//                       </h5>
//                       <p className="text-xs text-muted-foreground capitalize">
//                         Trigger: {pattern.trigger.replace('_', ' ')}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-lg font-bold text-foreground">{pattern.count}x</div>
//                       <div className="text-xs text-muted-foreground">
//                         Intensity: {pattern.avgIntensity}/10
//                       </div>
//                     </div>
//                   </div>

//                   {/* Craving Chain */}
//                   <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-3">
//                     <p className="text-xs font-semibold text-purple-500 mb-1">Craving Chain</p>
//                     <p className="text-xs text-foreground">{pattern.chain}</p>
//                   </div>

//                   {/* Correlations */}
//                   {(pattern.avgSleep || pattern.avgStress) && (
//                     <div className="flex gap-2 text-xs">
//                       {pattern.avgSleep && (
//                         <div className="flex-1 p-2 bg-muted/50 rounded">
//                           <span className="text-muted-foreground">Avg Sleep: </span>
//                           <span className={`font-semibold ${pattern.avgSleep < 6 ? 'text-orange-500' : 'text-[#c9fa5f]'}`}>
//                             {pattern.avgSleep}h
//                           </span>
//                         </div>
//                       )}
//                       {pattern.avgStress && (
//                         <div className="flex-1 p-2 bg-muted/50 rounded">
//                           <span className="text-muted-foreground">Avg Stress: </span>
//                           <span className={`font-semibold ${pattern.avgStress > 6 ? 'text-orange-500' : 'text-[#c9fa5f]'}`}>
//                             {pattern.avgStress}/10
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </Card>
//               ))}
//             </div>
//           </>
//         )}
//       </Card>
//     </div>
//   )
// }