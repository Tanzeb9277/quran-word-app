"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Brain, Home, Lock, Menu } from "lucide-react"

import ThemeToggle from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/game", label: "Knowledge Test", icon: Brain },
  { href: "/learn", label: "Learn", icon: BookOpen },
]

function slugifyConstructionEn(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function getSeenWordIdsCount() {
  if (typeof window === "undefined") return 0
  try {
    const saved = localStorage.getItem("quran-knowledge-test-stats")
    if (!saved) return 0
    const parsed = JSON.parse(saved)
    const seenWordIds = parsed?.seenWordIds
    return Array.isArray(seenWordIds) ? seenWordIds.length : 0
  } catch {
    return 0
  }
}

function difficultyBadgeClass(difficulty) {
  const d = (difficulty || "").toLowerCase()
  if (d === "beginner") return "bg-green-200 dark:bg-green-700 text-gray-900 dark:text-gray-100"
  if (d === "intermediate") return "bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100"
  if (d === "advanced") return "bg-red-200 dark:bg-red-700 text-gray-900 dark:text-gray-100"
  return "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
}

function CurriculumSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Card key={idx} className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function LearnPage() {
  const router = useRouter()
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seenCount, setSeenCount] = useState(0)

  useEffect(() => {
    setSeenCount(getSeenWordIdsCount())
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/morphology/clusters")
        const json = await res.json()
        if (!json?.success || !Array.isArray(json?.data)) {
          throw new Error(json?.error || "Failed to fetch clusters")
        }
        if (active) setClusters(json.data)
      } catch (e) {
        if (active) setError(e?.message || "Failed to load curriculum")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const constructions = useMemo(() => {
    const byConstruction = new Map()

    for (const c of clusters) {
      const key = c?.construction_ar || "Unknown"
      const prev = byConstruction.get(key) || []
      prev.push(c)
      byConstruction.set(key, prev)
    }

    const cards = Array.from(byConstruction.entries()).map(([construction_ar, group]) => {
      const sorted = [...group].sort(
        (a, b) => (a?.sequence_order ?? 9999) - (b?.sequence_order ?? 9999),
      )

      const first = sorted[0] || {}
      const sequence_order = first?.sequence_order ?? 9999
      const construction_en = first?.construction_en || "Unknown"
      const difficulty = first?.difficulty || "beginner"
      const verseTotal = sorted.reduce((sum, item) => sum + (Number(item?.verse_count) || 0), 0)

      return {
        construction_ar,
        construction_en,
        difficulty,
        sequence_order,
        verse_count_total: verseTotal,
        cluster_count: sorted.length,
        slug: slugifyConstructionEn(construction_en),
      }
    })

    return cards.sort((a, b) => a.sequence_order - b.sequence_order)
  }, [clusters])

  const handleCardClick = (item) => {
    const isLocked = item.sequence_order > 2 && seenCount < 5
    if (isLocked) return
    router.push(`/learn/${item.slug}`)
  }

  return (
    <div className="theme-container min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur -mx-4 -mt-4 sm:-mx-4">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-3 px-3 py-4 sm:max-w-7xl sm:px-4">
          <div className="flex items-center gap-2">
            <Sheet modal={false}>
              <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex h-full w-screen max-w-[100vw] flex-col overflow-y-auto sm:w-80 sm:max-w-sm"
              >
                <SheetHeader className="pb-4">
                  <SheetTitle>Navigate</SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-3">
                  {navLinks.map((link) => (
                    <Button key={link.href} asChild variant="outline" className="justify-start">
                      <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold leading-tight">Learn</p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="text-sm">
                <Link href={link.href} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:h-10">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-full space-y-6 px-3 py-8 sm:max-w-7xl sm:px-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Learn Arabic Grammar
          </h1>
          <p className="mt-2 text-muted-foreground">
            Study Quranic grammar constructions in sequence
          </p>
        </div>

        {error && (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <CurriculumSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {constructions.map((item) => {
              const locked = item.sequence_order > 2 && seenCount < 5

              return (
                <Card
                  key={item.construction_ar}
                  className={[
                    "border-border/70 bg-card/80 shadow-sm transition-all",
                    locked ? "opacity-70" : "cursor-pointer hover:shadow-md",
                  ].join(" ")}
                  onClick={() => handleCardClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleCardClick(item)
                  }}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs text-muted-foreground">#{item.sequence_order}</div>
                      {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
                    </div>

                    <CardTitle className="text-2xl leading-tight">
                      <span className="block font-arabic text-3xl" dir="rtl">
                        {item.construction_ar}
                      </span>
                    </CardTitle>

                    <CardDescription className="text-sm">{item.construction_en}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={difficultyBadgeClass(item.difficulty)}>
                        {(item.difficulty || "").toLowerCase()}
                      </Badge>
                      <Badge variant="outline">
                        {item.verse_count_total} {item.verse_count_total === 1 ? "verse" : "verses"}
                      </Badge>
                      <Badge variant="outline">
                        {item.cluster_count} {item.cluster_count === 1 ? "lesson" : "lessons"}
                      </Badge>
                    </div>

                    {locked ? (
                      <p className="text-xs text-muted-foreground">
                        Complete a few knowledge test sessions to unlock.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Click to start learning.</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

