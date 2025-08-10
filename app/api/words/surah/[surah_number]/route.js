import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { surah_number } = await params
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get("tag")
    const verse = searchParams.get("verse")

    let query = sql`
      SELECT * FROM words 
      WHERE surah_number = ${surah_number}
      ORDER BY 
        CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
        CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
    `

    if (tag) {
      query = sql`
        SELECT * FROM words 
        WHERE surah_number = ${surah_number} 
        AND tags @> ${JSON.stringify([{ tag }])}
        ORDER BY 
          CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
      `
    }

    if (verse) {
      query = sql`
        SELECT * FROM words 
        WHERE surah_number = ${surah_number} 
        AND verse = ${verse}
        ORDER BY 
          CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
      `
    }

    const words = await query

    return NextResponse.json({
      success: true,
      data: words,
      count: words.length,
    })
  } catch (error) {
    console.error("Error fetching words by surah:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch words" }, { status: 500 })
  }
}
