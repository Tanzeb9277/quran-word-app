import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * Map grammar values to broad POS categories for filtering.
 * Arabic grammar often contains: فعل (verb), اسم (noun), حرف (particle), صفة (adjective).
 */
function grammarMatchesCategory(grammar, category) {
  if (!grammar) return category === "all"
  const g = grammar.toLowerCase()
  if (category === "all") return true
  if (category === "verb") return g.includes("فعل") || g.includes("verb")
  if (category === "noun") return g.includes("اسم") || g.includes("noun") || g.includes("لفظ") || g.includes("صيغة")
  if (category === "particle") return g.includes("حرف") || g.includes("particle") || g.includes("جار") || g.includes("أداة")
  if (category === "adjective") return g.includes("صفة") || g.includes("adjective")
  return false
}

/**
 * GET /api/words/by-frequency
 * Returns top words by frequency, optionally filtered by POS category.
 * Query params: limit (default 50), category (verb|noun|particle|adjective|all)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit")) || 50, 200)
    const category = searchParams.get("category") || "all"

    // Get all words with grammar - we'll group and filter in JS since
    // grammar values are varied and we need flexible matching
    const words = await sql`
      SELECT 
        arabic_text,
        transliteration,
        translation,
        grammar,
        root_arabic,
        root_latin,
        location
      FROM words 
      WHERE arabic_text IS NOT NULL 
      AND translation IS NOT NULL
      ORDER BY transliteration, translation
    `

    const rows = Array.isArray(words) ? words : words.rows || []

    // Group by unique word (arabic + normalized translation) and filter by category
    const wordMap = new Map()
    for (const row of rows) {
      if (category !== "all" && !grammarMatchesCategory(row.grammar, category)) continue

      const key = `${row.arabic_text}::${(row.translation || "").toLowerCase().replace(/[^\w\s]/g, "").trim()}`
      if (!wordMap.has(key)) {
        wordMap.set(key, {
          arabic: row.arabic_text,
          transliteration: row.transliteration,
          translation: row.translation,
          grammar: row.grammar,
          root: row.root_arabic && row.root_latin
            ? { arabic: row.root_arabic, latin: row.root_latin }
            : null,
          occurrences: 0,
          locations: [],
          surahs: [],
        })
      }
      const entry = wordMap.get(key)
      entry.occurrences++
      if (row.location && !entry.locations.includes(row.location)) {
        entry.locations.push(row.location)
      }
      const sn = row.location?.split(':')[0]
      if (sn && !entry.surahs.includes(parseInt(sn))) {
        entry.surahs.push(parseInt(sn))
      }
    }

    const uniqueWords = Array.from(wordMap.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        words: uniqueWords,
        total: uniqueWords.length,
        category,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching words by frequency:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch words by frequency" },
      { status: 500 }
    )
  }
}
