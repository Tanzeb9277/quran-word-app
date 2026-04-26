import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Target words per page (must match paginated route)
const WORDS_PER_PAGE = 100

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const surahNumber = searchParams.get("surah") ? parseInt(searchParams.get("surah")) : null
    const verseNumber = searchParams.get("verse") ? searchParams.get("verse") : null

    if (!surahNumber || !verseNumber) {
      return NextResponse.json({
        success: false,
        error: "Both surah and verse parameters are required"
      }, { status: 400 })
    }

    // Get the verse location format (surah:verse)
    const verseLocation = `${surahNumber}:${verseNumber}`

    // Count words before this verse
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM words 
      WHERE surah_number = ${surahNumber} 
      AND CAST(SPLIT_PART(location, ':', 2) AS INTEGER) < ${parseInt(verseNumber)}
    `
    const countRows = Array.isArray(countResult) ? countResult : countResult.rows || []
    const wordsBeforeVerse = parseInt(countRows[0]?.total || 0)

    // Calculate which page this verse would start on
    // We need to account for the fact that pages may not align perfectly
    // So we'll search through pages to find the exact one
    const estimatedPage = Math.floor(wordsBeforeVerse / WORDS_PER_PAGE) + 1

    // Search around the estimated page to find the exact page containing this verse
    // Check pages from estimatedPage - 1 to estimatedPage + 2 to be safe
    for (let page = Math.max(1, estimatedPage - 1); page <= estimatedPage + 2; page++) {
      const offset = (page - 1) * WORDS_PER_PAGE
      const fetchLimit = WORDS_PER_PAGE + 50

      const wordsResult = await sql`
        SELECT verse
        FROM words 
        WHERE surah_number = ${surahNumber}
        ORDER BY 
          CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
        LIMIT ${fetchLimit}
        OFFSET ${offset}
      `
      
      const words = Array.isArray(wordsResult) ? wordsResult : wordsResult.rows || []
      
      // Check if this page contains the verse
      const pageVerses = [...new Set(words.map(w => w.verse))]
      if (pageVerses.includes(verseLocation)) {
        return NextResponse.json({
          success: true,
          data: {
            page,
            surah: surahNumber,
            verse: verseNumber
          }
        })
      }
    }

    // If not found in the search range, return estimated page
    return NextResponse.json({
      success: true,
      data: {
        page: estimatedPage,
        surah: surahNumber,
        verse: verseNumber
      }
    })

  } catch (error) {
    console.error("Error finding verse page:", error)
    return NextResponse.json(
      { success: false, error: "Failed to find verse page" },
      { status: 500 }
    )
  }
}


