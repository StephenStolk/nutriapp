import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import Header from "@/components/landing-temporary/header"
import Footer from "@/components/landing-temporary/footer"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
// const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "Kalnut - Your Food, Your Story",
  description:
    "AI-powered nutrition tracking that understands your lifestyle. Track meals, plan nutrition, and build healthy habits.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`${playfair.variable} font-sans antialiased`}>
      <Header />
      <main className="relative z-0">{children}</main>
      <Footer />
    </div>
  )
}
