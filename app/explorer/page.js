'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ThemeToggle from '@/components/ThemeToggle'
import WordPopup from '@/components/WordPopup'
import { 
  BookOpen, 
  TreePine, 
  Home,
  ChevronLeft,
  ChevronRight,
  Search, 
  MapPin
} from 'lucide-react'

export default function ExplorerHome() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [surahs, setSurahs] = useState([])
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState(null)
  const [selectedWord, setSelectedWord] = useState(null)
  const [selectedWordIndex, setSelectedWordIndex] = useState(-1)

  // Initialize from URL params
  useEffect(() => {
    const surahParam = searchParams.get('surah')
    const pageParam = searchParams.get('page')
    if (surahParam) setSelectedSurah(surahParam)
    if (pageParam) setCurrentPage(parseInt(pageParam))
  }, [searchParams])

  // Fetch surahs list
  useEffect(() => {
    fetchSurahs()
  }, [])

  // Fetch words when surah or page changes
  useEffect(() => {
    if (selectedSurah) {
      fetchWords()
    }
  }, [selectedSurah, currentPage])

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/words/surahs')
      const data = await response.json()
      if (data.success) {
        setSurahs(data.data)
        // Auto-select first surah if none selected
        if (!selectedSurah && data.data.length > 0) {
          const firstSurah = data.data[0].surah_number.toString()
          setSelectedSurah(firstSurah)
          router.push(`/explorer?surah=${firstSurah}&page=1`)
        }
      }
    } catch (error) {
      console.error('Error fetching surahs:', error)
    }
  }

  const fetchWords = async () => {
    if (!selectedSurah) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/words/paginated?surah=${selectedSurah}&page=${currentPage}`
      )
      const data = await response.json()
      if (data.success) {
        setWords(data.data.words || [])
        setPageInfo(data.data)
        // Update URL
        router.push(`/explorer?surah=${selectedSurah}&page=${currentPage}`, { scroll: false })
      }
    } catch (error) {
      console.error('Error fetching words:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSurahChange = (surahNumber) => {
    setSelectedSurah(surahNumber)
    setCurrentPage(1)
    router.push(`/explorer?surah=${surahNumber}&page=1`)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWordClick = (word, index) => {
    setSelectedWord(word)
    setSelectedWordIndex(index)
  }

  const handlePreviousWord = () => {
    if (selectedWordIndex > 0) {
      const prevWord = words[selectedWordIndex - 1]
      setSelectedWord(prevWord)
      setSelectedWordIndex(selectedWordIndex - 1)
    }
  }

  const handleNextWord = () => {
    if (selectedWordIndex < words.length - 1) {
      const nextWord = words[selectedWordIndex + 1]
      setSelectedWord(nextWord)
      setSelectedWordIndex(selectedWordIndex + 1)
    }
  }

  const getSurahName = (number) => {
    const surah = surahs.find(s => s.surah_number === number)
    return surah ? `${surah.name_english} (${surah.name_arabic})` : `Surah ${number}`
  }

  // Group words by verse for display
  const groupedByVerse = words.reduce((acc, word) => {
    const verseKey = word.verse
    if (!acc[verseKey]) {
      acc[verseKey] = []
    }
    acc[verseKey].push(word)
    return acc
  }, {})

  return (
    <div className="theme-container min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Quran Word Explorer
            </h1>
            <p className="text-xl text-gray-600">
              Discover the true meaning of words through their root forms
            </p>
        </div>

          {/* Surah Selector */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Select Surah:</label>
                <Select value={selectedSurah || ''} onValueChange={handleSurahChange}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Choose a surah" />
                  </SelectTrigger>
                  <SelectContent>
                    {surahs.map((surah) => (
                      <SelectItem key={surah.surah_number} value={surah.surah_number.toString()}>
                        {surah.surah_number}. {surah.name_english} - {surah.name_arabic}
                        {' '}({surah.verses_count} verses, {surah.words_count} words)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading words...</p>
          </div>
        )}

        {/* Words Display */}
        {!loading && words.length > 0 && (
          <>
            {/* Page Info */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {getSurahName(pageInfo?.surahNumber || parseInt(selectedSurah || '1'))}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Page {pageInfo?.page} of {pageInfo?.totalPages} • {pageInfo?.wordsInPage} words
                    </div>
                    {pageInfo?.startVerse && pageInfo?.endVerse && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Verses {pageInfo.startVerse} - {pageInfo.endVerse}
                      </div>
                    )}
                      </div>
                    </div>
              </CardContent>
            </Card>

            {/* Words grouped by verse */}
            <div className="space-y-8 mb-8">
              {Object.entries(groupedByVerse).map(([verse, verseWords]) => (
                <Card key={verse} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Verse {verse}
                      </CardTitle>
                      <Badge variant="secondary">
                        {verseWords.length} {verseWords.length === 1 ? 'word' : 'words'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-row-reverse flex-wrap gap-4 justify-end" dir="rtl">
                      {verseWords.slice().reverse().map((word, idx) => {
                        const globalIndex = words.findIndex(w => w.id === word.id)
                        const hasRoot = word.root && word.root.root_arabic
                        
                        return (
                          <div
                            key={word.id}
                            onClick={() => handleWordClick(word, globalIndex)}
                            className="p-4 border rounded-lg hover:shadow-lg transition-all cursor-pointer bg-white hover:border-blue-400 group min-w-[200px] max-w-[280px] flex-shrink-0"
                          >
                            {/* Arabic Text */}
                            <div className="text-center mb-3">
                              {word.arabic_text ? (
                                <div className="text-3xl font-arabic mb-2" dir="rtl">
                                  {word.arabic_text}
                                </div>
                              ) : word.image_url ? (
                                <img
                                  src={word.image_url}
                                  alt={word.transliteration}
                                  className="h-16 mx-auto object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : null}
                              
                              {/* Root Highlight */}
                              {hasRoot && (
                                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                  <div className="text-xs text-gray-600 mb-1">Root</div>
                                  <div className="text-xl font-arabic text-green-800 font-bold" dir="rtl">
                                    {word.root.root_arabic}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    {word.root.root_latin}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Translation */}
                            <div className="text-center mb-2">
                              <div className="font-semibold text-gray-900">
                                {word.translation}
                              </div>
                              {word.transliteration && (
                                <div className="text-sm text-gray-500 italic mt-1">
                                  {word.transliteration}
                                </div>
                              )}
                            </div>

                            {/* Grammar */}
                            {word.grammar && (
                              <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded text-center">
                                {word.grammar}
                              </div>
                            )}

                            {/* Click hint */}
                            <div className="text-xs text-blue-600 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                              ← Click to explore root
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pageInfo && pageInfo.totalPages > 1 && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pageInfo.hasPreviousPage}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pageInfo.totalPages) }, (_, i) => {
                        let pageNum
                        if (pageInfo.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= pageInfo.totalPages - 2) {
                          pageNum = pageInfo.totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pageInfo.hasNextPage}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && words.length === 0 && selectedSurah && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-500">No words found. Please select a different surah.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Word Popup */}
      {selectedWord && (
        <WordPopup
          word={{
            arabic: selectedWord.arabic_text || '',
            transliteration: selectedWord.transliteration || '',
            translation: selectedWord.translation || '',
            occurrences: 1,
            locations: [selectedWord.location]
          }}
          root={selectedWord.root ? {
            arabic: selectedWord.root.root_arabic,
            latin: selectedWord.root.root_latin
          } : null}
          onClose={() => {
            setSelectedWord(null)
            setSelectedWordIndex(-1)
          }}
          onPrevious={handlePreviousWord}
          onNext={handleNextWord}
          currentIndex={selectedWordIndex}
          totalWords={words.length}
        />
      )}
    </div>
  )
}