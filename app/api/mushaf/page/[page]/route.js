import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request, { params }) {
  try {
    const { page } = await params
    const pageNumber = parseInt(page)

    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      return NextResponse.json({
        success: false,
        error: "Invalid page number. Must be between 1 and 604"
      }, { status: 400 })
    }

    // Read the mushaf page JSON file to get word IDs
    const pageJsonPath = path.join(process.cwd(), "Mushaf_pages_json_fixed", `page_${pageNumber}.json`)
    
    if (!fs.existsSync(pageJsonPath)) {
      return NextResponse.json({
        success: false,
        error: `Page ${pageNumber} JSON file not found`
      }, { status: 404 })
    }

    const pageData = JSON.parse(fs.readFileSync(pageJsonPath, "utf8"))

    // Extract all word IDs from all lines
    const allWordIds = []
    const linesWithWordIds = []

    pageData.lines.forEach(line => {
      if (line.line_type === "ayah" && line.first_word_id && line.last_word_id) {
        const lineWordIds = []
        for (let id = line.first_word_id; id <= line.last_word_id; id++) {
          lineWordIds.push(id)
          allWordIds.push(id)
        }
        linesWithWordIds.push({
          ...line,
          word_ids: lineWordIds
        })
      } else {
        linesWithWordIds.push({
          ...line,
          word_ids: []
        })
      }
    })

    if (allWordIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No word IDs found for page ${pageNumber}`
      }, { status: 404 })
    }

    // Fetch all words from database
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
        tags
      FROM words
      WHERE id = ANY(${allWordIds})
      ORDER BY id
    `

    // Create a map for quick lookup
    const wordsMap = new Map(words.map(w => [w.id, w]))

    // Get last word of each verse for marking
    const uniqueVerses = [...new Set(words.map(w => w.verse))]
    const lastWordIdsByVerse = await sql`
      WITH verse_last_positions AS (
        SELECT 
          verse,
          MAX(CAST(SPLIT_PART(location, ':', 3) AS INTEGER)) as last_position
        FROM words
        WHERE verse = ANY(${uniqueVerses})
        GROUP BY verse
      )
      SELECT 
        w.id,
        w.verse
      FROM words w
      INNER JOIN verse_last_positions vlp 
        ON w.verse = vlp.verse 
        AND CAST(SPLIT_PART(w.location, ':', 3) AS INTEGER) = vlp.last_position
      WHERE w.verse = ANY(${uniqueVerses})
      ORDER BY w.id
    `

    const lastWordIdsSet = new Set(lastWordIdsByVerse.map(w => w.id))

    // Build lines with words
    const lines = linesWithWordIds.map(line => {
      const lineWords = line.word_ids
        .map(wordId => {
          const word = wordsMap.get(wordId)
          if (!word) return null
          
          return {
            id: word.id,
            verse: word.verse,
            location: word.location,
            transliteration: word.transliteration || "",
            translation: word.translation || "",
            arabic_text: word.arabic_text || "",
            is_last_word_of_verse: lastWordIdsSet.has(word.id)
          }
        })
        .filter(w => w !== null)

      // Get unique verses in this line
      const versesInLine = [...new Set(lineWords.map(w => w.verse))]

      return {
        line_number: line.line_number,
        line_type: line.line_type,
        verses_in_line: versesInLine,
        words: lineWords
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        page_number: pageNumber,
        info: pageData.info || {
          name: "Quran Complex V1 ( 1405 print )",
          number_of_pages: 604,
          lines_per_page: 15,
          font_name: "v1"
        },
        total_lines: lines.length,
        lines: lines
      }
    })

  } catch (error) {
    console.error("Error fetching mushaf page:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch mushaf page", details: error.message },
      { status: 500 }
    )
  }
}
