import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Target words per page (100 or less if verse ends)
const WORDS_PER_PAGE = 100

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page")) || 1
    const surahNumber = searchParams.get("surah") ? parseInt(searchParams.get("surah")) : null
    const startVerseParam = searchParams.get("start_verse") ? searchParams.get("start_verse") : null

    // Calculate offset for pagination
    const offset = (page - 1) * WORDS_PER_PAGE

    // Get all words ordered by surah, verse, and word position
    // We need to fetch more than WORDS_PER_PAGE to find a good verse boundary
    const fetchLimit = WORDS_PER_PAGE + 50 // Fetch extra to find verse boundary
    
    let query
    if (surahNumber && startVerseParam) {
      query = sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          arabic_text,
          tags,
          CASE 
            WHEN root_latin IS NOT NULL AND root_arabic IS NOT NULL 
            THEN json_build_object('root_latin', root_latin, 'root_arabic', root_arabic)
            ELSE NULL
          END as root
        FROM words 
        WHERE surah_number = ${surahNumber} AND verse >= ${startVerseParam}
        ORDER BY 
          CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
        LIMIT ${fetchLimit}
        OFFSET ${offset}
      `
    } else if (surahNumber) {
      query = sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          arabic_text,
          tags,
          CASE 
            WHEN root_latin IS NOT NULL AND root_arabic IS NOT NULL 
            THEN json_build_object('root_latin', root_latin, 'root_arabic', root_arabic)
            ELSE NULL
          END as root
        FROM words 
        WHERE surah_number = ${surahNumber}
        ORDER BY 
          CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
        LIMIT ${fetchLimit}
        OFFSET ${offset}
      `
    } else {
      // Get total count for pagination calculation
      const totalResult = await sql`SELECT COUNT(*) as total FROM words`
      const totalRows = Array.isArray(totalResult) ? totalResult : totalResult.rows || []
      const totalWords = parseInt(totalRows[0]?.total || 0)
      
      query = sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          arabic_text,
          tags,
          CASE 
            WHEN root_latin IS NOT NULL AND root_arabic IS NOT NULL 
            THEN json_build_object('root_latin', root_latin, 'root_arabic', root_arabic)
            ELSE NULL
          END as root
        FROM words 
        ORDER BY 
          surah_number,
          CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
        LIMIT ${fetchLimit}
        OFFSET ${offset}
      `
    }

    const result = await query
    const words = Array.isArray(result) ? result : result.rows || []

    if (words.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          words: [],
          page,
          totalPages: 0,
          totalWords: 0,
          wordsInPage: 0,
          startVerse: null,
          endVerse: null,
          surahNumber
        }
      })
    }

    // Find the best cut-off point (end at verse boundary, max WORDS_PER_PAGE words)
    let pageWords = []
    let currentVerse = null
    let wordCount = 0
    
    for (const word of words) {
      // If we've reached the target word count and we're at a new verse, stop
      if (wordCount >= WORDS_PER_PAGE && word.verse !== currentVerse && currentVerse !== null) {
        break
      }
      
      pageWords.push({
        ...word,
        tags: word.tags ? (typeof word.tags === 'string' ? JSON.parse(word.tags) : word.tags) : []
      })
      
      currentVerse = word.verse
      wordCount++
      
      // If we've exceeded target but haven't hit a verse boundary, stop at next verse
      if (wordCount > WORDS_PER_PAGE && word.verse !== currentVerse) {
        break
      }
    }

    // Get total count for pagination
    let totalWords
    if (surahNumber) {
      const countResult = await sql`
        SELECT COUNT(*) as total FROM words WHERE surah_number = ${surahNumber}
      `
      const countRows = Array.isArray(countResult) ? countResult : countResult.rows || []
      totalWords = parseInt(countRows[0]?.total || 0)
    } else {
      const countResult = await sql`SELECT COUNT(*) as total FROM words`
      const countRows = Array.isArray(countResult) ? countResult : countResult.rows || []
      totalWords = parseInt(countRows[0]?.total || 0)
    }

    const totalPages = Math.ceil(totalWords / WORDS_PER_PAGE)
    
    // Determine start and end verses for this page
    const startVerse = pageWords.length > 0 ? pageWords[0].verse : null
    const endVerse = pageWords.length > 0 ? pageWords[pageWords.length - 1].verse : null

    // Get unique verses in this page
    const uniqueVerses = [...new Set(pageWords.map(w => w.verse))]

    return NextResponse.json({
      success: true,
      data: {
        words: pageWords,
        page,
        totalPages,
        totalWords,
        wordsInPage: pageWords.length,
        startVerse,
        endVerse,
        verses: uniqueVerses,
        surahNumber: surahNumber || pageWords[0]?.surah_number || null,
        hasNextPage: offset + pageWords.length < totalWords,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error("Error fetching paginated words:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch paginated words" },
      { status: 500 }
    )
  }
}

