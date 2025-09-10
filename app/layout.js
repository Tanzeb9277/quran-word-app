import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Quran Word App",
  description: "Learn Quranic words through interactive exploration and quizzes",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light mode
              document.documentElement.classList.remove('dark');
              document.documentElement.style.colorScheme = 'light';
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen">
            <main className="w-full">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
