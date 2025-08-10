import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await sql`
      SELECT surah_number, COUNT(*) AS word_count
      FROM words
      GROUP BY surah_number
      ORDER BY surah_number
    `

    // Handle Vercel Postgres client structure
    const rows = Array.isArray(result) ? result : result.rows || []

    const surahs = rows.map((row) => ({
      number: Number(row.surah_number),
      name: null,
      wordCount: Number(row.word_count),
    }))

    return NextResponse.json({ success: true, data: surahs, count: surahs.length })
  } catch (error) {
    console.error("Error fetching surahs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch surahs" }, { status: 500 })
  }
}


