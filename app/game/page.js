"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Brain, Search, Target } from "lucide-react"
import VerseViewer from "@/components/VerseViewer"
import WordBankKeyboard from "@/components/WordBankKeyboard"

export default function GamePage() {
  const [verseData, setVerseData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [wordBank, setWordBank] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [verseLengthFilter, setVerseLengthFilter] = useState('all')
  const [submissionResults, setSubmissionResults] = useState(null)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)

  const cleanWord = (word) => {
    return word
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const generateDistractor = async (correctWord, avoidTranslations = []) => {
    try {
      const response = await fetch('/api/words/word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctWord,
          distractorCount: 1,
          options: {
            difficulty: 'medium',
            includeSemantic: true,
            includeSurah: true,
            includeRandom: true,
            avoidTranslations
          }
        })
      })

      const result = await response.json()
      if (result.success && result.data.length > 1) {
        return result.data.find(word => !word.isCorrect)
      } else {
        console.error('Error generating distractor:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error calling word bank API:', error)
      return null
    }
  }

  const getRandomWords = (words, count) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const fetchRandomVerse = async () => {
    setLoading(true)
    setError(null)
    setWordBank([])
    setSelectedWords([])
    setSubmissionResults(null)
    setShowDetailedInfo(false)

    try {
      const response = await fetch('/api/words/random-verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseLength: verseLengthFilter })
      })
      const result = await response.json()

      if (result.success) {
        setVerseData(result.data)
        if (result.data.words && result.data.words.length > 0) {
          const verseTranslations = result.data.words.map(word => ({
            translation: cleanWord(word.translation),
            transliteration: word.transliteration,
            originalWord: word
          }))

          const RandomSelectedWords = getRandomWords(result.data.words, 3)
          const distractors = []
          const existingTranslations = verseTranslations.map(vt => vt.translation)

          for (const selectedWord of RandomSelectedWords) {
            const distractor = await generateDistractor(selectedWord, existingTranslations)
            if (distractor) {
              distractors.push({
                translation: cleanWord(distractor.translation),
                transliteration: distractor.transliteration,
                originalWord: distractor
              })
            }
          }

          const verseTranslationSet = new Set(verseTranslations.map(vt => vt.translation))
          const uniqueDistractors = distractors.filter(distractor => !verseTranslationSet.has(distractor.translation))

          const combinedWordBank = [...verseTranslations, ...uniqueDistractors]
          const finalWordBank = shuffleArray(combinedWordBank)
          setWordBank(finalWordBank)
          setSelectedWords(new Array(verseTranslations.length).fill(null))
        }
      } else {
        setError(result.error || 'Failed to fetch verse')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomVerse()
  }, [])

  useEffect(() => {
    if (verseData) {
      fetchRandomVerse()
    }
  }, [verseLengthFilter])

  const handleSlotClick = (index, word) => {
    const newSelectedWords = [...selectedWords]
    newSelectedWords[index] = word
    setSelectedWords(newSelectedWords)
  }

  const handleWordSelect = (word, clearAll = false, submit = false) => {
    if (submit) {
      const isComplete = selectedWords.every((word) => word !== null)
      if (isComplete) {
        checkAccuracy()
      } else {
        alert("Please complete all words before submitting.")
      }
      return
    }

    if (clearAll) {
      setSelectedWords(new Array(selectedWords.length).fill(null))
      return
    }

    if (word === 'BACKSPACE') {
      const lastFilledIndex = selectedWords.map((word, index) => ({ word, index }))
        .filter(item => item.word !== null)
        .pop()?.index

      if (lastFilledIndex !== undefined) {
        const newSelectedWords = [...selectedWords]
        newSelectedWords[lastFilledIndex] = null
        setSelectedWords(newSelectedWords)
      }
      return
    }

    const emptyIndex = selectedWords.findIndex((w) => w === null)
    if (emptyIndex !== -1) {
      const newSelectedWords = [...selectedWords]
      newSelectedWords[emptyIndex] = word

      if (verseData && verseData.words) {
        const currentWord = verseData.words[emptyIndex]
        if (currentWord.transliteration) {
          verseData.words.forEach((verseWord, idx) => {
            if (idx !== emptyIndex &&
                verseWord.transliteration &&
                verseWord.transliteration === currentWord.transliteration) {
              newSelectedWords[idx] = word
            }
          })
        }
      }

      setSelectedWords(newSelectedWords)
    }
  }

  const checkAccuracy = () => {
    if (!verseData || !verseData.words) {
      alert("No verse data available to check accuracy.")
      return
    }

    let correctCount = 0
    const totalWords = verseData.words.length
    const wordResults = []

    selectedWords.forEach((selectedWord, index) => {
      const correctWord = cleanWord(verseData.words[index].translation)
      const isCorrect = selectedWord === correctWord
      if (isCorrect) {
        correctCount++
      }
      wordResults.push({ index, selectedWord, correctWord, isCorrect })
    })

    const accuracy = (correctCount / totalWords) * 100
    const isAccurate = accuracy === 100

    setSubmissionResults({
      correctCount,
      totalWords,
      accuracy,
      isAccurate,
      wordResults
    })
  }

  const usedWords = []

  return (
    <div className="w-full max-w-full sm:max-w-6xl mx-auto p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Quran Word App — Game</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Rebuild the verse using the word bank.</p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Verse Length:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { value: 'all', label: 'All', color: 'bg-gray-200 dark:bg-gray-700' },
              { value: 'short', label: 'Short (≤7)', color: 'bg-green-200 dark:bg-green-700' },
              { value: 'medium', label: 'Medium (8-15)', color: 'bg-yellow-200 dark:bg-yellow-700' },
              { value: 'long', label: 'Long (15+)', color: 'bg-red-200 dark:bg-red-700' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setVerseLengthFilter(filter.value)}
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  verseLengthFilter === filter.value
                    ? `${filter.color} text-gray-900 dark:text-gray-100`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading verse...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchRandomVerse} className="mt-2" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {verseData && (
        <VerseViewer 
          verseData={verseData}
          onRefresh={fetchRandomVerse}
          selectedWords={selectedWords}
          onWordSelect={handleSlotClick}
          currentFilter={verseLengthFilter}
          submissionResults={submissionResults}
          showDetailedInfo={showDetailedInfo}
          setShowDetailedInfo={setShowDetailedInfo}
        />
      )}

      {wordBank.length > 0 && (
        <WordBankKeyboard
          words={wordBank}
          usedWords={usedWords}
          onWordSelect={handleWordSelect}
        />
      )}
    </div>
  )
}


