import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { surah, verse } = await params
    const surahNumber = parseInt(surah)
    const verseNumber = parseInt(verse)
    
    if (isNaN(surahNumber) || isNaN(verseNumber) || surahNumber < 1 || surahNumber > 114 || verseNumber < 1) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid surah or verse number. Surah must be 1-114, verse must be positive integer." 
      }, { status: 400 })
    }

    // Query tafsir_ibn_kathir table using LIKE on all_verse_refs
    // Format: surah:verse (e.g., "2:255")
    const verseRef = `${surahNumber}:${verseNumber}`
    const searchPattern = `%${verseRef}%`
    const tafsirResult = await sql`
      SELECT 
        surah,
        ayah,
        primary_verse_ref,
        all_verse_refs,
        tafsir_text,
        tafsir_html
      FROM tafsir_ibn_kathir
      WHERE all_verse_refs LIKE ${searchPattern}
      LIMIT 1
    `

    const tafsir = Array.isArray(tafsirResult) ? tafsirResult[0] : (tafsirResult.rows && tafsirResult.rows[0])

    if (!tafsir) {
      return NextResponse.json({ 
        success: false, 
        error: `No tafsir found for Surah ${surahNumber}, Verse ${verseNumber}`,
        surah_number: surahNumber,
        verse_number: verseNumber
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        surah: tafsir.surah,
        ayah: tafsir.ayah,
        primary_verse_ref: tafsir.primary_verse_ref,
        all_verse_refs: tafsir.all_verse_refs,
        tafsir_text: tafsir.tafsir_text,
        tafsir_html: tafsir.tafsir_html
      },
      surah_number: surahNumber,
      verse_number: verseNumber
    })

  } catch (error) {
    console.error('Error fetching tafsir:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error while fetching tafsir" 
    }, { status: 500 })
  }
}


