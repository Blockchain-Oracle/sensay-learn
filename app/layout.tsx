import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sensay Learn - AI-Powered Learning Platform",
  description:
    "Experience personalized, interactive education through conversation. From coding to mindfulness, from history to science - learn anything with your AI-powered learning companion.",
  keywords: ["AI learning", "education", "personalized learning", "interactive education"],
  authors: [{ name: "Sensay Learn Team" }],
  openGraph: {
    title: "Sensay Learn - AI-Powered Learning Platform",
    description: "Experience personalized, interactive education through conversation.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Sensay Learn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sensay Learn - AI-Powered Learning Platform",
    description: "Experience personalized, interactive education through conversation.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<p>Loading...</p>}>
          <Providers>
            {children}
            <Analytics />
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
