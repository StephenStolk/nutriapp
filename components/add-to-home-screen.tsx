// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { X, Download, Share, Plus } from "lucide-react"

// interface BeforeInstallPromptEvent extends Event {
//   prompt: () => Promise<void>
//   userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
// }

// export function AddToHomeScreen() {
//   const [showPrompt, setShowPrompt] = useState(false)
//   const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
//   const [isIOS, setIsIOS] = useState(false)
//   const [isStandalone, setIsStandalone] = useState(false)

//   useEffect(() => {
//     // Check if already installed
//     const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
//     setIsStandalone(isInStandaloneMode)

//     // Check if iOS
//     const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
//     setIsIOS(iOS)

//     // Check if user has dismissed before
//     const dismissed = localStorage.getItem('pwa-prompt-dismissed')
//     const dismissedTime = dismissed ? parseInt(dismissed) : 0
//     const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

//     // Show prompt if not installed, not dismissed recently (7 days), and visited multiple times
//     const visitCount = parseInt(localStorage.getItem('visit-count') || '0') + 1
//     localStorage.setItem('visit-count', visitCount.toString())

//     if (!isInStandaloneMode && daysSinceDismissed > 7 && visitCount >= 2) {
//       setTimeout(() => setShowPrompt(true), 3000) // Show after 3 seconds
//     }

//     // Listen for beforeinstallprompt event (Android/Chrome)
//     const handleBeforeInstallPrompt = (e: Event) => {
//       e.preventDefault()
//       setDeferredPrompt(e as BeforeInstallPromptEvent)
//     }

//     window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

//     return () => {
//       window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
//     }
//   }, [])

//   const handleInstallClick = async () => {
//     if (deferredPrompt) {
//       deferredPrompt.prompt()
//       const { outcome } = await deferredPrompt.userChoice
      
//       if (outcome === 'accepted') {
//         setShowPrompt(false)
//       }
//       setDeferredPrompt(null)
//     }
//   }

//   const handleDismiss = () => {
//     localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
//     setShowPrompt(false)
//   }

//   if (!showPrompt || isStandalone) return null

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
//       <Card className="w-full max-w-md bg-card rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
//               <Download className="h-6 w-6 text-black" />
//             </div>
//             <div>
//               <h3 className="text-base font-semibold text-foreground">Install App</h3>
//               <p className="text-xs text-muted-foreground">Quick access from your home screen</p>
//             </div>
//           </div>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleDismiss}
//             className="h-8 w-8 p-0 -mt-1 -mr-1"
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         <div className="space-y-3 mb-5">
//           <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
//             <div className="w-8 h-8 rounded-lg bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0">
//               <span className="text-lg">⚡</span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-foreground">Faster Access</p>
//               <p className="text-xs text-muted-foreground">Launch directly from your home screen</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
//             <div className="w-8 h-8 rounded-lg bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0">
//               <span className="text-lg">📱</span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-foreground">Native Experience</p>
//               <p className="text-xs text-muted-foreground">Full-screen app-like interface</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
//             <div className="w-8 h-8 rounded-lg bg-[#c9fa5f]/20 flex items-center justify-center flex-shrink-0">
//               <span className="text-lg">🔔</span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-foreground">Stay Updated</p>
//               <p className="text-xs text-muted-foreground">Get reminders for your habits</p>
//             </div>
//           </div>
//         </div>

//         {isIOS ? (
//           <div className="space-y-3">
//             <p className="text-sm text-foreground font-medium text-center">To install on iOS:</p>
//             <div className="flex items-start gap-3 p-3 bg-[#c9fa5f]/10 rounded-lg border border-[#c9fa5f]/30">
//               <Share className="h-5 w-5 text-[#c9fa5f] flex-shrink-0 mt-0.5" />
//               <div className="text-xs text-foreground">
//                 <p className="font-medium mb-1">1. Tap the Share button below</p>
//                 <p className="text-muted-foreground mb-2">2. Scroll and tap "Add to Home Screen"</p>
//                 <p className="text-muted-foreground">3. Tap "Add" to confirm</p>
//               </div>
//             </div>
//             <Button
//               variant="outline"
//               onClick={handleDismiss}
//               className="w-full rounded-lg"
//             >
//               Got it!
//             </Button>
//           </div>
//         ) : (
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               onClick={handleDismiss}
//               className="flex-1 rounded-lg"
//             >
//               Maybe Later
//             </Button>
//             <Button
//               onClick={handleInstallClick}
//               className="flex-1 rounded-lg bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-medium"
//               disabled={!deferredPrompt}
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Install Now
//             </Button>
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }