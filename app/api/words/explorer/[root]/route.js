import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { root } = await params
    const decodedRoot = decodeURIComponent(root)
    const { searchParams } = new URL(request.url)
    const surah = searchParams.get("surah")
    const limit = searchParams.get("limit") || "50"

    // Keep the root as-is since database stores roots in spaced format
    const searchRoot = decodedRoot
    
    // Get words grouped by grammar category
    let wordsByGrammar
    if (surah) {
      wordsByGrammar = await sql`
        SELECT 
          grammar,
          arabic_text,
          transliteration,
          translation,
          COUNT(DISTINCT location) as occurrences,
          ARRAY_AGG(DISTINCT location ORDER BY location) as locations,
          ARRAY_AGG(DISTINCT surah_number ORDER BY surah_number) as surahs
        FROM words 
        WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND surah_number = ${surah}
        AND grammar IS NOT NULL
        AND arabic_text IS NOT NULL
        GROUP BY grammar, arabic_text, transliteration, translation
        ORDER BY grammar, occurrences DESC, arabic_text
        LIMIT ${parseInt(limit)}
      `
    } else {
      wordsByGrammar = await sql`
        SELECT 
          grammar,
          arabic_text,
          transliteration,
          translation,
          COUNT(DISTINCT location) as occurrences,
          ARRAY_AGG(DISTINCT location ORDER BY location) as locations,
          ARRAY_AGG(DISTINCT surah_number ORDER BY surah_number) as surahs
        FROM words 
        WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND grammar IS NOT NULL
        AND arabic_text IS NOT NULL
        GROUP BY grammar, arabic_text, transliteration, translation
        ORDER BY grammar, occurrences DESC, arabic_text
        LIMIT ${parseInt(limit)}
      `
    }

    // Get root information
    const rootInfo = await sql`
      SELECT DISTINCT 
        root_arabic,
        root_latin
      FROM words 
      WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
      LIMIT 1
    `

    // Group words by grammar category
    const grammarCategories = {}
    let totalWords = 0
    let totalOccurrences = 0

    wordsByGrammar.forEach(row => {
      const grammar = row.grammar || 'Unknown'
      
      if (!grammarCategories[grammar]) {
        grammarCategories[grammar] = []
      }
      
      grammarCategories[grammar].push({
        arabic_text: row.arabic_text,
        transliteration: row.transliteration,
        translation: row.translation,
        occurrences: row.occurrences,
        locations: row.locations,
        surahs: row.surahs
      })
      
      totalWords++
      totalOccurrences += row.occurrences
    })

    // Get summary statistics
    let summaryStats
    if (surah) {
      summaryStats = await sql`
        SELECT 
          COUNT(DISTINCT arabic_text) as total_unique_forms,
          COUNT(*) as total_occurrences,
          COUNT(DISTINCT surah_number) as total_surahs,
          COUNT(DISTINCT verse) as total_verses,
          COUNT(DISTINCT grammar) as total_grammar_categories
        FROM words 
        WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND surah_number = ${surah}
        AND arabic_text IS NOT NULL
      `
    } else {
      summaryStats = await sql`
        SELECT 
          COUNT(DISTINCT arabic_text) as total_unique_forms,
          COUNT(*) as total_occurrences,
          COUNT(DISTINCT surah_number) as total_surahs,
          COUNT(DISTINCT verse) as total_verses,
          COUNT(DISTINCT grammar) as total_grammar_categories
        FROM words 
        WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND arabic_text IS NOT NULL
      `
    }

    const stats = summaryStats[0] || {}

    // Create a more compact response for the explorer UI
    const compactGrammarCategories = {}
    Object.keys(grammarCategories).forEach(grammar => {
      compactGrammarCategories[grammar] = grammarCategories[grammar].map(word => ({
        arabic: word.arabic_text,
        transliteration: word.transliteration,
        translation: word.translation,
        occurrences: word.occurrences,
        surahs: word.surahs || [],
        locations: word.locations || []
      }))
    })

    return NextResponse.json({
      success: true,
      data: {
        root: {
          arabic: rootInfo[0]?.root_arabic || decodedRoot,
          latin: rootInfo[0]?.root_latin || decodedRoot,
          arabic_compact: rootInfo[0]?.root_arabic || decodedRoot,
          latin_compact: rootInfo[0]?.root_latin || decodedRoot
        },
        grammar_categories: compactGrammarCategories,
        summary: {
          total_unique_forms: stats.total_unique_forms || 0,
          total_occurrences: stats.total_occurrences || 0,
          total_surahs: stats.total_surahs || 0,
          total_verses: stats.total_verses || 0,
          grammar_categories_count: stats.total_grammar_categories || 0
        },
        filters: {
          surah: surah || null,
          limit: parseInt(limit)
        }
      },
      count: Object.keys(compactGrammarCategories).length,
      message: `Combined explorer data for root: ${rootInfo[0]?.root_arabic || decodedRoot}`
    })
  } catch (error) {
    console.error("Error fetching combined explorer data:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch combined explorer data",
      details: error.message 
    }, { status: 500 })
  }
}

