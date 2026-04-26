import type React from "react"
import type { Metadata } from "next"
import { Inter, Amiri } from "next/font/google"
import "./globals.css"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontArabic = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-arabic" })

export const metadata: Metadata = {
  title: "Quran Reader - Read, Search & Bookmark",
  description: "Beautiful Quran reading app with Arabic text, translations, search, and bookmarking",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontArabic.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
