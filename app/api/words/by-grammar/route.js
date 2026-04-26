import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/words/by-grammar
 * Returns words grouped by grammar category.
 * Query params: grammar (exact grammar value), limit, tab (verbs|nouns|particles)
 *
 * If tab is provided, we map to grammar values containing:
 * - verbs: فعل
 * - nouns: اسم, لفظ, صيغة
 * - particles: حرف, جار, أداة
 */
const TAB_PATTERNS = {
  verbs: ["فعل"],
  nouns: ["اسم", "لفظ", "صيغة", "صفة"],
  particles: ["حرف", "جار", "أداة"],
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const grammar = searchParams.get("grammar")
    const tab = searchParams.get("tab")
    const limit = Math.min(parseInt(searchParams.get("limit")) || 100, 300)


    let grammarFilter = ""
    if (grammar) {
      grammarFilter = `AND grammar = '${grammar.replace(/'/g, "''")}'`
    } else if (tab && TAB_PATTERNS[tab]) {
      const patterns = TAB_PATTERNS[tab]
      const orParts = patterns.map((p) => `grammar ILIKE '%${p.replace(/'/g, "''")}%'`).join(" OR ")
      grammarFilter = orParts ? `AND (${orParts})` : ""
    }

    const words = await sql.unsafe(`
      SELECT 
        arabic_text,
        transliteration,
        translation,
        grammar,
        root_arabic,
        root_latin,
        location
      FROM words 
      WHERE arabic_text IS NOT NULL AND translation IS NOT NULL AND grammar IS NOT NULL AND grammar != '' ${grammarFilter}
      ORDER BY grammar, transliteration, translation
    `)

    const rows = Array.isArray(words) ? words : words.rows || []

    const wordMap = new Map()
    for (const row of rows) {
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

    const uniqueWords = Array.from(wordMap.values()).sort(
      (a, b) => b.occurrences - a.occurrences
    )

    const groupedByGrammar = {}
    for (const w of uniqueWords) {
      const g = w.grammar || "Unknown"
      if (!groupedByGrammar[g]) groupedByGrammar[g] = []
      groupedByGrammar[g].push(w)
    }

    for (const g of Object.keys(groupedByGrammar)) {
      groupedByGrammar[g] = groupedByGrammar[g].slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      data: {
        by_grammar: groupedByGrammar,
        grammar_categories: Object.keys(groupedByGrammar).sort(),
        filter: grammar || tab || "all",
      },
    })
  } catch (error) {
    console.error("Error fetching words by grammar:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch words by grammar" },
      { status: 500 }
    )
  }
}
