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

// POST create a new topic
export async function POST(request) {
  try {
    const body = await request.json()
    const name = body?.name?.trim()
    const description = body?.description?.trim() || null

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Topic name is required"
      }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO topics (name, description)
      VALUES (${name}, ${description})
      ON CONFLICT (name) DO UPDATE
      SET description = EXCLUDED.description
      RETURNING topic_id, name, description
    `

    const topic = Array.isArray(result) ? result[0] : (result.rows && result.rows[0])

    return NextResponse.json({
      success: true,
      data: topic
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)

    // Handle duplicate topic names gracefully if conflict target differs
    const isConflict = error.code === '23505'
    return NextResponse.json({
      success: false,
      error: isConflict ? "Topic name already exists" : "Failed to create topic",
      details: error.message
    }, { status: isConflict ? 409 : 500 })
  }
}

