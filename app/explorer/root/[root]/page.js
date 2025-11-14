'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ExternalLink,
  Star,
  Eye,
  BookOpen,
  TrendingUp,
  Filter,
  Grid,
  List
} from 'lucide-react'
import WordPopup from '@/components/WordPopup'

export default function RootDetail({ params }) {
  const [rootData, setRootData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'tree'
  const [filterGrammar, setFilterGrammar] = useState(null)
  const router = useRouter()
  
  // Unwrap params Promise
  const resolvedParams = use(params)

  useEffect(() => {
    if (resolvedParams?.root) {
      fetchRootData(decodeURIComponent(resolvedParams.root))
    }
  }, [resolvedParams?.root])

  const fetchRootData = async (root) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/words/explorer/${encodeURIComponent(root)}`)
      const data = await response.json()
      
      if (data.success) {
        setRootData(data.data)
      } else {
        console.error('Error fetching root data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching root data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWordClick = (word) => {
    setSelectedWord(word)
  }

  const closeWordPopup = () => {
    setSelectedWord(null)
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!rootData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Root not found</h2>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  // Words are already unique (by arabic_text + normalized translation) from the API
  // We can use them directly, but let's format them for display
  const processWordsForDisplay = (words) => {
    return words.map(word => ({
      arabic: word.arabic || word.arabic_text,
      transliteration: word.transliteration,
      translation: word.translation,
      translations: [{ text: word.translation, occurrences: word.occurrences }],
      totalOccurrences: parseInt(word.occurrences) || 0,
      allLocations: word.locations || [],
      allSurahs: word.surahs || []
    }))
  }

  const grammarCategories = Object.keys(rootData.grammar_categories || {})
  const filteredCategories = filterGrammar 
    ? { [filterGrammar]: rootData.grammar_categories[filterGrammar] }
    : rootData.grammar_categories

  // Process each grammar category - words are already unique from API
  const processedCategories = {}
  Object.entries(filteredCategories).forEach(([grammar, words]) => {
    processedCategories[grammar] = processWordsForDisplay(words)
  })

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Root: <span className="font-arabic text-2xl sm:text-3xl md:text-4xl" dir="rtl">{rootData.root.arabic}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 break-words">
              {rootData.root.latin} • {rootData.summary.total_unique_forms} unique forms • {rootData.summary.total_occurrences} total occurrences
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {rootData.summary.total_unique_forms}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Unique Forms</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {rootData.summary.total_occurrences}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Occurrences</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {rootData.summary.grammar_categories_count}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Grammar Types</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {rootData.summary.total_surahs}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Surahs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Filter by grammar:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterGrammar === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterGrammar(null)}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  All
                </Button>
                {grammarCategories.map(grammar => (
                  <Button
                    key={grammar}
                    variant={filterGrammar === grammar ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGrammar(grammar)}
                    className={`text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${filterGrammar === grammar ? getGrammarColor(grammar) : ""}`}
                  >
                    {grammar}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POS Table */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              Words by Grammar Category
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Click on any word to see detailed information and context
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="w-full">
              {Object.entries(processedCategories).map(([grammar, words]) => (
                <div key={grammar} className="mb-6 sm:mb-8 w-full">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Badge className={`${getGrammarColor(grammar)} text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1`}>
                      {grammar}
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {words.length} unique word{words.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        onClick={() => handleWordClick({
                          ...word,
                          // For compatibility with WordPopup, use the first translation as primary
                          translation: word.translations[0]?.text || '',
                          occurrences: word.totalOccurrences,
                          locations: word.allLocations,
                          surahs: word.allSurahs
                        })}
                        className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer active:scale-[0.98]"
                      >
                          <div className="text-xl sm:text-2xl font-arabic text-gray-900 mb-1.5 sm:mb-2" dir="rtl">
                            {word.arabic}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">
                            {word.transliteration}
                          </div>
                          
                          {/* Show multiple translations */}
                          <div className="mb-2 sm:mb-2">
                            {word.translations.length === 1 ? (
                              <div className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">
                                {word.translations[0].text}
                              </div>
                            ) : (
                              <div className="space-y-0.5 sm:space-y-1">
                                <div className="text-xs text-gray-500 font-medium">
                                  {word.translations.length} translations:
                                </div>
                                {word.translations.slice(0, 2).map((translation, idx) => (
                                  <div key={idx} className="text-xs sm:text-sm text-gray-800 line-clamp-1">
                                    • {translation.text}
                                    {translation.occurrences > 1 && (
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({translation.occurrences})
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {word.translations.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{word.translations.length - 2} more...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 sm:mt-3">
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {word.totalOccurrences} occurrence{word.totalOccurrences !== 1 ? 's' : ''}
                            </Badge>
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
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
            root={rootData.root}
          />
        )}
      </div>
    </div>
  )
}
