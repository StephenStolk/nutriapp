'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/landing" || pathname === "/landing/"

  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-playfair text-2xl font-bold tracking-tight text-black/80">Kalnut</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {/* FEATURES */}
          <Link
            href={isHome ? "#features" : "/landing#features"}
            scroll={true}
            className="text-sm text-black tracking-wide hover:text-gray-600 transition-all duration-500 ease-out"
          >
            FEATURES
          </Link>

          {/* HOW IT WORKS */}
          <Link
            href={isHome ? "#how-it-works" : "/landing#how-it-works"}
            scroll={true}
            className="text-sm text-black tracking-wide hover:text-gray-600 transition-all duration-500 ease-out"
          >
            HOW IT WORKS
          </Link>

          {/* ABOUT */}
          <Link
            href={isHome ? "#about" : "/landing#about"}
            scroll={true}
            className="text-sm text-black tracking-wide hover:text-gray-600 transition-all duration-500 ease-out"
          >
            ABOUT
          </Link>
        </nav>
      </div>
    </header>
  )
}
