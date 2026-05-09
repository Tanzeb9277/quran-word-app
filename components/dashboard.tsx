"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import knowledgeTestStatsStore from "@/lib/game-stats"
import ThemeToggle from "./ThemeToggle"
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Flame,
  Home,
  Menu,
  Sparkles,
  Target,
  Clock,
  Trophy,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SessionData {
  id: string
  timestamp: string
  surahNumber: number
  verse: number
  totalWords: number
  correctWords: number
  accuracy: number
  isPerfect: boolean
  revealedWords: number
  inaccurateGuesses: number
  wordResults: Array<{
    index: number
    selectedWord: string
    correctWord: string
    isCorrect: boolean
  }>
}

interface DashboardData {
  stats: {
    totalWords: number
    accuracy: number
    streak: number
    perfectVerses: number
  }
  performance: {
    accuracy: number
    perfectRate: number
    wordsLearned: number
  }
  recentSessions: Array<{
    id: number
    date: string
    verses: number
    words: number
    accuracy: number
    surahNumber: number
    verse: number
    isPerfect: boolean
    revealedWords: number
    originalSession: SessionData
  }>
  areasToWorkOn: Array<{
    category: string
    items: string[]
    accuracy: number
    priority: string
  }>
}

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/game", label: "Knowledge Test", icon: Brain },
  { href: "/learn", label: "Learn", icon: BookOpen },
]

const priorityTone: Record<string, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

const calculateStreak = (sessions: SessionData[]) => {
  if (sessions.length === 0) return 0

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  let streak = 0
  let currentDate = new Date()

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.timestamp)
    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
      currentDate = sessionDate
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const analyzeAreasToWorkOn = (sessions: SessionData[]) => {
  const missedWords = new Map<string, number>()

  sessions.forEach((session) => {
    if (session.wordResults) {
      session.wordResults.forEach((result: any) => {
        if (!result.isCorrect) {
          const word = result.correctWord
          missedWords.set(word, (missedWords.get(word) || 0) + 1)
        }
      })
    }
  })

  const topMissedWords = Array.from(missedWords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word)

  return [
    {
      category: "Missed Words",
      items: topMissedWords.length > 0 ? topMissedWords : ["No data yet"],
      accuracy: topMissedWords.length > 0 ? Math.max(0, 100 - topMissedWords.length * 10) : 100,
      priority: topMissedWords.length > 2 ? "high" : topMissedWords.length > 0 ? "medium" : "low",
    },
    {
      category: "Grammar Rules",
      items: ["Definite Articles", "Plural Forms", "Verb Conjugation"],
      accuracy: 85,
      priority: "medium",
    },
    {
      category: "Root Words",
      items: ["ر-ح-م", "س-م-و", "أ-ر-ض"],
      accuracy: 90,
      priority: "low",
    },
  ]
}

function MetricTile({
  label,
  value,
  helper,
  progress,
}: {
  label: string
  value: string | number
  helper: string
  progress?: number
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      {typeof progress === "number" ? (
        <>
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
        </>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      )}
    </div>
  )
}

function QuickStat({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper: string
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/70 p-3 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold leading-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function QuranDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalWords: 0,
      accuracy: 0,
      streak: 0,
      perfectVerses: 0,
    },
    performance: {
      accuracy: 0,
      perfectRate: 0,
      wordsLearned: 0,
    },
    recentSessions: [],
    areasToWorkOn: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSessionData = () => {
      try {
        const stats = knowledgeTestStatsStore.getStats()
        const recentSessions = knowledgeTestStatsStore.getRecentSessions(10)

        const streak = calculateStreak(recentSessions)
        const areasToWorkOn = analyzeAreasToWorkOn(recentSessions)

        const formattedSessions = recentSessions.map((session: SessionData, index: number) => ({
          id: index + 1,
          date: formatDate(session.timestamp),
          verses: 1,
          words: session.totalWords,
          accuracy: Math.round(session.accuracy * 10) / 10,
          surahNumber: session.surahNumber,
          verse: session.verse,
          isPerfect: session.isPerfect,
          revealedWords: session.revealedWords,
          originalSession: session,
        }))

        setData({
          stats: {
            totalWords: stats.totalWords,
            accuracy: Math.round(stats.averageAccuracy * 10) / 10,
            streak: streak,
            perfectVerses: stats.perfectVerses,
          },
          performance: {
            accuracy: Math.round(stats.averageAccuracy * 10) / 10,
            perfectRate: Math.round(stats.perfectVerseRate * 10) / 10,
            wordsLearned: stats.totalUniqueWords,
          },
          recentSessions: formattedSessions,
          areasToWorkOn: areasToWorkOn,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading session data:", error)
        setIsLoading(false)
      }
    }

    loadSessionData()
  }, [])

  const todaySessions = useMemo(
    () =>
      data.recentSessions.filter((s) => {
        const today = new Date().toDateString()
        const sessionDate = new Date(s.originalSession.timestamp).toDateString()
        return today === sessionDate
      }).length,
    [data.recentSessions],
  )

  const weekSessions = useMemo(
    () =>
      data.recentSessions.filter((s) => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(s.originalSession.timestamp) >= weekAgo
      }).length,
    [data.recentSessions],
  )

  const bestAccuracy = useMemo(
    () => (data.recentSessions.length ? Math.max(...data.recentSessions.map((s) => s.accuracy)) : 0),
    [data.recentSessions],
  )

  const averageWords = useMemo(() => {
    if (!data.recentSessions.length) return 0
    const total = data.recentSessions.reduce((sum, s) => sum + s.words, 0)
    return Math.round(total / data.recentSessions.length)
  }, [data.recentSessions])

  const perfectSessionCount = useMemo(
    () => data.recentSessions.filter((s) => s.isPerfect).length,
    [data.recentSessions],
  )

  const revealedWordsTotal = useMemo(
    () => data.recentSessions.reduce((sum, session) => sum + (session.revealedWords || 0), 0),
    [data.recentSessions],
  )

  const averageMistakes = useMemo(() => {
    if (!data.recentSessions.length) return 0
    const total = data.recentSessions.reduce(
      (sum, session) => sum + (session.originalSession.inaccurateGuesses || 0),
      0,
    )
    return Math.round((total / data.recentSessions.length) * 10) / 10
  }, [data.recentSessions])

  const latestSession = data.recentSessions[0]

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-3 px-3 py-4 sm:max-w-7xl sm:px-4">
          <div className="flex items-center gap-2">
            <Sheet modal={false}>
              <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full w-screen max-w-[100vw] flex-col overflow-y-auto sm:w-80 sm:max-w-sm">
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
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold leading-tight">Quran Word App</p>
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

      <main className="mx-auto w-full max-w-full space-y-8 px-3 py-8 sm:max-w-7xl sm:px-4">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Words studied",
              value: data.stats.totalWords,
              icon: BookOpen,
              helper: "Lifetime attempts",
            },
            {
              label: "Accuracy",
              value: `${data.stats.accuracy}%`,
              icon: Target,
              helper: "Overall average",
            },
            {
              label: "Day streak",
              value: `${data.stats.streak}d`,
              icon: Flame,
              helper: "Consistency",
            },
            {
              label: "Perfect verses",
              value: data.stats.perfectVerses,
              icon: Trophy,
              helper: "No mistakes",
            },
          ].map((item) => (
            <Card key={item.label} className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{item.label}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-semibold tracking-tight text-foreground">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.helper}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Performance pulse
                </CardTitle>
                <CardDescription>Track accuracy, mastery, and momentum at a glance.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {data.performance.wordsLearned} unique words
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <MetricTile
                      label="Accuracy"
                      value={`${data.performance.accuracy}%`}
                      helper="Overall precision"
                      progress={data.performance.accuracy}
                    />
                    <MetricTile
                      label="Perfect rate"
                      value={`${data.performance.perfectRate}%`}
                      helper="Flawless verses"
                      progress={data.performance.perfectRate}
                    />
                    <MetricTile
                      label="Words mastered"
                      value={data.performance.wordsLearned}
                      helper="Unique across sessions"
                    />
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Latest session</p>
                          <p className="text-xs text-muted-foreground">
                            {latestSession ? latestSession.date : "No sessions yet"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          recent
                        </Badge>
                      </div>
                      {latestSession ? (
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Surah:Verse</span>
                            <span className="font-medium">
                              {latestSession.surahNumber}:{latestSession.verse}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Words</span>
                            <span className="font-medium">{latestSession.words}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-medium">{latestSession.accuracy}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">Complete a session to see insights.</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-sm font-semibold">Consistency</p>
                      <p className="text-xs text-muted-foreground">How steady your practice is.</p>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Day streak</span>
                          <span className="font-medium">{data.stats.streak} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Perfect sessions</span>
                          <span className="font-medium">{perfectSessionCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Revealed words</span>
                          <span className="font-medium">{revealedWordsTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Quality signals
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Track mistakes and revealed hints to focus on mastery.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MetricTile
                      label="Avg. mistakes"
                      value={averageMistakes}
                      helper="Per session"
                      progress={Math.min(100, (averageMistakes / 5) * 100)}
                    />
                    <MetricTile
                      label="Hints used"
                      value={revealedWordsTotal}
                      helper="Revealed words"
                      progress={Math.min(
                        100,
                        (revealedWordsTotal / Math.max(1, data.stats.totalWords || 1)) * 100,
                      )}
                    />
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
                    <p className="text-sm font-semibold">Focus areas</p>
                    <p className="text-xs text-muted-foreground">Top categories to revisit soon.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.areasToWorkOn.slice(0, 4).map((area, idx) => (
                        <Badge
                          key={`${area.category}-${idx}`}
                          variant={priorityTone[area.priority]}
                          className="capitalize"
                        >
                          {area.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Brain className="h-4 w-4" />
                Quick actions & insights
              </CardTitle>
              <CardDescription>Jump back in and keep the streak alive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickStat label="Today's sessions" value={todaySessions} helper="Completed today" />
                <QuickStat label="This week" value={weekSessions} helper="Sessions in the last 7 days" />
                <QuickStat label="Best accuracy" value={`${bestAccuracy}%`} helper="Personal best" />
                <QuickStat label="Avg. words" value={averageWords} helper="Per recent session" />
              </div>

              <Separator />

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">QW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">Stay on pace</p>
                    <p className="text-xs text-muted-foreground">
                      Your streak thrives on short, focused sessions.
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link href="/game">
                    Resume practice
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent sessions</CardTitle>
                <CardDescription>Latest activity with accuracy and reveal counts.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3.5 w-3.5" />
                {data.recentSessions.length} total
              </Badge>
            </CardHeader>
            <CardContent>
              {data.recentSessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  No sessions yet. Start a knowledge test to see your timeline here.
                </div>
              ) : (
                <ScrollArea className="h-[360px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Passage</TableHead>
                        <TableHead className="text-right">Words</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentSessions.map((session) => (
                        <TableRow key={session.id} className="hover:bg-muted/40">
                          <TableCell className="whitespace-nowrap text-sm font-medium">{session.date}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Surah {session.surahNumber}:{session.verse}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">{session.words}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{session.accuracy}%</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={session.isPerfect ? "default" : "secondary"}
                              className={cn(
                                "capitalize",
                                session.isPerfect ? "bg-primary text-primary-foreground" : "",
                              )}
                            >
                              {session.isPerfect ? "Perfect" : `${session.revealedWords || 0} revealed`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Areas to work on
              </CardTitle>
              <CardDescription>Prioritize what moves the needle next.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.areasToWorkOn.map((area, index) => (
                <div key={`${area.category}-${index}`} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{area.category}</p>
                      <p className="text-xs text-muted-foreground">{area.items.join(", ")}</p>
                    </div>
                    <Badge variant={priorityTone[area.priority]} className="capitalize">
                      {area.priority}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Mastery</span>
                      <span className="font-semibold text-foreground">{area.accuracy}%</span>
                    </div>
                    <Progress value={area.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
