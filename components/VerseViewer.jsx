"use client"

import { useState, useEffect } from "react"
import ArabicWordDisplay from "./ArabicWordDisplay"

/**
 * VerseViewer Component
 * @param {Object} props
 * @param {Object} props.verseData - The verse data from API
 * @param {Function} props.onRefresh - Callback to refresh the verse
 * @param {Array} props.selectedWords - Array of selected words for each slot
 * @param {Function} props.onWordSelect - Callback when a word slot is clicked
 * @param {string} props.currentFilter - Current verse length filter
 * @param {Object} props.submissionResults - Results from accuracy check
 * @param {boolean} props.showDetailedInfo - Whether to show detailed word information
 * @param {Function} props.setShowDetailedInfo - Function to toggle detailed info
 */
export default function VerseViewer({ verseData, onRefresh, selectedWords = [], onWordSelect, currentFilter = 'all', submissionResults = null, showDetailedInfo = false, setShowDetailedInfo = null, onRevealedWordsChange = null, revealedWords = new Set() }) {
  const [enlargedImageIndex, setEnlargedImageIndex] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [translationData, setTranslationData] = useState(null)
  const [translationLoading, setTranslationLoading] = useState(false)
  const [translationError, setTranslationError] = useState(null)
  
  // Reset revealed words when verseData changes (new verse loaded)
  useEffect(() => {
    // Notify parent component that revealed words are reset
    if (onRevealedWordsChange) {
      onRevealedWordsChange(new Set())
    }
    // Reset translation state when verse changes
    setShowTranslation(false)
    setTranslationData(null)
    setTranslationError(null)
  }, [verseData, onRevealedWordsChange])

  // Function to fetch verse translation
  const fetchTranslation = async () => {
    if (!verseData) return
    
    setTranslationLoading(true)
    setTranslationError(null)
    
    try {
      const response = await fetch(`/api/translations/reference/${verseData.verse}`)
      const result = await response.json()
      
      if (result.success) {
        setTranslationData(result.data)
        setShowTranslation(true)
      } else {
        setTranslationError(result.error || 'Failed to fetch translation')
      }
    } catch (error) {
      console.error('Error fetching translation:', error)
      setTranslationError('Network error occurred while fetching translation')
    } finally {
      setTranslationLoading(false)
    }
  }
  
  // Guard against undefined verseData
  if (!verseData || !verseData.words) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <p className="text-gray-500">No verse data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-screen p-3 sm:p-4 bg-white rounded-lg shadow-lg ${
      revealedWords.size > 0 
        ? 'mb-[350px] sm:mb-96' 
        : 'mb-[350px] sm:mb-80'
    }`}>
      {/* Verse Header */}
      <div className="text-center mb-6">
        <div className="text-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Arabic Words
          </h2>
        </div>
        
        {/* Verse Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            Surah {verseData.surah_number}, Verse {verseData.verse}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            {verseData.words.length} words
          </span>
          {currentFilter !== 'all' && (
            <span className={`px-2 py-1 rounded text-white ${
              currentFilter === 'short' ? 'bg-green-500' :
              currentFilter === 'medium' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {currentFilter === 'short' ? 'Short' :
               currentFilter === 'medium' ? 'Medium' :
               'Long'} verse
            </span>
          )}
        </div>
        
        <div className="w-16 h-1 bg-blue-500 mx-auto rounded"></div>
      </div>

      {/* Submission Results */}
      {submissionResults && (
        <div className="mb-6 p-4 rounded-lg border-2">
          <div className={`text-center mb-4 ${
            submissionResults.isAccurate 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="text-lg font-semibold mb-2">
              {submissionResults.isAccurate ? '🎉 Perfect!' : '📝 Good effort!'}
            </div>
            <div className="text-sm space-y-1">
              <div>
                You got {submissionResults.correctCount} out of {submissionResults.guessedWords} words correct 
                ({submissionResults.accuracy.toFixed(1)}% accuracy)
              </div>
              {submissionResults.revealedCount > 0 && (
                <div className="text-xs text-gray-600">
                  {submissionResults.revealedCount} word{submissionResults.revealedCount > 1 ? 's' : ''} revealed
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-3">
              <button
                onClick={() => setShowDetailedInfo && setShowDetailedInfo(!showDetailedInfo)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors text-sm ${
                  showDetailedInfo 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {showDetailedInfo ? 'Hide Details' : 'Show Details'}
              </button>
              <button
                onClick={fetchTranslation}
                disabled={translationLoading}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors text-sm ${
                  translationLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : showTranslation
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {translationLoading ? 'Loading...' : showTranslation ? 'Hide Translation' : 'Show Translation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Translation Display */}
      {showTranslation && translationData && (
        <div className="mb-6 p-4 rounded-lg border-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              📖 Verse Translation
            </h3>
            <div className="text-sm text-purple-600 mb-3">
              Surah {translationData.surah_number}, Verse {translationData.verse_number}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <div className="text-center">
              <p className="text-lg leading-relaxed text-gray-800 mb-3">
                {translationData.display_translation}
              </p>
              
              {translationData.translation_source && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Translation by:</span> {translationData.translation_source}
                </div>
              )}
              
              {translationData.has_footnotes && translationData.footnote_count > 0 && (
                <div className="text-xs text-gray-500">
                  {translationData.footnote_count} footnote{translationData.footnote_count > 1 ? 's' : ''} available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Translation Error */}
      {translationError && (
        <div className="mb-6 p-4 rounded-lg border-2 bg-red-50 border-red-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ Translation Error
            </h3>
            <p className="text-sm text-red-600 mb-3">
              {translationError}
            </p>
            <button
              onClick={fetchTranslation}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Arabic Words with Text Display - RTL */}
      <div className="mb-8">
        <div className="text-center mb-6 w-full max-w-full overflow-hidden" dir="rtl">
          <div className="inline-block">
            {verseData.words.map((word, index) => {
              const isSelected = !!selectedWords[index]
              const isRevealed = revealedWords.has(index)
              const isCorrect = submissionResults ? (() => {
                const result = submissionResults.wordResults.find(r => r.index === index)
                return result ? result.isCorrect : null
              })() : null
              
              // Find current word index (next empty slot)
              const currentWordIndex = selectedWords.findIndex((word, index) => !word && !revealedWords.has(index))
              const isCurrentWord = index === currentWordIndex
              
              // Check if this word has the same translation as the current word
              const isSameTranslationAsCurrent = currentWordIndex !== -1 && 
                verseData.words[currentWordIndex]?.translation === word.translation
              
              return (
                <ArabicWordDisplay
                  key={word.id}
                  word={word}
                  index={index}
                  isSelected={isSelected}
                  isRevealed={isRevealed}
                  isCorrect={isCorrect}
                  isCurrentWord={isCurrentWord}
                  isSameTranslationAsCurrent={isSameTranslationAsCurrent}
                  onClick={!submissionResults && !isRevealed ? onWordSelect : null}
                  isClickable={!submissionResults && !isRevealed}
                  showTransliteration={false}
                />
              )
            })}
          </div>
        </div>
        
        {/* Show correct answers for incorrect submissions */}
        {submissionResults && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Correct answers for incorrect words:</div>
            <div className="flex flex-wrap gap-2">
              {submissionResults.wordResults
                .filter(result => !result.isCorrect && !result.wasRevealed)
                .map((result, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Word {result.index + 1}: {result.correctWord}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Word Information */}
      {showDetailedInfo && submissionResults && (
        <div className="mt-6 sm:mt-8 p-3 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Detailed Word Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {verseData.words.map((word, index) => {
              const result = submissionResults.wordResults.find(r => r.index === index)
              console.log(`Word ${index + 1} grammar:`, word.grammar)
              return (
                <div key={word.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                  {/* Arabic Word Section */}
                  <div className="text-center mb-4">
                    <div className="mb-2">
                      <img
                        src={word.image_url || "/placeholder.svg"}
                        alt={`Arabic word ${index + 1}`}
                        className="object-contain w-full h-16 sm:h-22 max-w-[135px] sm:max-w-[180px] mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=64&width=135&text=Arabic+Word"
                        }}
                      />
                    </div>
                    
                    {/* Root Letters */}
                    {word.root && word.root.root_arabic && word.root.root_latin && (
                      <div className="text-xs text-gray-600 mb-2">
                        <span className="font-semibold">Root: </span>
                        <span className="font-arabic" dir="rtl">{word.root.root_arabic}</span>
                        <span className="text-gray-500 ml-1">({word.root.root_latin})</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Word {index + 1}
                    </div>
                  </div>

                  {/* Word Details Section */}
                  <div className="space-y-3">
                    {/* Translation */}
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        Translation
                      </div>
                      <div className={`text-sm font-medium p-2 rounded ${
                        result && result.isCorrect 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : result && !result.isCorrect
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {result ? result.selectedWord : 'Not selected'}
                      </div>
                      {result && !result.isCorrect && (
                        <div className="text-xs text-green-600 mt-1">
                          Correct: {result.correctWord}
                        </div>
                      )}
                    </div>



                    {/* Grammar */}
                    {word.grammar && word.grammar.trim() !== '' && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Grammar
                        </div>
                        <div className="text-sm bg-gray-50 p-2 rounded border border-gray-200 leading-relaxed whitespace-pre-line text-gray-800" dir="rtl">
                          {word.grammar}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {word.tags && Array.isArray(word.tags) && word.tags.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Tags
                        </div>
                        <div className="space-y-1">
                          {word.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                              <span className="font-semibold text-blue-700">{tag.tag}</span>
                              {tag.description && tag.description.trim() !== '' && (
                                <span className="text-blue-800 ml-1">: {tag.description}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImageIndex(null)}
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl max-w-5xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Arabic Word {enlargedImageIndex + 1}
              </h3>
              <button
                onClick={() => setEnlargedImageIndex(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              <img
                src={verseData.words[enlargedImageIndex].image_url || "/placeholder.svg"}
                alt={`Enlarged Arabic word ${enlargedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=800&text=Arabic+Word"
                }}
              />
            </div>
            
            {/* Footer with word info */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="text-center text-sm text-gray-600">

                {verseData.words[enlargedImageIndex].transliteration && (
                  <p className="mt-1">Transliteration: {verseData.words[enlargedImageIndex].transliteration}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}