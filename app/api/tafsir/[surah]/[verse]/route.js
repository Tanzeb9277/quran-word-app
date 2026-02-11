"use server"

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request, { params }) {
  try {
    const { surah, verse } = await params
    const surahNumber = parseInt(surah)
    const verseNumber = parseInt(verse)

    // Basic validation
    if (
      isNaN(surahNumber) ||
      isNaN(verseNumber) ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      verseNumber < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid surah or verse number. Surah must be 1-114 and verse must be a positive integer.",
        },
        { status: 400 },
      )
    }

    // Find tafsir that references this verse
    const verseRef = `${surahNumber}:${verseNumber}`
    const searchPattern = `%${verseRef}%`

    const results = await sql`
      SELECT
        primary_verse_ref,
        all_verse_refs,
        tafsir_html,
        tafsir_text
      FROM tafsir_ibn_kathir
      WHERE all_verse_refs LIKE ${searchPattern}
      LIMIT 1
    `

    const row = Array.isArray(results) ? results[0] : results?.rows?.[0]

    if (!row) {
      return NextResponse.json(
        {
          success: false,
          error: `No tafsir found for Surah ${surahNumber}, Verse ${verseNumber}`,
          surah_number: surahNumber,
          verse_number: verseNumber,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        surah_number: surahNumber,
        verse_number: verseNumber,
        primary_verse_ref: row.primary_verse_ref,
        all_verse_refs: row.all_verse_refs,
        tafsir_html: row.tafsir_html,
        tafsir_text: row.tafsir_text,
        tafsir_source: "Ibn Kathir",
      },
    })
  } catch (error) {
    console.error("Error fetching tafsir:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while fetching tafsir",
      },
      { status: 500 },
    )
  }
}

