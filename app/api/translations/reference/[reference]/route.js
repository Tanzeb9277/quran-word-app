import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { reference } = await params
    const { searchParams } = new URL(request.url)
    const includeFootnotes = searchParams.get("include_footnotes") === "true"
    const source = searchParams.get("source") // Optional: filter by translation source
    
    // Parse the reference (format: "surah:verse")
    const referenceParts = reference.split(':')
    const surahNumber = parseInt(referenceParts[0])
    const verseNumber = parseInt(referenceParts[1])
    
    if (isNaN(surahNumber) || isNaN(verseNumber) || surahNumber < 1 || surahNumber > 114 || verseNumber < 1) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid reference format. Expected format: surah:verse (e.g., 2:255)" 
      }, { status: 400 })
    }

    // Build the query based on parameters
    let query
    
    if (source) {
      query = sql`
        SELECT 
          verse_reference,
          surah_number,
          verse_number,
          translation,
          translation_with_footnotes,
          has_footnotes,
          footnote_count,
          translation_source
        FROM verse_translations 
        WHERE surah_number = ${surahNumber} 
        AND verse_number = ${verseNumber}
        AND translation_source = ${source}
        ORDER BY verse_reference
      `
    } else {
      query = sql`
        SELECT 
          verse_reference,
          surah_number,
          verse_number,
          translation,
          translation_with_footnotes,
          has_footnotes,
          footnote_count,
          translation_source
        FROM verse_translations 
        WHERE surah_number = ${surahNumber} 
        AND verse_number = ${verseNumber}
        ORDER BY translation_source, verse_reference
      `
    }

    const translations = await query

    if (translations.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No translations found for reference: ${reference}`,
        reference: reference
      }, { status: 404 })
    }

    // Process the results
    const processedTranslations = translations.map(translation => ({
      verse_reference: translation.verse_reference,
      surah_number: translation.surah_number,
      verse_number: translation.verse_number,
      translation: translation.translation,
      translation_with_footnotes: translation.translation_with_footnotes,
      has_footnotes: translation.has_footnotes,
      footnote_count: translation.footnote_count,
      translation_source: translation.translation_source,
      // Return the appropriate translation based on include_footnotes parameter
      display_translation: includeFootnotes && translation.translation_with_footnotes 
        ? translation.translation_with_footnotes 
        : translation.translation
    }))

    // If only one translation, return it directly; otherwise return array
    const responseData = translations.length === 1 ? processedTranslations[0] : processedTranslations

    return NextResponse.json({
      success: true,
      data: responseData,
      count: translations.length,
      reference: reference,
      include_footnotes: includeFootnotes,
      source_filter: source || null
    })

  } catch (error) {
    console.error('Error fetching verse translation:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error while fetching translation" 
    }, { status: 500 })
  }
}
