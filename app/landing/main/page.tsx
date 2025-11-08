"use client"

import Header from "@/components/landing-temporary/header"
import Hero from "@/components/landing-temporary/hero"
import Features from "@/components/landing-temporary/features"
import HowItWorks from "@/components/landing-temporary/how-it-works"
import About from "@/components/landing-temporary/about"
// import TrustSection from "@/components/landing-temporary/trust-section"
import Footer from "@/components/landing-temporary/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* <Header /> */}
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      {/* <TrustSection /> */}
      <Footer />
    </main>
  )
}
