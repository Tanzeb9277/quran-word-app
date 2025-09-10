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
  Eye,
  ExternalLink,
  Star,
  TreePine
} from 'lucide-react'
import WordPopup from '@/components/WordPopup'

export default function SurahDetail({ params }) {
  const [surahData, setSurahData] = useState(null)
  const [verses, setVerses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const router = useRouter()
  
  // Unwrap params Promise
  const resolvedParams = use(params)

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchSurahData(resolvedParams.id)
    }
  }, [resolvedParams?.id])

  const fetchSurahData = async (surahId) => {
    try {
      setIsLoading(true)
      
      // Fetch surah info
      const surahResponse = await fetch(`/api/words/surahs`)
      const surahData = await surahResponse.json()
      const surah = surahData.data.find(s => s.surah_number === parseInt(surahId))
      
      if (surah) {
        setSurahData(surah)
      }

      // Fetch verses
      const versesResponse = await fetch(`/api/words/surah/${surahId}`)
      const versesData = await versesResponse.json()
      
      if (versesData.success && Array.isArray(versesData.data)) {
        setVerses(versesData.data)
      } else {
        console.error('Error fetching verses:', versesData.error)
        setVerses([]) // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching surah data:', error)
      setVerses([]) // Set empty array as fallback
    } finally {
      setIsLoading(false)
    }
  }

  const handleWordClick = (word, verse) => {
    setSelectedWord(word)
    setSelectedVerse(verse)
  }

  const closeWordPopup = () => {
    setSelectedWord(null)
    setSelectedVerse(null)
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
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!surahData || !verses.length) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Surah not found</h2>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
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
              {surahData.name_english}
            </h1>
            <p className="text-gray-600 font-arabic text-xl">
              {surahData.name_arabic}
            </p>
          </div>
        </div>

        {/* Surah Info */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {surahData.surah_number}
                </div>
                <div className="text-sm text-gray-600">Surah Number</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {surahData.verses_count}
                </div>
                <div className="text-sm text-gray-600">Verses</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {surahData.words_count}
                </div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              
              <div className="text-center">
                <Badge className={surahData.revelation_type === 'Meccan' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {surahData.revelation_type}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Revelation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verses */}
        <div className="space-y-6">
          {verses.map((verse, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Verse {verse.verse}
                  </CardTitle>
                  <Badge variant="outline">
                    {verse.words?.length || 0} words
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Arabic Text */}
                <div className="text-2xl font-arabic text-gray-900 mb-4 leading-relaxed text-right" dir="rtl">
                  {verse.words?.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      onClick={() => handleWordClick(word, verse)}
                      className="inline-block mx-1 px-2 py-1 rounded hover:bg-blue-100 cursor-pointer transition-colors"
                      title={`${word.transliteration} - ${word.translation}`}
                    >
                      {word.arabic_text}
                    </span>
                  )) || []}
                </div>

                {/* Translation */}
                <div className="text-gray-700 mb-4 italic">
                  {verse.translation}
                </div>

                {/* Word Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {verse.words?.slice(0, 8).map((word, wordIndex) => (
                    <div
                      key={wordIndex}
                      onClick={() => handleWordClick(word, verse)}
                      className="p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="text-sm font-arabic text-gray-900" dir="rtl">
                        {word.arabic_text}
                      </div>
                      <div className="text-xs text-gray-600">
                        {word.transliteration}
                      </div>
                      <div className="text-xs font-medium text-gray-800">
                        {word.translation}
                      </div>
                      {word.grammar && (
                        <Badge className={`${getGrammarColor(word.grammar)} text-xs mt-1`}>
                          {word.grammar}
                        </Badge>
                      )}
                    </div>
                  )) || []}
                  {(verse.words?.length || 0) > 8 && (
                    <div className="p-2 border border-gray-200 rounded bg-gray-50 text-center">
                      <div className="text-xs text-gray-600">
                        +{(verse.words?.length || 0) - 8} more
                      </div>
                    </div>
                  )}
                </div>

                {/* Verse Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <Star className="w-4 h-4 mr-2" />
                    Bookmark
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <Eye className="w-4 h-4 mr-2" />
                    Study Words
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <TreePine className="w-4 h-4 mr-2" />
                    Explore Roots
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Word Popup */}
        {selectedWord && (
          <WordPopup
            word={selectedWord}
            onClose={closeWordPopup}
            root={{ arabic: selectedWord.root_arabic, latin: selectedWord.root_latin }}
            verse={selectedVerse}
          />
        )}
      </div>
    </div>
  )
}
