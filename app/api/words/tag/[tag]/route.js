import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { tag } = await params
    const { searchParams } = new URL(request.url)
    const surah = searchParams.get("surah")

    let query

    const tagPattern = `%${tag}%`
    
    if (surah) {
      query = sql`
        SELECT * FROM words 
        WHERE surah_number = ${surah} 
        AND tags::text LIKE ${tagPattern}
        ORDER BY location
      `
    } else {
      query = sql`
        SELECT * FROM words 
        WHERE tags::text LIKE ${tagPattern}
        ORDER BY surah_number, location
      `
    }

    const words = await query

    return NextResponse.json({
      success: true,
      data: words,
      count: words.length,
    })
  } catch (error) {
    console.error("Error fetching words by tag:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch words" }, { status: 500 })
  }
}
