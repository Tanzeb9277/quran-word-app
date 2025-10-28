'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ExternalLink, 
  BookOpen, 
  TrendingUp,
  MapPin,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function WordPopup({ word, onClose, root, verse, onPrevious, onNext, currentIndex, totalWords }) {
  const router = useRouter()
  const [verseContext, setVerseContext] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (word) {
      if (verse) {
        // Use the verse data passed from the surah explorer
        setVerseContext({
          surah: verse.surah_number,
          verse: verse.verse,
          text: verse.words.map(w => w.arabic_text).join(' '),
          translation: verse.translation,
          location: `${verse.surah_number}:${verse.verse}`
        })
      } else {
        fetchVerseContext()
      }
    }
  }, [word, verse])

  const fetchVerseContext = async () => {
    try {
      setIsLoading(true)
      
      // If we have location data from the word, use the first location
      if (word?.locations && word.locations.length > 0) {
        const firstLocation = word.locations[0]
        // Parse location (format: "surah:verse:word_position")
        const [surahNum, verseNum] = firstLocation.split(':')
        
        // Fetch the actual verse data
        const response = await fetch(`/api/words/surah/${surahNum}`)
        const data = await response.json()
       
        if (data.success && data.data) {
          const verse = data.data[verseNum - 1]
          if (verse) {
            setVerseContext({
              surah: parseInt(surahNum),
              verse: parseInt(verseNum),
              text: verse.words.map(w => w.arabic_text).join(' '),
              translation: verse.translation,
              location: firstLocation
            })
            return
          }
        }
      }
      
      // Fallback to mock data if no surah data available
      const mockContext = {
        surah: 2,
        verse: 255,
        text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
        translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
        location: "2:255:1"
      }
      setVerseContext(mockContext)
    } catch (error) {
      console.error('Error fetching verse context:', error)
      // Fallback to mock data on error
      const mockContext = {
        surah: 2,
        verse: 255,
        text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
        translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
        location: "2:255:1"
      }
      setVerseContext(mockContext)
    } finally {
      setIsLoading(false)
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

  if (!word) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
          {/* Close Button - Single, Prominent */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-500 hover:bg-red-600 text-white shadow-lg border-0 z-10 w-10 h-10 sm:w-8 sm:h-8 rounded-full"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
          
          {/* Main Header Content - Properly Centered */}
          <div className="px-12">
            {/* Navigation controls */}
            {onPrevious && onNext && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onPrevious}
                  disabled={currentIndex === 0}
                  className="bg-white dark:bg-gray-800 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentIndex + 1} of {totalWords}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNext}
                  disabled={currentIndex === totalWords - 1}
                  className="bg-white dark:bg-gray-800 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Word Information */}
            <div className="text-center">
              <CardTitle className="text-3xl sm:text-4xl font-arabic text-gray-900 dark:text-gray-100 mb-2" dir="rtl">
                {word.arabic}
              </CardTitle>
              <CardDescription className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium">
                {word.transliteration}
              </CardDescription>
              <div className="mt-2 text-base sm:text-lg text-gray-700 dark:text-gray-200">
                {word.translations ? word.translations[0]?.text : word.translation}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Word Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Root</h4>
              <div className="flex items-center gap-2">
                <span className="text-xl font-arabic text-gray-800" dir="rtl">
                  {root?.arabic}
                </span>
                <span className="text-sm text-gray-600">
                  ({root?.latin})
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Occurrences</h4>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-lg font-medium text-gray-800">
                  {word.occurrences}
                </span>
                <span className="text-sm text-gray-600">
                  time{word.occurrences !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Translations Section */}
          {word.translations && word.translations.length > 1 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                All Translations ({word.translations.length})
              </h4>
              <div className="space-y-2">
                {word.translations.map((translation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {translation.text}
                      </div>
                      <div className="text-sm text-gray-600">
                        {translation.occurrences} occurrence{translation.occurrences !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {translation.surahs && translation.surahs.length > 0 && (
                        <div>
                          {translation.surahs.slice(0, 3).join(', ')}
                          {translation.surahs.length > 3 && ` +${translation.surahs.length - 3} more`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Different translations based on verse context
              </p>
            </div>
          )}

          {/* Surahs Section */}
          {word.surahs && word.surahs.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Found in Surahs
              </h4>
              <div className="flex flex-wrap gap-2">
                {word.surahs.map((surahNum, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => {
                      // Navigate to surah explorer
                      window.open(`/explorer/surah/${surahNum}`, '_blank')
                    }}
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    Surah {surahNum}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click on any surah to explore it in detail
              </p>
            </div>
          )}

          {/* Grammar Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Grammar Information</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800">
                Root Family
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                Quranic Word
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                High Frequency
              </Badge>
            </div>
          </div>

          {/* Verse Context */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Verse Context
            </h4>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : verseContext ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Surah {verseContext.surah}, Verse {verseContext.verse}
                    </span>
                  </div>
                  
                  <div className="text-lg font-arabic text-gray-900 mb-3 leading-relaxed" dir="rtl">
                    {verseContext.text}
                  </div>
                  
                  <div className="text-sm text-gray-700 italic">
                    {verseContext.translation}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      window.open(`/explorer/verse/${verseContext.surah}:${verseContext.verse}`, '_blank')
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Verse
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    <Eye className="w-4 h-4 mr-2" />
                    See All Occurrences
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No context available
              </div>
            )}
          </div>

          {/* All Locations */}
          {word.locations && word.locations.length > 1 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                All Locations ({word.locations.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {word.locations.slice(0, 10).map((location, index) => {
                  const [surahNum, verseNum] = location.split(':')
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => {
                        // Navigate to verse explorer
                        window.open(`/explorer/verse/${surahNum}:${verseNum}`, '_blank')
                      }}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {surahNum}:{verseNum}
                    </Button>
                  )
                })}
                {word.locations.length > 10 && (
                  <div className="col-span-2 text-xs text-gray-500 text-center">
                    ... and {word.locations.length - 10} more locations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Learning Actions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Learning Actions</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <Star className="w-4 h-4 mr-2" />
                Add to Favorites
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => {
                  if (root && root.arabic) {
                    onClose()
                    router.push(`/explorer/root/${encodeURIComponent(root.arabic)}`)
                  }
                }}
                disabled={!root || !root.arabic}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Study Root Family
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <TrendingUp className="w-4 h-4 mr-2" />
                Practice This Word
              </Button>
            </div>
          </div>

          {/* Related Words */}
          {root && root.arabic && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Related Words</h4>
              <div className="text-sm text-gray-600">
                Explore other words from the same root family to understand morphological patterns.
              </div>
              <Button 
                size="sm" 
                className="mt-2 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  onClose()
                  router.push(`/explorer/root/${encodeURIComponent(root.arabic)}`)
                }}
              >
                Explore Root Family
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
