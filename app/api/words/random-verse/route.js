import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { enhanceTagsWithDescriptions } from "@/lib/tag-enhancer"

export async function GET(request) {
  return await handleRandomVerseRequest({})
}

export async function POST(request) {
  try {
    const body = await request.json()
    return await handleRandomVerseRequest(body)
  } catch (error) {
    console.error("Error parsing request body:", error)
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
  }
}

async function handleRandomVerseRequest({ verseLength = 'all' }) {
  try {
    // Build the WHERE clause based on verse length filter
    let whereClause = ''
    let params = []
    
    if (verseLength !== 'all') {
      // Get verses with the specified word count range
      const wordCountConditions = {
        short: 'word_count <= 7',
        medium: 'word_count BETWEEN 8 AND 15',
        long: 'word_count > 15'
      }
      
      if (wordCountConditions[verseLength]) {
        whereClause = `WHERE ${wordCountConditions[verseLength]}`
      }
    }
    
    // Get a random verse from the database using a subquery approach
    const [randomVerse] = await sql`
      SELECT surah_number, verse 
      FROM (
        SELECT DISTINCT surah_number, verse, COUNT(*) as word_count
        FROM words
        GROUP BY surah_number, verse
      ) AS unique_verses
      ${sql.unsafe(whereClause)}
      ORDER BY RANDOM() 
      LIMIT 1
    `

    if (!randomVerse) {
      return NextResponse.json({ 
        success: false, 
        error: `No verses found for length filter: ${verseLength}` 
      }, { status: 404 })
    }

    // Get all words for this specific verse, ordered by their position
    const words = await sql`
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
      WHERE surah_number = ${randomVerse.surah_number} 
      AND verse = ${randomVerse.verse}
      ORDER BY 
        CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
    `

    // Parse tags from JSON string to objects
    const processedWords = words.map(word => ({
      ...word,
      tags: word.tags ? JSON.parse(word.tags) : []
    }))

    // Enhance tags with descriptions from the database
    const enhancedWords = await enhanceTagsWithDescriptions(processedWords)

    console.log('API: First word grammar:', enhancedWords[0]?.grammar)
    console.log('API: First word has grammar:', !!enhancedWords[0]?.grammar)
    console.log('API: First word tags:', enhancedWords[0]?.tags)
    
    return NextResponse.json({
      success: true,
      data: {
        surah_number: randomVerse.surah_number,
        verse: randomVerse.verse,
        words: enhancedWords
      },
      count: enhancedWords.length,
      filter: verseLength
    })
  } catch (error) {
    console.error("Error fetching random verse:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch random verse" }, { status: 500 })
  }
} 