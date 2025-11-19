"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, Heart, Target, Clock2Icon, HeartPulse } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function UserProfile() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    age: "",
    location: "",
    healthgoals: "",
    dietaryrestrictions: "",
    cuisinepreferences: "",
  });

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw userError;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setProfile({
            username: data.username || "",
            age: data.age?.toString() || "",
            location: data.location || "",
            healthgoals: data.healthgoals || "",
            dietaryrestrictions: data.dietaryrestrictions || "",
            cuisinepreferences: data.cuisinepreferences || "",
          });
        }

      } catch (err) {

        console.error("Error loading profile:", err);
      } finally {


        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);


  const handleSave = async () => {
    try {

      setSaving(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError;

      const updates = {
        id: user.id,
        username: profile.username || "Anonymous",
        age: profile.age ? Number(profile.age) : null,
        location: profile.location || "Unknown",
        healthgoals: profile.healthgoals || "Not specified",
        dietaryrestrictions: profile.dietaryrestrictions || "None",
        cuisinepreferences: profile.cuisinepreferences || "Any",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "id" }); 

      if (error) throw error;

      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);

      alert("[error] Error saving profile.");
    } finally {

      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Loading profile...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Your Profile</h2>
        <p className="text-sm text-muted-foreground">
          Personalize your nutrition experience
        </p>
      </div>

      {/* <Card className="p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Appearance</Label>
          <ThemeToggle />
        </div>
      </Card> */}

      <Card className="p-6 space-y-4 border">
        {[
          { id: "username", label: "Name" },
          { id: "age", label: "Age", type: "number" },
          { id: "location", label: "Location/State" },
        ].map(({ id, label, type }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id} className="text-sm font-medium">
              {label}
            </Label>
            <Input
              id={id}
              type={type || "text"}
              value={(profile as any)[id]}
              onChange={(e) =>
                setProfile({ ...profile, [id]: e.target.value })
              }
              placeholder={`Enter your ${label.toLowerCase()}`}
              className="text-sm"
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="healthGoals" className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-1" />
            Health Goals
          </Label>
          <Textarea
            id="healthGoals"
            value={profile.healthgoals}
            onChange={(e) =>
              setProfile({ ...profile, healthgoals: e.target.value })
            }
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
            value={profile.cuisinepreferences}
            onChange={(e) =>
              setProfile({ ...profile, cuisinepreferences: e.target.value })
            }
            placeholder="e.g., South Indian, North Indian, Mexican, Italian"
            className="text-sm min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dietaryRestrictions" className="text-sm font-medium">
            <HeartPulse className="h-4 w-4 mr-1" />
            Dietary Restrictions
          </Label>
          <Textarea
            id="dietaryRestrictions"
            value={profile.dietaryrestrictions}
            onChange={(e) =>
              setProfile({ ...profile, dietaryrestrictions: e.target.value })
            }
            placeholder="e.g., Vegetarian, Vegan, Gluten-free"
            className="text-sm min-h-[60px]"
          />
        </div>

        <Button onClick={handleSave} className="w-full rounded-[5px] mb-20" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </Card>
    </div>
  );
}
