// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { X, AlertTriangle, Clock } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import { useUser } from "@/hooks/use-user"

// interface TriggerHeatmapProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function TriggerHeatmap({ isOpen, onClose }: TriggerHeatmapProps) {
//   const [heatmapData, setHeatmapData] = useState<number[][]>(Array(7).fill(0).map(() => Array(24).fill(0)))
//   const [riskWindow, setRiskWindow] = useState<{ hour: number; risk: number } | null>(null)
//   const [loading, setLoading] = useState(true)
//   const { userId } = useUser()
//   const supabase = createClient()

//   useEffect(() => {
//     if (!userId || !isOpen) return
//     loadTriggerHeatmap()
//   }, [userId, isOpen])

//   const loadTriggerHeatmap = async () => {
//     setLoading(true)
//     try {
//       const thirtyDaysAgo = new Date()
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

//       // Get all triggers with timestamps
//       const { data: triggers } = await supabase
//         .from('trigger_logs')
//         .select('created_at')
//         .eq('user_id', userId)
//         .gte('created_at', thirtyDaysAgo.toISOString())

//       const { data: cravings } = await supabase
//         .from('craving_logs')
//         .select('created_at')
//         .eq('user_id', userId)
//         .gte('created_at', thirtyDaysAgo.toISOString())

//       // Build heatmap: [day of week][hour] = count
//       const heatmap = Array(7).fill(0).map(() => Array(24).fill(0))
      
//       const allEvents = [...(triggers || []), ...(cravings || [])]
//       allEvents.forEach(event => {
//         const date = new Date(event.created_at)
//         const day = date.getDay()
//         const hour = date.getHours()
//         heatmap[day][hour]++
//       })

//       setHeatmapData(heatmap)

//       // Predict high-risk window for today
//       const today = new Date().getDay()
//       const currentHour = new Date().getHours()
//       const todayData = heatmap[today]
      
//       // Find peak hour in next 6 hours
//       let maxRisk = 0
//       let riskHour = currentHour
//       for (let h = currentHour; h < Math.min(currentHour + 6, 24); h++) {
//         if (todayData[h] > maxRisk) {
//           maxRisk = todayData[h]
//           riskHour = h
//         }
//       }

//       if (maxRisk > 2) {
//         setRiskWindow({
//           hour: riskHour,
//           risk: Math.min(Math.round((maxRisk / Math.max(...todayData)) * 100), 100)
//         })
//       }
//     } catch (error) {
//       console.error('Error loading heatmap:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!isOpen) return null

//   const maxValue = Math.max(...heatmapData.flat(), 1)
//   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

//   const getColor = (value: number) => {
//     const intensity = value / maxValue
//     if (intensity === 0) return 'bg-muted/30'
//     if (intensity < 0.25) return 'bg-green-500/30'
//     if (intensity < 0.5) return 'bg-yellow-500/50'
//     if (intensity < 0.75) return 'bg-orange-500/60'
//     return 'bg-red-500/70'
//   }

//   return (
//     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
//       <Card className="w-full max-w-4xl bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
//               <Clock className="h-5 w-5 text-orange-500" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-foreground">Trigger Heatmap</h3>
//               <p className="text-xs text-muted-foreground">When cravings strike most</p>
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
//         ) : (
//           <>
//             {/* Risk Alert */}
//             {riskWindow && (
//               <div className="mb-4 p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl">
//                 <div className="flex items-center gap-3">
//                   <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0" />
//                   <div className="flex-1">
//                     <h4 className="text-sm font-semibold text-foreground mb-1">
//                       High Risk Window Predicted
//                     </h4>
//                     <p className="text-xs text-muted-foreground">
//                       {riskWindow.risk}% chance of craving around{' '}
//                       {riskWindow.hour === 0 ? '12' : riskWindow.hour > 12 ? riskWindow.hour - 12 : riskWindow.hour}
//                       {riskWindow.hour >= 12 ? 'PM' : 'AM'}. 
//                       Take 3 deep breaths before reaching for food.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Heatmap Grid */}
//             <div className="overflow-x-auto">
//               <div className="min-w-[600px]">
//                 {/* Hour labels */}
//                 <div className="flex mb-2">
//                   <div className="w-12" />
//                   {[...Array(24)].map((_, hour) => (
//                     <div key={hour} className="flex-1 text-center">
//                       <span className="text-xs text-muted-foreground">
//                         {hour === 0 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour-12}P`}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Heatmap rows */}
//                 {days.map((day, dayIndex) => (
//                   <div key={day} className="flex items-center mb-1">
//                     <div className="w-12 text-xs font-medium text-muted-foreground">{day}</div>
//                     {heatmapData[dayIndex].map((value, hour) => (
//                       <div
//                         key={hour}
//                         className={`flex-1 h-8 mx-0.5 rounded ${getColor(value)} transition-all hover:scale-110 cursor-pointer relative group`}
//                         title={`${value} triggers`}
//                       >
//                         {value > 0 && (
//                           <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground opacity-0 group-hover:opacity-100">
//                             {value}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Legend */}
//             <div className="mt-4 flex items-center justify-center gap-4 text-xs">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-muted/30" />
//                 <span className="text-muted-foreground">None</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-green-500/30" />
//                 <span className="text-muted-foreground">Low</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-yellow-500/50" />
//                 <span className="text-muted-foreground">Medium</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-orange-500/60" />
//                 <span className="text-muted-foreground">High</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-red-500/70" />
//                 <span className="text-muted-foreground">Very High</span>
//               </div>
//             </div>
//           </>
//         )}
//       </Card>
//     </div>
//   )
// }