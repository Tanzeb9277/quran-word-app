import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Function to normalize translation by removing punctuation
function normalizeTranslation(translation) {
  if (!translation) return ''
  // Remove common punctuation marks: periods, commas, semicolons, colons, exclamation, question marks, parentheses, brackets, quotes
  return translation
    .replace(/[.,;:!?()[\]{}'"]/g, '')
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .trim()
    .toLowerCase()
}

export async function GET(request, { params }) {
  try {
    const { root } = await params
    const decodedRoot = decodeURIComponent(root)
    const { searchParams } = new URL(request.url)
    const surah = searchParams.get("surah")
    const limit = searchParams.get("limit") || "500" // Increase limit since we'll filter client-side

    // Keep the root as-is since database stores roots in spaced format
    const searchRoot = decodedRoot
    
    // Get all words first (without grouping by translation, since we'll normalize it)
    let allWords
    if (surah) {
      allWords = await sql`
        SELECT 
          grammar,
          arabic_text,
          transliteration,
          translation,
          location,
          surah_number
        FROM words 
        WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND surah_number = ${surah}
        AND grammar IS NOT NULL
        AND arabic_text IS NOT NULL
        AND translation IS NOT NULL
        ORDER BY grammar, arabic_text, translation
      `
    } else {
      allWords = await sql`
        SELECT 
          grammar,
          arabic_text,
          transliteration,
          translation,
          location,
          surah_number
        FROM words 
        WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
        AND grammar IS NOT NULL
        AND arabic_text IS NOT NULL
        AND translation IS NOT NULL
        ORDER BY grammar, arabic_text, translation
      `
    }

    // Convert to array if needed
    const wordsArray = Array.isArray(allWords) ? allWords : allWords.rows || []

    // Group words by grammar, then by unique arabic_text + normalized translation
    const grammarCategories = {}
    const uniqueWordMap = new Map() // Track unique words across all grammar categories

    wordsArray.forEach(row => {
      const grammar = row.grammar || 'Unknown'
      const normalizedTranslation = normalizeTranslation(row.translation)
      const uniqueKey = `${row.arabic_text}::${normalizedTranslation}`

      if (!grammarCategories[grammar]) {
        grammarCategories[grammar] = new Map()
      }

      // Check if this unique combination already exists
      if (!grammarCategories[grammar].has(uniqueKey)) {
        // Create new unique word entry
        grammarCategories[grammar].set(uniqueKey, {
          arabic_text: row.arabic_text,
          transliteration: row.transliteration,
          translation: row.translation, // Keep original translation
          normalizedTranslation: normalizedTranslation,
          occurrences: 0,
          locations: [],
          surahs: []
        })
      }

      // Update the word entry
      const wordEntry = grammarCategories[grammar].get(uniqueKey)
      wordEntry.occurrences++
      if (row.location && !wordEntry.locations.includes(row.location)) {
        wordEntry.locations.push(row.location)
      }
      if (row.surah_number && !wordEntry.surahs.includes(row.surah_number)) {
        wordEntry.surahs.push(row.surah_number)
      }

      // Track globally for statistics
      if (!uniqueWordMap.has(uniqueKey)) {
        uniqueWordMap.set(uniqueKey, true)
      }
    })

    // Convert Maps to arrays and sort
    const processedCategories = {}
    Object.keys(grammarCategories).forEach(grammar => {
      const words = Array.from(grammarCategories[grammar].values())
      // Sort by occurrences descending, then by arabic_text
      words.sort((a, b) => {
        if (b.occurrences !== a.occurrences) {
          return b.occurrences - a.occurrences
        }
        return (a.arabic_text || '').localeCompare(b.arabic_text || '')
      })
      // Apply limit per grammar category
      processedCategories[grammar] = words.slice(0, parseInt(limit))
    })

    // Get root information
    const rootInfo = await sql`
      SELECT DISTINCT 
        root_arabic,
        root_latin
      FROM words 
      WHERE (root_arabic = ${searchRoot} OR root_latin = ${searchRoot})
      LIMIT 1
    `

    // Calculate statistics
    let totalOccurrences = 0
    let totalSurahs = new Set()
    let totalVerses = new Set()

    Object.values(processedCategories).forEach(words => {
      words.forEach(word => {
        totalOccurrences += word.occurrences
        word.surahs.forEach(s => totalSurahs.add(s))
        word.locations.forEach(loc => {
          // Extract verse from location format: surah:verse:word
          const parts = loc.split(':')
          if (parts.length >= 2) {
            totalVerses.add(`${parts[0]}:${parts[1]}`)
          }
        })
      })
    })

    const totalUniqueWords = uniqueWordMap.size

    // Create a more compact response for the explorer UI
    const compactGrammarCategories = {}
    Object.keys(processedCategories).forEach(grammar => {
      compactGrammarCategories[grammar] = processedCategories[grammar].map(word => ({
        arabic: word.arabic_text,
        transliteration: word.transliteration,
        translation: word.translation, // Original translation with punctuation
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
          total_unique_forms: totalUniqueWords,
          total_occurrences: totalOccurrences,
          total_surahs: totalSurahs.size,
          total_verses: totalVerses.size,
          grammar_categories_count: Object.keys(compactGrammarCategories).length
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

