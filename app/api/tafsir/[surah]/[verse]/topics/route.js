import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// GET assigned topics for a specific tafsir
export async function GET(request, { params }) {
  try {
    const { surah, verse } = await params
    const surahNumber = parseInt(surah)
    const verseNumber = parseInt(verse)

    if (isNaN(surahNumber) || isNaN(verseNumber)) {
      return NextResponse.json({
        success: false,
        error: "Invalid surah or verse number"
      }, { status: 400 })
    }

    // First, fetch the tafsir to get the actual verse_range
    const verseRef = `${surahNumber}:${verseNumber}`
    const searchPattern = `%${verseRef}%`
    const tafsirResult = await sql`
      SELECT 
        primary_verse_ref,
        all_verse_refs
      FROM tafsir_ibn_kathir
      WHERE all_verse_refs LIKE ${searchPattern}
      LIMIT 1
    `

    const tafsir = Array.isArray(tafsirResult) ? tafsirResult[0] : (tafsirResult.rows && tafsirResult.rows[0])

    if (!tafsir) {
      return NextResponse.json({
        success: false,
        error: `No tafsir found for Surah ${surahNumber}, Verse ${verseNumber}`
      }, { status: 404 })
    }

    // Use all_verse_refs as the verse_range (it contains all verses covered by this tafsir)
    const verseRange = tafsir.all_verse_refs || tafsir.primary_verse_ref || verseRef
    const tafsirSource = "Ibn Kathir" // Default source

    const result = await sql`
      SELECT 
        tt.id,
        tt.topic_id,
        tt.verse_range,
        tt.assigned_by,
        tt.created_at,
        t.name as topic_name,
        t.description as topic_description
      FROM tafsir_topics tt
      JOIN topics t ON tt.topic_id = t.topic_id
      WHERE tt.tafsir_source = ${tafsirSource}
      AND tt.verse_range = ${verseRange}
      ORDER BY t.name
    `

    const assignedTopics = Array.isArray(result) ? result : result.rows || []

    return NextResponse.json({
      success: true,
      data: assignedTopics
    })
  } catch (error) {
    console.error('Error fetching assigned topics:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch assigned topics",
      details: error.message
    }, { status: 500 })
  }
}

// POST to assign topics to a tafsir
export async function POST(request, { params }) {
  try {
    const { surah, verse } = await params
    const surahNumber = parseInt(surah)
    const verseNumber = parseInt(verse)

    if (isNaN(surahNumber) || isNaN(verseNumber)) {
      return NextResponse.json({
        success: false,
        error: "Invalid surah or verse number"
      }, { status: 400 })
    }

    const body = await request.json()
    const { topic_ids, assigned_by, verse_range } = body

    if (!topic_ids || !Array.isArray(topic_ids)) {
      return NextResponse.json({
        success: false,
        error: "topic_ids must be an array"
      }, { status: 400 })
    }

    // Use verse_range from request body if provided, otherwise fetch from tafsir
    let verseRange = verse_range
    if (!verseRange) {
      // Fetch the tafsir to get the actual verse_range
      const verseRef = `${surahNumber}:${verseNumber}`
      const searchPattern = `%${verseRef}%`
      const tafsirResult = await sql`
        SELECT 
          primary_verse_ref,
          all_verse_refs
        FROM tafsir_ibn_kathir
        WHERE all_verse_refs LIKE ${searchPattern}
        LIMIT 1
      `

      const tafsir = Array.isArray(tafsirResult) ? tafsirResult[0] : (tafsirResult.rows && tafsirResult.rows[0])

      if (!tafsir) {
        return NextResponse.json({
          success: false,
          error: `No tafsir found for Surah ${surahNumber}, Verse ${verseNumber}`
        }, { status: 404 })
      }

      // Use all_verse_refs as the verse_range (it contains all verses covered by this tafsir)
      verseRange = tafsir.all_verse_refs || tafsir.primary_verse_ref || verseRef
    }

    const tafsirSource = "Ibn Kathir" // Default source

    // Delete existing assignments for this verse range (to replace them)
    await sql`
      DELETE FROM tafsir_topics
      WHERE tafsir_source = ${tafsirSource}
      AND verse_range = ${verseRange}
    `

    // Only insert if there are topics to assign
    if (topic_ids.length > 0) {
      // Insert new topic assignments
      const insertPromises = topic_ids.map(topic_id => 
        sql`
          INSERT INTO tafsir_topics (tafsir_source, verse_range, topic_id, assigned_by)
          VALUES (${tafsirSource}, ${verseRange}, ${topic_id}, ${assigned_by || null})
          ON CONFLICT (tafsir_source, verse_range, topic_id) DO NOTHING
        `
      )

      await Promise.all(insertPromises)
    }

    // Fetch the newly assigned topics to return
    const result = await sql`
      SELECT 
        tt.id,
        tt.topic_id,
        tt.verse_range,
        tt.assigned_by,
        tt.created_at,
        t.name as topic_name,
        t.description as topic_description
      FROM tafsir_topics tt
      JOIN topics t ON tt.topic_id = t.topic_id
      WHERE tt.tafsir_source = ${tafsirSource}
      AND tt.verse_range = ${verseRange}
      ORDER BY t.name
    `

    const assignedTopics = Array.isArray(result) ? result : result.rows || []

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignedTopics.length} topic(s)`,
      data: assignedTopics
    })
  } catch (error) {
    console.error('Error assigning topics:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to assign topics",
      details: error.message
    }, { status: 500 })
  }
}

