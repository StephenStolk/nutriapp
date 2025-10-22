"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Target,
  TrendingUp,
  Apple,
  Zap,
  Shield,
  Camera,
  BarChart3,
  Brain,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

interface LandingPageProps {
  onStartJourney: () => void
}

const motivationalMessages = [
  "Transform your nutrition with AI-powered insights",
  "Every healthy choice builds a better tomorrow",
  "Smart food analysis for smarter health decisions",
  "Your personalized nutrition journey starts here",
  "Discover the power of mindful eating",
]

const features = [
  {
    icon: Camera,
    title: "Instant Food Analysis",
    description: "Snap a photo and get detailed nutritional breakdown in seconds with our advanced AI technology.",
    color: "bg-primary",
  },
  {
    icon: BarChart3,
    title: "Smart Progress Tracking",
    description: "Monitor your daily intake, track habits, and visualize your nutrition journey with beautiful charts.",
    color: "bg-primary",
  },
  {
    icon: Brain,
    title: "Personalized Insights",
    description: "Get tailored recommendations and meal suggestions based on your goals and dietary preferences.",
    color: "bg-primary",
  },
  {
    icon: Target,
    title: "Goal-Based Planning",
    description: "Set custom calorie and macro targets with our intelligent calculator and meal planning tools.",
    color: "bg-primary",
  },
]

export function LandingPage({ onStartJourney }: LandingPageProps) {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % motivationalMessages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features-section")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Apple className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">NutriScan</span>
            </div>
            <div className="flex items-center">
              <Button onClick={onStartJourney} size="sm" className="bg-primary hover:bg-primary/90 text-sm px-4">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex items-center justify-center space-x-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Privacy First
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-2xl md:text-4xl font-bold text-balance">
                Nutrition that <span className="text-primary">understands</span> you
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                {motivationalMessages[currentMessage]}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Button
                onClick={onStartJourney}
                size="default"
                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Analyzing
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
              <Button
                onClick={scrollToFeatures}
                variant="outline"
                size="default"
                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold border-2 hover:bg-primary/5 bg-transparent"
              >
                Explore Features
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-6 pt-6">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-primary border-2 border-background" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">1000+ happy users</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-muted-foreground font-medium ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Everything you need for better nutrition</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make healthy eating simple, smart, and sustainable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="p-5 hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm"
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Why choose NutriScan?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Get results in under 3 seconds" },
              { icon: Brain, title: "AI-Powered", desc: "Advanced machine learning accuracy" },
              { icon: Shield, title: "Privacy First", desc: "Your data stays secure and private" },
              { icon: Target, title: "Goal Focused", desc: "Personalized to your health goals" },
              { icon: TrendingUp, title: "Track Progress", desc: "Visual insights and trends" },
              { icon: Users, title: "Expert Backed", desc: "Nutritionist approved algorithms" },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-start space-x-3 p-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Ready to transform your nutrition?</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Join thousands who've already started their journey to better health with smart food analysis.
            </p>
            <Button
              onClick={onStartJourney}
              size="default"
              className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <div className="flex items-center justify-center space-x-4 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-primary" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-primary" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <Apple className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">NutriScan</div>
                <div className="text-xs text-muted-foreground">AI-Powered Nutrition Analysis</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">© 2025 NutriScan. Made with ❤️ for better health.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
