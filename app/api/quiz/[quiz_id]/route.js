import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getQuiz } from "@/lib/quiz-store"

function generateOptions(correctTranslation, allWords) {
  const options = [correctTranslation]
  const otherTranslations = allWords.filter((w) => w.translation !== correctTranslation).map((w) => w.translation)

  // Add 3 random incorrect options
  while (options.length < 4 && otherTranslations.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherTranslations.length)
    const option = otherTranslations.splice(randomIndex, 1)[0]
    if (!options.includes(option)) {
      options.push(option)
    }
  }

  // Shuffle options
  return options.sort(() => Math.random() - 0.5)
}

export async function GET(request, { params }) {
  try {
    const { quiz_id } = await params

    // Get quiz state from in-memory store
    const quiz = getQuiz(quiz_id)

    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    // Check if quiz is over
    const isQuizOver = quiz.current_index >= quiz.word_order.length || quiz.lives_remaining === 0

    if (isQuizOver) {
      return NextResponse.json({
        success: true,
        quiz_over: true,
        quiz_id: quiz.id,
        current_index: quiz.current_index,
        lives_remaining: quiz.lives_remaining,
        word_order: quiz.word_order,
        correct_answers: quiz.correct_answers || [],
        incorrect_answers: quiz.incorrect_answers || []
      })
    }

    // Get current word based on word_order
    const currentWordLocation = quiz.word_order[quiz.current_index]
    
    if (!currentWordLocation) {
      return NextResponse.json({ success: false, error: "Current word location not found" }, { status: 404 })
    }

    const [currentWord] = await sql`
      SELECT * FROM words 
      WHERE surah_number = ${quiz.surah_number} AND location = ${currentWordLocation}
    `

    if (!currentWord) {
      return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
    }

    // Get all words for this surah to generate options
    const allWords = await sql`
      SELECT * FROM words 
      WHERE surah_number = ${quiz.surah_number}
    `

    const options = generateOptions(currentWord.translation, allWords)

    return NextResponse.json({
      success: true,
      quiz_id: quiz.id,
      current_index: quiz.current_index,
      lives_remaining: quiz.lives_remaining,
      word_order: quiz.word_order,
      correct_answers: quiz.correct_answers || [],
      incorrect_answers: quiz.incorrect_answers || [],
      current_question: {
        image_url: currentWord.image_url,
        location: currentWord.location,
        root_arabic: currentWord.root_arabic,
        options,
        correct_answer: currentWord.translation,
      },
    })
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch quiz" }, { status: 500 })
  }
}
