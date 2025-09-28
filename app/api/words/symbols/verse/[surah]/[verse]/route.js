import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { surah, verse } = await params
    
    const surahNumber = parseInt(surah)
    const verseNumber = parseInt(verse)
    
    if (!surahNumber || !verseNumber) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid surah or verse number" 
      }, { status: 400 })
    }

    // Your query to get verse data with symbol data
    const verseString = `${surahNumber}:${verseNumber}`
    const verseData = await sql`
      SELECT 
        w.location,
        w.arabic_text,
        w.translation,
        s.symbol
      FROM words w
      LEFT JOIN quranic_symbol_locations s 
        ON w.location = s.preceding_word_location
      WHERE w.surah_number = ${surahNumber} AND w.verse = ${verseString}
      ORDER BY w.id
    `

    if (verseData.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No words found for the specified verse",
        surah: surahNumber,
        verse: verseNumber
      }, { status: 404 })
    }

    // Get surah information
    const surahInfo = await sql`
      SELECT DISTINCT 
        surah_number,
        COUNT(DISTINCT verse) as total_verses,
        COUNT(*) as total_words
      FROM words 
      WHERE surah_number = ${surahNumber}
      GROUP BY surah_number
    `

    // Create a combined verse translation
    const verseTranslation = verseData.map(word => word.translation).join(' ')

    // Group words by their position in the verse for better organization
    const wordsWithSymbols = verseData.map((word, index) => ({
      ...word,
      position_in_verse: index + 1,
      is_first_word: index === 0,
      is_last_word: index === verseData.length - 1,
      has_symbol: !!word.symbol
    }))

    // Count symbols in this verse
    const symbolCount = verseData.filter(word => word.symbol).length

    return NextResponse.json({
      success: true,
      data: {
        surah_number: surahNumber,
        verse_number: verseNumber,
        location: `${surahNumber}:${verseNumber}`,
        words: wordsWithSymbols,
        verse_translation: verseTranslation,
        word_count: verseData.length,
        symbol_count: symbolCount,
        surah_info: surahInfo[0] || null
      },
      count: verseData.length,
      message: `Verse ${surahNumber}:${verseNumber} with symbol data`
    })
  } catch (error) {
    console.error("Error fetching verse with symbols:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch verse with symbol data",
      details: error.message 
    }, { status: 500 })
  }
}
