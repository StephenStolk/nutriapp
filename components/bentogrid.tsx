"use client"

import React from "react"

export function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Grid Background */}
      <div
        className="
          fixed top-0 left-0 w-screen h-screen
          bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)]
          dark:bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)]
          [background-size:24px_24px]
          animate-grid-move
          pointer-events-none
          z-0
        "
        aria-hidden="true"
      />

      {/* Page Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
