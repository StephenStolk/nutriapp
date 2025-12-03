"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import healthQuotes from "@/lib/health-quotes.json"

export function DailyQuoteModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [quote, setQuote] = useState({ quote: "", author: "" })

  useEffect(() => {
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem('last-quote-shown')
    
    if (lastShown !== today) {
      // Get quote based on day of year for consistency
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
      const quoteIndex = dayOfYear % healthQuotes.length
      setQuote(healthQuotes[quoteIndex])
      
      // Show after a brief delay for smooth experience
      setTimeout(() => setIsOpen(true), 1000)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('last-quote-shown', new Date().toDateString())
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Quote Card */}
      <Card className="relative w-full max-w-md bg-gradient-to-br from-card via-card to-muted/20 border-2 border-[#c9fa5f]/20 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Decorative top element */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#c9fa5f] flex items-center justify-center shadow-lg">
          <Sparkles className="h-6 w-6 text-black" />
        </div>

        {/* Quote Content */}
        <div className="mt-6 text-center space-y-6">
          <div className="relative">
            <span className="absolute -top-4 -left-2 text-6xl text-[#c9fa5f]/20 font-serif">"</span>
            <p className="text-lg font-light text-foreground leading-relaxed px-4">
              {quote.quote}
            </p>
            <span className="absolute -bottom-8 -right-2 text-6xl text-[#c9fa5f]/20 font-serif">"</span>
          </div>

          <p className="text-sm text-muted-foreground italic pt-4">
            — {quote.author}
          </p>

          <div className="pt-4">
            <Button
              onClick={handleClose}
              className="px-8 py-2 rounded-[5px] bg-[#c9fa5f] hover:bg-[#b8e954] text-black font-medium transition-all duration-300 hover:scale-105"
            >
              Start Your Day
            </Button>
          </div>
        </div>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#c9fa5f] blur-3xl" />
          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-[#c9fa5f] blur-3xl" />
        </div>
      </Card>
    </div>
  )
}