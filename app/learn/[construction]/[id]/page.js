"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, BookOpen, Brain, Eye, Home, Menu } from "lucide-react"

import ThemeToggle from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/game", label: "Knowledge Test", icon: Brain },
  { href: "/learn", label: "Learn", icon: BookOpen },
]

// Dependency highlighting based on Arabic grammar tags
const GOVERNED_BY = {
  "اسم مجرور": ["حرف جر", "جار ومجرور"],
  "جار ومجرور": [],
  "صفة مرفوعة": ["اسم مرفوع"],
  "صفة منصوبة": ["اسم منصوب"],
  "صفة مجرورة": ["اسم مجرور"],
  "اسم موصول": ["اسم مرفوع", "اسم منصوب"],
}

const GOVERNS = {
  "فعل ماض": ["اسم مرفوع", "اسم منصوب"],
  "فعل مضارع": ["اسم مرفوع", "اسم منصوب"],
  "فعل أمر": ["اسم منصوب"],
  "حرف جر": ["اسم مجرور"],
  "جار ومجرور": ["اسم مجرور"],
  "اسم مرفوع": ["صفة مرفوعة"],
  "اسم منصوب": ["صفة منصوبة"],
  "اسم مجرور": ["صفة مجرورة"],
}

function difficultyBadgeClass(difficulty) {
  const d = (difficulty || "").toLowerCase()
  if (d === "beginner") return "bg-green-200 dark:bg-green-700 text-gray-900 dark:text-gray-100"
  if (d === "intermediate") return "bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100"
  if (d === "advanced") return "bg-red-200 dark:bg-red-700 text-gray-900 dark:text-gray-100"
  return "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
}

function safeJson(value) {
  if (value == null) return null
  if (typeof value === "object") return value
  if (typeof value !== "string") return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function normalizeExampleEntry(entry) {
  if (entry == null) return null

  // String entries like: "كَتَبَ → he wrote"
  if (typeof entry === "string") {
    const line = entry.trim()
    if (!line) return null
    const parts = line
      .split(/→|->|—|-/)
      .map((p) => p.trim())
      .filter(Boolean)
    return { arabic: parts[0] || "", english: parts.slice(1).join(" ") || "" }
  }

  // Tuple entries like: ["كَتَبَ", "he wrote"]
  if (Array.isArray(entry)) {
    const arabic = typeof entry[0] === "string" ? entry[0] : ""
    const english = typeof entry[1] === "string" ? entry[1] : ""
    if (!arabic && !english) return null
    return { arabic, english }
  }

  // Object entries like: { arabic, english } with a few legacy keys
  if (typeof entry === "object") {
    const arabic = entry.arabic ?? entry.ar ?? entry.example_ar ?? ""
    const english = entry.english ?? entry.en ?? entry.example_en ?? ""
    if (!arabic && !english) return null
    return { arabic, english }
  }

  return null
}

function normalizeCommonExamples(input) {
  const parsed = safeJson(input)
  if (Array.isArray(parsed)) {
    return parsed.map(normalizeExampleEntry).filter((e) => e?.arabic || e?.english)
  }

  if (Array.isArray(input)) {
    return input.map(normalizeExampleEntry).filter((e) => e?.arabic || e?.english)
  }

  if (typeof input === "string" && input.trim()) {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/→|->|—|-/).map((p) => p.trim()).filter(Boolean)
        return { arabic: parts[0] || "", english: parts.slice(1).join(" ") || "" }
      })
      .filter((e) => e.arabic || e.english)
  }

  return []
}

function getSeenWordIdsSet() {
  if (typeof window === "undefined") return new Set()
  try {
    const saved = localStorage.getItem("quran-knowledge-test-stats")
    if (!saved) return new Set()
    const parsed = JSON.parse(saved)
    const seenWordIds = parsed?.seenWordIds
    if (!Array.isArray(seenWordIds)) return new Set()
    return new Set(seenWordIds.filter((n) => Number.isInteger(n)))
  } catch {
    return new Set()
  }
}

function WordChip({ word, highlighted, highlightMode, onHoverStart, popoverOpen, onPopoverOpenChange }) {
  const arabic = word?.arabic_text || word?.arabic || ""
  const transliteration = word?.transliteration || ""
  const translation = word?.translation || ""
  const grammar = word?.grammar || ""
  const root =
    word?.root?.root_arabic ||
    word?.root?.arabic ||
    word?.root_arabic ||
    word?.root?.root_latin ||
    word?.root_latin ||
    ""

  return (
    <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={[
            "rounded-full border px-3 py-1 text-lg font-arabic transition-colors",
            "bg-muted/20 data-[state=open]:bg-muted/40",
            highlightMode === "lesson"
              ? "border-green-400/70 bg-green-500/10"
              : highlightMode === "governor"
                ? "border-amber-400/70 bg-amber-500/10"
                : highlightMode === "governed"
                  ? "border-teal-400/70 bg-teal-500/10"
                  : highlightMode === "hovered"
                    ? "border-blue-400/80 bg-blue-500/10"
                    : highlighted
                      ? "border-green-400/70 bg-green-500/10"
                      : "border-border/70",
          ].join(" ")}
          dir="rtl"
          onMouseEnter={onHoverStart}
        >
          {arabic || "—"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-arabic text-2xl" dir="rtl">
              {arabic || "—"}
            </div>
            {root ? (
              <Badge variant="outline" className="shrink-0">
                Root: {root}
              </Badge>
            ) : null}
          </div>

          {transliteration ? (
            <div className="text-sm text-muted-foreground">{transliteration}</div>
          ) : null}

          {translation ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Translation:</span> {translation}
            </div>
          ) : null}

          {grammar ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Grammar:</span> {grammar}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function LessonSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      </Card>
      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card key={idx} className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function LessonPage() {
  const params = useParams()
  const construction = typeof params?.construction === "string" ? params.construction : ""
  const idParam = typeof params?.id === "string" ? params.id : ""

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seenSet, setSeenSet] = useState(new Set())
  const [surahMap, setSurahMap] = useState(new Map())
  const [hoveredWord, setHoveredWord] = useState(null) // { verseId: string, idx: number } | null
  const [openWordDetails, setOpenWordDetails] = useState(null) // { verseId, idx } | null — popover, click only

  useEffect(() => {
    setSeenSet(getSeenWordIdsSet())
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/morphology/clusters/${encodeURIComponent(idParam)}`)
        const json = await res.json()
        if (!json?.success || !json?.data?.cluster) {
          throw new Error(json?.error || "Failed to fetch lesson")
        }
        if (active) setData(json.data)
      } catch (e) {
        if (active) setError(e?.message || "Failed to load lesson")
      } finally {
        if (active) setLoading(false)
      }
    }

    if (idParam) load()
    return () => {
      active = false
    }
  }, [idParam])

  useEffect(() => {
    let active = true
    async function loadSurahs() {
      try {
        const res = await fetch("/api/words/surahs")
        const json = await res.json()
        if (!json?.success || !Array.isArray(json?.data)) return
        const map = new Map(json.data.map((s) => [s.surah_number, s.name_english]))
        if (active) setSurahMap(map)
      } catch {
        // optional
      }
    }
    loadSurahs()
    return () => {
      active = false
    }
  }, [])

  const cluster = data?.cluster || null

  const verses = useMemo(() => {
    const sample = Array.isArray(cluster?.sample_verses) ? cluster.sample_verses : []
    // If sample verses already include the full verse + word breakdown, use them.
    const hasRichSample = sample.some((v) => Array.isArray(v?.all_words) && v?.verse_id)
    if (hasRichSample) return sample.slice(0, 5)

    // Otherwise fall back to API `verses` groups from /api/morphology/clusters/[id]
    const verseGroups = Array.isArray(data?.verses) ? data.verses : []
    return verseGroups.slice(0, 5).map((vg) => ({
      verse_id: vg?.verse_id || `${vg?.surah_number}:${vg?.verse}`,
      arabic: "",
      translation: "",
      all_words: Array.isArray(vg?.words)
        ? vg.words.map((w) => ({
            id: w?.id,
            arabic: w?.arabic_text,
            transliteration: w?.transliteration,
            translation: w?.translation,
            grammar: w?.grammar,
            root: w?.root,
            tags: w?.tags,
          }))
        : [],
      highlighted_words: [],
    }))
  }, [cluster?.sample_verses, data?.verses])

  const highlightKeySet = useMemo(() => {
    const set = new Set()
    for (const v of verses) {
      const hw = Array.isArray(v?.highlighted_words) ? v.highlighted_words : []
      for (const w of hw) {
        if (Number.isInteger(w?.id)) set.add(`id:${w.id}`)
        if (w?.arabic) set.add(`ar:${w.arabic}`)
        if (w?.arabic_text) set.add(`ar:${w.arabic_text}`)
      }
    }
    return set
  }, [verses])

  const seenCountInLesson = useMemo(() => {
    const ids = new Set()
    for (const v of verses) {
      const all = Array.isArray(v?.all_words) ? v.all_words : []
      for (const w of all) {
        if (Number.isInteger(w?.id)) ids.add(w.id)
      }
    }
    let count = 0
    ids.forEach((id) => {
      if (seenSet.has(id)) count++
    })
    return count
  }, [verses, seenSet])

  const examples = useMemo(() => normalizeCommonExamples(cluster?.common_examples), [cluster?.common_examples])
  const genderNumberForms = useMemo(() => {
    const forms = cluster?.gender_number_forms?.forms
    if (!Array.isArray(forms)) return []
    return forms.filter((f) => f?.arabic || f?.label || f?.english)
  }, [cluster?.gender_number_forms])

  const titleConstruction = cluster?.construction_ar || ""
  const subtitleConstruction = cluster?.construction_en || ""
  const difficulty = cluster?.difficulty || ""

  const constructionBackHref = `/learn/${construction}`

  const renderVerseRef = (verseId) => {
    const [s, v] = String(verseId || "").split(":")
    const surahNum = parseInt(s, 10)
    const surahName = Number.isInteger(surahNum) ? surahMap.get(surahNum) : null
    if (surahName && v) return `${surahName} ${surahNum}:${v}`
    if (Number.isInteger(surahNum) && v) return `Surah ${surahNum}:${v}`
    return verseId || "Verse"
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
        <Button asChild variant="ghost" className="-ml-2 w-fit">
          <Link href={constructionBackHref} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        {error && (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <LessonSkeleton />
        ) : !cluster ? (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Lesson not found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {cluster.lesson_title || "Lesson"}
                </h1>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {titleConstruction ? (
                    <div className="font-arabic text-3xl leading-tight" dir="rtl">
                      {titleConstruction}
                    </div>
                  ) : null}
                  {subtitleConstruction ? (
                    <div className="text-muted-foreground">{subtitleConstruction}</div>
                  ) : null}
                  {difficulty ? (
                    <Badge className={difficultyBadgeClass(difficulty)}>{difficulty.toLowerCase()}</Badge>
                  ) : null}
                </div>
              </div>
            </section>

            <section>
              <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Grammar rule</CardTitle>
                  <CardDescription>How to recognize this construction.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cluster.rule_explanation ? (
                    <div className="space-y-2">
                      <p className="whitespace-pre-wrap text-sm text-foreground/90">{cluster.rule_explanation}</p>
                    </div>
                  ) : null}

                  {cluster.what_to_look_for ? (
                    <div className="rounded-lg border border-border/70 bg-muted/10 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        What to look for
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {cluster.what_to_look_for}
                      </p>
                    </div>
                  ) : null}

                  {examples.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Common examples</div>
                      <div className="space-y-2">
                        {examples.map((ex, idx) => (
                          <div
                            key={`${ex.arabic}-${idx}`}
                            className="flex flex-col gap-1 rounded-lg border border-border/70 bg-muted/10 p-3"
                          >
                            <div className="font-arabic text-xl" dir="rtl">
                              {ex.arabic || "—"}
                            </div>
                            {ex.english ? (
                              <div className="text-sm text-muted-foreground">{ex.english}</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {genderNumberForms.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Forms</div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {genderNumberForms.map((form, idx) => (
                          <div
                            key={`${form?.arabic || "form"}-${form?.label || ""}-${idx}`}
                            className="rounded-lg border border-border/70 bg-muted/10 p-3"
                          >
                            <div className="font-arabic text-2xl leading-tight" dir="rtl">
                              {form?.arabic || "—"}
                            </div>
                            {form?.label ? (
                              <div className="mt-1 text-xs text-muted-foreground">{form.label}</div>
                            ) : null}
                            {form?.english ? <div className="text-sm">{form.english}</div> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {cluster.teaching_tip ? (
                    <div className="text-sm italic text-muted-foreground">{cluster.teaching_tip}</div>
                  ) : null}
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              {verses.map((verse, verseIdx) => {
                const allWords = Array.isArray(verse?.all_words) ? verse.all_words : []
                const verseId = verse?.verse_id || `verse-${verseIdx}`

                const hoveredIdx =
                  hoveredWord && hoveredWord.verseId === verseId && Number.isInteger(hoveredWord.idx)
                    ? hoveredWord.idx
                    : null
                const hoveredGrammar =
                  hoveredIdx != null && allWords[hoveredIdx] ? String(allWords[hoveredIdx]?.grammar || "") : ""

                const governorSet = new Set()
                const governedSet = new Set()
                if (hoveredIdx != null && hoveredGrammar) {
                  const governedByTargets = GOVERNED_BY[hoveredGrammar] || []
                  const governsTargets = GOVERNS[hoveredGrammar] || []
                  const start = Math.max(0, hoveredIdx - 5)
                  const end = Math.min(allWords.length - 1, hoveredIdx + 5)
                  for (let i = start; i <= end; i++) {
                    if (i === hoveredIdx) continue
                    const g = allWords[i]?.grammar || ""
                    if (governedByTargets.includes(g)) governorSet.add(i)
                    if (governsTargets.includes(g)) governedSet.add(i)
                  }
                }

                return (
                  <Card key={verseId} className="border-border/70 bg-card/80 shadow-sm">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-base">{renderVerseRef(verse?.verse_id)}</CardTitle>
                      <CardDescription>Click a word to see details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4" onMouseLeave={() => setHoveredWord(null)}>
                        <div className="flex flex-wrap justify-start gap-2" dir="rtl">
                          {allWords.map((w, idx) => {
                            const key = Number.isInteger(w?.id) ? `id:${w.id}` : `ar:${w?.arabic || w?.arabic_text || ""}`
                            const highlighted = highlightKeySet.has(key)
                            const isHovered = hoveredIdx === idx

                            const highlightMode = isHovered
                              ? highlighted
                                ? "lesson"
                                : "hovered"
                              : governorSet.has(idx)
                                ? "governor"
                                : governedSet.has(idx)
                                  ? "governed"
                                  : highlighted
                                    ? "lesson"
                                    : null

                            const popoverOpen =
                              openWordDetails?.verseId === verseId && openWordDetails?.idx === idx

                            return (
                              <WordChip
                                key={`${verseId}-${idx}`}
                                word={w}
                                highlighted={highlighted}
                                highlightMode={highlightMode}
                                onHoverStart={() => setHoveredWord({ verseId, idx })}
                                popoverOpen={popoverOpen}
                                onPopoverOpenChange={(open) => {
                                  if (open) setOpenWordDetails({ verseId, idx })
                                  else
                                    setOpenWordDetails((cur) =>
                                      cur?.verseId === verseId && cur?.idx === idx ? null : cur,
                                    )
                                }}
                              />
                            )
                          })}
                        </div>

                        <div className="flex flex-wrap justify-start gap-2 text-sm text-muted-foreground" dir="rtl">
                          {allWords.map((w, idx) => (
                            <span key={`${verseId}-tr-${idx}`} className="min-w-[3rem]">
                              {w?.translation || "—"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </section>

            <section>
              <div className="flex items-center justify-end">
                <Badge variant="outline">
                  {seenCountInLesson} words in this lesson already seen in practice
                </Badge>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

