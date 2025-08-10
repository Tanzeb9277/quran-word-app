import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { root } = await params
    const decodedRoot = decodeURIComponent(root)
    const { searchParams } = new URL(request.url)
    const surah = searchParams.get("surah")

    let query

    if (surah) {
      query = sql`
        SELECT * FROM words 
        WHERE surah_number = ${surah} 
        AND (root_arabic = ${decodedRoot} OR root_latin = ${decodedRoot})
        ORDER BY location
      `
    } else {
      query = sql`
        SELECT * FROM words 
        WHERE root_arabic = ${decodedRoot} OR root_latin = ${decodedRoot}
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
    console.error("Error fetching words by root:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch words" }, { status: 500 })
  }
}
