"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

const GRAMMAR_EN_MAP = {
  "فعل ماض": "Perfect verb",
  "فعل مضارع": "Imperfect verb",
  "فعل أمر": "Imperative verb",
  "اسم مرفوع": "Nominative noun",
  "اسم مجرور": "Genitive noun",
  "اسم منصوب": "Accusative noun",
  "صفة مرفوعة": "Nominative adjective",
  "صفة مجرورة": "Genitive adjective",
  "جار ومجرور": "Prepositional phrase",
}

function getSeenWordIdsCsv() {
  if (typeof window === "undefined") return ""
  try {
    const saved = localStorage.getItem("quran-knowledge-test-stats")
    if (!saved) return ""
    const parsed = JSON.parse(saved)
    const seenWordIds = parsed?.seenWordIds
    if (!Array.isArray(seenWordIds) || seenWordIds.length === 0) return ""
    return seenWordIds.filter((n) => Number.isInteger(n)).sort((a, b) => a - b).join(",")
  } catch {
    return ""
  }
}

function RootSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20" />
      </div>
      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-12 w-56 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function LearnRootPage() {
  const router = useRouter()
  const params = useParams()
  const rootParam = typeof params?.root === "string" ? params.root : ""

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const decodedRoot = decodeURIComponent(rootParam)
        const seenCsv = getSeenWordIdsCsv()
        const qs = seenCsv ? `?seenWordIds=${encodeURIComponent(seenCsv)}` : ""
        const res = await fetch(`/api/morphology/root/${encodeURIComponent(decodedRoot)}${qs}`)
        const json = await res.json()

        if (json?.error) throw new Error(json.error)
        if (!json?.root_arabic || !Array.isArray(json?.forms)) {
          throw new Error("Failed to fetch root forms")
        }
        if (active) setData(json)
      } catch (e) {
        if (active) setError(e?.message || "Failed to load root")
      } finally {
        if (active) setLoading(false)
      }
    }

    if (rootParam) load()
    return () => {
      active = false
    }
  }, [rootParam])

  const grouped = useMemo(() => {
    const forms = Array.isArray(data?.forms) ? data.forms : []
    const map = new Map()

    for (const form of forms) {
      const grammarRaw = (form?.grammar || "").toString()
      const grammarFirstLine = grammarRaw.split("\n")[0].trim() || "غير مصنف"
      const list = map.get(grammarFirstLine) || []
      list.push(form)
      map.set(grammarFirstLine, list)
    }

    const groups = Array.from(map.entries()).map(([grammarAr, forms]) => {
      const formsSorted = [...forms].sort((a, b) => (b?.occurrences ?? 0) - (a?.occurrences ?? 0))
      const grammarEn = GRAMMAR_EN_MAP[grammarAr] || "Other"
      return { grammarAr, grammarEn, forms: formsSorted }
    })

    groups.sort((a, b) => {
      if (a.grammarAr === "غير مصنف") return 1
      if (b.grammarAr === "غير مصنف") return -1
      return a.grammarAr.localeCompare(b.grammarAr)
    })

    return groups
  }, [data?.forms])

  const stats = data?.stats || {}
  const totalForms = Number(stats?.total_forms) || 0
  const seenForms = Number(stats?.seen_forms) || 0
  const progress = totalForms > 0 ? Math.round((seenForms / totalForms) * 100) : 0

  return (
    <div className="theme-container min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-full space-y-6 px-3 py-8 sm:max-w-7xl sm:px-4">
        <Button
          variant="ghost"
          className="-ml-2 w-fit"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {loading ? (
          <RootSkeleton />
        ) : error ? (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : !data ? (
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Root not found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="space-y-4">
              <div className="text-center space-y-2">
                <div className="font-arabic text-6xl leading-tight" dir="rtl">
                  {data.root_arabic}
                </div>
                <div className="text-lg text-muted-foreground">{data.root_latin}</div>
                {data.core_meaning ? (
                  <div className="text-sm text-muted-foreground">{data.core_meaning}</div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Card className="border-border/70 bg-card/80 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-semibold">{stats.total_forms}</div>
                    <div className="text-xs text-muted-foreground">total_forms</div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-card/80 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-semibold">{stats.total_occurrences}</div>
                    <div className="text-xs text-muted-foreground">total_occurrences</div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-card/80 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-semibold">{stats.surahs_count}</div>
                    <div className="text-xs text-muted-foreground">surahs_count</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-6">
              {grouped.map((group) => (
                <div key={group.grammarAr} className="space-y-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{group.grammarAr}</Badge>
                      <span className="text-sm text-muted-foreground">{group.grammarEn}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {group.forms.length} form{group.forms.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.forms.map((form, idx) => (
                      <Card
                        key={`${group.grammarAr}-${idx}-${form.arabic}-${form.translation}`}
                        className={[
                          "border-border/70 bg-card/80 shadow-sm",
                          form.seen ? "border-l-4 border-l-green-500/70" : "",
                        ].join(" ")}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-start justify-between gap-3">
                            <span className="font-arabic text-3xl leading-tight" dir="rtl">
                              {form.arabic}
                            </span>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              ×{form.occurrences}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {form.transliteration ? (
                            <div className="text-sm text-muted-foreground">{form.transliteration}</div>
                          ) : null}
                          {form.translation ? (
                            <div className="text-sm">{form.translation}</div>
                          ) : null}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{form.example_location || "—"}</span>
                            {form.seen ? (
                              <Badge className="bg-green-200 dark:bg-green-700 text-gray-900 dark:text-gray-100">
                                seen
                              </Badge>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {seenForms} of {totalForms} forms encountered in practice
                </div>
                <Badge variant="outline">{progress}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </section>
          </>
        )}
      </main>
    </div>
  )
}

