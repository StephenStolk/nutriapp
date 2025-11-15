"use client"

import { Calendar, CheckSquare, Home, Plus, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type ActivePage = "landing" | "home" | "dashboard" | "meal-planner" | "profile" | "quick-meals" | "todos" | "journal"

export function BottomNav({
  activePage,
  onNavigate,
}: {
  activePage: ActivePage
  onNavigate: (page: ActivePage) => void
}) {
  const left = [
    { id: "dashboard" as ActivePage, label: "Home", icon: Home },
    { id: "meal-planner" as ActivePage, label: "Planner", icon: Calendar },
  ]
  const right = [
    { id: "quick-meals" as ActivePage, label: "Quick", icon: Zap },
    { id: "todos" as ActivePage, label: "Todos", icon: CheckSquare },
  ]

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-md px-4">
        <div className="relative mx-auto flex items-center justify-between rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
          {/* Left group */}
          <div className="flex items-center gap-3">
            {left.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
      ? "bg-[#c9fa5f] text-black"
      : "text-white bg-transparent",
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Center FAB */}
          <button
            onClick={() => onNavigate("home")}
            aria-label="Analyze Food"
            title="Analyze Food"
            className="group absolute -top-4 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/25 transition-[transform,opacity] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Analyze Food</span>
          </button>

          {/* Right group */}
          <div className="ml-auto flex items-center gap-3">
            {right.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
      ? "bg-[#c9fa5f] text-black"
      : "text-white bg-transparent",
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
