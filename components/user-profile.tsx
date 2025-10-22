"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, MapPin, Heart, Target } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function UserProfile() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    location: "",
    healthGoals: "",
    dietaryRestrictions: "",
    cuisinePreferences: "",
  })

  const handleSave = () => {
    // Save profile data to localStorage or API
    localStorage.setItem("userProfile", JSON.stringify(profile))
    // Show success message
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Your Profile</h2>
        <p className="text-sm text-muted-foreground">Personalize your nutrition experience</p>
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Appearance</Label>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Enter your name"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            placeholder="Enter your age"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Location/State
          </Label>
          <Input
            id="location"
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="e.g., Maharashtra, India"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="healthGoals" className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-1" />
            Health Goals
          </Label>
          <Textarea
            id="healthGoals"
            value={profile.healthGoals}
            onChange={(e) => setProfile({ ...profile, healthGoals: e.target.value })}
            placeholder="e.g., Weight loss, Muscle gain, Healthy living"
            className="text-sm min-h-[60px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisinePreferences" className="text-sm font-medium flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            Cuisine Preferences
          </Label>
          <Textarea
            id="cuisinePreferences"
            value={profile.cuisinePreferences}
            onChange={(e) => setProfile({ ...profile, cuisinePreferences: e.target.value })}
            placeholder="e.g., South Indian, North Indian, Mexican, Italian, Mediterranean"
            className="text-sm min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dietaryRestrictions" className="text-sm font-medium">
            Dietary Restrictions
          </Label>
          <Textarea
            id="dietaryRestrictions"
            value={profile.dietaryRestrictions}
            onChange={(e) => setProfile({ ...profile, dietaryRestrictions: e.target.value })}
            placeholder="e.g., Vegetarian, Vegan, Gluten-free, Lactose intolerant"
            className="text-sm min-h-[60px]"
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Profile
        </Button>
      </Card>
    </div>
  )
}
