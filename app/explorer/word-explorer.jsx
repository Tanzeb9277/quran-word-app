"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Filter, Loader2, SlidersHorizontal, X } from "lucide-react"

// ---------- Remove static sample and tag meta; fetch from API ----------

// Soft color mapping per tag
const TAG_COLOR = {
  N: "bg-emerald-100 text-emerald-800",
  V: "bg-rose-100 text-rose-800",
  ADJ: "bg-amber-100 text-amber-800",
  PN: "bg-violet-100 text-violet-800",
  PRON: "bg-purple-100 text-purple-800",
  P: "bg-teal-100 text-teal-800",
  CONJ: "bg-orange-100 text-orange-800",
  NEG: "bg-stone-100 text-stone-800",
  DEM: "bg-lime-100 text-lime-800",
  REL: "bg-cyan-100 text-cyan-800",
  ACC: "bg-pink-100 text-pink-800",
}

// ---------- Helpers ----------
function parseTags(value) {
  if (!value) return []
  try {
    if (Array.isArray(value)) return value
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Extract verse number from location field (e.g., "112:1:3" -> 1)
function getVerseNumber(location) {
  if (!location) return 0
  const parts = location.split(':')
  return parts.length >= 2 ? parseInt(parts[1]) : 0
}

// Group words by verse number
function groupWordsByVerse(words) {
  const grouped = {}
  words.forEach(word => {
    const verseNum = getVerseNumber(word.location)
    if (!grouped[verseNum]) {
      grouped[verseNum] = []
    }
    grouped[verseNum].push(word)
  })
  return grouped
}

// Get unique verse numbers from words
function getUniqueVerses(words) {
  if (!words || words.length === 0) return []
  const verseSet = new Set()
  words.forEach(word => {
    const verseNum = getVerseNumber(word.location)
    if (verseNum > 0) verseSet.add(verseNum)
  })
  return Array.from(verseSet).sort((a, b) => a - b)
}

function wordHasAnyTag(word, selected) {
  if (!selected.size) return true
  const tags = parseTags(word.tags).map((t) => t.tag)
  return tags.some((t) => selected.has(t))
}

function normalize(str) {
  return (str || "").toString().toLowerCase().trim()
}

function uniqueByKey(items, keyFn) {
  const seen = new Set()
  const out = []
  for (const it of items) {
    const k = keyFn(it)
    if (k && !seen.has(k)) {
      seen.add(k)
      out.push(it)
    }
  }
  return out
}

function groupBy(items, keyFn) {
  return items.reduce((acc, it) => {
    const k = keyFn(it)
    if (!acc[k]) acc[k] = []
    acc[k].push(it)
    return acc
  }, {})
}

// ---------- Word Card (inline) ----------
function TagBadge({ code }) {
  const classes = TAG_COLOR[code] || "bg-gray-100 text-gray-800"
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>{code}</span>
  )
}

function WordCard({ word }) {
  const tags = parseTags(word.tags).map((t) => t.tag)
  
  // Extract location components (surah:verse:word)
  const locationParts = word.location ? word.location.split(':') : []
  const locationDisplay = locationParts.length === 3 ? locationParts.join(':') : word.verse || ''
  
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          {/* Left side */}
          <div className="space-y-1">
            <div className="flex gap-1 flex-wrap">
              {word.root_arabic ? (
                <span className="font-arabic text-lg text-indigo-600 font-semibold">{word.root_arabic}</span>
              ) : null}
            </div>
          </div>
          {/* Right side */}
          <div className="space-y-1 text-right">
            <div className="text-sm text-muted-foreground">{locationDisplay}</div>
            <div className="text-xs text-muted-foreground">{word.grammar || ""}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="rounded-md p-3 bg-gradient-to-r from-indigo-200/40 to-indigo-500/10 border border-indigo-100">
          <img
            src={word.image_url || "/placeholder.svg?height=48&width=220&query=arabic%20word%20image"}
            alt={word.translation ? `Arabic: ${word.translation}` : "Arabic word image"}
            className="mx-auto h-12 object-contain"
            loading="lazy"
          />
        </div>
        <div className="text-base font-medium text-foreground text-center">
          {word.translation || "-"}
        </div>
        <div className="flex gap-1 flex-wrap justify-center">
          {tags.slice(0, 4).map((t) => (
            <TagBadge key={t} code={t} />
          ))}
          {tags.length > 4 ? (
            <Badge variant="secondary" className="rounded-md text-[10px]">
              {"+"}
              {tags.length - 4}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- Filters Panel (inline) ----------
function FiltersPanel({
  search,
  setSearch,
  uniqueOnly,
  setUniqueOnly,
  groupByVerse,
  setGroupByVerse,
  selectedTags,
  setSelectedTags,
  tagsMeta,
}) {
  const toggleTag = (code) => {
    const next = new Set(selectedTags)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    setSelectedTags(next)
  }

  // Common tags first, then the rest
  const commonCodes = ["N", "V", "ADJ", "PN", "PRON", "P", "CONJ", "NEG"]
  const common = tagsMeta.filter((t) => commonCodes.includes(t.tag))
  const others = tagsMeta.filter((t) => !commonCodes.includes(t.tag))

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">{"Search"}</label>
        <Input
          placeholder="Search transliteration, translation, root, verse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="uniqueOnly" checked={uniqueOnly} onCheckedChange={(v) => setUniqueOnly(Boolean(v))} />
          <label htmlFor="uniqueOnly" className="text-sm cursor-pointer">
            {"Unique words only"}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="groupByVerse" checked={groupByVerse} onCheckedChange={(v) => setGroupByVerse(Boolean(v))} />
          <label htmlFor="groupByVerse" className="text-sm cursor-pointer">
            {"Group by verse (collapsible)"}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">{"Filter by tags"}</div>
        <div className="grid grid-cols-2 gap-2">
          {common.map((t) => {
            const isSelected = selectedTags.has(t.tag)
            return (
              <button
                key={t.tag}
                onClick={() => toggleTag(t.tag)}
                className={`w-full text-left flex items-center justify-start gap-2 rounded-md px-2 py-1 border transition-colors
${isSelected ? "border-indigo-300 bg-indigo-50 text-indigo-900" : "border-transparent text-foreground hover:bg-gray-50 hover:border-gray-200"} focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                aria-pressed={isSelected}
              >
                <span className="font-mono">{t.tag}</span>
                <span className="text-muted-foreground truncate">{t.description}</span>
              </button>
            )
          })}
        </div>
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">{"More tags"}</summary>
          <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-auto pr-1">
            {others.map((t) => {
              const isSelected = selectedTags.has(t.tag)
              return (
                <button
                  key={t.tag}
                  onClick={() => toggleTag(t.tag)}
                  className={`w-full text-left flex items-center justify-start gap-2 rounded-md px-2 py-1 border transition-colors
${isSelected ? "border-indigo-300 bg-indigo-50 text-indigo-900" : "border-transparent text-foreground hover:bg-gray-50 hover:border-gray-200"} focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                  aria-pressed={isSelected}
                  title={t.description}
                >
                  <span className="font-mono">{t.tag}</span>
                  <span className="text-muted-foreground truncate">{t.description}</span>
                </button>
              )
            })}
          </div>
        </details>
        {selectedTags.size > 0 ? (
          <div className="flex flex-wrap gap-1 pt-2">
            {[...selectedTags].map((code) => (
              <Badge key={code} variant="secondary" className="rounded-md">
                <span className="font-mono mr-1">{code}</span>
                <button className="ml-1 text-xs opacity-70 hover:opacity-100" onClick={() => toggleTag(code)}>
                  {"×"}
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setSelectedTags(new Set())}>
              {"Clear"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ---------- Main Component ----------
export default function WordExplorer(props) {
  const {
    // Provide your own loader: async (surahNumber) => [{...word}]
    fetchWords,
    // Provide your own surah list: [{ number, name, wordCount }]
    surahs: surahsProp,
    initialSurah = 112,
    pageSize = 12,
    tagsMeta: tagsMetaProp,
    title = "Surah Explorer",
  } = props || {}

  const [surahs, setSurahs] = useState(surahsProp || [])
  const [tagsMeta, setTagsMeta] = useState(tagsMetaProp || [])

  const [selectedSurah, setSelectedSurah] = useState(initialSurah)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [words, setWords] = useState([])

  // Filters
  const [search, setSearch] = useState("")
  const [uniqueOnly, setUniqueOnly] = useState(false)
  const [groupByVerse, setGroupByVerse] = useState(false)
  const [selectedTags, setSelectedTags] = useState(new Set())

  // Verse selection
  const [selectedVerse, setSelectedVerse] = useState("")
  const [verseStart, setVerseStart] = useState("")
  const [verseEnd, setVerseEnd] = useState("")
  const [verseMode, setVerseMode] = useState("all") // "all", "single", "range"

  // Pagination
  const [page, setPage] = useState(1)

  // Mobile filters
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Load initial meta (surahs, tags)
  useEffect(() => {
    let cancelled = false
    async function loadMeta() {
      try {
        if (!surahsProp) {
          const res = await fetch('/api/words/surahs')
          const json = await res.json()
          if (!cancelled && json?.success) {
            setSurahs(json.data || [])
          }
        }
      } catch (e) {
        // swallow; UI will still work but list may be empty
      }
      try {
        if (!tagsMetaProp) {
          const res = await fetch('/api/tags')
          const json = await res.json()
          if (!cancelled && json?.tags) {
            setTagsMeta(json.tags)
          }
        }
      } catch (e) {
        // swallow
      }
    }
    loadMeta()
    return () => { cancelled = true }
  }, [surahsProp, tagsMetaProp])



  // Frontend verse filtering - no API calls needed
  const applyVerseFilter = () => {
    // Validate verse range
    if (verseMode === "range") {
      if (verseStart && verseEnd && parseInt(verseStart) > parseInt(verseEnd)) {
        setError("Start verse must be less than or equal to end verse.")
        return
      }
    }
    
    setError("")
    setPage(1)
  }

  // Load words on surah change
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError("")
      setWords([])
      setPage(1)
      
      // Reset verse selection when surah changes
      setSelectedVerse("")
      setVerseStart("")
      setVerseEnd("")
      setVerseMode("all")
      
      try {
        let data = []
        if (typeof fetchWords === "function") {
          const result = await fetchWords(selectedSurah)
          data = Array.isArray(result) ? result : []
        } else {
          const res = await fetch(`/api/words/surah/${selectedSurah}`)
          const json = await res.json()
          data = json?.success ? (json.data || []) : []
        }
        if (!cancelled) {
          setWords(data)
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load words.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedSurah, fetchWords])

  // Derived filtered words with verse filtering
  const { filtered, totalCount, verses } = useMemo(() => {
    const q = normalize(search)
    
    // First apply verse filtering
    let verseFiltered = words || []
    if (verseMode === "single" && selectedVerse) {
      const targetVerse = parseInt(selectedVerse)
      if (!isNaN(targetVerse)) {
        verseFiltered = words.filter(w => getVerseNumber(w.location) === targetVerse)
      }
    } else if (verseMode === "range") {
      if (verseStart || verseEnd) {
        verseFiltered = words.filter(w => {
          const verseNum = getVerseNumber(w.location)
          if (verseStart && verseEnd) {
            const start = parseInt(verseStart)
            const end = parseInt(verseEnd)
            return !isNaN(start) && !isNaN(end) && verseNum >= start && verseNum <= end
          } else if (verseStart) {
            const start = parseInt(verseStart)
            return !isNaN(start) && verseNum >= start
          } else if (verseEnd) {
            const end = parseInt(verseEnd)
            return !isNaN(end) && verseNum <= end
          }
          return true
        })
      }
    }
    
    // Then apply tag and search filtering
    const filteredAll = verseFiltered.filter((w) => {
      if (!wordHasAnyTag(w, selectedTags)) return false
      if (!q) return true
      const hay = [w.transliteration, w.translation, w.root_latin, w.root_arabic, w.verse, w.grammar]
        .map(normalize)
        .join(" ")
      return hay.includes(q)
    })

    const unique = uniqueOnly
      ? uniqueByKey(
          filteredAll,
          (w) => w.root_arabic || w.root_latin || w.transliteration || w.translation || w.image_url,
        )
      : filteredAll

    // Get available verses from the current words
    const availableVerses = getUniqueVerses(words || [])

    return { filtered: unique, totalCount: unique.length, verses: availableVerses }
  }, [words, search, uniqueOnly, selectedTags, verseMode, selectedVerse, verseStart, verseEnd])

  // Pagination slice (disabled when grouping by verse)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])
  const pageSlice = useMemo(() => {
    if (groupByVerse) return filtered
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize, groupByVerse])

  // Grouping by verse
  const grouped = useMemo(() => {
    if (!groupByVerse) return {}
    return groupBy(pageSlice, (w) => w.verse || "Unknown")
  }, [pageSlice, groupByVerse])

  const currentSurahMeta = surahs.find((s) => s.number === selectedSurah)

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header / Selector */}
      <div className="rounded-xl border mb-4 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-200 to-indigo-500/20 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {"Explore words by surah, filter by tags, and view roots and grammar."}
              </p>
            </div>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="surah-select" className="text-sm font-medium">
                  {"Surah"}
                </label>
                <select
                  id="surah-select"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={selectedSurah}
                  onChange={(e) => setSelectedSurah(Number(e.target.value))}
                >
                  {surahs.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}
                      {" - "}
                      {s.name || "Surah"}
                      {s.wordCount ? ` (${s.wordCount})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Verse Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm font-medium">Verse:</label>
                <select
                  className={`h-9 rounded-md border px-3 text-sm w-24 transition-colors ${
                    verseMode !== "all" ? "border-blue-300 bg-blue-50" : "border-input bg-background"
                  }`}
                  value={verseMode}
                  onChange={(e) => setVerseMode(e.target.value)}
                >
                  <option value="all">All Verses</option>
                  <option value="single">Single Verse</option>
                  <option value="range">Verse Range</option>
                </select>
                
                {verseMode === "single" && (
                  <select
                    className="h-9 rounded-md border bg-background px-3 text-sm w-20"
                    value={selectedVerse}
                    onChange={(e) => setSelectedVerse(e.target.value)}
                  >
                    <option value="">Select</option>
                    {verses.map((verseNum) => {
                      const verseWords = words.filter(w => getVerseNumber(w.location) === verseNum)
                      return (
                        <option key={verseNum} value={verseNum}>
                          {verseNum} ({verseWords.length})
                        </option>
                      )
                    })}
                  </select>
                )}
                
                {verseMode === "range" && (
                  <>
                    <input
                      type="number"
                      placeholder="Start"
                      className="h-9 rounded-md border bg-background px-3 text-sm w-20"
                      value={verseStart}
                      onChange={(e) => setVerseStart(e.target.value)}
                      min={verses.length > 0 ? 1 : 0}
                      max={verses.length > 0 ? Math.max(...verses) : 0}
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <input
                      type="number"
                      placeholder="End"
                      className="h-9 rounded-md border bg-background px-3 text-sm w-20"
                      value={verseEnd}
                      onChange={(e) => setVerseEnd(e.target.value)}
                      min={verses.length > 0 ? 1 : 0}
                      max={verses.length > 0 ? Math.max(...verses) : 0}
                    />
                  </>
                )}
                
                {(verseMode === "single" || verseMode === "range") && (
                  <>
                    <Button
                      size="sm"
                      onClick={applyVerseFilter}
                      className="h-9 px-3"
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setVerseMode("all")
                        setSelectedVerse("")
                        setVerseStart("")
                        setVerseEnd("")
                      }}
                      className="h-9 px-2"
                      title="Reset verse filter"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 p-3 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium">{"Surah:"}</span>{" "}
            <span>
              {currentSurahMeta ? `${currentSurahMeta.number} • ${currentSurahMeta.name || "Surah"}` : selectedSurah}
            </span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium">{"Verses:"}</span> <span>{verses.length}</span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium">{"Words:"}</span> <span>{words.length}</span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium">{"Filtered:"}</span> <span>{totalCount}</span>
          </div>
          {verseMode === "single" && selectedVerse && (
            <div className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              <span className="font-medium">{"Verse:"}</span> <span>{selectedVerse}</span>
            </div>
          )}
          {verseMode === "range" && (verseStart || verseEnd) && (
            <div className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              <span className="font-medium">{"Range:"}</span>{" "}
              <span>
                {verseStart || "1"} - {verseEnd || verses.length}
              </span>
            </div>
          )}
          {!groupByVerse && (
            <div className="text-muted-foreground">
              <span className="font-medium">{"Page:"}</span>{" "}
              <span>
                {page}/{totalPages}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> {"Filters"}
              </CardTitle>
              <CardDescription className="text-xs">{"Refine the word list"}</CardDescription>
            </CardHeader>
            <CardContent>
              <FiltersPanel
                search={search}
                setSearch={setSearch}
                uniqueOnly={uniqueOnly}
                setUniqueOnly={setUniqueOnly}
                groupByVerse={groupByVerse}
                setGroupByVerse={setGroupByVerse}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                tagsMeta={tagsMeta}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Content */}
        <main className="min-h-[400px]">
          {/* Mobile Filters trigger */}
          <div className="md:hidden mb-3 flex justify-between">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  {"Filters"}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle>{"Filters"}</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {/* Verse Selection in Mobile */}
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-3">Verse Selection</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Mode:</label>
                        <select
                          className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                          value={verseMode}
                          onChange={(e) => setVerseMode(e.target.value)}
                        >
                          <option value="all">All Verses</option>
                          <option value="single">Single Verse</option>
                          <option value="range">Verse Range</option>
                        </select>
                      </div>
                      
                      {verseMode === "single" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Select Verse:</label>
                          <select
                            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                            value={selectedVerse}
                            onChange={(e) => setSelectedVerse(e.target.value)}
                          >
                            <option value="">Choose a verse</option>
                            {verses.map((verseNum) => {
                              const verseWords = words.filter(w => getVerseNumber(w.location) === verseNum)
                              return (
                                <option key={verseNum} value={verseNum}>
                                  Verse {verseNum} ({verseWords.length} words)
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                      
                      {verseMode === "range" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-2">Start:</label>
                            <input
                              type="number"
                              placeholder="Start verse"
                              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                              value={verseStart}
                              onChange={(e) => setVerseStart(e.target.value)}
                              min={verses.length > 0 ? 1 : 0}
                              max={verses.length > 0 ? Math.max(...verses) : 0}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">End:</label>
                            <input
                              type="number"
                              placeholder="End verse"
                              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                              value={verseEnd}
                              onChange={(e) => setVerseEnd(e.target.value)}
                              min={verses.length > 0 ? 1 : 0}
                              max={verses.length > 0 ? Math.max(...verses) : 0}
                            />
                          </div>
                        </div>
                      )}
                      
                      {(verseMode === "single" || verseMode === "range") && (
                        <div className="flex gap-2">
                                                  <Button
                          size="sm"
                          onClick={() => {
                            applyVerseFilter()
                            setFiltersOpen(false)
                          }}
                          className="flex-1"
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setVerseMode("all")
                            setSelectedVerse("")
                            setVerseStart("")
                            setVerseEnd("")
                          }}
                        >
                          Reset
                        </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <FiltersPanel
                    search={search}
                    setSearch={setSearch}
                    uniqueOnly={uniqueOnly}
                    setUniqueOnly={setUniqueOnly}
                    groupByVerse={groupByVerse}
                    setGroupByVerse={setGroupByVerse}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    tagsMeta={tagsMeta}
                  />
                  <div className="mt-6">
                    <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                      {"Apply"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="text-sm text-muted-foreground self-center">
              {totalCount}
              {" results"}
            </div>
          </div>

          {/* Loading / Error */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {"Loading words..."}
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : totalCount === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground mb-2">
                {verseMode !== "all" ? "No words found for the selected verse(s)." : "No words match your filters."}
              </div>
              {verseMode !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVerseMode("all")
                    setSelectedVerse("")
                    setVerseStart("")
                    setVerseEnd("")
                  }}
                >
                  Show All Verses
                </Button>
              )}
            </div>
          ) : groupByVerse ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(grouped).map(([verse, items]) => (
                <AccordionItem key={verse} value={verse}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{verse}</span>
                      <Badge variant="secondary" className="rounded-md">
                        {items.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" dir="rtl">
                      {items.map((w) => (
                        <WordCard key={w.id} word={w} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" dir="rtl">
                {pageSlice.map((w) => (
                  <WordCard key={w.id} word={w} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage((p) => Math.max(1, p - 1))
                          }}
                        />
                      </PaginationItem>
                      {/* Show up to 5 pages around current */}
                      {Array.from({ length: totalPages })
                        .slice(Math.max(0, page - 3), Math.max(0, page - 3) + Math.min(5, totalPages))
                        .map((_, idx) => {
                          const num = Math.max(1, page - 2) + idx
                          if (num > totalPages) return null
                          return (
                            <PaginationItem key={num}>
                              <PaginationLink
                                href="#"
                                isActive={page === num}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPage(num)
                                }}
                              >
                                {num}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage((p) => Math.min(totalPages, p + 1))
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Optional: small font class for Arabic if you load one globally
// .font-arabic { font-family: 'Amiri', 'Scheherazade', serif; }
