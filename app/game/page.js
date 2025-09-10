"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Brain, Search, Target } from "lucide-react"
import VerseViewer from "@/components/VerseViewer"
import WordBankKeyboard from "@/components/WordBankKeyboard"
import GameSummary from "@/components/GameSummary"
import knowledgeTestStatsStore from "@/lib/game-stats"

export default function GamePage() {
  const [verseData, setVerseData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [wordBank, setWordBank] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [verseLengthFilter, setVerseLengthFilter] = useState('all')
  const [submissionResults, setSubmissionResults] = useState(null)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)
  const [revealedWords, setRevealedWords] = useState(new Set())
  const [usedWords, setUsedWords] = useState([])

  const cleanWord = (word) => {
    return word
      .toLowerCase() // Convert to lowercase for case-insensitive comparison
      .replace(/[^\w\s()]/g, '') // Keep letters, numbers, spaces, and parentheses
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
    setRevealedWords(new Set())

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
            translation: word.translation, // Keep original capitalization for display
            cleanTranslation: cleanWord(word.translation), // Clean version for comparison
            transliteration: word.transliteration,
            originalWord: word
          }))

          const RandomSelectedWords = getRandomWords(result.data.words, 3)
          const distractors = []
          const existingTranslations = verseTranslations.map(vt => vt.cleanTranslation)

          for (const selectedWord of RandomSelectedWords) {
            const distractor = await generateDistractor(selectedWord, existingTranslations)
            if (distractor) {
              distractors.push({
                translation: distractor.translation, // Keep original capitalization for display
                cleanTranslation: cleanWord(distractor.translation), // Clean version for comparison
                transliteration: distractor.transliteration,
                originalWord: distractor
              })
            }
          }

          // Create a set of cleaned verse translations for case-insensitive comparison
          const verseTranslationSet = new Set(verseTranslations.map(vt => vt.cleanTranslation))
          const uniqueDistractors = distractors.filter(distractor => {
            return !verseTranslationSet.has(distractor.cleanTranslation)
          })

          const combinedWordBank = [...verseTranslations, ...uniqueDistractors]
          const finalWordBank = shuffleArray(combinedWordBank)
          setWordBank(finalWordBank)
          setSelectedWords(new Array(verseTranslations.length).fill(null))
          setUsedWords([])
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
      // Check if all words are filled (either selected by user or revealed)
      const isComplete = selectedWords.every((word, index) => word !== null || revealedWords.has(index))
      if (isComplete) {
        checkAccuracy()
      } else {
        alert("Please complete all words before submitting.")
      }
      return
    }

    if (clearAll) {
      // Only clear user-selected words, keep revealed words
      const newSelectedWords = [...selectedWords]
      selectedWords.forEach((word, index) => {
        // Only clear if the word wasn't revealed
        if (!revealedWords.has(index)) {
          newSelectedWords[index] = null
        }
      })
      setSelectedWords(newSelectedWords)
      setUsedWords([])
      return
    }

    if (word === 'BACKSPACE') {
      // Find the last user-selected word (not revealed)
      const lastFilledIndex = selectedWords.map((word, index) => ({ word, index }))
        .filter(item => item.word !== null && !revealedWords.has(item.index))
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

      // Track used word (cleaned version for comparison)
      const cleanedWord = cleanWord(word)
      if (!usedWords.includes(cleanedWord)) {
        setUsedWords([...usedWords, cleanedWord])
      }

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
    let revealedCount = 0
    const totalWords = verseData.words.length
    const wordResults = []

    selectedWords.forEach((selectedWord, index) => {
      const correctWord = cleanWord(verseData.words[index].translation)
      const wasRevealed = revealedWords.has(index)
      
      // For revealed words, don't count as correct guesses
      let isCorrect = false
      if (wasRevealed) {
        revealedCount++
        isCorrect = false // Revealed words are not considered correct guesses
      } else {
        // Compare with clean version of the selected word
        const cleanSelectedWord = cleanWord(selectedWord || '')
        isCorrect = cleanSelectedWord === correctWord
        if (isCorrect) {
          correctCount++
        }
      }
      
      wordResults.push({ 
        index, 
        selectedWord: wasRevealed ? correctWord : selectedWord, 
        correctWord, 
        isCorrect,
        wasRevealed
      })
    })

    // Calculate accuracy based only on non-revealed words
    const guessedWords = totalWords - revealedCount
    const accuracy = guessedWords > 0 ? (correctCount / guessedWords) * 100 : 0
    const isAccurate = correctCount === guessedWords && revealedCount === 0 // Perfect only if no reveals and all guesses correct

    const submissionResults = {
      correctCount,
      revealedCount,
      totalWords,
      guessedWords,
      accuracy,
      isAccurate,
      wordResults
    }

    setSubmissionResults(submissionResults)

    // Record session statistics
    try {
      knowledgeTestStatsStore.recordSession({
        verseData,
        submissionResults,
        revealedWords,
        selectedWords
      })
    } catch (error) {
      console.error('Error recording session stats:', error)
    }
  }

  // Toolbar handlers
  const handleRevealNext = () => {
    const nextIndex = selectedWords.findIndex((word, index) => !word && !revealedWords.has(index))
    if (nextIndex !== -1) {
      const newRevealedWords = new Set([...revealedWords, nextIndex])
      setRevealedWords(newRevealedWords)
      // Auto-fill the revealed word (original version for display)
      const newSelectedWords = [...selectedWords]
      const revealedWord = verseData.words[nextIndex].translation
      newSelectedWords[nextIndex] = revealedWord
      
      // Track used word (cleaned version for comparison)
      const cleanedRevealedWord = cleanWord(revealedWord)
      if (!usedWords.includes(cleanedRevealedWord)) {
        setUsedWords([...usedWords, cleanedRevealedWord])
      }
      
      setSelectedWords(newSelectedWords)
    }
  }


  const handleClearAll = () => {
    // Only clear user-selected words, keep revealed words
    const newSelectedWords = [...selectedWords]
    selectedWords.forEach((word, index) => {
      // Only clear if the word wasn't revealed
      if (!revealedWords.has(index)) {
        newSelectedWords[index] = null
      }
    })
    setSelectedWords(newSelectedWords)
    setUsedWords([])
  }


  return (
    <div className="w-full max-w-full sm:max-w-6xl mx-auto p-4 sm:p-8">
      {/* Header Section */}
      <div className="mb-8">
        {/* Main Header */}
        <div className="text-center mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            {/* Left side - empty on mobile, GameSummary on desktop */}
            <div className="hidden sm:block flex-1">
              <GameSummary />
            </div>
            
            {/* Center - Title */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quran Word App
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Knowledge Test</span>
              </div>
            </div>
            
            {/* Right side - GameSummary on mobile, empty on desktop */}
            <div className="sm:hidden">
              <GameSummary />
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Test your knowledge by rebuilding the verse using the word bank below
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Verse Length Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verse Length:</span>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { value: 'all', label: 'All', color: 'bg-gray-200 dark:bg-gray-700', icon: '📚' },
                  { value: 'short', label: 'Short (≤7)', color: 'bg-green-200 dark:bg-green-700', icon: '🌱' },
                  { value: 'medium', label: 'Medium (8-15)', color: 'bg-yellow-200 dark:bg-yellow-700', icon: '🌿' },
                  { value: 'long', label: 'Long (15+)', color: 'bg-red-200 dark:bg-red-700', icon: '🌳' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setVerseLengthFilter(filter.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                      verseLengthFilter === filter.value
                        ? `${filter.color} text-gray-900 dark:text-gray-100 shadow-sm`
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xs">{filter.icon}</span>
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchRandomVerse}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 text-sm font-medium shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    New Verse
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading Verse</h3>
            <p className="text-gray-600 dark:text-gray-300">Finding the perfect verse for your test...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Button 
              onClick={fetchRandomVerse} 
              className="bg-red-600 hover:bg-red-700 text-white"
              variant="outline"
            >
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
           onRevealedWordsChange={setRevealedWords}
           revealedWords={revealedWords}
         />
       )}

      {wordBank.length > 0 && (
        <WordBankKeyboard
          words={wordBank}
          usedWords={usedWords}
          onWordSelect={handleWordSelect}
          onRevealNext={handleRevealNext}
          onClearAll={handleClearAll}
          onShowUsedWords={() => {}} // This is handled internally in the component
          canRevealNext={!submissionResults && selectedWords.some((word, index) => !word && !revealedWords.has(index))}
          hasSelectedWords={!submissionResults && selectedWords.some(word => word !== null)}
          isSubmitted={!!submissionResults}
        />
      )}
    </div>
  )
}


