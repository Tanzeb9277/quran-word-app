'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  BookOpen,
  TrendingUp,
  MapPin,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import WordPopup from '@/components/WordPopup'

export default function VerseDetail({ params }) {
  const [verseData, setVerseData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const router = useRouter()
  
  // Unwrap params Promise
  const resolvedParams = use(params)

  useEffect(() => {
    if (resolvedParams?.location) {
      fetchVerseData(decodeURIComponent(resolvedParams.location))
    }
  }, [resolvedParams?.location])

  const fetchVerseData = async (location) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/words/verse/${encodeURIComponent(location)}`)
      const data = await response.json()
      
      if (data.success) {
        setVerseData(data.data)
      } else {
        console.error('Error fetching verse data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching verse data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWordClick = (word, index) => {
    setSelectedWord(word)
    setCurrentWordIndex(index)
  }

  const closeWordPopup = () => {
    setSelectedWord(null)
  }

  const navigateToPreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
      setSelectedWord(verseData.words[currentWordIndex - 1])
    }
  }

  const navigateToNextWord = () => {
    if (currentWordIndex < verseData.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setSelectedWord(verseData.words[currentWordIndex + 1])
    }
  }

  const getGrammarColor = (grammar) => {
    const colors = {
      'Proper noun': 'bg-blue-100 text-blue-800',
      'Noun': 'bg-green-100 text-green-800',
      'Verb': 'bg-red-100 text-red-800',
      'Adjective': 'bg-purple-100 text-purple-800',
      'Particle': 'bg-gray-100 text-gray-800',
      'Pronoun': 'bg-yellow-100 text-yellow-800',
      'Adverb': 'bg-indigo-100 text-indigo-800',
    }
    return colors[grammar] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!verseData) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verse not found</h2>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Surah {verseData.surah_number}, Verse {verseData.verse_number}
            </h1>
            <p className="text-gray-600">
              {verseData.word_count} words • Location: {verseData.location}
            </p>
          </div>
        </div>

        {/* Verse Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {verseData.word_count}
                  </div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {verseData.surah_info?.total_verses || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Total Verses in Surah</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {verseData.surah_number}
                  </div>
                  <div className="text-sm text-gray-600">Surah Number</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verse Translation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Verse Translation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-800 leading-relaxed">
              {verseData.verse_translation}
            </p>
          </CardContent>
        </Card>

        {/* Words Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Words in This Verse
            </CardTitle>
            <CardDescription>
              Click on any word to see detailed information and explore its root
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Arabic text display - right to left */}
            <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl sm:text-3xl font-arabic text-gray-900 leading-relaxed" dir="rtl">
                {verseData.words.map((word, index) => (
                  <span
                    key={word.id}
                    onClick={() => handleWordClick(word, index)}
                    className="inline-block mx-1 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition-colors"
                    title={`${word.transliteration} - ${word.translation}`}
                  >
                    {word.arabic_text}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-2 text-center">
                Click on any word above for detailed information
              </div>
            </div>

             {/* Individual word cards - right to left */}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-end gap-4" dir="rtl">
               {verseData.words.map((word, index) => (
                 <div
                   key={word.id}
                   onClick={() => handleWordClick(word, index)}
                   className="w-full sm:w-48 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer relative min-h-[120px] flex flex-col"
                 >
                   {/* Position indicator */}
                   <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">
                     {word.position_in_verse}
                   </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="text-2xl font-arabic text-gray-900 text-center sm:text-right" dir="rtl">
                      {word.arabic_text}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="text-sm text-gray-600 mb-1">
                        {word.transliteration}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {word.translation}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Grammar Badge - Full Width */}
                    <div className="w-full">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs w-full justify-center py-1 px-2 ${getGrammarColor(word.grammar)}`}
                      >
                        <span className="truncate">
                          {word.grammar || 'Unknown'}
                        </span>
                      </Badge>
                    </div>
                    
                    {/* Root information - Full Width */}
                    {word.root_arabic && (
                      <div className="text-xs text-gray-500 text-center bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                        Root: <span className="font-arabic" dir="rtl">{word.root_arabic}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Word Popup */}
        {selectedWord && (
          <WordPopup
            word={selectedWord}
            onClose={closeWordPopup}
            root={{
              arabic: selectedWord.root_arabic,
              latin: selectedWord.root_latin
            }}
            verse={{
              surah_number: verseData.surah_number,
              verse: verseData.verse_number,
              words: verseData.words,
              translation: verseData.verse_translation
            }}
            // Navigation controls for the popup
            onPrevious={currentWordIndex > 0 ? navigateToPreviousWord : null}
            onNext={currentWordIndex < verseData.words.length - 1 ? navigateToNextWord : null}
            currentIndex={currentWordIndex}
            totalWords={verseData.words.length}
          />
        )}
      </div>
    </div>
  )
}
