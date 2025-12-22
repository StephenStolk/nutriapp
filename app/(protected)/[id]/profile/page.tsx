"use client"

import { UserProfile } from "@/components/user-profile"
import { BottomNav } from "@/components/bottom-nav"
import { useRouter, useParams } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const handleNavigation = (page: string) => {
    if (page === "home") {
      router.push(`/${userId}/nutrition`)
    } else if (page === "dashboard") {
      router.push(`/${userId}/nutrition`)
    } else if (page === "meal-planner") {
      router.push(`/${userId}/nutrition?page=meal-planner`)
    } else if (page === "quick-meals") {
      router.push(`/${userId}/nutrition?page=quick-meals`)
    } else if (page === "todos") {
      router.push(`/${userId}/nutrition?page=todos`)
    } else if (page === "profile") {
      router.push(`/${userId}/profile`)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 mt-12">
      <div className="container mx-auto max-w-md px-4 py-6">
        <UserProfile />
      </div>
      
      <BottomNav 
        activePage="profile" 
        onNavigate={handleNavigation as any} 
      />
    </div>
  )
}