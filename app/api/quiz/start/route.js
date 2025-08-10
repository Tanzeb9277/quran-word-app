import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { createQuiz } from "@/lib/quiz-store"
import { DistractorGenerator } from "@/lib/distractor-generator"

async function generateWordBank(correctWord, allWords) {
  try {
    // Use the smart distractor generator
    const wordBank = await DistractorGenerator.generateWordBank(correctWord, 3, {
      difficulty: 'medium',
      includeSemantic: true,
      includeSurah: true,
      includeRandom: true
    })
    
    // Extract just the translations for backward compatibility
    return wordBank.map(word => word.translation)
  } catch (error) {
    console.error('Error generating word bank:', error)
    // Fallback to original method
    return generateOptionsFallback(correctWord.translation, allWords)
  }
}

function generateOptionsFallback(correctTranslation, allWords) {
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

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function POST(request) {
  try {
    const { surah_number, lives, user_id, word_order } = await request.json()
    
    console.log('Quiz start request:', { surah_number, lives, user_id, word_order_length: word_order?.length })

    // If word_order is provided, use it directly (frontend filtering)
    if (word_order && Array.isArray(word_order)) {
      console.log('Using frontend-provided word order')
      
      // Create new quiz with provided word order (in-memory)
      const quiz = createQuiz({
        user_id,
        surah_number,
        lives_remaining: lives,
        word_order,
        current_index: 0
      })

      console.log('Created quiz:', quiz.id)
      console.log('Quiz data:', quiz)

      // Get first question using the provided order
      const firstWordLocation = word_order[0]
      console.log('First word location:', firstWordLocation)
      
      // Get the word data for the first location
      const [currentWord] = await sql`
        SELECT * FROM words 
        WHERE surah_number = ${surah_number} AND location = ${firstWordLocation}
      `

      console.log('Current word found:', currentWord ? 'yes' : 'no')

      if (!currentWord) {
        return NextResponse.json({ success: false, error: "Word not found" }, { status: 404 })
      }

      // Get all words for this surah to generate options
      const allWords = await sql`
        SELECT * FROM words 
        WHERE surah_number = ${surah_number}
      `

      const options = await generateWordBank(currentWord, allWords)

      const response = {
        success: true,
        quiz_id: quiz.id,
        current_question: {
          image_url: currentWord.image_url,
          location: currentWord.location,
          root_arabic: currentWord.root_arabic,
          options,
          correct_answer: currentWord.translation,
        },
        lives_remaining: quiz.lives_remaining,
      }

      console.log('Returning quiz response:', response)
      return NextResponse.json(response)
    }

    console.log('Using backend filtering (fallback)')
    // Fallback to backend filtering (for backward compatibility)
    // Get all words for this surah
    const words = await sql`
      SELECT * FROM words 
      WHERE surah_number = ${surah_number} 
      ORDER BY 
        CAST(SPLIT_PART(location, ':', 2) AS INTEGER),
        CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
    `

    if (words.length === 0) {
      return NextResponse.json({ success: false, error: "No words found for this surah" }, { status: 404 })
    }

    // Filter out duplicate words
    const uniqueWords = words.filter((word, index, self) =>
      index === self.findIndex((w) => w.location === word.location)
    )

    if (uniqueWords.length === 0) {
      return NextResponse.json({ success: false, error: "No unique words found for this surah" }, { status: 404 })
    }

    // Generate randomized word order using unique words
    const wordOrder = shuffleArray(uniqueWords.map(word => word.location))

    // Create new quiz with randomized word order (in-memory)
    const quiz = createQuiz({
      user_id,
      surah_number,
      lives_remaining: lives,
      word_order: wordOrder,
      current_index: 0
    })

    // Get first question using the randomized order
    const firstWordLocation = wordOrder[0]
    const currentWord = uniqueWords.find(word => word.location === firstWordLocation)
    const options = await generateWordBank(currentWord, uniqueWords)

    return NextResponse.json({
      success: true,
      quiz_id: quiz.id,
      current_question: {
        image_url: currentWord.image_url,
        location: currentWord.location,
        root_arabic: currentWord.root_arabic,
        options,
        correct_answer: currentWord.translation,
      },
      lives_remaining: quiz.lives_remaining,
    })
  } catch (error) {
    console.error("Error starting quiz:", error)
    return NextResponse.json({ success: false, error: "Failed to start quiz" }, { status: 500 })
  }
}
