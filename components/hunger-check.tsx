"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface HungerCheckProps {
  isOpen: boolean
  onClose: () => void
}

const MOODS = ["happy", "neutral", "sad", "stressed", "anxious"]
const STRESS_LEVELS = ["low", "medium", "high"]

export function HungerCheck({ isOpen, onClose }: HungerCheckProps) {
  const [step, setStep] = useState(1)
  const [hungerLevel, setHungerLevel] = useState(3)
  const [hoursSinceMeal, setHoursSinceMeal] = useState(2)
  const [mood, setMood] = useState<string | null>(null)
  const [stressLevel, setStressLevel] = useState<string | null>(null)
  const [result, setResult] = useState<{ isEmotional: boolean; message: string } | null>(null)
  const { userId } = useUser()
  const supabase = createClient()

  const analyzeHunger = () => {
    const isEmotional =
      (hungerLevel <= 2 && hoursSinceMeal < 3) ||
      (mood && ["sad", "stressed", "anxious"].includes(mood)) ||
      stressLevel === "high"

    let message = ""
    if (isEmotional) {
      message =
        "This might be emotional hunger. Try drinking water and waiting 5 minutes before eating."
    } else {
      message = "Looks like real hunger! Go ahead and eat mindfully. Focus on balanced nutrition."
    }

    setResult({ isEmotional, message })
  }

  const handleSave = async () => {
    if (!userId) return

    try {
      await supabase.from("emotional_hunger_checks").insert({
        user_id: userId,
        hunger_level: hungerLevel,
        hours_since_meal: hoursSinceMeal,
        mood,
        stress_level: stressLevel,
        is_emotional: result?.isEmotional,
      })

      setTimeout(() => {
        onClose()
        setStep(1)
        setResult(null)
      }, 3000)
    } catch (error) {
      console.error("Error saving hunger check:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-card border border-border/50 p-6">
        {result ? (
          <>
            <div className="flex flex-col items-center text-center space-y-4">
              {result.isEmotional ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-[#c9fa5f]" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground">
                {result.isEmotional ? "Emotional Hunger Detected" : "Physical Hunger"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.message}</p>
              <Button
                onClick={handleSave}
                className="w-full bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
              >
                Got it!
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Are you really hungry?</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Hunger level (1 = not hungry, 5 = very hungry)
                  </label>
                  <Slider
                    value={[hungerLevel]}
                    onValueChange={(v) => setHungerLevel(v[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Not hungry</span>
                    <span className="font-semibold text-[#c9fa5f]">{hungerLevel}</span>
                    <span>Very hungry</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Hours since last meal
                  </label>
                  <Slider
                    value={[hoursSinceMeal]}
                    onValueChange={(v) => setHoursSinceMeal(v[0])}
                    min={0}
                    max={12}
                    step={0.5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Just ate</span>
                    <span className="font-semibold text-[#c9fa5f]">{hoursSinceMeal}h</span>
                    <span>12+ hours</span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
                >
                  Next
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Current mood
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["😊 Happy", "😐 Neutral", "😢 Sad", "😰 Stressed", "😟 Anxious"].map((m) => {
                      const [emoji, ...labelParts] = m.split(" ")
                      const label = labelParts.join(" ")
                      const value = label.toLowerCase()
                      return (
                        <button
                          key={value}
                          onClick={() => setMood(value)}
                          className={`p-3 rounded-lg text-sm transition-all ${
                            mood === value
                              ? "bg-[#c9fa5f]/20 border-2 border-[#c9fa5f]"
                              : "bg-muted/30 border-2 border-transparent"
                          }`}
                        >
                          <div className="text-2xl mb-1">{emoji}</div>
                          <div className="text-xs">{label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Stress level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STRESS_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setStressLevel(level)}
                        className={`p-3 rounded-lg text-sm capitalize transition-all ${
                          stressLevel === level
                            ? "bg-[#c9fa5f]/20 border-2 border-[#c9fa5f]"
                            : "bg-muted/30 border-2 border-transparent"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={analyzeHunger}
                    disabled={!mood || !stressLevel}
                    className="flex-1 bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
                  >
                    Check
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}



















// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider"
// import { X, AlertCircle, CheckCircle2 } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import { useUser } from "@/hooks/use-user"

// interface HungerCheckProps {
//   isOpen: boolean
//   onClose: () => void
// }

// const MOODS = ["happy", "neutral", "sad", "stressed", "anxious"]
// const STRESS_LEVELS = ["low", "medium", "high"]

// export function HungerCheck({ isOpen, onClose }: HungerCheckProps) {
//   const [step, setStep] = useState(1)
//   const [hungerLevel, setHungerLevel] = useState(3)
//   const [hoursSinceMeal, setHoursSinceMeal] = useState(2)
//   const [mood, setMood] = useState<string | null>(null)
//   const [stressLevel, setStressLevel] = useState<string | null>(null)
//   const [result, setResult] = useState<{ isEmotional: boolean; message: string;  } | null>(null)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const { userId } = useUser()
//   const supabase = createClient()

//   const analyzeHunger = async () => {
//   setIsAnalyzing(true);
  
//   try {
//     // Call AI API for analysis
//     const response = await fetch('/api/analyze-emotion', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         emotionText: `Hunger level: ${hungerLevel}/10. Mood: ${mood}. Stress: ${stressLevel}. Hours since meal: ${hoursSinceMeal}`,
//         type: 'hunger'
//       })
//     });

//     const { analysis } = await response.json();

//     const isEmotional = analysis.hunger_type === 'emotional';
//     const message = analysis.suggestion || (isEmotional
//       ? "This might be emotional hunger. Try drinking water and waiting 5 minutes before eating."
//       : "Looks like real hunger! Go ahead and eat mindfully. Focus on balanced nutrition.");

//     setResult({ isEmotional, message, analysis });

//     // Save to database with AI analysis
//     if (userId) {
//       await supabase.from('hunger_checks_v2').insert({
//         user_id: userId,
//         hunger_level: hungerLevel,
//         emotion_text: `${mood}, ${stressLevel} stress`,
//         ai_hunger_type: analysis.hunger_type,
//         ai_suggestion: analysis.suggestion,
//         decided_to_eat: null
//       });
//     }
//   } catch (error) {
//     console.error('Error analyzing hunger:', error);
//     // Fallback to basic analysis
//     const isEmotional = (hungerLevel <= 2 && hoursSinceMeal < 3) || 
//                         (mood && ["sad", "stressed", "anxious"].includes(mood)) || 
//                         stressLevel === "high";
//     setResult({ 
//       isEmotional, 
//       message: isEmotional ? "This might be emotional hunger." : "Looks like real hunger!"
//     });
//   } finally {
//     setIsAnalyzing(false);
//   }
// };

//   const handleSave = async () => {
//     if (!userId) return

//     try {
//       await supabase.from("emotional_hunger_checks").insert({
//         user_id: userId,
//         hunger_level: hungerLevel,
//         hours_since_meal: hoursSinceMeal,
//         mood,
//         stress_level: stressLevel,
//         is_emotional: result?.isEmotional,
//       })

//       setTimeout(() => {
//         onClose()
//         setStep(1)
//         setResult(null)
//       }, 3000)
//     } catch (error) {
//       console.error("Error saving hunger check:", error)
//     }
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
//       <Card className="w-full max-w-md bg-card border border-border/50 p-6">
//         {result ? (
//           <>
//             <div className="flex flex-col items-center text-center space-y-4">
//               {result.isEmotional ? (
//                 <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
//                   <AlertCircle className="h-8 w-8 text-amber-500" />
//                 </div>
//               ) : (
//                 <div className="w-16 h-16 rounded-full bg-[#c9fa5f]/20 flex items-center justify-center">
//                   <CheckCircle2 className="h-8 w-8 text-[#c9fa5f]" />
//                 </div>
//               )}
//               <h3 className="text-lg font-semibold text-foreground">
//                 {result.isEmotional ? "Emotional Hunger Detected" : "Physical Hunger"}
//               </h3>
//               <p className="text-sm text-muted-foreground leading-relaxed">{result.message}</p>
//               <Button
//                 onClick={handleSave}
//                 className="w-full bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
//               >
//                 Got it!
//               </Button>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-foreground">Are you really hungry?</h3>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={onClose}
//                 className="h-8 w-8 p-0 hover:bg-muted"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>

//             {step === 1 && (
//               <div className="space-y-6">
//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-3 block">
//                     Hunger level (1 = not hungry, 5 = very hungry)
//                   </label>
//                   <Slider
//                     value={[hungerLevel]}
//                     onValueChange={(v) => setHungerLevel(v[0])}
//                     min={1}
//                     max={5}
//                     step={1}
//                     className="mb-2"
//                   />
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>Not hungry</span>
//                     <span className="font-semibold text-[#c9fa5f]">{hungerLevel}</span>
//                     <span>Very hungry</span>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-3 block">
//                     Hours since last meal
//                   </label>
//                   <Slider
//                     value={[hoursSinceMeal]}
//                     onValueChange={(v) => setHoursSinceMeal(v[0])}
//                     min={0}
//                     max={12}
//                     step={0.5}
//                     className="mb-2"
//                   />
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>Just ate</span>
//                     <span className="font-semibold text-[#c9fa5f]">{hoursSinceMeal}h</span>
//                     <span>12+ hours</span>
//                   </div>
//                 </div>

//                 <Button
//                   onClick={() => setStep(2)}
//                   className="w-full bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}

//             {step === 2 && (
//               <div className="space-y-6">
//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-3 block">
//                     Current mood
//                   </label>
//                   <div className="grid grid-cols-3 gap-2">
//                     {["😊 Happy", "😐 Neutral", "😢 Sad", "😰 Stressed", "😟 Anxious"].map((m) => {
//                       const [emoji, ...labelParts] = m.split(" ")
//                       const label = labelParts.join(" ")
//                       const value = label.toLowerCase()
//                       return (
//                         <button
//                           key={value}
//                           onClick={() => setMood(value)}
//                           className={`p-3 rounded-lg text-sm transition-all ${
//                             mood === value
//                               ? "bg-[#c9fa5f]/20 border-2 border-[#c9fa5f]"
//                               : "bg-muted/30 border-2 border-transparent"
//                           }`}
//                         >
//                           <div className="text-2xl mb-1">{emoji}</div>
//                           <div className="text-xs">{label}</div>
//                         </button>
//                       )
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-3 block">
//                     Stress level
//                   </label>
//                   <div className="grid grid-cols-3 gap-2">
//                     {STRESS_LEVELS.map((level) => (
//                       <button
//                         key={level}
//                         onClick={() => setStressLevel(level)}
//                         className={`p-3 rounded-lg text-sm capitalize transition-all ${
//                           stressLevel === level
//                             ? "bg-[#c9fa5f]/20 border-2 border-[#c9fa5f]"
//                             : "bg-muted/30 border-2 border-transparent"
//                         }`}
//                       >
//                         {level}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex gap-3">
//                   <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
//                     Back
//                   </Button>
//                  <Button
//   onClick={analyzeHunger}
//   disabled={!mood || !stressLevel || isAnalyzing}
//   className="flex-1 bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
// >
//   {isAnalyzing ? "Analyzing..." : "Check"}
// </Button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </Card>
//     </div>
//   )
// }