import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// GET all tafsir topic assignments with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get("topic_id")
    const verseRange = searchParams.get("verse_range")
    const tafsirSource = searchParams.get("tafsir_source") || "Ibn Kathir"

    let query
    if (topicId && verseRange) {
      query = sql`
        SELECT 
          tt.id,
          tt.tafsir_source,
          tt.verse_range,
          tt.topic_id,
          tt.assigned_by,
          tt.created_at,
          t.name as topic_name,
          t.description as topic_description
        FROM tafsir_topics tt
        JOIN topics t ON tt.topic_id = t.topic_id
        WHERE tt.tafsir_source = ${tafsirSource}
        AND tt.topic_id = ${parseInt(topicId)}
        AND tt.verse_range = ${verseRange}
        ORDER BY tt.verse_range, t.name
      `
    } else if (topicId) {
      query = sql`
        SELECT 
          tt.id,
          tt.tafsir_source,
          tt.verse_range,
          tt.topic_id,
          tt.assigned_by,
          tt.created_at,
          t.name as topic_name,
          t.description as topic_description
        FROM tafsir_topics tt
        JOIN topics t ON tt.topic_id = t.topic_id
        WHERE tt.tafsir_source = ${tafsirSource}
        AND tt.topic_id = ${parseInt(topicId)}
        ORDER BY tt.verse_range, t.name
      `
    } else if (verseRange) {
      query = sql`
        SELECT 
          tt.id,
          tt.tafsir_source,
          tt.verse_range,
          tt.topic_id,
          tt.assigned_by,
          tt.created_at,
          t.name as topic_name,
          t.description as topic_description
        FROM tafsir_topics tt
        JOIN topics t ON tt.topic_id = t.topic_id
        WHERE tt.tafsir_source = ${tafsirSource}
        AND tt.verse_range = ${verseRange}
        ORDER BY tt.verse_range, t.name
      `
    } else {
      query = sql`
        SELECT 
          tt.id,
          tt.tafsir_source,
          tt.verse_range,
          tt.topic_id,
          tt.assigned_by,
          tt.created_at,
          t.name as topic_name,
          t.description as topic_description
        FROM tafsir_topics tt
        JOIN topics t ON tt.topic_id = t.topic_id
        WHERE tt.tafsir_source = ${tafsirSource}
        ORDER BY tt.verse_range, t.name
      `
    }

    const result = await query
    const assignments = Array.isArray(result) ? result : result.rows || []

    return NextResponse.json({
      success: true,
      data: assignments,
      count: assignments.length
    })
  } catch (error) {
    console.error('Error fetching tafsir topic assignments:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch tafsir topic assignments",
      details: error.message
    }, { status: 500 })
  }
}

