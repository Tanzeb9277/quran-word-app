import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// DELETE a specific tafsir topic assignment
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const assignmentId = parseInt(id)

    if (isNaN(assignmentId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid assignment ID"
      }, { status: 400 })
    }

    // First, check if the assignment exists
    const checkResult = await sql`
      SELECT id, verse_range, topic_id
      FROM tafsir_topics
      WHERE id = ${assignmentId}
    `

    const assignment = Array.isArray(checkResult) ? checkResult[0] : (checkResult.rows && checkResult.rows[0])

    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: "Assignment not found"
      }, { status: 404 })
    }

    // Delete the assignment
    await sql`
      DELETE FROM tafsir_topics
      WHERE id = ${assignmentId}
    `

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
      data: {
        id: assignmentId,
        verse_range: assignment.verse_range,
        topic_id: assignment.topic_id
      }
    })
  } catch (error) {
    console.error('Error deleting tafsir topic assignment:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete assignment",
      details: error.message
    }, { status: 500 })
  }
}

