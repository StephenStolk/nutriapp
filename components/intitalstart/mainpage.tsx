'use client'

import { SpiralAnimation } from '../spiral-animation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { useUser } from '@/hooks/use-user'

const MainPage = () => {
  const [startVisible, setStartVisible] = useState(false)
  const router = useRouter()
  const { user, userId } = useUser();
  const [message, setMessage] = useState('');
  
  const navigateToPersonalSite = () => {
    setMessage("Setting up the user");

    if(!user){
      router.push('/signup');
    }
    router.push(`/${userId}/nutrition`)
  }

  useEffect(() => {
    const timer = setTimeout(() => setStartVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
       {message && (
        <div className="absolute top-15 w-full text-center py-3 text-white text-sm font-medium z-50 ">
          {message}
        </div>
      )}

      {/* Spiral background animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Centered Title */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-1500 ease-out
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <h1 className="text-white text-4xl md:text-4xl font-medium tracking-wide select-none">
          Kalnut.
        </h1>
      </div>

      {/* Bottom Section */}
      <div
        className={`
          absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-center
          transition-all duration-1500 ease-out
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <Button
          onClick={navigateToPersonalSite}
          className="
          rounded-sm
            text-white text-sm font-medium
            px-6 py-2 border border-white/40
            bg-black/80 opacity-0.9 hover:bg-white hover:text-black transition-all duration-300
          "
        >
          Get Started →
        </Button>
      </div>
    </div>
  )
}

export { MainPage }
