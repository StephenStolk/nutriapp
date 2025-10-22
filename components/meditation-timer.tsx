"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const motivationalQuotes = [
  "Meditation is the dissolution of thoughts in eternal awareness or pure consciousness.",
  "The present moment is the only time over which we have dominion.",
  "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts.",
  "Peace comes from within. Do not seek it without.",
  "The mind is everything. What you think you become.",
  "Wherever you are, be there totally.",
  "The quieter you become, the more you are able to hear.",
  "Meditation is the tongue of the soul and the language of our spirit.",
  "In the midst of movement and chaos, keep stillness inside of you.",
  "The goal of meditation isn't to control your thoughts, it's to stop letting them control you.",
  "Breathe in peace, breathe out stress.",
  "Your calm mind is the ultimate weapon against your challenges.",
  "Meditation is a way for nourishing and blossoming the divinity within you.",
  "The best way to take care of the future is to take care of the present moment.",
  "Meditation brings wisdom; lack of meditation leaves ignorance.",
  "Be happy in the moment, that's enough. Each moment is all we need, not more.",
  "Meditation is not a way of making your mind quiet. It is a way of entering into the quiet that is already there.",
  "The thing about meditation is: You become more and more you.",
  "Meditation is the ultimate mobile device; you can use it anywhere, anytime, unobtrusively.",
  "Meditation is not about feeling a certain way. It's about feeling whatever way you feel.",
  "The success of meditation is not in achieving a particular state, but in being present to whatever arises.",
  "Meditation is the art of doing nothing and letting undone nothing that ought to be done.",
  "In meditation, we discover our inherent restlessness and impatience.",
  "Meditation is not about getting anywhere else. It is about being where you are and knowing it.",
  "The waves of the mind demand so much of Silence. But Silence is not shaken.",
  "Through meditation, the higher self is experienced.",
  "Meditation is a vital way to purify and quiet the mind, thus rejuvenating the body.",
  "The more regularly and the more deeply you meditate, the sooner you will find yourself acting always from a center of peace.",
  "Meditation is not a means to an end. It is both the means and the end.",
  "Meditation is the journey from sound to silence, from movement to stillness.",
]

interface MeditationTimerProps {
  isOpen: boolean
  onClose: () => void
}

export function MeditationTimer({ isOpen, onClose }: MeditationTimerProps) {
  const [duration, setDuration] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
      if (!audioRef.current) {
        audioRef.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/angelical-pad-143276-miTW1U3ZvuRyC8Bv38vjNb2Wui9KV9.mp3")
        audioRef.current.loop = true
        audioRef.current.volume = 0.6
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsStarted(false)
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current.currentTime = 0
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (isRunning) {
      const quoteInterval = setInterval(() => {
        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
      }, 30000)

      return () => clearInterval(quoteInterval)
    }
  }, [isRunning])

  const startMeditation = () => {
    setTimeLeft(duration * 60)
    setIsRunning(true)
    setIsStarted(true)
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  const endMeditation = () => {
    setIsRunning(false)
    setIsStarted(false)
    setTimeLeft(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    onClose()
  }

  const handleClose = () => {
    setIsRunning(false)
    setIsStarted(false)
    setTimeLeft(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
      >
        <X className="h-5 w-5" />
      </Button>

      {!isStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Meditation</h1>

          <div className="text-center space-y-6">
            <h3 className="text-xl font-medium text-white/90">Set Your Duration</h3>
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setDuration(Math.max(1, duration - 1))}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 p-0 text-xl"
              >
                -
              </Button>
              <div className="text-5xl font-bold text-white min-w-[120px] text-center">{duration}m</div>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setDuration(duration + 1)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 p-0 text-xl"
              >
                +
              </Button>
            </div>
          </div>

          <Button
            onClick={startMeditation}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-12 py-4 rounded-full text-lg font-medium mt-8"
          >
            Start Meditation
          </Button>

          <div className="text-center mt-12 px-8 max-w-md">
            <p className="text-white/80 text-base italic leading-relaxed">"{currentQuote}"</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 px-8">
          <div className="text-6xl font-light text-white tracking-wide">{formatTime(timeLeft)}</div>

          <div className="text-center px-8 max-w-lg">
            <p className="text-white/80 text-base italic leading-relaxed">"{currentQuote}"</p>
          </div>

          <Button
            onClick={endMeditation}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-3 rounded-full text-base font-medium"
          >
            END
          </Button>
        </div>
      )}
    </div>
  )
}
