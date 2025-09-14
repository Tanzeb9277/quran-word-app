import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { surah_number } = await params
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get("tag")

    let query = sql`
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
      WHERE surah_number = ${surah_number}
      ORDER BY 
        CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
        CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
    `

    if (tag) {
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
        WHERE surah_number = ${surah_number} 
        AND tags @> ${JSON.stringify([{ tag }])}
        ORDER BY 
          CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
      `
    }

    const words = await query

    // Group words by verse
    const versesMap = new Map()
    
    words.forEach(word => {
      const verseNumber = word.verse
      if (!versesMap.has(verseNumber)) {
        versesMap.set(verseNumber, {
          surah_number: word.surah_number,
          verse: verseNumber,
          words: [],
          translation: '' // We'll need to get this from a separate source
        })
      }
      
      versesMap.get(verseNumber).words.push({
        id: word.id,
        surah_number: word.surah_number,
        verse: word.verse,
        location: word.location,
        transliteration: word.transliteration,
        translation: word.translation,
        grammar: word.grammar,
        image_url: word.image_url,
        root_latin: word.root_latin,
        root_arabic: word.root_arabic,
        arabic_text: word.arabic_text,
        tags: word.tags,
        root: word.root
      })
    })

    // Convert map to array and sort by verse number
    const verses = Array.from(versesMap.values()).sort((a, b) => a.verse - b.verse)

    // Add verse translations (combine word translations for now)
    verses.forEach(verse => {
      if (verse.words && verse.words.length > 0) {
        // Create a simple translation by combining word translations
        verse.translation = verse.words
          .map(word => word.translation)
          .filter(translation => translation && translation.trim())
          .join(' ')
      }
    })

    return NextResponse.json({
      success: true,
      data: verses,
      count: verses.length,
      surah_number: parseInt(surah_number)
    })
  } catch (error) {
    console.error("Error fetching words by surah:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch words" }, { status: 500 })
  }
}
