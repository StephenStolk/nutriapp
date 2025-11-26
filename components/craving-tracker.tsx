"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Cookie, Coffee, Zap, HelpCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface CravingTrackerProps {
  isOpen: boolean
  onClose: () => void
}

const CRAVING_TYPES = [
  { id: "sweet", label: "Sweet", icon: "🍰" },
  { id: "salty", label: "Salty", icon: "🍟" },
  { id: "fried", label: "Fried", icon: "🍗" },
  { id: "random", label: "Random", icon: "🎲" },
]

const TRIGGERS = [
  { id: "boredom", label: "Boredom", icon: "😑" },
  { id: "stress", label: "Stress", icon: "😰" },
  { id: "social_media", label: "Social Media", icon: "📱" },
  { id: "tv", label: "Watching TV", icon: "📺" },
  { id: "late_night", label: "Late Night", icon: "🌙" },
  { id: "unknown", label: "Not Sure", icon: "🤷" },
]

export function CravingTracker({ isOpen, onClose }: CravingTrackerProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [cravingType, setCravingType] = useState<string | null>(null)
  const [trigger, setTrigger] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { userId } = useUser()
  const supabase = createClient()

  const handleSave = async () => {
    if (!userId || !cravingType || !trigger) return

    setIsSaving(true)
    try {
      await supabase.from("craving_logs").insert({
        user_id: userId,
        craving_type: cravingType,
        trigger: trigger,
      })

      onClose()
      setStep(1)
      setCravingType(null)
      setTrigger(null)
    } catch (error) {
      console.error("Error saving craving:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {step === 1 ? "What are you craving?" : "What triggered it?"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {step === 1 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Understanding your cravings helps break unhealthy patterns
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CRAVING_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setCravingType(type.id)
                    setStep(2)
                  }}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border-2 border-transparent hover:border-[#c9fa5f]/30 transition-all duration-200"
                >
                  <span className="text-4xl">{type.icon}</span>
                  <span className="text-sm font-medium text-foreground">{type.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Identifying triggers is the first step to overcoming them
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {TRIGGERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrigger(t.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 border-2 ${
                    trigger === t.id
                      ? "bg-[#c9fa5f]/10 border-[#c9fa5f]"
                      : "bg-muted/30 border-transparent hover:border-[#c9fa5f]/30"
                  }`}
                >
                  <span className="text-3xl">{t.icon}</span>
                  <span className="text-xs font-medium text-foreground text-center">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1)
                  setTrigger(null)
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={!trigger || isSaving}
                className="flex-1 bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
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
// import { X, Cookie, Coffee, Zap, HelpCircle } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import { useUser } from "@/hooks/use-user"
// import { useSubscription } from "@/hooks/use-subscription"

// interface CravingTrackerProps {
//   isOpen: boolean
//   onClose: () => void
// }

// const CRAVING_TYPES = [
//   { id: "sweet", label: "Sweet", icon: "🍰" },
//   { id: "salty", label: "Salty", icon: "🍟" },
//   { id: "fried", label: "Fried", icon: "🍗" },
//   { id: "random", label: "Random", icon: "🎲" },
// ]

// const TRIGGERS = [
//   { id: "boredom", label: "Boredom", icon: "😑" },
//   { id: "stress", label: "Stress", icon: "😰" },
//   { id: "social_media", label: "Social Media", icon: "📱" },
//   { id: "tv", label: "Watching TV", icon: "📺" },
//   { id: "late_night", label: "Late Night", icon: "🌙" },
//   { id: "unknown", label: "Not Sure", icon: "🤷" },
// ]

// export function CravingTracker({ isOpen, onClose }: CravingTrackerProps) {
//   const [step, setStep] = useState<1 | 2>(1)
//   const [cravingType, setCravingType] = useState<string | null>(null)
//   const [trigger, setTrigger] = useState<string | null>(null)
//   const [isSaving, setIsSaving] = useState(false)
//   const { userId } = useUser()
//   const supabase = createClient()

//   const handleSave = async () => {
//   if (!userId || !cravingType || !trigger) return

//   setIsSaving(true)
//   try {
//     // Get current sleep and stress data
//     const today = new Date().toISOString().split('T')[0];
    
//     const { data: sleepData } = await supabase
//       .from('sleep_logs')
//       .select('hours')
//       .eq('user_id', userId)
//       .eq('date', today)
//       .maybeSingle();

//     const { data: stressData } = await supabase
//       .from('stress_logs')
//       .select('stress_level')
//       .eq('user_id', userId)
//       .eq('date', today)
//       .maybeSingle();

//     // Get AI analysis of the craving
//     const response = await fetch('/api/analyze-emotion', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         emotionText: `I'm craving ${cravingType}. Trigger: ${trigger}. Sleep: ${sleepData?.hours || 'unknown'}h. Stress: ${stressData?.stress_level || 'unknown'}`,
//         type: 'craving'
//       })
//     });

//     const { analysis } = await response.json();

//     // Save enhanced craving log
//     await supabase.from('craving_logs').insert({
//       user_id: userId,
//       craving_type: cravingType,
//       trigger: trigger,
//       intensity: analysis?.intensity || 5,
//       related_emotion: analysis?.emotion || null,
//       sleep_hours: sleepData?.hours || null,
//       stress_level_at_time: stressData?.stress_level === 'high' ? 8 : 
//                            stressData?.stress_level === 'medium' ? 5 : 2
//     });

//     onClose();
//     setStep(1);
//     setCravingType(null);
//     setTrigger(null);
//   } catch (error) {
//     console.error('Error saving craving:', error);
//   } finally {
//     setIsSaving(false);
//   }
// };

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
//       <Card className="w-full max-w-md bg-card border border-border/50 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-foreground">
//             {step === 1 ? "What are you craving?" : "What triggered it?"}
//           </h3>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onClose}
//             className="h-8 w-8 p-0 hover:bg-muted"
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {step === 1 ? (
//           <>
//             <p className="text-sm text-muted-foreground mb-6">
//               Understanding your cravings helps break unhealthy patterns
//             </p>
//             <div className="grid grid-cols-2 gap-3">
//               {CRAVING_TYPES.map((type) => (
//                 <button
//                   key={type.id}
//                   onClick={() => {
//                     setCravingType(type.id)
//                     setStep(2)
//                   }}
//                   className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border-2 border-transparent hover:border-[#c9fa5f]/30 transition-all duration-200"
//                 >
//                   <span className="text-4xl">{type.icon}</span>
//                   <span className="text-sm font-medium text-foreground">{type.label}</span>
//                 </button>
//               ))}
//             </div>
//           </>
//         ) : (
//           <>
//             <p className="text-sm text-muted-foreground mb-6">
//               Identifying triggers is the first step to overcoming them
//             </p>
//             <div className="grid grid-cols-2 gap-3 mb-4">
//               {TRIGGERS.map((t) => (
//                 <button
//                   key={t.id}
//                   onClick={() => setTrigger(t.id)}
//                   className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 border-2 ${
//                     trigger === t.id
//                       ? "bg-[#c9fa5f]/10 border-[#c9fa5f]"
//                       : "bg-muted/30 border-transparent hover:border-[#c9fa5f]/30"
//                   }`}
//                 >
//                   <span className="text-3xl">{t.icon}</span>
//                   <span className="text-xs font-medium text-foreground text-center">{t.label}</span>
//                 </button>
//               ))}
//             </div>
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setStep(1)
//                   setTrigger(null)
//                 }}
//                 className="flex-1"
//               >
//                 Back
//               </Button>
//               <Button
//                 onClick={handleSave}
//                 disabled={!trigger || isSaving}
//                 className="flex-1 bg-[#c9fa5f] text-black hover:bg-[#b8e954]"
//               >
//                 {isSaving ? "Saving..." : "Save"}
//               </Button>
//             </div>
//           </>
//         )}
//       </Card>
//     </div>
//   )
// }