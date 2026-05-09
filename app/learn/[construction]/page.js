"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Brain, Home, Menu } from "lucide-react"

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

function difficultyBadgeClass(difficulty) {
  const d = (difficulty || "").toLowerCase()
  if (d === "beginner") return "bg-green-200 dark:bg-green-700 text-gray-900 dark:text-gray-100"
  if (d === "intermediate") return "bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100"
  if (d === "advanced") return "bg-red-200 dark:bg-red-700 text-gray-900 dark:text-gray-100"
  return "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
}

function getSampleArabicPreview(sampleVerses) {
  const first = Array.isArray(sampleVerses) ? sampleVerses[0] : null
  if (!first) return ""
  return (
    first.arabic_text ||
    first.arabic ||
    first.text_ar ||
    first.verse_arabic ||
    first.ayah_arabic ||
    ""
  )
}

function LessonsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, idx) => (
        <Card key={idx} className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ConstructionLessonsPage() {
  const router = useRouter()
  const params = useParams()
  const constructionSlug = typeof params?.construction === "string" ? params.construction : ""

  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        if (active) setError(e?.message || "Failed to load lessons")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const { constructionMeta, lessons } = useMemo(() => {
    const matching = clusters.filter(
      (c) => slugifyConstructionEn(c?.construction_en) === constructionSlug,
    )

    const lessonsSorted = [...matching].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))
    const headerSeed =
      [...matching].sort((a, b) => (a?.sequence_order ?? 9999) - (b?.sequence_order ?? 9999))[0] || null

    return {
      constructionMeta: headerSeed
        ? {
            construction_ar: headerSeed.construction_ar,
            construction_en: headerSeed.construction_en,
            difficulty: headerSeed.difficulty,
            rule_explanation: headerSeed.rule_explanation,
          }
        : null,
      lessons: lessonsSorted,
    }
  }, [clusters, constructionSlug])

  const handleLessonClick = (id) => {
    if (!id) return
    router.push(`/learn/${constructionSlug}/${id}`)
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
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-2">
            <Link href="/learn" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <LessonsSkeleton />
        ) : !constructionMeta ? (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Construction not found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-3xl font-semibold leading-tight">
                    <span className="block font-arabic text-4xl" dir="rtl">
                      {constructionMeta.construction_ar}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{constructionMeta.construction_en}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={difficultyBadgeClass(constructionMeta.difficulty)}>
                    {(constructionMeta.difficulty || "").toLowerCase()}
                  </Badge>
                </div>
              </div>

              {constructionMeta.rule_explanation ? (
                <Card className="border-border/70 bg-card/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Rule explanation</CardTitle>
                    <CardDescription>Core idea for this construction.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-foreground/90">
                      {constructionMeta.rule_explanation}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((cluster, idx) => {
                const preview = getSampleArabicPreview(cluster?.sample_verses)
                const verseCount = Number(cluster?.verse_count) || 0

                return (
                  <Card
                    key={cluster?.id ?? idx}
                    className="cursor-pointer border-border/70 bg-card/80 shadow-sm transition-all hover:shadow-md"
                    onClick={() => handleLessonClick(cluster?.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleLessonClick(cluster?.id)
                    }}
                  >
                    <CardHeader className="space-y-2">
                      <div className="text-xs text-muted-foreground">Lesson {idx + 1}</div>
                      <CardTitle className="text-base">{cluster?.lesson_title || "Lesson"}</CardTitle>
                      <CardDescription>
                        {verseCount} {verseCount === 1 ? "verse" : "verses"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-muted-foreground">Sample</div>
                      <div className="truncate font-arabic text-lg" dir="rtl" title={preview}>
                        {preview || "—"}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

