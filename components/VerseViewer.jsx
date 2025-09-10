"use client"

import { useState, useEffect } from "react"

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
  
  // Reset revealed words when verseData changes (new verse loaded)
  useEffect(() => {
    // Notify parent component that revealed words are reset
    if (onRevealedWordsChange) {
      onRevealedWordsChange(new Set())
    }
  }, [verseData, onRevealedWordsChange])
  
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
    <div className={`w-full max-w-full sm:max-w-5xl mx-auto p-3 sm:p-4 bg-white rounded-lg shadow-lg ${
      revealedWords.size > 0 
        ? 'mb-80 sm:mb-48' 
        : 'mb-64 sm:mb-40'
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
            <div className="flex justify-center mt-3">
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
            </div>
          </div>
        </div>
      )}

      {/* Arabic Words with Slots - RTL */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-6" dir="rtl">
          {verseData.words.map((word, index) => (
            <div key={word.id} className="flex flex-col items-center min-w-[120px] sm:min-w-[120px] md:min-w-[150px] max-w-[120px] sm:max-w-[150px] md:max-w-[180px] group">
              {/* Arabic Word Image */}
              <div 
                className="relative mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 cursor-pointer"
                onClick={() => setEnlargedImageIndex(enlargedImageIndex === index ? null : index)}
              >
                <img
                  src={word.image_url || "/placeholder.svg"}
                  alt={`Arabic word ${index + 1}`}
                  className="object-contain w-full h-14 sm:h-14 md:h-18 max-w-[113px] sm:max-w-[108px] md:max-w-[135px] transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=56&width=113&text=Arabic+Word"
                  }}
                />
              </div>

              {/* Enhanced Word Slot directly under the Arabic word */}
              <div 
                className={`
                  w-24 sm:w-28 md:w-36 h-12 sm:h-14 md:h-18 rounded-xl flex items-center justify-center mb-2 
                  transition-all duration-300 transform hover:scale-105 active:scale-95
                  shadow-md hover:shadow-lg
                  ${submissionResults ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${(() => {
                    if (submissionResults) {
                      const result = submissionResults.wordResults.find(r => r.index === index)
                      if (result) {
                        if (result.wasRevealed) {
                          return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white border-2 border-blue-300 shadow-blue-200'
                        }
                        return result.isCorrect
                          ? 'bg-gradient-to-br from-green-400 to-green-500 text-white border-2 border-green-300 shadow-green-200'
                          : 'bg-gradient-to-br from-red-400 to-red-500 text-white border-2 border-red-300 shadow-red-200'
                      }
                    }
                    if (revealedWords.has(index)) {
                      return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white border-2 border-blue-300 shadow-blue-200'
                    }
                    return selectedWords[index] 
                      ? 'bg-gradient-to-br from-green-400 to-green-500 text-white border-2 border-green-300 shadow-green-200' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100'
                  })()}
                `}
                onClick={() => !submissionResults && !revealedWords.has(index) && onWordSelect && onWordSelect(index, selectedWords[index])}
              >
                <span className={`font-medium text-center px-2 leading-tight break-words ${
                  selectedWords[index] || revealedWords.has(index)
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-500'
                } ${
                  (selectedWords[index] || revealedWords.has(index)) && (selectedWords[index]?.length > 15 || word.translation?.length > 15)
                    ? 'text-xs' 
                    : (selectedWords[index] || revealedWords.has(index)) && (selectedWords[index]?.length > 10 || word.translation?.length > 10)
                    ? 'text-xs sm:text-sm' 
                    : 'text-sm sm:text-base'
                }`}>
                  {revealedWords.has(index) ? word.translation : (selectedWords[index] || '')}
                </span>
              </div>
              
              {/* Word number label */}
              <div className="text-xs text-gray-500 text-center font-medium">
                Word {index + 1}
              </div>
              
              {/* Show correct answer for incorrect submissions only */}
              {submissionResults && (() => {
                const result = submissionResults.wordResults.find(r => r.index === index)
                if (result && !result.isCorrect && !result.wasRevealed) {
                  return (
                    <div className="mt-2 max-w-[96px] sm:max-w-[112px] md:max-w-[144px]">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg px-2 sm:px-3 py-1 shadow-sm">
                        <div className="flex items-center justify-center">
                          <span className="text-xs font-medium text-green-800 break-words leading-tight text-center">
                            {result.correctWord}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          ))}
        </div>
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
                        className="object-contain w-full h-24 max-w-[180px] mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=96&width=180&text=Arabic+Word"
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
                <p className="font-medium">Translation: {verseData.words[enlargedImageIndex].translation}</p>
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