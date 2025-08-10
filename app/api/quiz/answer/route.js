import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getQuiz, updateQuiz, addAnswer } from "@/lib/quiz-store"

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

export async function POST(request) {
  try {
    const { quiz_id, word_location, is_correct } = await request.json()

    // Get quiz state from in-memory store
    const quiz = getQuiz(quiz_id)

    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    // Track the answer
    addAnswer(quiz_id, word_location, is_correct)

    // Update lives if answer was incorrect
    let newLives = quiz.lives_remaining
    if (!is_correct) {
      newLives = Math.max(0, quiz.lives_remaining - 1)
    }

    // Check if this was the last question
    const newIndex = quiz.current_index + 1
    const isLastQuestion = newIndex >= quiz.word_order.length

    // Check if quiz is over
    const quizOver = isLastQuestion || newLives === 0
    
    console.log(`Quiz progress: ${newIndex}/${quiz.word_order.length}, lives: ${newLives}, quiz over: ${quizOver}, isLastQuestion: ${isLastQuestion}`)

    if (quizOver) {
      // Update quiz state to mark as completed
      updateQuiz(quiz_id, {
        current_index: newIndex,
        lives_remaining: newLives
      })

      return NextResponse.json({
        success: true,
        quiz_over: true,
        lives_remaining: newLives,
        final_score: quiz.correct_answers.length,
      })
    }

    // Get next word
    const nextWordLocation = quiz.word_order[newIndex]
    const [nextWord] = await sql`
      SELECT * FROM words 
      WHERE surah_number = ${quiz.surah_number} AND location = ${nextWordLocation}
    `

    if (!nextWord) {
      return NextResponse.json({ success: false, error: "Next word not found" }, { status: 404 })
    }

    // Get all words for this surah to generate options
    const allWords = await sql`
      SELECT * FROM words 
      WHERE surah_number = ${quiz.surah_number}
    `

    const options = generateOptions(nextWord.translation, allWords)

    // Update quiz state
    updateQuiz(quiz_id, {
      current_index: newIndex,
      lives_remaining: newLives
    })

    return NextResponse.json({
      success: true,
      correct: is_correct,
      lives_remaining: newLives,
      quiz_over: false,
      next_question: {
        image_url: nextWord.image_url,
        location: nextWord.location,
        root_arabic: nextWord.root_arabic,
        options,
        correct_answer: nextWord.translation,
      },
    })
  } catch (error) {
    console.error("Error processing answer:", error)
    return NextResponse.json({ success: false, error: "Failed to process answer" }, { status: 500 })
  }
}
