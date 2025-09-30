import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { DistractorGenerator } from "@/lib/distractor-generator"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const surah = searchParams.get('surah')
    const verse = searchParams.get('verse')
    const strategy = searchParams.get('strategy') || 'smart'
    const wordsPerVerse = parseInt(searchParams.get('wordsPerVerse')) || 3

    // Get a random verse if no specific surah/verse provided
    let targetVerse
    if (surah && verse) {
      targetVerse = { surah_number: parseInt(surah), verse: parseInt(verse) }
    } else {
      [targetVerse] = await sql`
        SELECT surah_number, verse 
        FROM (
          SELECT DISTINCT surah_number, verse 
          FROM words
        ) AS unique_verses
        ORDER BY RANDOM() 
        LIMIT 1
      `
    }

    if (!targetVerse) {
      return NextResponse.json({ 
        success: false, 
        error: "No verse found" 
      }, { status: 404 })
    }

    // Get all words for this verse, ordered by position
    const verseWords = await sql`
      SELECT * FROM words 
      WHERE surah_number = ${targetVerse.surah_number} 
      AND verse = ${targetVerse.verse}
      ORDER BY 
        CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
    `

    if (verseWords.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No words found for this verse" 
      }, { status: 404 })
    }

    // Select a subset of words based on wordsPerVerse
    const selectedWords = verseWords.slice(0, Math.min(wordsPerVerse, verseWords.length))
    
          // Generate distractors for each selected word
      const wordResults = []
      
      for (const word of selectedWords) {
        let distractors = []
        let strategyUsed = strategy

        switch (strategy) {
          case 'semantic':
            distractors = await DistractorGenerator.getSemanticDistractors(word, 1)
            break
          case 'surah':
            distractors = await DistractorGenerator.getSurahDistractors(word, 1)
            break
          case 'phonetic':
            distractors = await DistractorGenerator.getPhoneticDistractors(word, 1)
            break
          case 'random':
            distractors = await DistractorGenerator.getRandomDistractors(word, 1)
            break
          case 'mixed':
            distractors = await DistractorGenerator.getMixedDistractors(word, 1)
            break
          case 'easy':
            distractors = await DistractorGenerator.getEasyDistractors(word, 1)
            break
          case 'length':
            distractors = await DistractorGenerator.getLengthBasedDistractors(word, 1)
            break
          case 'different-surah':
            distractors = await DistractorGenerator.getDifferentSurahDistractors(word, 1)
            break
          case 'simple':
            distractors = await DistractorGenerator.getSimpleDistractors(word, 1)
            break
          case 'smart':
          default:
            distractors = await DistractorGenerator.getSmartDistractors(word, 1, {
              difficulty: 'medium',
              includeSemantic: true,
              includeSurah: true,
              includeRandom: true
            })
            break
        }

        // Create word bank using the same distractors we just generated
        const wordBank = [
          { ...word, isCorrect: true },
          ...distractors.map(d => ({ ...d, isCorrect: false }))
        ]

        // Shuffle the word bank
        const shuffledWordBank = DistractorGenerator.shuffleArray(wordBank)

        wordResults.push({
          word,
          distractors,
          wordBank: shuffledWordBank,
          strategy: strategyUsed
        })
      }

    return NextResponse.json({
      success: true,
      data: {
        verse: targetVerse,
        totalWords: verseWords.length,
        selectedWords: selectedWords.length,
        wordResults,
        strategy: strategy
      }
    })

  } catch (error) {
    console.error("Error generating distractors:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to generate distractors" 
    }, { status: 500 })
  }
} 