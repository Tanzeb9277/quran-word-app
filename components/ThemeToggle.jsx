"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = theme === "system" ? resolvedTheme : theme
  const isDark = currentTheme === "dark"

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-10 w-10 rounded-full border border-border/60 bg-card/70"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            <Sun
              className={`h-4 w-4 rotate-0 scale-100 transition-all ${isDark ? "rotate-90 scale-0" : ""}`}
            />
            <Moon
              className={`absolute h-4 w-4 rotate-90 scale-0 transition-all ${isDark ? "rotate-0 scale-100" : ""}`}
            />
            {!mounted && (
              <Monitor className="absolute h-4 w-4 text-muted-foreground opacity-40" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Switch to {isDark ? "light" : "dark"} mode
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

