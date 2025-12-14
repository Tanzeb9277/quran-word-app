import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// GET all topics
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        topic_id,
        name,
        description
      FROM topics
      ORDER BY name
    `

    const topics = Array.isArray(result) ? result : result.rows || []

    return NextResponse.json({
      success: true,
      data: topics
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch topics",
      details: error.message
    }, { status: 500 })
  }
}

