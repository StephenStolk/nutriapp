// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { X, Cloud, Plus } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import { useUser } from "@/hooks/use-user"

// interface EmotionalWordCloudProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function EmotionalWordCloud({ isOpen, onClose }: EmotionalWordCloudProps) {
//   const [words, setWords] = useState<Array<{ text: string; count: number; intensity: number }>>([])
//   const [loading, setLoading] = useState(true)
//   const [showAddEmotion, setShowAddEmotion] = useState(false)
//   const [emotionText, setEmotionText] = useState("")
//   const [saving, setSaving] = useState(false)
//   const { userId } = useUser()
//   const supabase = createClient()

//   useEffect(() => {
//     if (!userId || !isOpen) return
//     loadEmotionalWordCloud()
//   }, [userId, isOpen])

//   const loadEmotionalWordCloud = async () => {
//     setLoading(true)
//     try {
//       const thirtyDaysAgo = new Date()
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

//       // Get emotion logs with AI tags
//       const { data: emotions } = await supabase
//         .from('emotion_logs')
//         .select('ai_emotion_tag, ai_trigger_tag, intensity')
//         .eq('user_id', userId)
//         .gte('created_at', thirtyDaysAgo.toISOString())

//       // Get craving logs with emotions
//       const { data: cravings } = await supabase
//         .from('craving_logs')
//         .select('craving_type, trigger, related_emotion, intensity')
//         .eq('user_id', userId)
//         .gte('created_at', thirtyDaysAgo.toISOString())

//       // Build word frequency map with intensity
//       const wordMap: Record<string, { count: number; totalIntensity: number }> = {}

//       emotions?.forEach(e => {
//         if (e.ai_emotion_tag) {
//           if (!wordMap[e.ai_emotion_tag]) {
//             wordMap[e.ai_emotion_tag] = { count: 0, totalIntensity: 0 }
//           }
//           wordMap[e.ai_emotion_tag].count += 1
//           wordMap[e.ai_emotion_tag].totalIntensity += e.intensity || 5
//         }
//         if (e.ai_trigger_tag) {
//           if (!wordMap[e.ai_trigger_tag]) {
//             wordMap[e.ai_trigger_tag] = { count: 0, totalIntensity: 0 }
//           }
//           wordMap[e.ai_trigger_tag].count += 1
//           wordMap[e.ai_trigger_tag].totalIntensity += e.intensity || 5
//         }
//       })

//       cravings?.forEach(c => {
//         if (c.related_emotion) {
//           if (!wordMap[c.related_emotion]) {
//             wordMap[c.related_emotion] = { count: 0, totalIntensity: 0 }
//           }
//           wordMap[c.related_emotion].count += 1
//           wordMap[c.related_emotion].totalIntensity += c.intensity || 5
//         }
//       })

//       // Convert to array with average intensity
//       const wordArray = Object.entries(wordMap)
//         .map(([text, data]) => ({
//           text,
//           count: data.count,
//           intensity: Math.round(data.totalIntensity / data.count)
//         }))
//         .sort((a, b) => b.count - a.count)
//         .slice(0, 25)

//       setWords(wordArray)
//     } catch (error) {
//       console.error('Error loading word cloud:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const addEmotion = async () => {
//     if (!emotionText.trim() || !userId) return

//     setSaving(true)
//     try {
//       // Get AI analysis
//       const response = await fetch('/api/analyze-emotion', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ emotionText, type: 'emotion' })
//       })

//       const { analysis } = await response.json()

//       // Save to database
//       await supabase.from('emotion_logs').insert({
//         user_id: userId,
//         emotion_text: emotionText,
//         ai_emotion_tag: analysis?.emotion || null,
//         ai_trigger_tag: analysis?.trigger || null,
//         sentiment_score: analysis?.sentiment || 0,
//         intensity: analysis?.intensity || 5
//       })

//       setEmotionText("")
//       setShowAddEmotion(false)
//       await loadEmotionalWordCloud()
//     } catch (error) {
//       console.error('Error adding emotion:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const getFontSize = (count: number, intensity: number, maxCount: number) => {
//     const minSize = 14
//     const maxSize = 42
//     const countRatio = count / maxCount
//     const intensityRatio = intensity / 10
//     const combinedRatio = (countRatio * 0.7) + (intensityRatio * 0.3)
//     return minSize + (maxSize - minSize) * combinedRatio
//   }

//   const getColor = (intensity: number) => {
//     if (intensity >= 8) return "text-red-500"
//     if (intensity >= 6) return "text-orange-500"
//     if (intensity >= 4) return "text-[#c9fa5f]"
//     return "text-muted-foreground"
//   }

//   if (!isOpen) return null

//   const maxCount = Math.max(...words.map(w => w.count), 1)

//   return (
//     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
//       <Card className="w-full max-w-2xl bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-[#c9fa5f]/20 flex items-center justify-center">
//               <Cloud className="h-5 w-5 text-[#c9fa5f]" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-foreground">Emotional Word Cloud</h3>
//               <p className="text-xs text-muted-foreground">Your emotional eating patterns</p>
//             </div>
//           </div>
//           <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {loading ? (
//           <div className="py-12 text-center">
//             <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
//             <p className="text-sm text-muted-foreground">Analyzing patterns...</p>
//           </div>
//         ) : (
//           <>
//             {/* Add Emotion Button */}
//             {!showAddEmotion && (
//               <Button
//                 onClick={() => setShowAddEmotion(true)}
//                 className="w-full mb-4 bg-[#c9fa5f]/10 hover:bg-[#c9fa5f]/20 text-foreground border-2 border-[#c9fa5f]/30"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Log Current Feeling
//               </Button>
//             )}

//             {/* Add Emotion Form */}
//             {showAddEmotion && (
//               <div className="mb-4 p-4 bg-muted/30 rounded-xl border border-border/50">
//                 <Textarea
//                   value={emotionText}
//                   onChange={(e) => setEmotionText(e.target.value)}
//                   placeholder="How are you feeling right now? What's triggering this feeling?"
//                   className="mb-3 min-h-[80px]"
//                 />
//                 <div className="flex gap-2">
//                   <Button
//                     onClick={addEmotion}
//                     disabled={!emotionText.trim() || saving}
//                     className="flex-1 bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
//                   >
//                     {saving ? "Analyzing..." : "Save"}
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setShowAddEmotion(false)
//                       setEmotionText("")
//                     }}
//                     className="flex-1"
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Word Cloud */}
//             {words.length === 0 ? (
//               <div className="py-12 text-center">
//                 <Cloud className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
//                 <p className="text-sm text-muted-foreground">No emotional data yet. Start logging your feelings!</p>
//               </div>
//             ) : (
//               <>
//                 <div className="min-h-[300px] bg-muted/20 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 mb-4">
//                   {words.map((word, idx) => (
//                     <span
//                       key={idx}
//                       className={`font-bold transition-all duration-300 hover:scale-110 cursor-pointer ${getColor(word.intensity)}`}
//                       style={{
//                         fontSize: `${getFontSize(word.count, word.intensity, maxCount)}px`,
//                         lineHeight: 1.2,
//                       }}
//                       title={`Appeared ${word.count} times • Intensity: ${word.intensity}/10`}
//                     >
//                       {word.text}
//                     </span>
//                   ))}
//                 </div>

//                 {/* Legend */}
//                 <div className="flex items-center justify-center gap-4 text-xs">
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 rounded-full bg-red-500" />
//                     <span className="text-muted-foreground">High intensity</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 rounded-full bg-orange-500" />
//                     <span className="text-muted-foreground">Medium</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 rounded-full bg-[#c9fa5f]" />
//                     <span className="text-muted-foreground">Low</span>
//                   </div>
//                 </div>

//                 {/* Top Emotion */}
//                 {words.length > 0 && (
//                   <div className="mt-4 p-4 bg-[#c9fa5f]/10 border border-[#c9fa5f]/20 rounded-lg">
//                     <p className="text-sm text-foreground">
//                       <strong className="text-[#c9fa5f]">Your dominant emotion:</strong> {words[0].text}
//                     </p>
//                     <p className="text-xs text-muted-foreground mt-2">
//                       This pattern appeared {words[0].count} times with an average intensity of {words[0].intensity}/10.
//                     </p>
//                   </div>
//                 )}
//               </>
//             )}
//           </>
//         )}
//       </Card>
//     </div>
//   )
// }