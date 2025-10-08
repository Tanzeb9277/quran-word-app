import { NextResponse } from 'next/server'
import { DistractorGenerator } from '@/lib/distractor-generator'

export async function POST(request) {
  try {
    const { correctWord, distractorCount = 3, options = {} } = await request.json()

    // console.log('🚀 Word Bank API called with:', {
    //   correctWord: correctWord?.translation,
    //   location: correctWord?.location,
    //   distractorCount,
    //   options
    // })

    if (!correctWord) {
      // console.log('❌ No correct word provided')
      return NextResponse.json(
        { success: false, error: 'Correct word is required' },
        { status: 400 }
      )
    }

    const wordBank = await DistractorGenerator.generateWordBank(
      correctWord,
      distractorCount,
      {
        difficulty: 'medium',
        includeSemantic: true,
        includeSurah: true,
        includeRandom: true,
        ...options
      }
    )

    // console.log('📊 Word Bank API result:', {
    //   success: true,
    //   wordBankLength: wordBank?.length,
    //   wordBank: wordBank?.map(wb => ({
    //     translation: wb.translation,
    //     location: wb.location,
    //     isCorrect: wb.isCorrect
    //   }))
    // })

    return NextResponse.json({
      success: true,
      data: wordBank
    })

  } catch (error) {
    console.error('🚨 Error generating word bank:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate word bank' },
      { status: 500 }
    )
  }
} 