import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

function normalizeTranslation(translation) {
  if (!translation) return ""
  return translation
    .replace(/[.,;:!?()[\]{}'"]/g, "")
    .replace(/-/g, " ")
    .trim()
    .toLowerCase()
}

function parseSeenWordIdsParam(value) {
  if (!value) return []
  return value
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter(Number.isInteger)
}

function locationToAyah(location) {
  if (!location) return null
  const parts = String(location).split(":")
  if (parts.length < 2) return null
  return `${parts[0]}:${parts[1]}`
}

/**
 * GET /api/morphology/root/[root]
 * Query params:
 * - seenWordIds: comma-separated list of word IDs the user has seen
 */
export async function GET(request, { params }) {
  try {
    const { root } = await params
    const decodedRoot = decodeURIComponent(root)

    const { searchParams } = new URL(request.url)
    const seenWordIds = parseSeenWordIdsParam(searchParams.get("seenWordIds"))
    const seenSet = new Set(seenWordIds)

    const searchRoot = decodedRoot

    const words = await sql`
      SELECT
        id,
        root_arabic,
        root_latin,
        arabic_text,
        transliteration,
        translation,
        grammar,
        location,
        surah_number
      FROM words
      WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND arabic_text IS NOT NULL
        AND translation IS NOT NULL
      ORDER BY arabic_text, translation, id
    `

    const rows = Array.isArray(words) ? words : words.rows || []

    const rootArabic = rows[0]?.root_arabic || decodedRoot
    const rootLatin = rows[0]?.root_latin || decodedRoot

    // Group by unique arabic_text + normalized translation (dedupe translation punctuation/case)
    const formMap = new Map()
    const surahsAll = new Set()
    let totalOccurrences = 0

    for (const row of rows) {
      surahsAll.add(row.surah_number)
      totalOccurrences += 1

      const normTr = normalizeTranslation(row.translation)
      const key = `${row.arabic_text}::${normTr}`

      if (!formMap.has(key)) {
        formMap.set(key, {
          arabic: row.arabic_text,
          transliteration: row.transliteration,
          translation: row.translation,
          grammar: row.grammar,
          occurrences: 0,
          seen: false,
          example_location: null,
          _seen_ids: [],
        })
      }

      const entry = formMap.get(key)
      entry.occurrences += 1

      if (!entry.example_location && row.location) {
        entry.example_location = locationToAyah(row.location)
      }

      if (Number.isInteger(row.id)) {
        entry._seen_ids.push(row.id)
        if (!entry.seen && seenSet.has(row.id)) {
          entry.seen = true
        }
      }
    }

    let forms = Array.from(formMap.values()).map((f) => {
      const { _seen_ids, ...rest } = f
      return rest
    })

    const coreMeaning = forms
    .sort((a, b) => b.occurrences - a.occurrences)[0]
    ?.translation || ""

    // Sort: seen first, then occurrences descending
    forms.sort((a, b) => {
      if (a.seen !== b.seen) return a.seen ? -1 : 1
      if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences
      return (a.arabic || "").localeCompare(b.arabic || "")
    })

    const seenForms = forms.reduce((acc, f) => acc + (f.seen ? 1 : 0), 0)

    return NextResponse.json({
      root_arabic: rootArabic,
      root_latin: rootLatin,
      core_meaning: coreMeaning,
      forms,
      stats: {
        total_forms: forms.length,
        seen_forms: seenForms,
        total_occurrences: totalOccurrences,
        surahs_count: surahsAll.size,
      },
    })
  } catch (error) {
    console.error("Error fetching morphology root data:", error)
    return NextResponse.json(
      { error: "Failed to fetch morphology root data", details: error.message },
      { status: 500 }
    )
  }
}

