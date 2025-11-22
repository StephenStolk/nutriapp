import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"
import { Playfair_Display } from "next/font/google"
import { UserProvider } from "@/hooks/use-user"
import { SubscriptionProvider } from "@/hooks/use-subscription"
import Script from "next/script"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], 
  variable: "--font-sans",     
});


export const metadata: Metadata = {
  title: "Kalnut",
  description: "Your food, Your story",
  generator: "kalnut app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <UserProvider>
            <SubscriptionProvider>
          <Suspense
            fallback={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            }
          >
            
         
                  {children}
               
        

            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          </Suspense>
          </SubscriptionProvider>
          </UserProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
