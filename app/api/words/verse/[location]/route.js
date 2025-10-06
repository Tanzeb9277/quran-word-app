import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { location } = await params
    
    const decodedLocation = decodeURIComponent(location)
    
    // Parse location (format: "surah:verse" or "surah:verse:word_position")
    const locationParts = decodedLocation.split(':')
    const surahNumber = locationParts[0]
    const verseNumber = locationParts[1]
    console.log(surahNumber, verseNumber)
    
    if (!surahNumber || !verseNumber) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid location format. Expected format: surah:verse (e.g., 19:86)" 
      }, { status: 400 })
    }

    // Query all words for the specific verse
    const words = await sql`
        SELECT *
        FROM words
        WHERE verse = ${decodedLocation}
        ORDER BY CAST(SPLIT_PART(location, ':', 3) AS INTEGER);
    `

    if (words.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No words found for the specified verse",
        location: decodedLocation
      }, { status: 404 })
    }

    // Get surah information
    const surahInfo = await sql`
      SELECT DISTINCT 
        surah_number,
        COUNT(DISTINCT verse) as total_verses,
        COUNT(*) as total_words
      FROM words 
      WHERE surah_number = ${parseInt(surahNumber)}
      GROUP BY surah_number
    `

    // Create a combined verse translation
    const verseTranslation = words.map(word => word.translation).join(' ')

    // Group words by their position in the verse for better organization
    const wordsByPosition = words.map((word, index) => ({
      ...word,
      position_in_verse: index + 1,
      is_first_word: index === 0,
      is_last_word: index === words.length - 1
    }))

    return NextResponse.json({
      success: true,
      data: {
        location: decodedLocation,
        surah_number: parseInt(surahNumber),
        verse_number: parseInt(verseNumber),
        words: wordsByPosition,
        verse_translation: verseTranslation,
        word_count: words.length,
        surah_info: surahInfo[0] || null
      },
      count: words.length,
      message: `Words for verse ${decodedLocation}`
    })
  } catch (error) {
    console.error("Error fetching verse words:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch verse words",
      details: error.message 
    }, { status: 500 })
  }
}
