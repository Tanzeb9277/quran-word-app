import { NextResponse } from "next/server"
import { getAllQuizzes } from "@/lib/quiz-store"

export async function GET() {
  try {
    const quizzes = getAllQuizzes()
    
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      surah_number: quiz.surah_number,
      current_index: quiz.current_index,
      lives_remaining: quiz.lives_remaining,
      total_questions: quiz.word_order?.length || 0,
      created_at: quiz.created_at,
      updated_at: quiz.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: formattedQuizzes,
      count: formattedQuizzes.length,
    })
  } catch (error) {
    console.error("Error fetching active quizzes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch active quizzes" }, { status: 500 })
  }
} 